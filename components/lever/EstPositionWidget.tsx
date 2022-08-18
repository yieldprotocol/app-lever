import { BigNumber } from 'ethers';
import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext, W3bNumber } from '../../context/InputContext';
import { BorderWrap } from '../styles';
import { useLever } from '../../hooks/useLever';
import { ILeverStrategy, LeverContext } from '../../context/LeverContext';

const Inner = tw.div`m-4 gap-10`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const Label = tw.div`text-[10px] text-[grey]`;
const NotShown = tw.div` text-[pink]`;

const EstPositionWidget = (props:any) => {
  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState;

  const [leverState] = useContext(LeverContext);
  const { selectedStrategy, shortAsset, longAsset } = leverState;

  const {
    netAPR,
    borrowAPR,
    investAPR,
    shortBorrowed,
    shortInvested,
    debtPosition,
    investPosition,
    investValue,
    flashFee,
    swapFee
  } = props.lever;

  return (
    <BorderWrap>
      <TopRow>Estimated Position Information</TopRow>
   
      <Inner>
      <br/>
        === INPUTS ===
        <Label>1: Input value (INPUT) </Label>
        <div> Input value (Short asset) : {input?.dsp} { shortAsset?.displaySymbol } </div>
        {/* <Label>2: Wrap if required (1:1)</Label> */}
        {/* <NotShown> Wrapped input: {input?.dsp} WETH </NotShown> */}
        {/* <Label>3: Sell Short Asset for fyToken ( sellBase() ) </Label> */}
        {/* <NotShown> Short asset investment as FyToken : {inputAsFyToken.dsp} (fyETH) </NotShown> */}
        {/* <Label>5: Total to invest based on input and leverage (fyToken input*leverage) </Label> */}
        {/* <NotShown> Total Investment ( fyToken ): {totalToInvest.dsp} (fyETH) </NotShown> */}

        <Label>4: Input Leverage (INPUT):</Label>
        <div>Leverage: {leverage.dsp} X </div>
        <br/>
        === SIMULATIONS ===
        <Label>6: Base Invested ( baseInvested ) </Label>
        <div> Short asset total invested : {shortInvested?.dsp} FYETH</div>
        <Label>7: Base Borrowed ( baseBorrowed ) </Label>
        <div> Short asset borrowed : {shortBorrowed?.dsp} { shortAsset?.displaySymbol } </div>
        <Label>8: Debt Position ( debtPosition ) </Label>
        <div> Debt owed at maturity : {debtPosition?.dsp} FYETH=={ shortAsset?.displaySymbol }</div>
        <Label>9: Investment position ( long asset obtained ) ( investPosition ) </Label>
        <div> Long asset obtained : {investPosition?.dsp} { longAsset?.displaySymbol }</div>

        {/* <Label>10: Amount borrowed </Label>
        <div>Current Debt: {toBorrow.dsp} ETH </div> */}
        <Label>11: flashFee </Label>
        <div> Flash borrow fee: {flashFee?.dsp} </div>

        <div> Swap Back fee : {swapFee?.dsp} </div>
        
        <br/>
        === CURRENT VALUES ===

        <Label>9: Investment value( ) ( investPosition ) </Label>
        <div> Value of long asset (in short terms): {investValue?.dsp} { shortAsset?.displaySymbol } </div>

        {/* <Label>12: Current value </Label>
        <NotShown> Current position value: {valueOfInvestment.dsp} </NotShown> */}
        <br/>
        === CALCULATIONS ===

        <Label>13: (debtPosition/investPosition * LTV ) </Label>
        <NotShown> Borrow Limit: {debtPosition?.dsp!/investPosition?.dsp! * selectedStrategy?.LoanToValue*100 } % </NotShown> 

        <Label>13: (pos/prin - 1) </Label>
        <div>PnL : {Math.round(((investPosition?.dsp!/shortInvested?.dsp! -1) + Number.EPSILON) * 100) / 100} </div>
        <Label>14: ( investPosition/ baseInvested ) ^ t%year - 1 </Label>
        <div>Invest rate ( APR): {Math.round((investAPR + Number.EPSILON) * 100) / 100} %APR</div>
        <Label>15: ( debtPosition / baseBorrowed ) ^ t%year -1 </Label>
        <div>Borrowing rate (APR): {Math.round((borrowAPR + Number.EPSILON) * 100) / 100} %APR </div>
        <Label>16: leverage*longAPR - (leverage - 1)*borrowAPR </Label>
        <div>Net rate: {Math.round((netAPR + Number.EPSILON) * 100) / 100} %APR </div>
        <Label>16: ( investPostion - debtPosition - input ) </Label>
        <div>Return in base: { investPosition?.dsp! - debtPosition?.dsp! - input?.dsp } { shortAsset?.displaySymbol }  </div>
      </Inner>
    </BorderWrap>
  );
};

export default EstPositionWidget;
