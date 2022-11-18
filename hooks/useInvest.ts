import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { FormatTypes } from 'ethers/lib/utils.js';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite, useSigner } from 'wagmi';
import { contractMap } from '../config/contracts';
import { ILever } from '../context/LeverContext';

const useInvest = (
  lever: ILever| undefined,
  txArgs: any[],
  overrides: { value: BigNumber} = { value: ZERO_BN },
  enabled: boolean = false,
  // input: BigNumber,
  // borrowed: BigNumber,
  // minPosition: BigNumber = ZERO_BN
) => {

  const { config, error, isFetching, isIdle, status } = usePrepareContractWrite({
    address: lever?.leverAddress,
    abi: lever?.leverContract.interface as any,
    functionName: 'invest',
    args: txArgs,
    // overrides,
    enabled: txArgs.length > 0,
  });

  const {
    write,
    error: txError,
  } = useContractWrite({
    ...config,
    onSuccess(data) {
      toast.success(`Transaction Complete: ${data}`)
    },
    onError(error) {
      toast.error(`Transaction Error: ${error?.message}`)
    },
  });

  return write;
};

export default useInvest;
