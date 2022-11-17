import { useContext } from 'react';
import InputProvider, { InputContext } from '../../context/InputContext';
import { LeverContext } from '../../context/LeverContext';
import { MarketContext } from '../../context/MarketContext';
import { useLever } from '../../hooks/useLever';
import TenderlyView from '../testing/TenderlyView';

import { ChartWidget } from './ChartWidget';
import EstimatedPosition from './EstimatedPosition';
import LeverWidget from './LeverWidget';

const LeverView = () => {
  
  const [leverState] = useContext(LeverContext);
  const simulator = leverState.selectedStrategy?.leverSimulator
  /* lever is abstracted up here in a higher level to save a few re-renders/calcs */
  const lever = useLever( simulator );

  return (
    <>
      <div className="grid overflow-hidden grid-cols-2 grid-rows-2 gap-4">
        <div className="h-[700px]">
          <LeverWidget lever={lever} />
        </div>

        <div className="h-[700px]">
          <ChartWidget />
          <div>
            <EstimatedPosition lever={lever} />
          </div>
        </div>
      </div>
      <TenderlyView />
    </>
  );
};

export default LeverView;
