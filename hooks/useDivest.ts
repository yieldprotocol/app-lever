import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { ILever } from '../context/LeverContext';

const useDivest = (
  lever: ILever| undefined,
  txArgs: any[],
  overrides: { value: BigNumber} = { value: ZERO_BN },
  enabled: boolean = false,
  // input: BigNumber,
  // borrowed: BigNumber,
  // minPosition: BigNumber = ZERO_BN
) => {

  const { config, error, isFetching, isIdle } = usePrepareContractWrite({
    address: lever?.leverAddress,
    abi: lever?.leverContract.interface as any,
    functionName: 'divest',
    args: txArgs,
    overrides,
    enabled
    // args: [lever?.seriesId, borrowed, ZERO_BN],
    // overrides: { value: input },
    // enabled: input.gt(ZERO_BN) && borrowed.gt(ZERO_BN) && minPosition.gt(ZERO_BN),
  });

  const {
    isError,
    isLoading,
    write: divest,
    isSuccess,
    error: txError,
  } = useContractWrite({
    ...config,
    onSuccess(data) {
      toast.success(`Transaction Complete: ${data}`)
    },
    onError(error) {
      toast.error(`Transaction Error: ${error?.message}`)
    }
  });
  return divest;
};

export default useDivest;
