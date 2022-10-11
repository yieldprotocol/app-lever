import { useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { LeverContext } from '../../context/LeverContext';
import { PositionContext } from '../../context/PositionContext';
import { useLever } from '../../hooks/useLever';
import Button from '../common/Button';
import { BorderWrap } from '../styled';

const Inner = tw.div`m-4 text-center gap-2`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

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
      {selectedPosition && (
        <>
          <TopRow>
            <div className="text-lg"> Vault {selectedPosition?.id} </div>
          </TopRow>
          <Inner>
            <div>id: {selectedPosition?.id} </div>
            <div>ilkId: {selectedPosition?.ilkId} </div>
            <div>seriesId: {selectedPosition?.seriesId} </div>
            <div>art: {selectedPosition?.art.toString()} </div>
            <div>ink: {selectedPosition?.ink.toString()} </div>
            <div>{selectedPosition?.id} </div>

            <div> Return if divesting now: {currentReturn.dsp}  </div>
            <div> Return if divesting at maturity: {futureReturn.dsp} </div>

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
      )}
    </BorderWrap>
  );
};

export default PositionWidget;
