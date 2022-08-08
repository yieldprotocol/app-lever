import { FC, useContext, useState } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';

const ButtonInner = tw.div`
  h-full w-full dark:bg-gray-900/80 bg-gray-100/80 dark:text-gray-50 text-gray-900 rounded-lg
  flex p-3 gap-3 justify-center
`;

const ButtonOuter = tw.button`w-full flex p-[1px]
rounded-lg gap-3 align-middle items-center hover:opacity-80
`;

const LeverageSelect = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [inputState, inputActions] = useContext(InputContext);

  return (
<div className="relative pt-1 flex-row flex">
  {/*  <label className="form-label">Example range</label> */}
  <input
    value={inputState.leverage}
    type="range"
    className="
      form-range
      appearance-none
      w-full
      h-6
      p-0
      bg-transparent
      focus:outline-none focus:ring-0 focus:shadow-none
    "
    id="customRange1"
    min={0.1}
    max={5}
    step="0.01"
    onChange={(e) => inputActions.setLeverage(e.target.value)}
  />
  {inputState.leverage}x  
</div>
  );
};

export default LeverageSelect;