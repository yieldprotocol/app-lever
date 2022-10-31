import InputProvider from '../../context/InputContext';
import { useLever } from '../../hooks/useLever';
import TenderlyView from '../testing/TenderlyView';

import { ChartWidget } from './ChartWidget';
import EstimatedPosition from './EstimatedPosition';
import LeverWidget from './LeverWidget';

const LeverView_NoContext = () => {
  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const lever = useLever();

  return (
    <>
      <div className="grid overflow-hidden grid-cols-2 grid-rows-2 gap-4">
        <div className='h-[700px]'>
          <LeverWidget lever={lever} />
        </div>

        <div className='h-[700px]'>
          <ChartWidget />
          <div >
            <EstimatedPosition lever={lever} />
          </div>
        </div>
        
      </div>
      <TenderlyView />
    </>
  );
};

/* Wrap it with the input porivder */
const LeverView = () => (
  // <InputProvider>
  <LeverView_NoContext />
  // </InputProvider>
);

export default LeverView;
