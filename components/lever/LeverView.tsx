import GraphProvider from '../../context/GraphContext';
import InputProvider, { InputContext } from '../../context/InputContext';
import { useLever } from '../../hooks/useLever';
import EstimatedPosition from './EstimatedPosition';
import LeverWidget from './LeverWidget';

const LeverView_NoContext = () => {
  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const lever = useLever();

  return (
      <div className="flex flex-row">
        <LeverWidget lever={lever} />
        <EstimatedPosition lever={lever} />
        {/* <GraphProvider />*/}
      </div>
  );
};

/* Wrap it with the input porivder */ 
const LeverView = () => (<InputProvider> <LeverView_NoContext /> </InputProvider>)

export default LeverView;
