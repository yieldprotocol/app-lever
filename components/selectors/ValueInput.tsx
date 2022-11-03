import { ZERO_BN } from '@yield-protocol/ui-math';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';
import { IAsset, LeverContext } from '../../context/LeverContext';

type DivProps = {
  $unFocused?: boolean;
};

const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border border hover:border-gray-400 dark:hover:border-gray-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;
const Input = tw.input<any>` rounded-lg h-full text-2xl appearance-none w-full dark:bg-black dark:bg-opacity-0 bg-opacity-0 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-2 leading-tight focus:outline-none `;
const Inner = tw.div`flex flex-grow text-right text-lg align-middle items-center`;
const Button = tw.button`float-right flex items-center gap-1 my-[1px] text-xs mr-2 dark:text-gray-300 text-gray-700 hover:text-gray-600 dark:hover:text-gray-400`;

export const ValueInput = () => {
  const [leverState] = useContext(LeverContext);
  const { shortAsset, selectedStrategy } = leverState;
  const [inputState, inputActions] = useContext(InputContext);
  const [focus, setFocus] = useState(false);

  const [warnInput, setWarnInput] = useState<boolean>(false);

  // useEffect(() => {
  //   if (selectedStrategy && inputState.input) {
  //     // toast.warn('Input less than min debt required.')
  //     // inputState.input.dsp < selectedStrategy.minDebt.dsp && toast.warn('Input less than min debt required.')
  //     // console.log( 'greater than minDebt: ',  inputState.input.dsp > selectedStrategy.minDebt.dsp )
  //     // console.log( 'less than maxBase: ',  inputState.input.dsp < selectedStrategy.maxBase.dsp )
  //   }
  // }, [inputState.input?.dsp, selectedStrategy]);

  return (
    <Container $unFocused={false}>
      
      <Inner className='pl-4'>
        <Input
          name="invest_amount"
          type="number"
          value={inputState.input?.dsp || ''}
          onChange={(el) => inputActions.setInput(el.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
      </Inner>

      <div className="grow min-w-fit text-left ">
        <div className="px-1">{shortAsset?.displaySymbol}</div>
        {inputState?.input?.hStr !== shortAsset?.balance.hStr && shortAsset?.balance.big.gt(ZERO_BN) && (
          <Button onClick={() => inputActions.setInput(shortAsset?.balance.hStr)} >
            <div> Use max balance</div>
            <div> {shortAsset?.balance.dsp} </div>
          </Button>
        )}
        {inputState?.input?.hStr === shortAsset?.balance.hStr && shortAsset?.balance.big.gt(ZERO_BN) && (
          <Button onClick={() => inputActions.setInput('0')} >
            <div> Clear </div>
          </Button>
        )}

      </div>
    </Container>
  );
};
