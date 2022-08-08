import { BigNumber, ethers } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { ILeverStrategy } from '../lib/protocol/types';
import { LeverContext } from './LeverContext';

interface W3bNumber {
  dsp: string;
  hStr: string;
  big: BigInt | BigNumber;
}

interface IInputContextState {
  selectedStrategy?: ILeverStrategy;
  input?: W3bNumber;
  leverage?: any;
}

const InputContext = React.createContext<any>({});

const initState: IInputContextState = {
  selectedStrategy: undefined,
  input: undefined,
  leverage: 3,
};

const inputReducer = (state: IInputContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'SELECT_STRATEGY':
      return {
        ...state,
        selectedStrategy: action.payload,
      };

    case 'UPDATE_INPUT':
      return {
        ...state,
        input: action.payload,
      };

    case 'UPDATE_INPUT_DSP':
      return {
        ...state,
        input_dsp: action.payload,
      };

    case 'UPDATE_LEVERAGE':
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
  const [inputState, updateState] = useReducer(inputReducer, initState);

  const [leverState] = useContext(LeverContext);
  const { assets } = leverState;

  /* Parse the input to W3BNumber based on the selected Strategy and base */
  const parseInput = (input: number): W3bNumber=> {

    const input_bn = input ? ethers.utils.parseUnits(input.toString(), 18) : ethers.constants.Zero;
    const input_dsp = input;
    const input_hstr = ethers.utils.formatUnits(input_bn, 18);

    return { 
      dsp: input_dsp.toString(),
      hStr: input_hstr,
      big: input_bn
    }
  };

  /* reset input and leverage when selected strategy changes */
  useEffect(() => {
    updateState({ type: 'UPDATE_INPUT', payload: initState.input });
    updateState({ type: 'UPDATE_LEVERAGE', payload: initState.leverage });
  }, [inputState.selectedStrategy]);

  /* ACTIONS TO CHANGE CONTEXT */
  const inputActions = {
    selectStrategy: (strategy: ILeverStrategy) => updateState({ type: 'UPDATE_STRATEGY', payload: strategy }),
    setInput: (input: number) => updateState({ type: 'UPDATE_INPUT', payload: parseInput(input) }),
    setLeverage: (leverage: number) => updateState({ type: 'UPDATE_LEVERAGE', payload: leverage }),
  };

  return <InputContext.Provider value={[inputState, inputActions]}>{children}</InputContext.Provider>;
};

export { InputContext };

export default InputProvider;
