import { useContext } from 'react';
import { InputContext } from '../../../context/InputContext';
import { LeverContext } from '../../../context/LeverContext';
import { useLever } from '../../../hooks/useLever';

import Positions from './Positions';
import PositionWidget from './PositionWidget';

const PositionView = () => {
  const [inputState] = useContext(InputContext);
  const simulator = inputState.selectedLever?.leverSimulator;

  /* lever is abstracted up here in a higher level to save a few re-renders/calcs */
  const lever = useLever(simulator);

  
  return (
    <div className="flex justify-center">
      <div className="grid max-w-[1000px] h-[1000px] w-full overflow-hidden grid-cols-5 grid-rows-1 gap-2 ">
        <div className="col-span-2">
          <Positions />
        </div>
        <div className="col-span-3">
          <PositionWidget lever={lever} />
        </div>
      </div>
    </div>
  );
};

export default PositionView;
