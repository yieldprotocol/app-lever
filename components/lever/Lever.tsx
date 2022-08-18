import tw from 'tailwind-styled-components';
import GraphProvider from '../../context/GraphContext';
import { useLever } from '../../hooks/useLever';
import EstPositionWidget from './EstPositionWidget';
import LeverWidget from './LeverWidget';

const Lever = () => {
  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const lever = useLever()
  
  return (
    <div className="flex flex-row">
        <LeverWidget lever={lever} />
        <EstPositionWidget lever={lever} />
        {/* <GraphProvider >
            <div> graph here. </div>
        </GraphProvider> */}
    </div>
  );
};

export default Lever;
