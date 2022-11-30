import { useContext, useState } from 'react';
import { InputContext } from '../../context/InputContext';
import { BorderWrap, Divider, InfoBlock, Inner, Label, TopRow, Value } from '../styled';
import { LeverContext } from '../../context/LeverContext';
import { ILeverSimulation } from '../../hooks/useLever';
import Loader from '../common/Loader';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/20/solid';
import StackedLogos from '../common/StackedLogos';

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
    shortAssetBorrowed,
    shortAssetObtained,

    debtAtMaturity,
    longAssetObtained,
    investmentCurrent,
    investmentAtMaturity,
    flashBorrowFee,
    tradingFee,
    isSimulating,
    pnl,
    borrowLimitUsed,
  }: ILeverSimulation = props.lever;

  const [showExtra, setShowExtra] = useState<Boolean>(false);

  return (
    <BorderWrap className="pb-4">
      <TopRow>
        <div className="flex items-center gap-4">
          <StackedLogos size={8} logos={[longAsset?.image, shortAsset?.image]} />
          <div className="text-lg">Position Estimation</div>
        </div>

        <div className="flex gap-4">
          <div className="py-2 text-sm"> Leverage </div>
          <div className="text-lg rounded-full bg-primary-500 p-1 px-2"> X {leverage?.dsp.toFixed(1) || '0.0'} </div>
        </div>
      </TopRow>
      <Inner>
        <InfoBlock>
          <Label className="text-base">Initial Investment</Label>
          <Value className="text-xl flex justify-end gap-4">
            <div>{input?.dsp.toFixed(shortAsset?.displayDigits || 2)} </div>
            <div className="w-6"> {shortAsset?.image} </div>
          </Value>

          {/* <div /> */}
          {/* <Label className="text-lg" > Leverage </Label>
          <Value className="text-xl">
            <div className='flex lex-row justify-end'>
              <div className="text-lg rounded-full bg-primary-500 p-1 px-2"> X {leverage?.dsp || 0} </div>
            </div>
          </Value> */}

          {selectedLever && input?.dsp > 0 && (
            <>
              <Label className="text-base">net APR</Label>
              <Value
                className={`text-2xl font-extrabold ${
                  netAPR < 0 ? 'text-red-400 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-600 '
                }`}
              >
                {isSimulating ? <Loader /> : Math.round((netAPR + Number.EPSILON) * 100) / 100}%
              </Value>

              <Label className="text-base">Borrow Limit Usage</Label>
              <Value className="text-lg">
                {isSimulating ? <Loader /> : Math.round((borrowLimitUsed + Number.EPSILON) * 100) / 100} %
              </Value>
            </>
          )}
        </InfoBlock>

        {selectedLever && input?.dsp > 0 && (
          <>
            <Divider />
            <InfoBlock>
              <Label>
                <div className="flex   gap-2 ">
                  {longAsset.displaySymbol} Obtained
                  <div className="w-5">
                    <PlusCircleIcon />
                  </div>
                </div>
              </Label>
              <Value className="text-xl flex   justify-end gap-2">
                {isSimulating && <Loader />}
                {!isSimulating && (
                  <div className="text-xl flex   justify-end gap-6 ">
                    <div className="flex   gap-2">
                      <div className="w-6">{longAsset?.image}</div>
                      <div>{longAssetObtained?.dsp} </div>
                    </div>

                    <div className="flex   gap-2">
                      <div className="text-xs">earning</div>
                      <div>{Math.round((investAPR + Number.EPSILON) * 100) / 100}% </div>
                      <div className="text-xs">APR </div>
                    </div>
                  </div>
                )}
              </Value>

              <Label>
                <div className="flex   gap-2 ">
                  {shortAsset.displaySymbol} borrowed
                  <div className="w-5">
                    <MinusCircleIcon />
                  </div>
                </div>
              </Label>
              <Value className="text-xl flex   justify-end gap-2">
                {isSimulating && <Loader />}
                {!isSimulating && (
                  <div className="text-xl flex   justify-end gap-6">
                    <div className="flex   gap-2">
                      <div className="w-6">{shortAsset?.image}</div>
                      <div>{shortAssetBorrowed?.dsp} </div>
                    </div>
                    <div className="flex   gap-2">
                      <div className="text-sm">@</div>
                      <div>{Math.round((borrowAPR + Number.EPSILON) * 100) / 100}%</div>
                    </div>
                  </div>
                )}
              </Value>
            </InfoBlock>

            {showExtra && (
              <InfoBlock>
                <div className="text-sm text-start mt-2">Investment</div> <div />
                <Label className="text-sm">Investment value at maturity </Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${investmentAtMaturity?.dsp} ${longAsset?.displaySymbol}`}
                </Value>
                <Label className="text-sm">Current investment value </Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${investmentCurrent?.dsp} ${shortAsset?.displaySymbol}`}
                </Value>
                {/* <Label className="text-sm">Yield fy{shortAsset?.displaySymbol} used for investment</Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${shortAssetObtained?.dsp} FY${shortAsset?.displaySymbol}`}
                </Value> */}
                <div className=" text-sm text-start mt-2">Debt</div> <div />
                <Label className="text-sm">Amount owed at series maturity</Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${debtAtMaturity?.dsp} ${shortAsset?.displaySymbol}`}
                </Value>
                <div className=" text-sm text-start mt-2">
                  <div className="flex   gap-2 text-sm ">
                    Fees
                    <div className="w-5">
                      <MinusCircleIcon />
                    </div>
                  </div>
                </div>
                <div />
                <Label className="text-sm">Flash Borrowing fees </Label>
                <Value className="text-sm">{isSimulating ? <Loader /> : flashBorrowFee?.dsp}</Value>
                <Label className="text-sm">Trading fees </Label>
                <Value className="text-sm">{isSimulating ? <Loader /> : tradingFee?.dsp} </Value>
                <Label>
                  <div className="flex   gap-2 text-sm font-bold">Total fees</div>
                </Label>
                <Value className="text-sm font-bold ">
                  {isSimulating ? <Loader /> : `${tradingFee?.dsp + flashBorrowFee?.dsp} ${shortAsset?.displaySymbol}`}
                </Value>
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

            {/* <Divider /> */}
            {/* <InfoBlock>
              <Label>PnL</Label>
              <Value>{isSimulating ? <Loader /> : Math.round((pnl + Number.EPSILON) * 100) / 100} %</Value>
            </InfoBlock> */}
          </>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default EstimatedPosition;
