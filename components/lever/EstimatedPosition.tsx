import { useContext, useState } from 'react';
import { InputContext } from '../../context/InputContext';
import { BorderWrap, Divider, InfoBlock, Inner, Label, TopRow, Value } from '../styled';
import { LeverContext } from '../../context/LeverContext';
import { ILeverSimulation } from '../../hooks/useLever';
import Loader from '../common/Loader';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/20/solid';

const EstimatedPosition = (props: any) => {
  const [inputState] = useContext(InputContext);
  const { input, leverage } = inputState;

  const [leverState] = useContext(LeverContext);
  const { selectedLever, assets } = leverState;

  const shortAsset = assets.get(selectedLever?.baseId);
  const longAsset = assets.get(selectedLever?.ilkId);

  const {
    netAPR,
    borrowAPR,
    investAPR,
    investmentBorrowed,
    shortInvested,
    debtAtMaturity,
    investmentLong,
    investmentCurrent,
    investmentAtMaturity,
    flashBorrowFee,
    investmentFee,
    isSimulating,
    pnl,
    borrowLimitUsed,
  }: ILeverSimulation = props.lever;

  const [showExtra, setShowExtra] = useState<Boolean>(false);

  return (
    <BorderWrap className="pb-4">
      <TopRow>Estimated Position Information</TopRow>
      <Inner>
        <InfoBlock>
          <Label>Principal Investment:</Label>
          <Value>
            {input?.dsp} {shortAsset?.displaySymbol}
          </Value>
          <Label> Leverage:</Label>
          <Value> {leverage?.dsp || 0} X </Value>
        </InfoBlock>

        {selectedLever && input?.dsp > 0 && (
          <>
            <Divider />
            <InfoBlock>
              <Label>Short asset borrowed: </Label>
              <Value>{isSimulating ? <Loader /> : `${investmentBorrowed?.dsp} ${shortAsset?.displaySymbol}`}</Value>

              <Label>Long asset obtained: </Label>
              <Value>{isSimulating ? <Loader /> : `${investmentLong?.dsp} ${longAsset?.displaySymbol}`}</Value>

              <Label>Total fees: </Label>
              <Value>
                {isSimulating ? <Loader /> : `${investmentFee?.dsp + flashBorrowFee?.dsp} ${shortAsset?.displaySymbol}`}
              </Value>
            </InfoBlock>

            {showExtra && (
              <InfoBlock>
                <div className="text-sm text-start mt-2">Investment</div> <div />
                <Label className="text-sm">Investment value at maturity: </Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${investmentAtMaturity?.dsp} ${longAsset?.displaySymbol}`}
                </Value>
                <Label className="text-sm">Current investment value: </Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${investmentCurrent?.dsp} ${shortAsset?.displaySymbol}`}
                </Value>
                <Label className="text-sm">Yield fy{shortAsset?.displaySymbol} used for investment:</Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${shortInvested?.dsp} FY${shortAsset?.displaySymbol}`}
                </Value>
                <div className=" text-sm text-start mt-2">Debt</div> <div />
                <Label className="text-sm">Borrowed amount owed at maturity:</Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${debtAtMaturity?.dsp} ${shortAsset?.displaySymbol}`}
                </Value>
                <div className=" text-sm text-start mt-2">Fees</div> <div />
                <Label className="text-sm">Flash Borrowing fees: </Label>
                <Value className="text-sm">{isSimulating ? <Loader /> : flashBorrowFee?.dsp}</Value>
                <Label className="text-sm">Trading fees: </Label>
                <Value className="text-sm">{isSimulating ? <Loader /> : investmentFee?.dsp} </Value>
              </InfoBlock>
            )}

            <div className="mb-2">
              <button
                className="text-xs text-slate-700 dark:text-slate-400 text-left"
                onClick={() => setShowExtra(!showExtra)}
              >
                {showExtra ? 'Show less -' : 'Show Advanced Info +'}
              </button>
            </div>
            <Divider />

            <InfoBlock>
              <Label>Borrow Limit Usage</Label>
              <Value> {isSimulating ? <Loader /> : Math.round((borrowLimitUsed + Number.EPSILON) * 100) / 100} %</Value>

              <Label>PnL</Label>
              <Value>{isSimulating ? <Loader /> : Math.round((pnl + Number.EPSILON) * 100) / 100} %</Value>

              <Label>
                <div className="flex flex-row gap-2 ">
                  Investment rate
                  <div className="w-5">
                    <PlusCircleIcon />
                  </div>
                </div> 
              </Label>
              <Value>{isSimulating ? <Loader /> : Math.round((investAPR + Number.EPSILON) * 100) / 100} % APR</Value>

              <Label>
                <div className="flex flex-row gap-2 ">
                  Borrowing rate
                  <div className="w-5">
                    <MinusCircleIcon />
                  </div>
                </div>
              </Label>
              <Value>{isSimulating ? <Loader /> : Math.round((borrowAPR + Number.EPSILON) * 100) / 100} % APR</Value>

              <Label>Net rate</Label>
              <Value className={netAPR < 0 ? 'text-red-400 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-600 '}>
                {isSimulating ? <Loader /> : Math.round((netAPR + Number.EPSILON) * 100) / 100} % APR
              </Value>
            </InfoBlock>
          </>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default EstimatedPosition;
