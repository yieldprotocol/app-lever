import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { ILever } from '../context/LeverContext';

const useInvest = (
  lever: ILever | undefined,
  txArgs: any[],
  overrides: { value: BigNumber } = { value: ZERO_BN },
  enabled: boolean = false
) => {
  
  const { config } = usePrepareContractWrite({
    address: lever?.leverAddress,
    abi: lever?.leverContract.interface as any,
    functionName: 'invest',
    args: txArgs,
    overrides,
    enabled,
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

  return write;
};

export default useInvest;
