import { BigNumber } from 'ethers';
import { useContext, useMemo } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext, W3bNumber } from '../../context/InputContext';
import { useStEth } from '../../hooks/leverHooks/useStEth';
import { BorderWrap, Header } from '../styles';
import { useLever } from './useLever';

const Inner = tw.div`m-4 gap-10`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const Label = tw.div`text-[10px] text-[grey]`;

export interface leverDetails {
  investPosition: W3bNumber|undefined;
  debtPosition: W3bNumber|undefined;
  baseInvested: W3bNumber|undefined;
  baseBorrowed: W3bNumber|undefined;
  flashFee: W3bNumber|undefined;
}

const EstPositionWidget = () => {
  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState;

  const { totalToInvest, toBorrow, inputAsFyToken, valueOfInvestment } = useLever();

  const stEthLever : leverDetails = useStEth(inputAsFyToken, toBorrow );

  return (
    <BorderWrap>
      <TopRow>
        Estimated Position Information
      </TopRow>

      {/* <div>{input?.dsp.toString()}</div>
      <div> {input?.hStr.toString()} </div>
      <div> {input?.big.toString()} </div> */}
      
      <Inner>
        
        <Label>1: Input value (INPUT) </Label>
        <div> Input value (Short asset) : {input.dsp} ETH </div>

        <Label>2: Wrap if required (1:1)</Label>
        <div> Wrapped input: {input.dsp} WETH </div>
        
        <Label>3: Sell Short Asset for fyToken ( sellBase() ) </Label>
        <div> Short asset investment as FyToken : {inputAsFyToken.dsp} (fyETH) </div>
        
        <Label>4: Input Leverage (INPUT):</Label>
        <div>Leverage: {leverage.dsp} X </div>
        
        <Label>5: Total to invest based on input and leverage </Label>
        <div> Total Investment ( fyToken ): {totalToInvest.dsp} (fyETH)</div> 

        ================================

        <Label>5: Base Invested </Label>
        <div> Total base  used to invest: {stEthLever.baseInvested?.dsp} </div>

        <Label>6: Base Borrowed </Label>
        <div> Base borrowed:  {stEthLever.baseBorrowed?.dsp} </div>

        <Label>6: Debt Position (at Maturity) </Label>
        <div> Debt owed at maturity: {stEthLever.debtPosition?.dsp} </div>

        <Label>5: Investment position (long asset obtained) </Label>
        <div>  Long position : {stEthLever.investPosition?.dsp} </div>

        <Label>6: flashFee </Label>
        <div> Flash borrow fee: {stEthLever.flashFee?.dsp} </div>

        <Label>6: Current value </Label>
        <div> Current position value: { valueOfInvestment.dsp } </div>

        <Label>9: Value of debt at present </Label>
        <div>Current Debt: {toBorrow.dsp} ETH </div>


        ===========CALC'D========


        <Label>7: </Label>
        <div>PnL (pos/prin - 1): </div>

        <Label>8: </Label>
        <div>Long Rate ( APR): x %APR</div>


        <Label>10: </Label>
        <div>Borrowing rate (borrow APR): x %APR </div>

        <div> </div>
      </Inner>
    </BorderWrap>
  );
};

export default EstPositionWidget;
