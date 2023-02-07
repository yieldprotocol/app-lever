import { ArrowRightOnRectangleIcon, ArrowTrendingUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { etherscanBlockExplorers, useNetwork } from 'wagmi';
import { FC, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { IPositionContextState, PositionContext, PositionStatus } from '../../../context/PositionContext';
import Button from '../../common/Button';
import { BorderWrap, InfoBlock, Inner, Label, Section, TopRow, Value } from '../../styled';
import Link from 'next/link';
import { abbreviateHash } from '../../../utils/appUtils';
import { IAsset, ILever, ILeverContextState, LeverContext } from '../../../context/LeverContext';
import StackedLogos from '../../common/StackedLogos';
import { ILeverSimulation } from '../../../hooks/useLever';
import WrapWithLogo from '../../common/WrapWithLogo';

const TxInfo = (props: { label: string; date: Date | undefined; txHash: string | undefined }) => {
  const { chain } = useNetwork();
  const { url: baseUrl } = chain?.id === 1 ? etherscanBlockExplorers.mainnet : etherscanBlockExplorers.arbitrum;
  const url = `${baseUrl}/tx/${props.txHash}`;
  return (
    <div className={`flex justify-between bg-slate-900 bg-opacity-20 py-2 mb-2`}>
      <div className={`text-sm`}> {props.label} </div>
      <div className="flex gap-4">
        {/* <div className={`text-sm`}> {abbreviateHash(props.txHash!)} </div> */}
        <div className={`text-xs`}> {props.date?.toDateString()} </div>
        <Link href={url} rel="noopener noreferrer" target="_blank">
          <div className="w-4">
            <ArrowRightOnRectangleIcon />
          </div>
        </Link>
      </div>
    </div>
  );
};

const PositionWidget = (props: any) => {
  const { address: account } = useAccount();

  const [leverState] = useContext(LeverContext);
  const { levers, assets } = leverState as ILeverContextState;

  const [positionState] = useContext(PositionContext);
  const { selectedPosition } = positionState as IPositionContextState;

  const [associatedLever, setAssociatedLever] = useState<ILever>();
  const [shortAsset, setShortAsset] = useState<IAsset>();
  const [longAsset, setLongAsset] = useState<IAsset>();

  const [isClosed, setIsClosed] = useState<boolean>();
  const [showInfo, setShowInfo] = useState<boolean>(false);

  useEffect(() => {
    if (selectedPosition) {
      setAssociatedLever(levers.get(selectedPosition.leverId));
      setShortAsset(assets.get(selectedPosition.baseId));
      setLongAsset(assets.get(selectedPosition.ilkId));
      setIsClosed(selectedPosition.status === PositionStatus.CLOSED);
    }
  }, [selectedPosition]);

  const { divest, investmentAtMaturity, investmentValue } = props.lever as ILeverSimulation;
  const InfoLogo: FC<any> = () => <InformationCircleIcon />;

  return (
    <BorderWrap>
      {selectedPosition ? (
        <>
          <TopRow>
            {/* <div className="w-8" > {associatedLever?.tradeImage} </div> */}
            <StackedLogos size={8} logos={[longAsset?.image!, shortAsset?.image!]} />
            <div className="text-2xl">
              {/* <WrapWithLogo logo={<InformationCircleIcon onClick={() => setShowInfo(!showInfo)} />} size={6} logoAfter>
              {selectedPosition.displayName}
              </WrapWithLogo> */}
              {selectedPosition.displayName}
            </div>

            <div className="flex items-center gap-2 ">
              <div className={`text-xs rounded-full p-2 ${!isClosed ? 'bg-emerald-500 ' : 'bg-red-500'}`}>
                {selectedPosition.status}
              </div>
              <div className="w-8 h-8">
                {' '}
                <InformationCircleIcon onClick={() => setShowInfo(!showInfo)} />{' '}
              </div>
            </div>
          </TopRow>

          {showInfo && (
            <TopRow>
              <div className="text-xs w-full space-y-2">
                <div className="flex justify-between">
                  <div>Vault Id </div>
                  <div> {abbreviateHash(selectedPosition.vaultId)}</div>
                </div>

                <div className="flex justify-between">
                  <div> Long asset </div>
                  <WrapWithLogo logo={longAsset?.image!}> {longAsset?.name} </WrapWithLogo>
                </div>

                <div className="flex justify-between">
                  <div> Trading platform </div>
                  <WrapWithLogo logo={associatedLever?.tradeImage!}> {associatedLever?.tradePlatform} </WrapWithLogo>
                </div>
              </div>
            </TopRow>
          )}

          <Inner className="pb-8">
            <div className="pb-8">
              <Section>
                <div className="text-emerald-500">
                  <TxInfo
                    label="Invested"
                    date={selectedPosition.investTxDate}
                    txHash={selectedPosition.investTxHash}
                  />
                </div>

                <div className="text-base space-y-4">
                  <div className="flex justify-between">
                    <Label> Principal investment </Label>
                    <div className="flex gap-4">
                      <WrapWithLogo logo={shortAsset?.image!}>
                        <div className="text-xl">{selectedPosition.shortAssetInput.dsp.toFixed(2)} </div>
                      </WrapWithLogo>
                      <div className=" items-center ">
                        <div className="flex gap-2 px-3 font-bold justify-between rounded-full min-w-3em bg-primary-600 ">
                          {selectedPosition.leverage.toFixed(1)} X
                        </div>                 
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Label> {longAsset?.displaySymbol} position aquired </Label>
                    <WrapWithLogo logo={longAsset?.image!}>
                      <div className="text-xl">{selectedPosition.longAssetObtained.dsp}</div>
                    </WrapWithLogo>
                  </div>
                </div>
              </Section>

              <Section>
                {!isClosed && (
                  <div className="text-base">
                    <div className={`flex text-sm bg-slate-900 bg-opacity-20 py-2 mb-2 text-emerald-500`}>
                      Projections
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label> Estimated {longAsset?.displaySymbol} at maturity</Label>
                        <WrapWithLogo logo={longAsset?.image!}>
                          <div className="text-xl">{investmentAtMaturity?.dsp}</div>
                        </WrapWithLogo>
                      </div>
                      <div className="flex justify-between">
                        <Label> {shortAsset?.displaySymbol} return if divesting now </Label>
                        <WrapWithLogo logo={shortAsset?.image!}>
                          <div className="text-xl">{investmentValue?.dsp}</div>
                        </WrapWithLogo>
                      </div>
                    </div>
                  </div>
                )}

                {isClosed && (
                  <>
                    <div className="text-red-500">
                      <TxInfo
                        label="Divested"
                        date={selectedPosition.divestTxDate}
                        txHash={selectedPosition.divestTxHash}
                      />
                    </div>

                    <div className="text-base space-y-4">
                      <div className="flex justify-between">
                        <Label> {shortAsset?.displaySymbol} returned </Label>

                        <WrapWithLogo logo={shortAsset?.image!}>
                          <div className="text-xl"> {selectedPosition.divestReturn?.dsp}</div>
                        </WrapWithLogo>
                      </div>
                      {/* <div className="flex justify-between">
                        <Label> {shortAsset?.displaySymbol} return if divesting now </Label>
                        <WrapWithLogo logo={shortAsset?.image!}> {investmentValue?.dsp}</WrapWithLogo>
                      </div> */}
                    </div>
                  </>
                )}
              </Section>
            </div>
            {selectedPosition.status === PositionStatus.ACTIVE && (
              <Button
                action={() => divest()}
                disabled={!account}
                loading={false}
                // loading={isTransacting}
              >
                Divest
              </Button>
            )}
          </Inner>
        </>
      ) : (
        <div />
      )}
    </BorderWrap>
  );
};

export default PositionWidget;
