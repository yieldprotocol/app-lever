import tw from 'tailwind-styled-components';
import GraphProvider from '../../context/GraphContext';
import { useLever } from '../../hooks/useLever';
import useTestFunctions from '../../hooks/useTestFunctions';
import Button from '../common/Button';
import EstPositionWidget from './EstPositionWidget';
import LeverWidget from './LeverWidget';

const Lever = () => {
  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const lever = useLever();

  const { fillEther } = useTestFunctions();

  return (
    <div>
    <div className="flex flex-row">
      <LeverWidget lever={lever} />
      <EstPositionWidget lever={lever} />
      {/* <GraphProvider >
            <div> graph here. </div>
        </GraphProvider> */}
     
    </div>
    <div className='p-8 gap-2' >
      Test section
      <Button action={() => void fillEther()}> Fund Eth </Button>
      {/* <Button action={() => void fillEther()} disabled={true}> Fund Eth </Button> */}
      </div>
    </div>
  );
};

export default Lever;
