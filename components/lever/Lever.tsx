import tw from 'tailwind-styled-components';
import EstPositionWidget from './EstPositionWidget';
import LeverWidget from './LeverWidget';

const Lever = () => {
  return (
    <div className="flex flex-row">
      <>
        <LeverWidget />
        <EstPositionWidget />
      </>
    </div>
  );
};

export default Lever;
