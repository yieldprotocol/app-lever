import { BigNumber, utils } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useEffect, useMemo, useState } from "react";

import tw from 'tailwind-styled-components';
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

/** A class used to let the user input a decimally interpreted BigNumber value.
 *
 */
interface Props {
  onValueChange(value: BigNumber): unknown;
  defaultValue: BigNumber;
  max: BigNumber;
  decimals: number;
}

/** Format a BigNumber value as a decimal. */
const format = (value: BigNumber, decimals: number) =>
  utils.formatUnits(value, decimals);

/** Try to parse a value as a BigNumber, return undefined when parsing fails. */
const parseValue = (val: string, decimals: number): BigNumber | undefined => {
  try {
    return utils.parseUnits(val, decimals);
  } catch (e) {
    return undefined;
  }
};

export const ValueInput = ({
  defaultValue,
  decimals,
  max,
  onValueChange,
}: Props) => {

  const defaultValueFormatted = format(defaultValue, decimals);

  /**
   * This is the "real" text content.
   */
  const [value, setValue] = useState<string>(defaultValueFormatted);
  /**
   * This is the parsed value, potentially undefined if the content could not
   * be parsed.
   */
  const parsedValue = useMemo(
    () => parseValue(value, decimals),
    [value, decimals]
  );

  // Update the listener when the value changes.
  useEffect(() => {
    if (parsedValue !== undefined) onValueChange(parsedValue);
  }, [parsedValue, onValueChange]);

  /**
   * This is the formatted value. It is defined when the parsed value is
   * defined.
   */
  const prettyValue: string | undefined =
    parsedValue === undefined ? undefined : format(parsedValue, decimals);

  const [focus, setFocus] = useState(false);
  const maxString = formatUnits(max, decimals);

  const displayValue =
    !focus && prettyValue !== undefined ? prettyValue : value;
  const valid = prettyValue !== undefined;

  return (
    <Container $unFocused={false}>
    <Inner>
    <Input
      className={"usdc_input" + (valid ? "" : " invalid")}
      name="invest_amount"
      type="number"
      min="0"
      max={maxString}
      value={displayValue}
      onChange={(el) => setValue(el.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
    </Inner>

    <div className="grow min-w-fit">
      <div className="p-1">
        {/* <AssetSelect item={asset} isFyToken={false} /> */}
        WETH
      </div>
        <button
          className="float-right flex items-center gap-1 my-[1px] text-xs mr-2 dark:text-gray-300 text-gray-700 hover:text-gray-600 dark:hover:text-gray-400"
          onClick={()=> console.log('max')}
        >
          <div> use max balance</div>
          <div> 1000.12 </div>
        </button>
    </div>
    </Container>
  );
};
