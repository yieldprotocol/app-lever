/* inputForm.tsx */
import { ethers } from 'ethers';
import { createContext, useContext, useState } from 'react';

interface W3bNumber {
  dsp: string;
  hStr: string;
  big: BigInt;
}

/* A basic react context implementation - this separates any blockchain logic from the visual input component */
export const InputContext = createContext<any>({});
export const InputProvider = ({ children }: any) => {
  const [input, setInput] = useState<W3bNumber> ({ dsp: '0', hStr: '0', big: 0n });

  /* function that parses the input to W3bNumber */
  const parseInput = (input: string) => {
    const inputAsWei = ethers.utils.parseUnits(input.toString(), 18);
    const inputAsBigInt = BigInt(inputAsWei.toString());
    const inputAsString = ethers.utils.formatUnits(inputAsWei, 18);
    setInput ( {
      dsp: input,
      hStr: inputAsString,
      big: inputAsBigInt,
    })
  };
  return <InputContext.Provider value={[input, parseInput]}>{children}</InputContext.Provider>;
};

/* The InputForm, can get dropped anywhere in the app */
export const InputForm = () => {
  const [input, handleInput] = useContext(InputContext);
  return (
    <input name="invest_amount" type="number" value={input.hStr} onChange={(el) => handleInput(el.target.value)} />
  );
};

export const DisplayInput = () => {
  const [input] = useContext(InputContext);
  return (
    <div>
      {input.dsp}
      {input.big * 2n}
    </div>
  );
};

/* Don't forget to wrap the app with the context provider */
export const App = () => {
  return (
    <InputProvider>
      <InputForm />
      <DisplayInput />
    </InputProvider>
  );
};
