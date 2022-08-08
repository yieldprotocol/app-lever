import { BigNumber } from 'ethers';
import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';
import { BorderWrap, Header } from '../styles';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const EstPositionWidget = () => {

  const [inputState, ] = useContext(InputContext);
  // calculate the required stuff here


  return (
    <BorderWrap>
      <div>{inputState.input?.dsp.toString()}</div>
      <div> {inputState.input?.hStr.toString()} </div>
      <div> {inputState.input?.big.toString()}  </div>

      <div>Leverage: {inputState.leverage} X</div>
      <Inner>
          <div >
            <h3> Estimated Position Information</h3> 
          </div>
          <div>Principle Investment: </div>
          <div>Position value: </div>
          <div>PnL (pos/prin - 1): </div>
          <div>Supplying : </div>
          <div>Borrowing : </div>
          <div>Net Native APRs : </div>
      </Inner>
    </BorderWrap>
  );
};

export default EstPositionWidget;