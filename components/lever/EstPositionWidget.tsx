import { BigNumber } from 'ethers';
import { useContext, useMemo } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';
import { BorderWrap, Header } from '../styles';
import { useLever } from './useLever';

const Inner = tw.div`m-4 gap-10`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const Label = tw.div`text-[10px] text-[grey]`;

const EstPositionWidget = () => {
  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState;

  const { totalToInvest, toBorrow, inputAsFyToken, valueOfInvestment } = useLever();

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
        <div> Base to invest (input) : {input.dsp} ETH </div>

        <Label>2: Wrap if required (1:1)</Label>
        <div> Wrapped ETH input: {input.dsp} WETH </div>
        
        <Label>3: Sell base for fyToken ( sellBase() ) </Label>
        <div>Principle Investment ( FyToken) : {inputAsFyToken.dsp} fyETH </div>
        
        <Label>4: Input Leverage (INPUT):</Label>
        <div>Leverage: {leverage.dsp} X</div>



        
        <Label>5: Total to invest based on input</Label>
        <div> Supplying ( fyToken ): {totalToInvest.dsp} </div> 

        <Label> 6: Current value   </Label>
        <div>Position value: { valueOfInvestment.dsp } </div>

        <Label>7:  </Label>
        <div>PnL (pos/prin - 1): </div>

        <Label>8: </Label>
        <div>Supply Rate (APR): x %APR</div>

        <Label>9: </Label>
        <div>Borrowed Amount: {toBorrow.dsp} ETH </div>

        <Label>10: </Label>
        <div>Borrowing rate (APR): x %APR </div>

        <div> </div>
      </Inner>
    </BorderWrap>
  );
};

export default EstPositionWidget;
