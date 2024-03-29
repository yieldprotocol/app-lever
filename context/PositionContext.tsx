import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber, Contract, Event } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { CAULDRON, contractMap } from '../config/contracts';
import { ILeverRoot, LEVERS } from '../config/levers';
import { W3bNumber } from '../lib/types';
import { convertToW3bNumber } from '../lib/utils';
import { generateVaultName } from '../utils/appUtils';
import { ILeverContextState, LeverContext } from './LeverContext';

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

  shortAssetInput: W3bNumber;

  shortAssetBorrowed: W3bNumber; // resultant debt === input? 
  debtAtMaturity: W3bNumber; // debt owed at maturity

  // debtCurrent: W3bNumber; // current Value of debt (if settling now)
  shortAssetObtained: W3bNumber; // TOTAL short-asset used for investment (input + borrow)
  longAssetObtained: W3bNumber; // long-asset obtained (by using short asset obtained

  divestReturn: W3bNumber;
  leverage: number;
  
  ink: W3bNumber; // current collateral 
  art: W3bNumber; // current debt

  investTxDate: Date;
  divestTxDate: Date | undefined;

  investTxHash: string;
  divestTxHash: string | undefined;

  leverId: string;
  leverAddress: string;
  leverContract: Contract;

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

  /* STATE FROM CONTEXT */
  const [leverState] = useContext(LeverContext);
  const { assetRoots, leverRoots } = leverState as ILeverContextState;
  
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
        
        const [investedEvents, divestedEvents] = await Promise.all([
          contract_.queryFilter(investedFilter_, parseInt(process.env.FORKED_ENV_FIRST_BLOCK!.toString()), 'latest'),
          contract_.queryFilter(divestedFilter_, parseInt(process.env.FORKED_ENV_FIRST_BLOCK!.toString()), 'latest'),
        ]);

        await Promise.all(
          investedEvents.map( async (invEvnt: Event ): Promise<any> => {
            
            const { vaultId, seriesId, investment, debt } = invEvnt.args as any;
            const [{ilkId}, {ink, art}, tx, {baseId} ] = await Promise.all([
              cauldron.vaults(vaultId),
              cauldron.balances(vaultId),
              invEvnt.getTransaction(),
              cauldron.series(seriesId)
            ])

            let { args, value } = contract_.interface.parseTransaction({ data: tx.data, value: tx.value });

            const longAsset = assetRoots.get(ilkId);
            const shortAsset = assetRoots.get(baseId);
            
            const longAssetObtained_ = convertToW3bNumber(investment, longAsset?.decimals, longAsset?.displayDigits);
            const shortAssetInput_ = convertToW3bNumber(args.baseAmount, shortAsset?.decimals, shortAsset?.displayDigits);
            const shortAssetBorrowed_ = convertToW3bNumber(args.borrowAmount, shortAsset?.decimals, shortAsset?.displayDigits);

            const debtAtMaturity_ = convertToW3bNumber(debt, shortAsset?.decimals, shortAsset?.displayDigits);
   
            const totalShort_ = args.baseAmount.add(args.borrowAmount);
            const shortAssetObtained_ = convertToW3bNumber(totalShort_, shortAsset?.decimals, shortAsset?.displayDigits);
            
            const leverage_ = shortAssetObtained_.dsp/shortAssetInput_.dsp

            const investTxHash = invEvnt.transactionHash;

            const divestEvent = divestedEvents.find((d: Event) => d?.args?.vaultId === vaultId);
            const divestTxHash = divestEvent?.transactionHash;
            
            /* Get invest/divest dates */
            const [investTxBlock, divestTxBlock ]  = await Promise.all( [
              provider.getBlock(invEvnt.blockNumber),
              divestEvent ? provider.getBlock(divestEvent?.blockNumber) : undefined
            ])
            const divestReturn_ = divestEvent?.args && divestEvent?.args.profit || ZERO_BN;
            
            const positionInfo: IPosition = {
              vaultId,
              seriesId,
              ilkId,
              baseId,

              longAssetObtained: longAssetObtained_,
              
              shortAssetInput: shortAssetInput_  , 
              shortAssetBorrowed: shortAssetBorrowed_, //  convertToW3bNumber(args.borrowAmount, 18, 6),
              debtAtMaturity: debtAtMaturity_,

              shortAssetObtained: shortAssetObtained_,
              
              leverage: leverage_,
              divestReturn: convertToW3bNumber(divestReturn_, longAsset?.decimals, longAsset?.displayDigits),

              ink: convertToW3bNumber(ink, longAsset?.decimals, longAsset?.displayDigits),
              art: convertToW3bNumber(art, shortAsset?.decimals, shortAsset?.displayDigits),

              status: divestEvent ? PositionStatus.CLOSED: PositionStatus.ACTIVE,
              displayName: generateVaultName(vaultId),

              leverId: lever.id,
              leverAddress: lever.leverAddress,
              leverContract: contract_,

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
    account && updatePositions();
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
