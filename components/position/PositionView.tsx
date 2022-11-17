import { useContext } from 'react';
import { LeverContext } from '../../context/LeverContext';
import { useLever } from '../../hooks/useLever';

import Positions from './Positions';
import PositionWidget from './PositionWidget';

const PositionView = () => {
  const [leverState] = useContext(LeverContext);
  const simulator = leverState.selectedStrategy?.leverSimulator;
  /* lever is abstracted up here in a higher level to save a few re-renders/calcs */
  const lever = useLever(simulator);

  return (
    <div className="grid overflow-hidden grid-cols-2 grid-rows-2 gap-2">
      <div className="col-span-1">
        <Positions />
      </div>
      <div className="col-span-1">
        <PositionWidget lever={lever} />
      </div>
    </div>
  );
};

export default PositionView;
