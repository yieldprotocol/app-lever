import { BigNumber, utils } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useContext, useEffect, useMemo, useState } from "react";

import tw from 'tailwind-styled-components';
import { InputContext } from "../../context/InputContext";
import { IAsset } from '../../lib/protocol/types';
import AssetSelect from '../common/AssetSelect';

type DivProps = {
  $unFocused?: boolean;
};

const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border border hover:border-gray-400 dark:hover:border-gray-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300`;
const Input = tw.input`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none `;
const Inner = tw.div`grow-0 w-auto ml-3 text-center text-lg align-middle my-1 items-center`;

export const ValueInput = () => {

  const [inputState, inputActions ] = useContext(InputContext);
  const [focus, setFocus] = useState(false);

  return (
    <Container $unFocused={false}>
    <Inner>
    <Input
      name="invest_amount"
      type="number"
      min="0"
      max={inputState.max}
      value={inputState.input?.dsp}
      onChange={(el)=> inputActions.setInput(el.target.value)}

      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
    </Inner>

    <div className="grow min-w-fit">
      <div className="p-1">
        WETH
      </div>
        <button
          className="float-right flex items-center gap-1 my-[1px] text-xs mr-2 dark:text-gray-300 text-gray-700 hover:text-gray-600 dark:hover:text-gray-400"
          onClick={()=>inputActions.setInput(inputState.max)}
        >
          <div> use max balance</div>
          <div> 1000.12 </div>
        </button>
    </div>
    </Container>
  );
};
