import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';
import { BorderWrap } from '../styles';
import { LeverContext } from '../../context/LeverContext';

const Inner = tw.div`m-4 gap-10`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;

const InfoBlock = tw.div`grid grid-cols-2 gap-4 my-8`;
const Label = tw.div`text-[grey] text-left`;
const Value = tw.div`text-[white] text-right`;

const Divider = tw.div`border-0.5 border-[indigo] border-t-[indigo]`;
const NotShown = tw.div`invisible`;

const EstimatedPosition = (props:any) => {
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
    swapFee,
    isSimulating,
  } = props.lever;

  return (
    <BorderWrap >
      <Inner>
      <TopRow>Estimated Position Information</TopRow>

      <InfoBlock>
        <Label>Input value (Short asset):</Label>
        <Value>  {input?.dsp} { shortAsset?.displaySymbol } </Value>  
        {/* <NotShown> Wrapped input: {input?.dsp} WETH </NotShown>
        <NotShown> Short asset investment as FyToken : {inputAsFyToken.dsp} (fyETH) </NotShown>
        <NotShown> Total Investment ( fyToken ): {totalToInvest.dsp} (fyETH) </NotShown>  */}
        <Label> Leverage (INPUT):</Label>
        <Value> {leverage?.dsp || 0} X </Value>
      
      </InfoBlock>

      <Divider />

      <InfoBlock>
        <Label>Short asset invested:</Label>
        <Value>{shortInvested?.dsp} FYETH</Value>

        <Label>Short asset borrowed:</Label>
        <Value>{shortBorrowed?.dsp} { shortAsset?.displaySymbol }</Value>

        <Label>Debt owed at maturity:</Label>
        <Value> {debtPosition?.dsp} FYETH=={ shortAsset?.displaySymbol } </Value>

        <Label>Long asset obtained: </Label>
        <Value>{investPosition?.dsp} { longAsset?.displaySymbol } </Value>

        <Label>Flash fees</Label>
        <Value>{flashFee?.dsp} </Value>

        <Label>Swap fees</Label>
        <Value>{swapFee?.dsp} </Value>

        <Label>Value of long asset (in short terms): </Label>
        <Value>{investValue?.dsp} { shortAsset?.displaySymbol } </Value>

      </InfoBlock>

      <Divider />

      <InfoBlock>
        {/* <NotShown> (debtPosition/investPosition * LTV )</NotShown> */}
        <Label>Borrow Limit :</Label>
        {/* <Value> {selectedStrategy?.loanToValue*100 } %</Value> */}

        <Value> {debtPosition?.dsp!/investPosition?.dsp! * selectedStrategy?.loanToValue*100 } %</Value>


        {/* <NotShown>(pos/prin - 1)</NotShown> */}
        <Label>PnL</Label>
        <Value>{Math.round(((investPosition?.dsp!/shortInvested?.dsp! -1) + Number.EPSILON) * 100) / 100}</Value>

        {/* <NotShown>( investPosition/ baseInvested ) ^ t%year - 1</NotShown> */}
        <Label>Invest rate ( APR):</Label>
        <Value> {Math.round((investAPR + Number.EPSILON) * 100) / 100} %APR</Value>

        {/* <NotShown>( debtPosition / baseBorrowed ) ^ t%year -1</NotShown> */}
        <Label>Borrowing rate (APR):</Label>
        <Value>{Math.round((borrowAPR + Number.EPSILON) * 100) / 100} %APR</Value>

        {/* <NotShown>leverage*longAPR - (leverage - 1)*borrowAPR</NotShown> */}
        <Label>Net rate:</Label>
        <Value>{Math.round((netAPR + Number.EPSILON) * 100) / 100} %APR</Value>

        {/* <NotShown>( investPostion - debtPosition - input )</NotShown> */}
        <Label>Return in base: </Label>
        <Value>{ investPosition?.dsp! - debtPosition?.dsp! - input?.dsp } { shortAsset?.displaySymbol }</Value>

      </InfoBlock>
      </Inner>

    </BorderWrap>
  );
};

export default EstimatedPosition;
