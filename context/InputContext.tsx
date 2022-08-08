import { BigNumber } from 'ethers';
import React, { useContext, useReducer } from 'react';
import useConnector from '../hooks/useConnector';
import {  ILeverStrategy } from '../lib/protocol/types';
import { staticPageGenerationTimeout } from '../next.config';
import { LeverContext } from './LeverContext';

interface IInputContextState {
  selectedStrategy?: ILeverStrategy;
  input?: any;
  leverage?: any;
}

const InputContext = React.createContext<any>({});

const initState: IInputContextState = {
  selectedStrategy: undefined,
  input: undefined,
  leverage: undefined,
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
  const { assets  } = leverState;

  /* parse the input based on the selected Series and Selected base */ 
  const parseInput = (input: number) : BigNumber => {
    assets.get()
    return BigNumber.from('1000000000000000000');
  }

  /* ACTIONS TO CHANGE CONTEXT */
  const leverActions = {
    selectStrategy: (strategy: ILeverStrategy) => updateState({ type: 'UPDATE_STRATEGY', payload: strategy }),
    setInput: (input: number) => updateState({ type: 'UPDATE_INPUT', payload: parseInput(input) }),
    setLeverage: (leverage: number) => updateState({ type: 'UPDATE_LEVERAGE', payload: leverage }),
  };

  return <InputContext.Provider value={[inputState, leverActions]}>{children}</InputContext.Provider>;
};

export { InputContext };

export default InputProvider;