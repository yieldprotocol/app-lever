import { FC, useContext, useState } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';

type DivProps = {
  $unFocused?: boolean;
};
const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border border hover:border-gray-400 dark:hover:border-gray-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;


const Input = tw.input`
h-full 
caret-gray-800
 dark:caret-gray-50
  text-2xl 
  appearance-none
   w-full
   
   dark:bg-black dark:bg-opacity-0 bg-opacity-0
   
   dark:focus:text-gray-50 
   focus:text-gray-800 
   dark:text-gray-300 
   text-gray-800 
   py-1 
   px-4 
   leading-tight 
   focus:outline-none 
   rounded-lg
   `;



const LeverageSelect = () => {
  const [inputState, inputActions] = useContext(InputContext);

  return (
    <>
      <div className="flex-row flex gap-2">

        <Container>

          <div className='flex flex-shrink'>
          <Input
            value={inputState.leverage?.dsp || ''}
            type="number"
            onChange={(e) => inputActions.setLeverage(e.target.value)}
            name="leverage_text"
            min={1.1}
            max={5}
          />
          </div>

          <div className='grow' >
          <Input
            value={inputState.leverage?.dsp || ''}
            type="range"
            id="leverage_range"
            min={1.1}
            max={5}
            step="0.1"
            onChange={(e) => inputActions.setLeverage(e.target.value)}
          />
          </div>
          </Container>
  
      </div>
      {/* <div> {inputState.leverage.dsp}X </div> */}
    </>
  );
};

export default LeverageSelect;
