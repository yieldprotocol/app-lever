import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { etherscanBlockExplorers, useNetwork } from 'wagmi';
import { useContext } from 'react';
import { useAccount } from 'wagmi';
import { IPositionContextState, PositionContext, PositionStatus } from '../../context/PositionContext';
import Button from '../common/Button';
import { BorderWrap, InfoBlock, Inner, Label, TopRow, Value } from '../styled';
import Link from 'next/link';

const TxInfo = (props: { label: string; date: Date | undefined; txHash: string | undefined }) => {
  const { chain } = useNetwork();
  const {url:baseUrl} = (chain?.id === 1) ? etherscanBlockExplorers.mainnet : etherscanBlockExplorers.arbitrum;
  const url = `${baseUrl}/tx/${props.txHash}`;
  return (
    <TopRow>
      <div className={`text-sm`}> {props.label} </div>
      <div className="flex flex-row gap-4">
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
  const [positionState] = useContext(PositionContext);
  const { selectedPosition } = positionState as IPositionContextState;

  const { divest } = props.lever;

  return (
    <BorderWrap>
      {selectedPosition ? (
        <>
          <TopRow>
            <div className="text-lg"> {selectedPosition.displayName} </div>
            <div
              className={`text-xs rounded px-2 ${
                selectedPosition.status === PositionStatus.ACTIVE ? 'bg-emerald-500 ' : 'bg-red-500'
              }`}
            >
              {selectedPosition.status}
            </div>
          </TopRow>
          <TxInfo label="Invest Date " date={selectedPosition.investTxDate} txHash={selectedPosition.investTxHash} />

          {selectedPosition.divestTxDate && (
            <TxInfo label="Divest Date " date={selectedPosition.divestTxDate} txHash={selectedPosition.divestTxHash} />
          )}
          <Inner className="pb-4">
            <InfoBlock>
              <Label>Vault Id: </Label>
              <Value>{selectedPosition.vaultId}</Value>

              <Label>Ilk Id:</Label>
              <Value> {selectedPosition.ilkId}</Value>

              <Label>Series Id: </Label>
              <Value>{selectedPosition.seriesId} </Value>

              <Label>Initial Investment: </Label>
              <Value>{selectedPosition.shortInvested.dsp} </Value>

              <Label>Investment Debt: </Label>
              <Value>{selectedPosition.investmentBorrowed.dsp} </Value>

              <Label>Investment Amount: </Label>
              <Value>{selectedPosition.investmentLong.dsp}</Value>

              <Label>Current Vault Debt: </Label>
              <Value>{selectedPosition.art.dsp} </Value>

              <Label>Current Vault Collateral: </Label>
              <Value>{selectedPosition.ink.dsp}</Value>

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
