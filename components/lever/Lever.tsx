import tw from 'tailwind-styled-components';
import { useLever } from '../../hooks/useLever';
import EstPositionWidget from './EstPositionWidget';
import LeverWidget from './LeverWidget';

const Lever = () => {
  /* lever is abstracted up here in the top level to save a re-render */
  const lever = useLever()

  console.log(lever)
  
  return (
    <div className="flex flex-row">
        <LeverWidget lever={lever} />
        <EstPositionWidget lever={lever} />
    </div>
  );
};

export default Lever;
