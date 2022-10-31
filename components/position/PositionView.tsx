import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import PositionProvider from '../../context/PositionContext';
import { useLever } from '../../hooks/useLever';

import Positions from './Positions';
import PositionWidget from './PositionWidget';

const PositionView_NoContext = () => {
  const lever = useLever(); // true here to supress 'input'

  return (
    // <div className="grid overflow-hidden grid-cols-3 grid-rows-2 gap-2">

<div className="grid overflow-hidden grid-cols-2 grid-rows-2 gap-2">
      <div className="col-span-1"  >
        <Positions />
      </div>
      <div className="col-span-1" >
        <PositionWidget lever={lever} />
      </div>
    </div>
  );
};

/* wrap position context */
const PositionView = () => (
  <PositionProvider>
    <PositionView_NoContext />
  </PositionProvider>
);

export default PositionView;
