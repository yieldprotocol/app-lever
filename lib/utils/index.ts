import { BigNumber, ethers } from 'ethers';
import { W3bNumber } from '../types';

/* Parse the input to W3BNumber based on the selected lever and base */
export const convertToW3bNumber = (value: BigNumber, decimals: number = 18, displayDecimals?: number): W3bNumber => {
  const inputHstr = ethers.utils.formatUnits(value, decimals); // hStr wil be the same as dsp because it is what the user is entereing.
  const inputDsp = displayDecimals
    ? Number(
        Math.round(Number(parseFloat(inputHstr) + 'e' + displayDecimals.toString())) +
          'e-' +
          displayDecimals.toString()
      )
    : parseFloat(inputHstr);
  return {
    dsp: inputDsp,
    hStr: inputHstr,
    big: value,
  };
};

