import { useLever } from '../../hooks/useLever';
import useTestFunctions from '../../hooks/useTestFunctions';
import Button from '../common/Button';

const TenderlyView = () => {
  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const { fillEther } = useTestFunctions();

  return (
    <div className="p-32 gap-2 text-white">
      <p className="text-white">Test section: </p>
      <div className="flex flex-row gap-8">
        <Button action={() => void fillEther()}> Fund Eth </Button>
        <div>https://rpc.tenderly.co/fork/2c68a094-0507-462e-ba1c-ee0e6d096717</div>
      </div>
    </div>
  );
};

export default TenderlyView;
