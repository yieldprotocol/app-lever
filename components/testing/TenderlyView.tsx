import { useNetwork, useSwitchNetwork } from 'wagmi';
import useTestFunctions from '../../hooks/useTestFunctions';
import Button from '../common/Button';

const TenderlyView = () => {

  /* lever is abstracted up here in the top level to save a few re-renders/calcs */
  const { fillEther, balance, loading } = useTestFunctions();

  // const { chain } = useNetwork()
  // const { chains, error, isLoading, pendingChainId, switchNetwork } =useSwitchNetwork()
  
  return (
    <div className="p-32 gap-2 text-white">
      <p className="text-white">Test section: </p>
      <div className="flex   gap-8">
        <Button action={() => void fillEther()} disabled={ balance > 10 || loading }> Fund Eth </Button>
        <div>{process.env.FORKED_ENV_RPC}</div>
      </div>
    </div>
  );
};

export default TenderlyView;
