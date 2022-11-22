import { TransactionReceipt } from '@ethersproject/providers';
import { MAX_256, ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { WETH } from '../config/assets';
import { IAsset, LeverContext } from '../context/LeverContext';

const useApprove = (
  asset: IAsset,
  spenderAddress: string,
  amountToApprove: BigNumber,
  enabled: boolean = true,
  approveType: 'approve' | 'permit' = 'approve', // default approve
): { approve: any, hasApproval: boolean } => {
 
  // () => ERC1155__factory.connect(reqSig.target.address, signer).setApprovalForAll(spender, true)
  // () => ERC20Permit__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),
  // () => ERC20__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),
  
  const { address: account } = useAccount();
  const [ hasApproval, setHasApproval ] = useState<boolean>(false);

  const { data: allowance } = useContractRead({
    address: asset?.address,
    abi: asset?.assetContract.interface as any,
    functionName: 'allowance',
    args: [account, spenderAddress],
    enabled: enabled && !!account && !!asset && amountToApprove.gt(ZERO_BN),
    scopeKey: `allowance_${asset?.id}`,
    cacheTime: 10_000,
    onSuccess: (v: any) => console.log('Allowance checked: ', asset.symbol, v.toString()),
  });

  // Watch the approved Amount contract reads and update approved accordingly
  useEffect(() => {
    if (allowance && amountToApprove.gt(ZERO_BN)) {
      console.log('Allowance >= amount: ', (allowance! as BigNumber).gte(amountToApprove));
      (allowance as BigNumber).gte(amountToApprove) ? setHasApproval(true) : setHasApproval(false);
    }
  }, [allowance, amountToApprove]);

    // No approvals if WETH/ETH is the base asset 
    useEffect(() => {
      asset?.id === WETH ? setHasApproval(true): setHasApproval(false)
    }, [asset]);

  const { config } = usePrepareContractWrite({
    address: asset?.address,
    abi: asset?.assetContract.interface as any,
    functionName: 'approve',
    args: [spenderAddress, amountToApprove],
    enabled: !!asset && !!spenderAddress && !!account && !hasApproval,
  });

  const { write: approve, data: writeData } = useContractWrite({ ...config });
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

  // const notReadyFn = () => console.log('Transaction not ready');
  // const alreadyApprovedFn = () => console.log('Already approved');
  return { approve, hasApproval };
  
};

export default useApprove;
