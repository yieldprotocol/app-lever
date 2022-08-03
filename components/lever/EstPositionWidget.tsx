import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { BorderWrap, Header } from '../styles';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;


const EstPositionWidget = () => {

  return (
    <BorderWrap>
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