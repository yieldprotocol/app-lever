import { useContext } from 'react';
import { useAccount } from 'wagmi';
import { PositionContext } from '../../context/PositionContext';
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
            <div className="text-lg"> {selectedPosition?.displayName} </div>
          </TopRow>
          <Inner>
            <InfoBlock>
              <Label>Vault Id: </Label>
              <Value>{selectedPosition.vaultId}</Value>

              <Label>Ilk Id:</Label>
              <Value> {selectedPosition.ilkId}</Value>

              <Label>Series Id: </Label>
              <Value>{selectedPosition.seriesId} </Value>

              <Label>Initial Investment: </Label>
              <Value>{selectedPosition.amountInvested.dsp} </Value>

              <Label>Debt: </Label>
              <Value>{selectedPosition.debt.dsp} </Value>

              <Label>Investment: </Label>
              <Value>{selectedPosition.investment.dsp}</Value>

              <Label>Return if divesting now:</Label>
              <Value>0 </Value>

              <Label>Return if divesting at maturity: </Label>
              <Value>0</Value>
            </InfoBlock>
            <Button
              action={() => divest() }
              disabled={!account}
              loading={false}
              // loading={isTransacting}
            >
              Divest
            </Button>
          </Inner>
        </>
      ) : (
        <div />
      )}
    </BorderWrap>
  );
};

export default PositionWidget;
