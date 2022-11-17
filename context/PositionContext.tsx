import { BigNumber } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { useAccount } from 'wagmi';
import { ILeverContextState, LeverContext } from './LeverContext';

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
  const { selectedStrategy, contracts } = leverState as ILeverContextState;

  const {address: account} = useAccount();

  const updatePositions = async (positionsToUpdate: [] = []) => {
    if (account && contracts.Cauldron ) {
      const vaultsReceivedFilter = contracts.Cauldron.filters.VaultGiven(null, account);
      const vaultsReceived = await contracts.Cauldron.queryFilter(vaultsReceivedFilter, 15940787, 'latest');

      await Promise.all(
        vaultsReceived.map(async (x: any): Promise<any> => {
          const { vaultId: id } = x.args;
          const { ilkId, seriesId } = await contracts.Cauldron.vaults(id);
          const { ink, art } = await contracts.Cauldron.balances(id);

          const vaultInfo = {
            id,
            seriesId,
            ilkId,
            ink,
            art,
            // displayName: generateVaultName(id),
            // decimals: series.decimals,
          };
          updateState({ type: 'UPDATE_POSITION', payload: vaultInfo });
          return vaultInfo;
        })
      );
      // console.log(receivedEventsList);
    }
  };

  /* update the positions if the account/contracts change */
  useEffect(() => {
    updatePositions();
  }, [account, contracts]);

  /* ACTIONS TO CHANGE CONTEXT */
  const positionActions = {
    // updatePositions: () => (positionId: string) => updateState({ type: 'SET_SELECTED_POSITION', payload: positionId }),
    selectPosition: (position: any) => updateState({ type: 'SELECT_POSITION', payload: position }),
  };

  return <PositionContext.Provider value={[positionState, positionActions]}>{children}</PositionContext.Provider>;
  
};

export { PositionContext };

export default PositionProvider;
