import { useContext, useState } from 'react';
import { InputContext } from '../../../context/InputContext';
import { BorderWrap, Divider, InfoBlock, Inner, Label, Section, TopRow, Value } from '../../styled';
import { LeverContext } from '../../../context/LeverContext';
import { ILeverSimulation } from '../../../hooks/useLever';
import Loader from '../../common/Loader';
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/20/solid';
import StackedLogos from '../../common/StackedLogos';
import { ZERO_BN } from '@yield-protocol/ui-math';
import WrapWithLogo from '../../common/WrapWithLogo';

const EstimatedPosition = (props: any) => {
  const [inputState] = useContext(InputContext);
  const { input, leverage, selectedLever } = inputState;
  const [leverState] = useContext(LeverContext);
  const { assets } = leverState;
  const shortAsset = assets.get(selectedLever?.baseId);
  const longAsset = assets.get(selectedLever?.ilkId);

  const {
    netAPR,
    borrowAPR,
    investAPR,
    shortAssetBorrowed,
    shortAssetInput,

    notification,

    debtAtMaturity,
    longAssetObtained,
    investmentValue,
    investmentAtMaturity,
    flashBorrowFee,
    tradingFee,
    isSimulating,
    pnl,
    borrowLimitUsed,
  }: ILeverSimulation = props.lever;

  console.log( investAPR )


  const [showExtra, setShowExtra] = useState<Boolean>(false);

  return (
    <BorderWrap className="pb-4">
      <TopRow>
        {selectedLever ? (
          <div className="flex items-center gap-4">
            <StackedLogos size={8} logos={[longAsset?.image, shortAsset?.image]} />
            { !input.big.gt(ZERO_BN) &&  <div className="text-lg text-slate-400">Position Simulator</div> }
            { input.big.gt(ZERO_BN) &&  <div className="text-lg text-slate-400">Simulation</div> }
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-4">
          {input.big.gt(ZERO_BN) && (
            <Value className="text-2xl flex items-center justify-end gap-2">
              <div className="w-4"> {shortAsset?.image} </div>
              <div>{input?.dsp.toFixed(2)} </div>
            </Value>
          )}

          <div className="flex items-center gap-2 ">
            <div className="relative text-lg font-bold min-w-[5em] rounded-full bg-primary-600 p-1 px-2">
              X {leverage?.dsp.toFixed(1) || '0.0'}
            </div>
          </div>
        </div>
      </TopRow>

      {selectedLever && notification && <div> {notification.msg} </div>}

      {/* { input?.dsp === 0 && ( <div> Enter an amount to get started. </div> ) } */}

      {!notification && selectedLever && input?.dsp > 0 && (
        <Inner>
          <InfoBlock className='px-2'>
            <Label className="text-sm">Net return rate </Label>
            <Value
              className={`text-2xl font-extrabold ${
                netAPR < 0 ? 'text-red-400 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-600 '
              }`}
            >
              {isSimulating ? <Loader /> : Math.round((netAPR + Number.EPSILON) * 100) / 100}%  <span className='text-xs font-bold'>APR</span>
              
            </Value>

            <Label className="text-sm">Borrow Limit Usage</Label>
            <Value className="text-lg">
              {isSimulating ? <Loader /> : Math.round((borrowLimitUsed + Number.EPSILON) * 100) / 100} %
            </Value>

            {/* <Label className="text-sm">PNL</Label>
            <Value className="text-lg">
              {isSimulating ? <Loader /> : Math.round((pnl + Number.EPSILON) * 100) / 100} %
            </Value> */}

          </InfoBlock>

          {/* <Divider /> */}

          <Section className='mb-8'>
            <div className={`flex justify-between bg-slate-900 bg-opacity-20 py-2 mb-2 text-sm`}>Overview</div>
            {isSimulating && <Loader />}

            {!isSimulating && (
              <div className="space-y-2" >
                <div className="flex items-center gap-2 justify-between ">
                  <div className="flex items-center gap-2 text-sm text-slate-400 ">
                    <div className='text-sm'> {shortAsset.displaySymbol}</div>
                    <div> provided by user</div>
                  </div>
                  <div className="flex text-lg items-center gap-2">
                    <div className="w-4">{shortAsset?.image}</div>
                    <div>{shortAssetInput?.dsp.toFixed(2)} </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-between">

                  <div className="flex text-sm gap-2 items-center text-slate-400 ">
                    <div className='text-sm'> {shortAsset.displaySymbol}  </div>
                    <div> borrowed from Yield Protocol </div>
                    {/* <div className="text-xs border rounded-full min-w-2em px-2">@ {Math.round((borrowAPR + Number.EPSILON) * 100) / 100}%</div> */}

                  </div>

                  <div className="text-2xl flex items-center justify-end gap-2">
                    <div className="flex items-center text-lg gap-2">
                    <div className="text-xs border rounded-full min-w-2em px-2">fixed @ {Math.round((borrowAPR + Number.EPSILON) * 100) / 100}%</div>

                      <div className="w-4">{shortAsset?.image}</div>
                      <div>{shortAssetBorrowed?.dsp} </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                  
                  <div className='text-sm'>{longAsset?.displaySymbol}</div>
                    <div className="flex items-center gap-2">
                      bought on
                      <WrapWithLogo logo={selectedLever?.tradeImage}> {selectedLever?.tradePlatform} </WrapWithLogo>
                    </div>
                    {/* <div className="text-xs border rounded-full min-w-2em px-2"> earning {Math.round((investAPR + Number.EPSILON) * 100) / 100}%</div> */}
                  </div>

                  <div className="flex  items-center text-lg gap-2">
                  <div className="text-xs border rounded-full min-w-2em px-2"> earning ~ {Math.round((investAPR + Number.EPSILON) * 100) / 100}%</div>
                    <div className="w-4">{longAsset?.image}</div>
                    <div> {longAssetObtained?.dsp} </div>

                  </div>
                </div>
              </div>
            )}
          </Section>

          {showExtra && (

            <InfoBlock>
              <div className="text-sm text-start mt-2">Investment</div> <div />
              <Label className="text-sm">Investment at maturity </Label>
              <Value className="text-sm">
                {isSimulating ? <Loader /> : `${investmentAtMaturity?.dsp} ${longAsset?.displaySymbol}`}
              </Value>
              <Label className="text-sm">Estimated {`${shortAsset?.displaySymbol}`} value at maturity</Label>
              <Value className="text-sm">
                {isSimulating ? <Loader /> : `${investmentValue?.dsp} ${shortAsset?.displaySymbol}`}
              </Value>
              {/* <Label className="text-sm">Yield fy{shortAsset?.displaySymbol} used for investment</Label>
                <Value className="text-sm">
                  {isSimulating ? <Loader /> : `${shortAssetObtained?.dsp} FY${shortAsset?.displaySymbol}`}
                </Value> */}
              <div className=" text-sm text-start mt-2">Fixed debt</div> <div />
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

          <div className="m-2">
            <button
              className="text-xs text-slate-700 dark:text-slate-400 text-left"
              onClick={() => setShowExtra(!showExtra)}
            >
              {showExtra ? 'Show less -' : 'Show More Info +'}
            </button>
          </div>
        </Inner>
      )}
    </BorderWrap>
  );
};

export default EstimatedPosition;
