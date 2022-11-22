import { ZERO_BN } from '@yield-protocol/ui-math';
import { ethers } from 'ethers';
import React, { useContext, useEffect, useReducer } from 'react';
import { ZERO_W3N } from '../constants';
import { W3bNumber } from '../lib/types';
import { ILeverContextState, LeverContext } from './LeverContext';

export interface IInputContextState {
  input: W3bNumber | undefined;
  leverage: W3bNumber | undefined;
  slippage: number;
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
};

const inputReducer = (state: IInputContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        input: action.payload,
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

    default:
      return state;
  }
};

const InputProvider = ({ children }: any) => {
  /* LOCAL STATE */
  const [inputState, updateState] = useReducer(inputReducer, initState);
  const [leverState] = useContext(LeverContext);
  const { selectedLever, assets } = leverState as ILeverContextState;
  const shortAsset = assets.get(selectedLever?.baseId!);

  /* NOTE: try debounceleverage when using slider - to prevent excessive calcs */
  // const [rawLeverage, setRawLeverage] = useState<number>(0);
  // const debouncedLeverage = useDebounce(rawLeverage, 500);
  // useEffect(()=>{
  //   updateState({ type: 'SET_LEVERAGE', payload: inputToW3bNumber(debouncedLeverage.toString(), 2) })
  // },[debouncedLeverage])

  /* Reset Input and leverage when selected lever changes */
  useEffect(() => {
    updateState({ type: 'SET_INPUT', payload: initState.input });
    updateState({ type: 'SET_LEVERAGE', payload: initState.leverage });
  }, [selectedLever]);

  /* ACTIONS TO CHANGE CONTEXT */
  const inputActions = {
    setInput: (input: number) =>
      updateState({
        type: 'SET_INPUT',
        payload: inputToW3bNumber(input.toString(), shortAsset?.decimals, shortAsset?.digitFormat),
      }),
    // setLeverage: (leverage: number) => setRawLeverage(leverage),
    setLeverage: (leverage: number) =>
      updateState({ type: 'SET_LEVERAGE', payload: inputToW3bNumber(leverage.toString(), 2) }),
    setSlippage: (slippagePercent: number) => updateState({ type: 'SET_SLIPPAGE', payload: slippagePercent / 100 }),
  };

  return <InputContext.Provider value={[inputState, inputActions]}>{children}</InputContext.Provider>;
};

export { InputContext };

export default InputProvider;
