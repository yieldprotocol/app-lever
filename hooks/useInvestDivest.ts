import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { InputContext } from '../context/InputContext';
import { LeverContext } from '../context/LeverContext';
import useApprove from './useApprove';

const useInvestDivest = (
  transactType: 'invest' | 'divest',
  txArgs: any[],
  enabled: boolean,
  overrides: { value: BigNumber } = { value: ZERO_BN },
) => {

  const [ leverState ] = useContext(LeverContext)
  const { selectedLever, assets } = leverState

  const [inputState] = useContext(InputContext)
  const {input} = inputState;

  const shortAsset = assets.get(selectedLever?.baseId); 
  const {} = useApprove( shortAsset, selectedLever?.leverAddress, input.big ) 

  const hasApproval = false;

  const { config,  } = usePrepareContractWrite({
    address: selectedLever?.leverAddress,
    abi: selectedLever?.leverContract.interface as any,
    functionName: transactType,
    args: txArgs,
    overrides,
    enabled: enabled && !!selectedLever && txArgs.length>0 && input.dsp > 0 && hasApproval,
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
