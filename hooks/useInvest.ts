import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { ILeverStrategy } from '../context/LeverContext';
import { copyToClipboard } from '../utils/appUtils';

const useInvest = (
  leverStrategy: ILeverStrategy,
  input: BigNumber,
  borrowed: BigNumber,
  minPosition: BigNumber = ZERO_BN
) => {
  const { config, error, isFetching, isIdle } = usePrepareContractWrite({
    address: leverStrategy?.leverAddress,
    abi: leverStrategy?.leverContract.interface as any,
    functionName: 'invest',
    args: [leverStrategy?.seriesId, borrowed, ZERO_BN],
    overrides: { value: input },
    enabled: input.gt(ZERO_BN) && borrowed.gt(ZERO_BN) && minPosition.gt(ZERO_BN),
  });

  const {
    isError,
    isLoading,
    write,
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

  return write;
};

export default useInvest;
