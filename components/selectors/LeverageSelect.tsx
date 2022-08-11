import { FC, useContext, useState } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';
import { useDebounce } from '../../hooks/generalHooks';

const Input = tw.input`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none `;

const LeverageSelect = () => {
  const [inputState, inputActions] = useContext(InputContext);

  return (
    <>
      <div className="relative pt-1 flex-row flex">
        <Input
          value={inputState.leverage.hStr}
          type="range"
          id="range1"
          min={0.1}
          max={5}
          step="0.1"
          onChange={(e) => inputActions.setLeverage(e.target.value)}
        />
      </div>
      <div> {inputState.leverage.dsp}X </div>
    </>
  );
};

export default LeverageSelect;
