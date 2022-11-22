import { useContext } from 'react';
import { useAccount } from 'wagmi';
import { PositionContext, PositionStatus } from '../../context/PositionContext';
import Button from '../common/Button';
import { BorderWrap, InfoBlock, Inner, Label, TopRow, Value } from '../styled';

const PositionWidget = (props: any) => {
  const { address: account } = useAccount();
  const [positionState] = useContext(PositionContext);
  const { selectedPosition } = positionState;

  const { divest } = props.lever;

  return (
    <BorderWrap>
      {selectedPosition ? (
        <>
          <TopRow>
            <div className="text-lg"> {selectedPosition.displayName} </div>
          </TopRow>

          <TopRow>
            <div> Status: </div>
            <div> {selectedPosition.status} </div>
          </TopRow>

          <Inner className='pb-4'>
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
