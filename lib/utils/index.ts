import { BigNumber, ethers } from 'ethers';
import { rawListeners } from 'process';
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
  investValue: W3bNumber, // 'short value' of long asset obtained
  debtPosition: W3bNumber, // 'short value' of debt at maturity ( shortvalue === fyToken value here)

  shortInvested: W3bNumber, // total 'short value' (nb: NOT fytokens invested).
  shortBorrowed: W3bNumber, // 'short value' borrowed

  leverage: number,
  maturity: number
): {
  investAPR: number;
  borrowAPR: number;
  netAPR: number;
} => {
  const now = Math.round(new Date().getTime() / 1000);
  const secsToMaturity = maturity - now;
  console.log(maturity, secsToMaturity, now);
  const oneOverYearProp = 1 / (secsToMaturity / 31536000);

  // const investRate = calculateAPR(baseInvested.big, investPosition.big, maturity);
  // const investAPR = investRate ? parseFloat(investRate) : 0;
  const investRate = Math.pow(investValue.dsp / shortInvested.dsp, oneOverYearProp) - 1;
  const investAPR = investRate * 100;
  // console.log('invest rate: ',   investValue.dsp, shortInvested.dsp , investAPR )

  // const borrowRate = calculateAPR(debtPosition.big, baseBorrowed.big, maturity);
  // const borrowAPR = borrowRate ? parseFloat(borrowRate) : 0;
  const borrowRate = Math.pow(debtPosition.dsp / shortBorrowed.dsp, oneOverYearProp) - 1;
  const borrowAPR = borrowRate * 100;
  // console.log('borrow rate: ', debtPosition.dsp, borrowed.dsp , borrowAPR )

  const netAPR = leverage * investAPR - (leverage - 1) * borrowAPR;

  return { investAPR, borrowAPR, netAPR };
};
