import { useContext } from 'react';
import { InputContext } from '../../../context/InputContext';
import { LeverContext } from '../../../context/LeverContext';
import { useLever } from '../../../hooks/useLever';
import TenderlyView from '../../testing/TenderlyView';

import { ChartWidget } from './ChartWidget';
import EstimatedPosition from './EstimatedPosition';
import LeverWidget from './LeverWidget';

const LeverView = () => {
  
  const [inputState] = useContext(InputContext);
  const simulator = inputState.selectedLever?.leverSimulator
  
  /* lever is abstracted up here in a higher level to save a few re-renders/calcs */
  const lever = useLever( simulator );

  return (
    <div className="flex align-middle justify-center">
      <div className="grid overflow-hidden grid-cols-2 grid-rows-2 gap-4 max-w-[1100px] ">
        <div >
          <LeverWidget lever={lever} />
        </div>

        <div className="h-[710px]">
          <ChartWidget />
          <div>
            <EstimatedPosition lever={lever} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeverView;
