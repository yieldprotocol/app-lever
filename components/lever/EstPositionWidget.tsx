import { BigNumber } from 'ethers';
import { useContext, useMemo } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext, W3bNumber } from '../../context/InputContext';
import { useStEthSim } from '../../hooks/leverHooks/useStEthSim';
import { BorderWrap, Header } from '../styles';
import { useLever } from '../../hooks/useLever';

const Inner = tw.div`m-4 gap-10`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const Label = tw.div`text-[10px] text-[grey]`;
const NotShown = tw.div` text-[pink]`;

export interface leverSimulation {
  investPosition: W3bNumber | undefined;
  debtPosition: W3bNumber | undefined;
  baseInvested: W3bNumber | undefined;
  baseBorrowed: W3bNumber | undefined;
  flashFee: W3bNumber | undefined;
}

const EstPositionWidget = () => {
  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState;

  const {
    totalToInvest,
    toBorrow,
    inputAsFyToken,
    valueOfInvestment,
    netAPR,
    borrowAPR,
    investAPR,
    shortBorrowed,
    shortInvested,
    debtPosition,
    investPosition,
    flashFee
  } = useLever();

  return (
    <BorderWrap>
      <TopRow>Estimated Position Information</TopRow>

      <Inner>
        === INPUTS ===
        <Label>1: Input value (INPUT) </Label>
        <div> Input value (Short asset) : {input.dsp} ETH </div>
        <Label>2: Wrap if required (1:1)</Label>
        <NotShown> Wrapped input: {input.dsp} WETH </NotShown>
        <Label>3: Sell Short Asset for fyToken ( sellBase() ) </Label>
        <NotShown> Short asset investment as FyToken : {inputAsFyToken.dsp} (fyETH) </NotShown>
        <Label>4: Input Leverage (INPUT):</Label>
        <div>Leverage: {leverage.dsp} X </div>
        <Label>5: Total to invest based on input and leverage (fyToken input*leverage) </Label>
        <NotShown> Total Investment ( fyToken ): {totalToInvest.dsp} (fyETH) </NotShown>
        === SIMULATIONS ===
        <Label>6: Base Invested ( baseInvested ) </Label>
        <div> Short asset total invested : {shortInvested?.dsp} </div>
        <Label>7: Base Borrowed ( baseBorrowed ) </Label>
        <div> Short asset borrowed : {shortBorrowed?.dsp} </div>
        <Label>8: Debt Position ( debtPosition ) </Label>
        <div> Debt owed at maturity : {debtPosition?.dsp} </div>
        <Label>9: Investment position ( long asset obtained ) ( investPosition ) </Label>
        <div> Long position obtained : {investPosition?.dsp} </div>
        {/* <Label>10: Amount borrowed </Label>
        <div>Current Debt: {toBorrow.dsp} ETH </div> */}
        <Label>11: flashFee </Label>
        <div> Flash borrow fee: {flashFee?.dsp} </div>
        === CURRENT VALUES ===
        <Label>12: Current value </Label>
        <div> Current position value: {valueOfInvestment.dsp} </div>
        === CALCULATIONS ===
        <Label>13: (pos/prin - 1) </Label>
        <div>PnL : {investPosition?.dsp!/shortInvested?.dsp! -1 } </div>
        <Label>14: ( investPosition/ baseInvested ) ^ t%year - 1 </Label>
        <div>Invest rate ( APR): {investAPR} %APR</div>
        <Label>15: ( debtPosition / baseBorrowed ) ^ t%year -1 </Label>
        <div>Borrowing rate (APR): {borrowAPR} %APR </div>
        <Label>16: leverage*longAPR - (leverage - 1)*borrowAPR </Label>
        <div>Net rate: {netAPR} %APR </div>
        <Label>16: ( investPostion - debtPosition - input ) </Label>
        <div>Return in base: { investPosition?.dsp! - debtPosition?.dsp! - input.dsp }  </div>
      </Inner>
    </BorderWrap>
  );
};

export default EstPositionWidget;
