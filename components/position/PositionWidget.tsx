import { useContext} from 'react';
import { useAccount } from 'wagmi';
import { IPosition, PositionContext } from '../../context/PositionContext';
import Button from '../common/Button';
import { BorderWrap, InfoBlock, Inner, Label, TopRow, Value } from '../styled';

const PositionWidget = (props: any) => {

  const {address: account } = useAccount();
  const [positionState] = useContext(PositionContext);
  const {selectedPosition}= positionState;

  const {
    divest,
    isSimulating,
  } = props.lever;

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
        <Value>{selectedPosition.amountInvested.toString()} </Value>

        <Label>Debt: </Label>
        <Value>{selectedPosition.debt.toString()} </Value>

        <Label>Investment: </Label>
        <Value>{selectedPosition.investment.toString()}</Value>

        <Label>Return if divesting now:</Label>
        <Value>0 </Value>

        <Label>Return if divesting at maturity: </Label>
        <Value>0</Value>

      </InfoBlock>
            <Button

              action = { () => divest(selectedPosition.lever )  }
              // action={() => divest(selectedPosition.id, selectedPosition.seriesId, selectedPosition.ink, selectedPosition.art )}
              disabled={!account} // add in isTransacting check
              loading={false}
              // loading={isTransacting}
            >
              {/* {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : 'Trade'} */}
              Divest
            </Button>
            {/* <div> is simulating: { isSimulating?.toString() }</div> */}
          </Inner>
        </>
      )
    : <div />}
    </BorderWrap>
  );
};

export default PositionWidget;
