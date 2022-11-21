import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { LeverContext } from '../context/LeverContext';

const useInvestDivest = (
  transactType: 'invest' | 'divest',
  txArgs: any[],
  enabled: boolean = false,
  overrides: { value: BigNumber } = { value: ZERO_BN },
) => {

  const [ leverState ] = useContext(LeverContext)
  const { selectedLever } = leverState
  
  const { config } = usePrepareContractWrite({
    address: selectedLever?.leverAddress,
    abi: selectedLever?.leverContract.interface as any,
    functionName: transactType,
    args: txArgs,
    overrides,
    enabled: enabled && !!selectedLever && txArgs.length>0,
    cacheTime: 0,
  });

  const { write, data: writeData } = useContractWrite({ ...config });

  const {
    data: waitData,
    error: waitError,
    isError,
    isLoading,
    status,
  } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  status !== 'idle' && console.log('STATUS: ', status);
  waitData && console.log('WAIT DATA RESULT: ', waitData.status);
  isError && toast.error(`Transaction Error: ${waitError?.message}`);

  const notReady = () => console.log('not ready');

  return write || notReady;
};

export default useInvestDivest;
