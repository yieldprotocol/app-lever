import { useContext } from 'react';
import { LeverContext } from '../../context/LeverContext';
import { useLever } from '../../hooks/useLever';
import useTestFunctions from '../../hooks/useTestFunctions';
import Button from '../common/Button';

const TenderlyView = () => {

  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const { fillEther, balance, loading } = useTestFunctions();

  return (
    <div className="p-32 gap-2 text-white">
      <p className="text-white">Test section: </p>
      <div className="flex flex-row gap-8">
        <Button action={() => void fillEther()} disabled={ balance > 100 || loading }> Fund Eth </Button>
        <div>{process.env.tenderlyRpc}</div>
      </div>
    </div>
  );
};

export default TenderlyView;
