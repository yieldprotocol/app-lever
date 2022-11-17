import { BigNumber } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { CAULDRON, contractMap } from '../config/contractRegister';
import { ILeverContextState, ILever, LeverContext } from './LeverContext';

export interface IPositionContextState {
  positions: Map<string, IPosition>;
  selectedPosition: IPosition | undefined;
}

export interface IPosition {
  id: string;
  seriesId: string;
  ilkId: string;
  ink: BigNumber;
  art: BigNumber;
  lever: ILever;
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
        positions: new Map(state.positions.set(action.payload.id, action.payload)),
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
  const [ leverState ] = useContext(LeverContext);
  const { levers } = leverState as ILeverContextState;

  const provider = useProvider();
  const {address: account} = useAccount();

  const updatePositions = async (positionsToUpdate: [] = []) => {

    const cauldron = contractMap.get(CAULDRON).connect(CAULDRON, provider);

    if (account ) {
      const vaultsReceivedFilter = cauldron.filters.VaultGiven(null, account);
      const vaultsReceived = await cauldron.queryFilter(vaultsReceivedFilter, 15990171, 'latest');

      await Promise.all(
        vaultsReceived.map(async (x: any): Promise<any> => {
          const { vaultId: id } = x.args;
          const { ilkId, seriesId } = await cauldron.vaults(id);
          const { ink, art } = await cauldron.balances(id);

          const vaultInfo = {
            id,
            seriesId,
            ilkId,
            ink,
            art,
            // displayName: generateVaultName(id),
            // decimals: series.decimals,
          };
          updateState({ type: 'UPDATE_POSITION', payload: vaultInfo  });
          return vaultInfo;
        })
      );


      // console.log(receivedEventsList);
    }
  };

  /* update the positions if the account/contracts change */
  useEffect(() => {
    updatePositions();
  }, [account]);

  /* ACTIONS TO CHANGE CONTEXT */
  const positionActions = {
    // updatePositions: () => (positionId: string) => updateState({ type: 'SET_SELECTED_POSITION', payload: positionId }),
    selectPosition: (position: any) => updateState({ type: 'SELECT_POSITION', payload: position }),
  };

  return <PositionContext.Provider value={[positionState, positionActions]}>{children}</PositionContext.Provider>;
  
};

export { PositionContext };

export default PositionProvider;
