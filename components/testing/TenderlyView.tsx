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
        <div>{process.env.tenderlyRpc}</div>
      </div>
    </div>
  );
};

export default TenderlyView;
