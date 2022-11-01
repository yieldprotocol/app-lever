import { FC, useContext, useState } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';
import { Range } from 'react-range';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

type DivProps = {
  $unFocused?: boolean;
};
const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border border hover:border-gray-400 dark:hover:border-gray-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;

const Input = tw.input<any>`
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

const getColor = (val: number, max: number) => {
  const percent = (val / max) * 100;
  if (max) {
    if (percent < 33) return '#00000025';
    if (percent < 50) return '#006B3D';
    if (percent < 75) return '#FF980E';
    return '#D3212C';
  }
  return '#00000025';
};

const LeverageSelect = ({ max }) => {
  const [inputState, inputActions] = useContext(InputContext);
  const [color, setColor] = useState(undefined);

  return (
    <Container className=" align-middle">
      <div className="w-1/4 flex flex-grow">
        <div className=" px-2 py-4"> X </div>
        <Input
          className=" before:content: "
          value={`${inputState?.leverage?.dsp!}`}
          type="number"
          onChange={(e) => inputActions.setLeverage(e.target.value)}
          name="leverage_text"
          min={1.1}
          max={max || 5}
        />
      </div>

      <div className="w-full p-4">
        <Range
          step={0.1}
          min={1.1}
          max={max || 5}
          values={[inputState.leverage?.dsp || '']}
          onChange={(value) => inputActions.setLeverage(value)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '10px',
                width: '100%',
                backgroundColor: getColor(inputState.leverage?.dsp, max),
                borderRadius: '8px',
              }}
            >
              {children}
            </div>
          )}
          renderMark={({ props, index }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '2px',
                width: '2px',
                backgroundColor: 'teal',
              }}
            />
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '44px',
                width: '50px',
                backgroundColor: 'teal', //getColor(inputState.leverage?.dsp, max),
                borderRadius: '8px',
                border: '1px solid grey',
              }}
            >
              <div className="pt-3 flex flex-row justify-center">
                <ChevronLeftIcon className="h-4 w-4 text-gray-200" /> <ChevronRightIcon className="h-4 w-4 text-gray-200" />
              </div>
            </div>
          )}
        />
      </div>
    </Container>
  );
};

export default LeverageSelect;
