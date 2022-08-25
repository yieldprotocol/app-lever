import { bytesToBytes32, ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { idText } from 'typescript';
import { contractFactories } from '../config/contractRegister';
import { ZERO_W3N } from '../constants';
import { Cauldron } from '../contracts/types';
import { ILeverContextState, ILeverStrategy, LeverContext } from './LeverContext';

export interface W3bNumber {
  dsp: number;
  hStr: string;
  big: BigNumber;
}

export interface IPositionContextState {
  positions: Map<any, any>;
  selectedPosition: any;
}

/* Parse the input to W3BNumber based on the selected Strategy and base */
const inputToW3bNumber = (input: string, decimals: number = 18, displayDecimals?: number): W3bNumber | undefined => {
  if (input) {
    const input_bn = input ? ethers.utils.parseUnits(input, decimals) : ZERO_BN;
    const input_hstr = ethers.utils.formatUnits(input_bn, decimals); // hStr wil be the same as dsp because it is what the user is entereing.
    const input_dsp = displayDecimals
      ? Number(
          Math.round(Number(parseFloat(input_hstr) + 'e' + displayDecimals.toString())) +
            'e-' +
            displayDecimals.toString()
        )
      : parseFloat(input);

    return {
      dsp: input_dsp,
      hStr: input_hstr,
      big: input_bn,
    };
  }
  return undefined;
};

const PositionContext = React.createContext<any>({});
const initState: IPositionContextState = {
  positions: new Map([]),
  selectedPosition: '',
};

const inputReducer = (state: IPositionContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_POSITIONS':
      return {
        ...state,
        positions: action.payload,
      };

    default:
      return state;
  }
};

const PositionProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [inputState, updateState] = useReducer(inputReducer, initState);
  const [leverState] = useContext(LeverContext);
  const { selectedStrategy, contracts, account, strategies } = leverState as ILeverContextState;

  const updatePositions = async () => {
    if (account) {
      console.log(account);
      const vaultsReceivedFilter = contracts.Cauldron.filters.VaultGiven(null, account);
      const vaultsReceived = await contracts.Cauldron.queryFilter(vaultsReceivedFilter, 15271100, 'latest');

      const receivedEventsList = await Promise.all(
        vaultsReceived.map(async (x:any): Promise<any> => {
          const { vaultId:id } = x.args;
          const { ilkId, seriesId} = await contracts.Cauldron.vaults(id);
          const {ink, art } = await contracts.Cauldron.balances(id)

          return {
            id,
            seriesId,
            ilkId,
            ink,
            art
            // displayName: generateVaultName(id),
            // decimals: series.decimals,
          };
        })
      )     
      console.log(receivedEventsList);
    }
  };


  /* update the positions if the account/contracts change */
  useEffect(() => {
    updatePositions();
  }, [account, contracts]);

  /* ACTIONS TO CHANGE CONTEXT */
  const inputActions = {
    // updatePositions: () => (positionId: string) => updateState({ type: 'SET_SELECTED_POSITION', payload: positionId }),
    setSelectedPosition: (positionId: string) => updateState({ type: 'SET_SELECTED_POSITION', payload: positionId }),
  };

  return <PositionContext.Provider value={[inputState, inputActions]}>{children}</PositionContext.Provider>;
};

export { PositionContext };

export default PositionProvider;
