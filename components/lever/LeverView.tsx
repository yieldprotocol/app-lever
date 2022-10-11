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
      <div className="flex flex-row gap-4">
        <div className="w-1/2">
          <LeverWidget lever={lever} />
        </div>

        <div className="w-1/2">
          <ChartWidget />
          <EstimatedPosition lever={lever} />
        </div>
      </div>
      <TenderlyView />
    </>
  );
};

/* Wrap it with the input porivder */
const LeverView = () => (
  <InputProvider>
    <LeverView_NoContext />
  </InputProvider>
);

export default LeverView;
