import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { WETH } from '../config/assets';
import { IInputContextState, InputContext } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';
import { PositionContext } from '../context/PositionContext';
import useApprove from './useApprove';

const useInvest= (
  txArgs: any[],
  enabled: boolean
  // overrides: { value: BigNumber } = { value: ZERO_BN }
) => {
  const [leverState] = useContext(LeverContext);
  const { selectedLever, assets } = leverState as ILeverContextState;
  const [, positionActions] = useContext(PositionContext);
  const [inputState] = useContext(InputContext);
  const { input, inputNativeToken } = inputState as IInputContextState;
  const shortAsset = assets.get(selectedLever?.baseId!);

  const { approve, hasApproval } = useApprove(
    shortAsset!, // asset to approve
    selectedLever?.leverAddress!, // spender
    input?.big!, // amountToApprove
    enabled,
  );

  /* Logic to enable tx */
  const [ txnEnabled, setTxnEnabled ] = useState<boolean>(false);
  useEffect(() => {
    const commonChecks = enabled && !!selectedLever && txArgs.length > 0;
    const investChecks = commonChecks && input?.big.gte(selectedLever.minDebt.big)!;
    investChecks && setTxnEnabled(investChecks);
  }, [selectedLever, txArgs, enabled, input]);

  /* set the override to include value if using native token */
  const overrides = inputNativeToken ? { value: input?.big!, gasLimit: '2000000' } : { gasLimit: '2000000' };

  const { config } = usePrepareContractWrite({
    address: selectedLever?.leverAddress,
    abi: selectedLever?.leverContract.interface as any,
    functionName: 'invest',
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
    confirmations: 2,
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

  const invest = async () => {
    if (write) {
      if (hasApproval) {
        console.log('Pre-approved token');
        write();
      }
      if (!hasApproval) {
        await approve();
        console.log('Approval complete.');
        write();
      }
    }
    /* Handle Transaction not ready */
    if (!write) {
      console.log('Transaction not ready: ', txArgs);
    }
  };

  return invest;
};

export default useInvest;
