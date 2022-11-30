import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { etherscanBlockExplorers, useNetwork } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { IPositionContextState, PositionContext, PositionStatus } from '../../context/PositionContext';
import Button from '../common/Button';
import { BorderWrap, InfoBlock, Inner, Label, TopRow, Value } from '../styled';
import Link from 'next/link';
import { abbreviateHash } from '../../utils/appUtils';
import { IAsset, ILever, ILeverContextState, LeverContext } from '../../context/LeverContext';
import StackedLogos from '../common/StackedLogos';

const TxInfo = (props: { label: string; date: Date | undefined; txHash: string | undefined }) => {
  const { chain } = useNetwork();
  const {url:baseUrl} = (chain?.id === 1) ? etherscanBlockExplorers.mainnet : etherscanBlockExplorers.arbitrum;
  const url = `${baseUrl}/tx/${props.txHash}`;
  return (
    <TopRow className="px-4 py-2" >
      <div className={`text-sm`}> {props.label} </div>
      <div className="flex   gap-4">
        <div className={`text-sm`}> {abbreviateHash(props.txHash!) } </div>
        <div className={`text-sm`}> {props.date?.toDateString()} </div>
        <Link href={url} rel="noopener noreferrer" target="_blank">
          <div className="w-4">
            <ArrowRightOnRectangleIcon />
          </div>
        </Link>
      </div>
    </TopRow>
  );
};

console.log();
const PositionWidget = (props: any) => {
  const { address: account } = useAccount();

  const [leverState] = useContext(LeverContext);
  const { levers, assets } = leverState as ILeverContextState;

  const [positionState] = useContext(PositionContext);
  const { selectedPosition } = positionState as IPositionContextState;

  const [associatedLever, setLever]= useState<ILever>();

  const [shortAsset, setShortAsset]= useState<IAsset>();
  const [longAsset, setLongAsset]= useState<IAsset>();

  useEffect(()=> {
    if (selectedPosition) {
    const address =  selectedPosition.leverAddress;
    const seriesId = selectedPosition.seriesId;
    const leverList = Array.from(levers.values());
    setLever(leverList.find((l: ILever) => l.leverAddress === address && l.seriesId === seriesId))
    
    setShortAsset( assets.get(selectedPosition.baseId )) 
    setLongAsset( assets.get(selectedPosition.ilkId )) 

    }
  },[selectedPosition])

  const { divest } = props.lever;

  return (
    <BorderWrap>
      {selectedPosition ? (
        <>
          <TopRow>
          {/* <div className="w-8" > {associatedLever?.tradeImage} </div> */}
          <StackedLogos size={8} logos={[ longAsset?.image!, shortAsset?.image!] } /> 
          <div className=" text-2xl"> {selectedPosition.displayName} </div>
            <div
              className={`text-xs rounded px-2 ${
                selectedPosition.status === PositionStatus.ACTIVE ? 'bg-emerald-500 ' : 'bg-red-500'
              }`}
            >
              {selectedPosition.status}
            </div>
          </TopRow>
          <TxInfo label="Invest Transaction " date={selectedPosition.investTxDate} txHash={selectedPosition.investTxHash} />

          {selectedPosition.divestTxDate && (
            <TxInfo label="Divest Transaction " date={selectedPosition.divestTxDate} txHash={selectedPosition.divestTxHash} />
          )}
          <Inner className="pb-4">
            <InfoBlock>
              <Label>Vault Id: </Label>
              <Value> { abbreviateHash( selectedPosition.vaultId )} </Value>

              <Label>Long Asset :</Label>
              {/* <Value> <div><div className='w-4'> {longAsset?.image}</div>  {longAsset?.symbol} </div></Value> */}
              <Value> {longAsset?.name}</Value>

              <Label>Series Id: </Label>
              <Value>{selectedPosition.seriesId} </Value>

              <Label>Initial Investment: </Label>
              <Value>{selectedPosition.shortAssetObtained.dsp} { shortAsset?.symbol} </Value>

              <Label>Investment Debt: </Label>
              <Value>{selectedPosition.shortAssetBorrowed.dsp} {shortAsset?.symbol} </Value>

              <Label>Investment Amount: </Label>
              <Value>{selectedPosition.longAssetObtained.dsp} {longAsset?.symbol}</Value>

              <Label>Current Vault Debt: </Label>
              <Value>{selectedPosition.art.dsp} { shortAsset?.symbol} </Value>

              <Label>Current Vault Collateral: </Label>
              <Value>{selectedPosition.ink.dsp} { longAsset?.symbol} </Value>

              {/* <Label>Return if divesting now:</Label>
              <Value>0 </Value>

              <Label>Return if divesting at maturity: </Label>
              <Value>0</Value> */}
            </InfoBlock>
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
