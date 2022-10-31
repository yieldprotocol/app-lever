import { useContext, useEffect, useState } from 'react';
import { LeverContext } from '../../context/LeverContext';
import Button from '../common/Button';
import { BorderWrap, InfoBlock, Inner, Label, TopRow, Value } from '../styled';

const PositionWidget = (props: any) => {
  const [leverState] = useContext(LeverContext);
  const { account, selectedPosition } = leverState;

  const {
    currentReturn,
    futureReturn,
    isSimulating,
    
  } = props.lever;

  return (
    <BorderWrap>
      {selectedPosition ? (
        <>
          <TopRow>
            <div className="text-lg"> Vault {selectedPosition?.id} </div>
          </TopRow>
          <Inner>

          <InfoBlock>
        {/* <Label>Short asset invested:</Label>
        <Value>{shortInvested?.dsp} FYETH</Value> */}

        <Label>id: </Label>
        <Value>{selectedPosition.id}</Value>

        <Label>ilkId:</Label>
        <Value> {selectedPosition.ilkId}</Value>

        <Label>seriesId: </Label>
        <Value>{selectedPosition.seriesId} </Value>

        <Label> art: </Label>
        <Value>{selectedPosition.art.toString()} </Value>

        <Label>ink: </Label>
        <Value>{selectedPosition.ink.toString()}</Value>

        <Label>Return if divesting now:</Label>
        <Value>{currentReturn.dsp}  </Value>

        <Label>Return if divesting at maturity: </Label>
        <Value>{futureReturn.dsp} </Value>

      </InfoBlock>

            <Button
              action={() => console.log('closing')}
              disabled={!account} // add in isTransacting check
              loading={false}
              // loading={isTransacting}
            >
              {/* {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : 'Trade'} */}
              Divest
            </Button>
            <div> is simulating: { isSimulating?.toString() }</div>
          </Inner>
        </>
      )
    : <div/>}
    </BorderWrap>
  );
};

export default PositionWidget;
