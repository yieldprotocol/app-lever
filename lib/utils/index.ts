import { calculateAPR } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import { W3bNumber } from '../../context/InputContext';

/* Parse the input to W3BNumber based on the selected Strategy and base */
export const convertToW3bNumber = (value: BigNumber, decimals: number = 18, displayDecimals?: number): W3bNumber => {
  const input_hstr = ethers.utils.formatUnits(value, decimals); // hStr wil be the same as dsp because it is what the user is entereing.
  const input_dsp = displayDecimals
    ? Number(
        Math.round(Number(parseFloat(input_hstr) + 'e' + displayDecimals.toString())) +
          'e-' +
          displayDecimals.toString()
      )
    : parseFloat(input_hstr);
  return {
    dsp: input_dsp,
    hStr: input_hstr,
    big: value,
  };
};

export const getTimeToMaturity = (maturity: number, blocknumber?: number): string => {
  const secs = maturity - Math.round(new Date().getTime() / 1000);
  return secs.toString();
};


export const calculateAPRs = (
  investPosition: W3bNumber,
  debtPosition: W3bNumber,
  baseInvested: W3bNumber,
  baseBorrowed: W3bNumber,
  leverage: number,
  maturity: number
): {
  investAPR: number;
  borrowAPR: number;
  netAPR: number;
} => {
  const investRate = calculateAPR(investPosition.big, baseInvested.big, maturity);
  const investAPR = investRate ? parseFloat(investRate) * 100 : 0;

  const borrowRate = calculateAPR(baseBorrowed.big, debtPosition.big, maturity);
  const borrowAPR = borrowRate ? parseFloat(borrowRate) * 100 : 0;

  const netAPR = leverage * investAPR - (leverage - 1) * borrowAPR;

  return { investAPR, borrowAPR, netAPR };
};
