import { BigNumber, ethers } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { useDebounce } from '../hooks/generalHooks';
import { ILeverStrategy, LeverContext } from './LeverContext';

export interface W3bNumber {
  dsp: number;
  hStr: string;
  big: BigNumber;
}

export interface IInputContextState {
  selectedStrategy: ILeverStrategy | undefined;
  input: W3bNumber;
  leverage: W3bNumber;
}

/* Parse the input to W3BNumber based on the selected Strategy and base */
const inputToW3bNumber = (input: string, decimals: number = 18, displayDecimals?: number ): W3bNumber => {
  const input_bn = input ? ethers.utils.parseUnits(input.toString(), decimals) : ethers.constants.Zero;
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
};

const InputContext = React.createContext<any>({});

const initState: IInputContextState = {
  selectedStrategy: undefined,
  input: inputToW3bNumber('0'),
  leverage: inputToW3bNumber('3', 2),
};

const inputReducer = (state: IInputContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'SET_STRATEGY':
      return {
        ...state,
        selectedStrategy: action.payload,
      };

    case 'SET_INPUT':
      return {
        ...state,
        input: action.payload,
      };

    case 'SET_LEVERAGE':
      return {
        ...state,
        leverage: action.payload,
      };

    default:
      return state;
  }
};

const InputProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [ inputState, updateState ] = useReducer(inputReducer, initState);
  const [ leverState ] = useContext(LeverContext);
  const { assets } = leverState;

  /* Reset Input and leverage when selected strategy changes */
  useEffect(() => {
    updateState({ type: 'SET_INPUT', payload: initState.input });
    updateState({ type: 'SET_LEVERAGE', payload: initState.leverage });
  }, [inputState.selectedStrategy]);

  /* Set the initial selected Strategy if there is no strategy seelcted */
  useEffect(() => {
    !inputState.selectedStrategy &&
      updateState({
        type: 'SET_STRATEGY',
        payload: Array.from(leverState.strategies.values())[0], // Take the first strategy as default
      });
  }, [leverState.strategies]);

  /* ACTIONS TO CHANGE CONTEXT */
  const inputActions = {
    selectStrategy: (strategy: ILeverStrategy) => updateState({ type: 'SET_STRATEGY', payload: strategy }),
    setInput: (input: number) => updateState({ type: 'SET_INPUT', payload: inputToW3bNumber(input.toString()) }),
    setLeverage: (leverage: number) =>
      updateState({ type: 'SET_LEVERAGE', payload: inputToW3bNumber(leverage.toString(), 2) }),
  };

  return <InputContext.Provider value={[inputState, inputActions]}>{children}</InputContext.Provider>;
};

export { InputContext };

export default InputProvider;
