import { ZERO_BN } from '@yield-protocol/ui-math';
import { ethers } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { ZERO_W3N } from '../constants';
import { W3bNumber } from '../lib/types';
import { ILever, ILeverContextState, LeverContext } from './LeverContext';

export interface IInputContextState {
  input: W3bNumber | undefined;
  leverage: W3bNumber | undefined;
  slippage: number;
  inputNativeToken: boolean; // if using ETH, for example

  selectedLever: ILever | undefined;
}

/* Parse the input to W3BNumber based on the selected lever and base */
const inputToW3bNumber = (input: string, decimals: number = 18, displayDecimals?: number): W3bNumber => {
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
  return ZERO_W3N;
};

const InputContext = React.createContext<any>({});
const initState: IInputContextState = {
  input: ZERO_W3N,
  leverage: inputToW3bNumber('2', 2),
  slippage: 0.001,
  inputNativeToken: false,
  selectedLever: undefined,
};

const inputReducer = (state: IInputContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        input: action.payload.input,
        inputNativeToken: action.payload.nativeToken,
      };

    case 'SET_SLIPPAGE':
      return {
        ...state,
        slippage: action.payload,
      };

    case 'SET_LEVERAGE':
      return {
        ...state,
        leverage: action.payload,
      };

    case 'SELECT_LEVER':
      return {
        ...state,
        selectedLever: action.payload,
        /**
         * Reset Input and leverage when selected lever changes
         * */
        input: ZERO_W3N,
        leverage: inputToW3bNumber('2', 2),
        inputNativeToken: false,
      };

    default:
      return state;
  }
};

const InputProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [inputState, updateState] = useReducer(inputReducer, initState);
  const {selectedLever} = inputState
  const [leverState] = useContext(LeverContext);
  const {assetRoots, levers} = leverState;
  
  const shortAsset = assetRoots.get(selectedLever?.baseId);

  /* Set the initial selected lever if there is no lever selected */
  useEffect(() => {
    if (levers.size) {
      updateState({
        type: 'SELECT_LEVER',
        payload: levers.get('STETH_02') || levers.get('FETH_2303'),
      });
      console.log('Initial lever selected'); 
    }
  }, [levers]);
  
  /* ACTIONS TO CHANGE CONTEXT */
  const inputActions = {
    setInput: (input: number, nativeToken: boolean = false) =>
      updateState({
        type: 'SET_INPUT',
        payload: { input: inputToW3bNumber(input.toString(), shortAsset.decimals , shortAsset.displayDecimals), nativeToken },
      }),

    setLeverage: (leverage: number) =>
      updateState({ type: 'SET_LEVERAGE', payload: inputToW3bNumber(leverage.toString(), 2) }),
    setSlippage: (slippagePercent: number) => updateState({ type: 'SET_SLIPPAGE', payload: slippagePercent / 100 }),
    selectLever: (lever: ILever) => updateState({ type: 'SELECT_LEVER', payload: lever }),
  };

  return <InputContext.Provider value={[inputState, inputActions]}>{children}</InputContext.Provider>;
};

export { InputContext };

export default InputProvider;
