import { useContext } from 'react';
import { InputContext } from '../../context/InputContext';
import { BorderWrap, Divider, InfoBlock, Inner, Label, Spinner, TopRow, Value } from '../styled';
import { LeverContext } from '../../context/LeverContext';
import { LeverSimulation } from '../../hooks/useLever';
import Loader from '../common/Loader';

const EstimatedPosition = (props: any) => {
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
    debtAtMaturity,
    investmentPosition,
    investmentCurrent,
    investmentAtMaturity,
    flashBorrowFee,
    investmentFee,
    isSimulating,

    pnl,
    borrowLimitUsed,
    maxLeverage,
  }: LeverSimulation = props.lever;

  return (
    <BorderWrap>
      <TopRow>Estimated Position Information</TopRow>
      <Inner>
        <InfoBlock>
          <Label>Principle Investment:</Label>
          <Value>
            {input?.dsp} {shortAsset?.displaySymbol}
          </Value>
          {/* <NotShown> Wrapped input: {input?.dsp} WETH </NotShown>
        <NotShown> Short asset investment as FyToken : {inputAsFyToken.dsp} (fyETH) </NotShown>
        <NotShown> Total Investment ( fyToken ): {totalToInvest.dsp} (fyETH) </NotShown>  */}
          <Label> Leverage:</Label>
          <Value> {leverage?.dsp || 0} X </Value>
        </InfoBlock>

        {/* {isSimulating && <Loader />} */}

        {input?.dsp > 0 && (
          <>
            <Divider />
            <InfoBlock>
              {/* <Label>Short asset invested:</Label>
                  <Value>{shortInvested?.dsp} FYETH</Value> 
                  
                */}

              <Label>Short asset borrowed: </Label>
              <Value>
                {isSimulating ?  <Loader /> : `${shortBorrowed?.dsp} ${shortAsset?.displaySymbol}` }
              </Value>

              <Label> - Debt owed at maturity:</Label>
              <Value>
              {isSimulating ? <Loader /> : `${debtAtMaturity?.dsp } ${shortAsset?.displaySymbol}`}

              </Value>

              <Label>Long asset obtained: </Label>
              <Value>
              {isSimulating ? <Loader /> : `${investmentPosition?.dsp} ${longAsset?.displaySymbol}`}
              </Value>

              <Label> - Investment at maturity: </Label>
              <Value>
              {isSimulating ? <Loader /> : `${investmentAtMaturity?.dsp} ${longAsset?.displaySymbol}`}
              </Value>

              <Label>Flash Borrowing fees: </Label>
              <Value>{isSimulating ? <Loader /> : flashBorrowFee?.dsp < 0.0000001 ? flashBorrowFee?.dsp : <p>Insignificant</p>} </Value>

              <Label>Investment fees: </Label>
              <Value>{isSimulating ? <Loader /> : investmentFee?.dsp} </Value>

              <Label>Current investment value (in short terms): </Label>
              <Value>
                {isSimulating ? <Loader /> :`${investmentCurrent?.dsp} ${shortAsset?.displaySymbol}`}
              </Value>
            </InfoBlock>

            <Divider />

            <InfoBlock>
              {/* <NotShown> (debtPosition/investPosition * LTV )</NotShown> */}
              <Label>Borrow Limit Usage:</Label>
              {/* <Value> {selectedStrategy?.loanToValue*100 } %</Value> */}

              <Value> {isSimulating ? <Loader /> : Math.round((borrowLimitUsed + Number.EPSILON) * 100) / 100}%</Value>

              {/* <NotShown>(pos/prin - 1)</NotShown> */}
              <Label>PnL</Label>
              <Value>{isSimulating ? <Loader /> : Math.round((pnl + Number.EPSILON) * 100) / 100}</Value>

              {/* <NotShown>( investPosition/ baseInvested ) ^ t%year - 1</NotShown> */}
              <Label>Investment rate ( + ):</Label>
              <Value> { isSimulating ? <Loader /> : Math.round((investAPR + Number.EPSILON) * 100) / 100} %APR</Value>

              {/* <NotShown>( debtPosition / baseBorrowed ) ^ t%year -1</NotShown> */}
              <Label>Borrowing rate ( - ):</Label>
              <Value>{isSimulating ? <Loader /> : Math.round((borrowAPR + Number.EPSILON) * 100) / 100} %APR</Value>

              {/* <NotShown>leverage*longAPR - (leverage - 1)*borrowAPR</NotShown> */}
              <Label>Net rate:</Label>
              <Value>{isSimulating ? <Loader /> : Math.round((netAPR + Number.EPSILON) * 100) / 100} %APR</Value>

              {/* <NotShown>( investPostion - debtPosition - input )</NotShown> */}
              {/* <Label>Return in base: </Label>
              <Value>
                {investmentPosition?.dsp! - debtAtMaturity?.dsp! - input?.dsp} {shortAsset?.displaySymbol}
              </Value> */}
            </InfoBlock>
          </>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default EstimatedPosition;
