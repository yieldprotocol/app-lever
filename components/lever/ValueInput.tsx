import { useContext, useEffect, useMemo, useState } from "react";
import tw from 'tailwind-styled-components';
import { InputContext } from "../../context/InputContext";
import { IAsset, LeverContext } from "../../context/LeverContext";

type DivProps = {
  $unFocused?: boolean;
};

const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border border hover:border-gray-400 dark:hover:border-gray-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300`;
const Input = tw.input`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none `;
const Inner = tw.div`grow-0 w-auto ml-3 text-center text-lg align-middle my-1 items-center`;
const Button = tw.button`float-right flex items-center gap-1 my-[1px] text-xs mr-2 dark:text-gray-300 text-gray-700 hover:text-gray-600 dark:hover:text-gray-400`

export const ValueInput = () => {
  
  const [leverState ] = useContext(LeverContext);
  const [inputState, inputActions ] = useContext(InputContext);
  const [focus, setFocus] = useState(false);
  const [asset, setAsset] = useState<IAsset>();

  useEffect(()=> {
    const strat = leverState.selectedStrategy;
    if (strat)  {
      console.log('strategy selected');
      const asset = leverState.assets.get(strat.baseId);
      console.log('asset', asset);
      setAsset(asset);
    }
  },[leverState.selectedStrategy])

  return (
    <Container $unFocused={false}>
    <Inner>
    <Input
      name="invest_amount"
      type="number"
      min="0"
      max={asset?.balance.hStr}
      value={inputState.input?.dsp}
      onChange={(el)=>inputActions.setInput(el.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
    </Inner>
    <div className="grow min-w-fit">
      <div className="p-1">
        {asset?.displaySymbol}
      </div>
        <Button
          onClick={()=>inputActions.setInput(asset?.balance.hStr)}
        >
          <div> Use max balance</div>
          <div> {asset?.balance.dsp} </div>
        </Button>
    </div>
    </Container>
  );
};
