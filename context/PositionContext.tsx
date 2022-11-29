import { BigNumber, Contract, Event } from 'ethers';
import React, { useEffect, useReducer } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { CAULDRON, contractMap } from '../config/contracts';
import { ILeverRoot, LEVERS } from '../config/levers';
import { W3bNumber } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';
import { generateVaultName } from '../utils/appUtils';

export interface IPositionContextState {
  positions: Map<string, IPosition>;
  selectedPosition: IPosition | undefined;
}
export enum PositionStatus {
  CLOSED='Closed',
  ACTIVE='Active'
}

export interface IPosition {
  vaultId: string;
  seriesId: string;
  ilkId: string;
  baseId: string;

  shortInvested: W3bNumber; // short asset invested

  investmentLong: W3bNumber; // resultant long asset obtained
  investmentBorrowed: W3bNumber; // resultant debt

  ink: W3bNumber; // current collateral 
  art: W3bNumber; // current debt

  investTxDate: Date;
  divestTxDate: Date | undefined;

  investTxHash: string;
  divestTxHash: string | undefined;

  leverAddress: string;

  displayName: string;
  status: PositionStatus;
}

const PositionContext = React.createContext<any>({});
const initState: IPositionContextState = {
  positions: new Map([]),
  selectedPosition: undefined,
};

const positionReducer = (state: IPositionContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_POSITION':
      return {
        ...state,
        positions: new Map(state.positions.set(action.payload.vaultId, action.payload)),
      };

    case 'SELECT_POSITION':
      return {
        ...state,
        selectedPosition: action.payload,
      };
    default:
      return state;
  }
};

const PositionProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [positionState, updateState] = useReducer(positionReducer, initState);

  const provider = useProvider();
  const { address: account } = useAccount();

  const updatePositions = async (positionsToUpdate: [] = []) => {
    const cauldron = contractMap.get(CAULDRON).connect(CAULDRON, provider);

    const allLevers = Array.from(LEVERS.values());
    const uniqueBy = 'leverAddress';
    const uniqueLevers = [...new Map(allLevers.map((item) => [item[uniqueBy], item])).values()];

    if (account) {
      uniqueLevers.map(async (lever: ILeverRoot) => {
        const contract_ = contractMap.get(lever.leverAddress).connect(lever.leverAddress, provider) as Contract;
        const investedFilter_ = contract_.filters.Invested(null, null, account, null, null);
        const divestedFilter_ = contract_.filters.Divested();

        console.log( process.env.FORKED_ENV_FIRST_BLOCK )
        const [investedEvents, divestedEvents] = await Promise.all([
          contract_.queryFilter(investedFilter_, 16067737, 'latest'),
          contract_.queryFilter(divestedFilter_, 16067737, 'latest'),
        ]);

        await Promise.all(
          investedEvents.map( async (invEvnt: Event ): Promise<any> => {
            const { vaultId, seriesId, investment, debt } = invEvnt.args as any;
            const { ilkId } = await cauldron.vaults(vaultId);
            const { ink, art } = await cauldron.balances(vaultId);
            const tx = await invEvnt.getTransaction();
            let { args, value } = contract_.interface.parseTransaction({ data: tx.data, value: tx.value });
            
            const investTxHash = invEvnt.transactionHash;

            const divestEvent = divestedEvents.find((d: Event) => d?.args?.vaultId === vaultId);
            const divestTxHash = divestEvent?.transactionHash;

            /* get dates */
            const [investTxBlock, divestTxBlock ]  = await Promise.all( [
              provider.getBlock(invEvnt.blockNumber),
              divestEvent ? provider.getBlock(divestEvent?.blockNumber) : undefined
            ])
            
            const positionInfo = {
              vaultId,
              seriesId,
              ilkId,
              baseId: `${seriesId.substring(0, 6)}00000000`,

              investmentLong: convertToW3bNumber(investment, 18, 6),
              investmentBorrowed: convertToW3bNumber(debt, 18, 6),
              shortInvested: convertToW3bNumber(args.amountToInvest || value, 18, 6),
              ink: convertToW3bNumber(ink, 18, 6),
              art: convertToW3bNumber(art, 18, 6),

              status: divestEvent ? PositionStatus.CLOSED: PositionStatus.ACTIVE,
              displayName: generateVaultName(vaultId),
              leverAddress: lever.leverAddress,

              investTxHash,
              divestTxHash,

              investTxDate: new Date(investTxBlock.timestamp*1000),
              divestTxDate: divestTxBlock ? new Date(divestTxBlock?.timestamp*1000): undefined,

            } as IPosition;

            updateState({ type: 'UPDATE_POSITION', payload: positionInfo });
            return positionInfo;
          })
        );
      });
    }
  };

  /* update the positions if the account/contracts change */
  useEffect(() => {
    updatePositions();
  }, [account]);

  /* ACTIONS TO CHANGE CONTEXT */
  const positionActions = {
    updatePositions: () => updatePositions(),
    selectPosition: (position: any) => updateState({ type: 'SELECT_POSITION', payload: position })
  };

  return <PositionContext.Provider value={[positionState, positionActions]}>{children}</PositionContext.Provider>;
};

export { PositionContext };

export default PositionProvider;
