import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { IPositionContextState, PositionContext } from '../context/PositionContext';

const useDivest = (txArgs: any[], enabled: boolean = false) => {

  const [ positionState , positionActions] = useContext(PositionContext);
  const {selectedPosition} = positionState as IPositionContextState;
  const [txnEnabled, setTxnEnabled] = useState<boolean>(false);

  /* set the override to include value if using native token */
  const overrides = { gasLimit: '2000000' };
  
  useEffect(() => {
    const divestChecks = enabled && txArgs.length > 0;
    divestChecks && setTxnEnabled(divestChecks);
  }, [ txArgs, enabled ]);

  const { config } = usePrepareContractWrite({
    address: selectedPosition?.leverAddress as `0x${string}`,
    abi: selectedPosition?.leverContract.interface as any, // selectedLever?.leverContract.interface as any,
    functionName: 'divest',
    args: txArgs,
    overrides,
    enabled: txnEnabled,
    cacheTime: 0,
  });

  const { write, data: writeData } = useContractWrite({ ...config });
  const {
    data: waitData,
    error: waitError,
    status,
  } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  useEffect(() => {
    if (waitData?.status === 0) {
      toast.error(`Transaction Error: ${waitError?.message}`);
    }
    if (waitData?.status === 1) {
      toast.success(`Transaction Complete: ${waitData.transactionHash}`);
      positionActions.updatePositions();
    }
  }, [waitData, status]);

  const divest = async () => {
    if (write) write();
    if (!write) console.log('Transaction not ready: ', txArgs);
  };

  return divest;
};

export default useDivest;
