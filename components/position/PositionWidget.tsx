import { ZERO_BN } from '@yield-protocol/ui-math';
import { TransactionDescription } from 'ethers/lib/utils';
import { useContext, useEffect, useState } from 'react';
import { ILeverStrategy, LeverContext } from '../../context/LeverContext';
import { IPosition } from '../../context/PositionContext';
import Button from '../common/Button';
import { BorderWrap, InfoBlock, Inner, Label, TopRow, Value } from '../styled';


const PositionWidget = (props: any) => {
  const [leverState] = useContext(LeverContext);
  const { account, selectedPosition } : {account:string, selectedPosition: IPosition } = leverState;

  const {
    divest,
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
        <Value>0 </Value>

        <Label>Return if divesting at maturity: </Label>
        <Value>0</Value>

      </InfoBlock>
            <Button
              action={() => divest(selectedPosition.id, selectedPosition.seriesId, selectedPosition.ink, selectedPosition.art )}
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
