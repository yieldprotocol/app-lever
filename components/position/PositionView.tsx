import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import PositionProvider from '../../context/PositionContext';
import { useLever } from '../../hooks/useLever';

import Positions from './Positions';
import PositionWidget from './PositionWidget';

const PositionView_NoContext = () => {

  const lever = useLever(); // true here to supress 'input' 

  return (
      <div className="flex flex-row">
        <Positions />
        <PositionWidget lever={lever} />
      </div>
  );
};

/* wrap position context */ 
const PositionView = () => ( <PositionProvider><PositionView_NoContext/></PositionProvider>)

export default PositionView;
