import { BigNumber } from 'ethers';
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

export interface IPosition {
  vaultId: string;
  seriesId: string;
  ilkId: string;

  investment: W3bNumber; // ink
  debt: W3bNumber; // art

  amountInvested: W3bNumber;

  investDate: Date;
  divestDate: Date | undefined;
  // lever: ILever;

  displayName: string;
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
        const contract_ = contractMap.get(lever.leverAddress).connect(lever.leverAddress, provider);
        const investedFilter_ = contract_.filters.Invested(null, null, account, null, null);
        const divestedFilter_ = contract_.filters.Divested();

        const [investedEvents, divestedEvents] = await Promise.all([
          contract_.queryFilter(investedFilter_, 15990171, 'latest'),
          contract_.queryFilter(divestedFilter_, 15990171, 'latest'),
        ]);

        await Promise.all(
          investedEvents.map(async (x: any): Promise<any> => {
            const { vaultId, seriesId, investment, debt } = x.args;
            const { ilkId } = await cauldron.vaults(vaultId);

            const tx = await x.getTransaction();
            let { args, value } = contract_.interface.parseTransaction({ data: tx.data, value: tx.value });

            const divestEvent = divestedEvents.find((d: any) => d.args.vaultId === vaultId);
            const divestDate = divestEvent ? divestEvent[0] : undefined;

            const vaultInfo = {
              vaultId,
              seriesId,
              ilkId,

              investment: convertToW3bNumber(investment, 18, 6),
              debt: convertToW3bNumber(debt, 18, 6),
              amountInvested: convertToW3bNumber(args.amountToInvest || value, 18, 6),

              investDate: new Date(),
              divestDate,

              displayName: generateVaultName(vaultId),
              // decimals: series.decimals,
            };

            updateState({ type: 'UPDATE_POSITION', payload: vaultInfo });
            return vaultInfo;
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
    // updatePositions: () => (positionId: string) => updateState({ type: 'SET_SELECTED_POSITION', payload: positionId }),
    selectPosition: (position: any) => updateState({ type: 'SELECT_POSITION', payload: position })
  };

  return <PositionContext.Provider value={[positionState, positionActions]}>{children}</PositionContext.Provider>;
};

export { PositionContext };

export default PositionProvider;
