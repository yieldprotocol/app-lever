import { ZERO_BN } from '@yield-protocol/ui-math';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { useAccount, useBalance } from 'wagmi';
import { WETH } from '../../config/assets';
import logoMap from '../../config/logos';
import { InputContext } from '../../context/InputContext';
import { LeverContext } from '../../context/LeverContext';
import { TokenType } from '../../lib/types';

type DivProps = {
  $unFocused?: boolean;
};

const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border border hover:border-primary-400 dark:hover:border-primary-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;
const Input = tw.input<any>`rounded-lg h-full text-2xl appearance-none w-full dark:bg-black dark:bg-opacity-0 bg-opacity-0 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-2 leading-tight focus:outline-none `;
const Button = tw.button`flex items-center gap-1 my-[1px] text-xs mr-2 dark:text-gray-300 text-gray-700 hover:text-gray-600 dark:hover:text-gray-400`;

export const ValueInput = () => {
  const { address } = useAccount();

  const { data:balance } = useBalance({address});

  const [inputState, inputActions] = useContext(InputContext);
  const {selectedLever} = inputState; 

  const [leverState] = useContext(LeverContext);
  const { assets } = leverState;
  const shortAsset = assets.get(selectedLever?.baseId!);

  const [useNative, setUseNative] = useState<boolean>( ); // if WETH default to native else 

  useEffect(()=>{
    shortAsset?.id === WETH ?  setUseNative(true) : setUseNative(false)
  },[ shortAsset ])

  return (
    <Container>
      <div className="grid overflow-hidden grid-cols-4 grid-rows-1 gap-2">
        <div className="row-span-2 col-span-2 pl-6">
          <Input
            name="invest_amount"
            type="number"
            inputMode="decimal"
            value={inputState.input?.dsp || ''}
            onChange={(el: ChangeEvent<HTMLInputElement>) => inputActions.setInput(el.target.value, useNative)}
            onWheelCapture={(e: ChangeEvent<HTMLInputElement>) => {
              e.currentTarget.blur();
            }}
            // onFocus={() => setFocus(true)}
            // onBlur={() => setFocus(false)}
            disabled={!selectedLever}
          />
        </div>

        <div className="col-span-2 text-start flex justify-between">
          {shortAsset?.id === WETH && (
            <div
              onClick={() => setUseNative(true)}
              className={`flex items-center gap-2 ${useNative ? ' text-white' : 'text-gray-500'}`}
            >
              <div className="w-4">{logoMap.get('ETH')}</div>
              <button>ETH </button>
            </div>
          )}

          <div
            className={`flex items-center gap-2 ${useNative ? 'text-gray-500' : ' text-white'}`}
            onClick={() => setUseNative(false)}
          >
            <div className=" w-4"> {shortAsset?.image} </div>
            <button>{shortAsset?.displaySymbol}</button>
          </div>

          <div />
        </div>

        <div className="col-span-2 text-start">
          {( inputState?.input?.hStr !== shortAsset?.balance.hStr || inputState?.input.dsp ===0 )  && (
            <Button onClick={() => inputActions.setInput(useNative ? balance?.formatted : shortAsset?.balance.hStr)}>
              <div> Use max balance: </div>
              <div> { useNative ? balance?.formatted.substring(0,6) : shortAsset?.balance.dsp} </div>
            </Button>
          )}
          {inputState?.input?.hStr === shortAsset?.balance.hStr && shortAsset?.balance.big.gt(ZERO_BN) && (
            <Button onClick={() => inputActions.setInput('0')}>
              <div> Clear </div>
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
};
