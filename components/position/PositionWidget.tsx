import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { BorderWrap } from '../styles';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const PositionWidget = () => {
  return (
    <BorderWrap>
    <TopRow >
          <div className='text-lg'> Position X </div>
      </TopRow>
    <Inner>
      position x
      </Inner>
      </BorderWrap>
  );
};

export default PositionWidget;