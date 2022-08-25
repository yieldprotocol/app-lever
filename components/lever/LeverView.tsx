import tw from 'tailwind-styled-components';
import GraphProvider from '../../context/GraphContext';
import InputProvider, { InputContext } from '../../context/InputContext';
import { useLever } from '../../hooks/useLever';
import useTestFunctions from '../../hooks/useTestFunctions';
import Button from '../common/Button';
import EstimatedPosition from './EstimatedPosition';
import EstPositionWidget from './EstimatedPosition';
import LeverWidget from './LeverWidget';

const LeverView_NoContext = () => {
  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const lever = useLever();

  const { fillEther } = useTestFunctions();

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
