import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import PositionProvider from '../../context/PositionContext';

import Positions from './Positions';
import PositionWidget from './PositionWidget';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const PositionView_NoContext = () => {

  return (
      <div className="flex flex-row">
        <Positions />
        <PositionWidget />
      </div>
  );
};

/* wrap position context */ 
const PositionView = () => ( <PositionProvider><PositionView_NoContext/></PositionProvider>)

export default PositionView;
