import { TransactionReceipt } from '@ethersproject/providers';
import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { IAsset } from '../context/LeverContext';

const useApprove = (
  asset: IAsset,
  spenderAddress: string,
  amountToApprove: BigNumber,
  enabled: boolean = true,
  approveType: 'approve' | 'permit' = 'approve' 
): { approve: () => Promise<TransactionReceipt | undefined>; hasApproval: boolean } => {

  // () => ERC1155__factory.connect(reqSig.target.address, signer).setApprovalForAll(spender, true)
  // () => ERC20Permit__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),
  // () => ERC20__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),

  const { address: account } = useAccount();
  const [hasApproval, setHasApproval] = useState<boolean>(false);

  const { data: allowance } = useContractRead({
    address: asset?.address as `0x${string}`,
    abi: asset?.assetContract.interface as any,
    functionName: 'allowance',
    args: [account, spenderAddress],
    enabled: enabled && !!account && !!asset && amountToApprove.gt(ZERO_BN),
    scopeKey: `allowance_${asset?.id}`,
    cacheTime: 20_000,
    onSuccess: (v: any) => console.log('Allowance checked: ', asset.symbol, v.toString()),
  });

  const { config } = usePrepareContractWrite({
    address: asset?.address as `0x${string}`,
    abi: asset?.assetContract.interface as any,
    functionName: 'approve',
    args: [spenderAddress, amountToApprove],
    enabled: !!asset && !!spenderAddress && !!account, // && !hasApproval,
  });

  const { writeAsync, data: writeData } = useContractWrite({ ...config });

  /* Watch the approved Amount contract reads and compare with amount and update approved accordingly */
  useEffect(() => {
    if (allowance && amountToApprove.gt(ZERO_BN)) {
      const gtAllowance = (allowance! as BigNumber).gte(amountToApprove);
      gtAllowance ? setHasApproval(true) : setHasApproval(false);
      console.log('Allowance >= amount: ', gtAllowance);
    }
  }, [allowance, amountToApprove]);

  const approve = async () => {
    await writeAsync!();
    const txReceipt = await writeData?.wait();
    if (txReceipt && txReceipt.status === 1) {
      toast.success('Token approval complete.')
      setHasApproval(true)
    };
    return txReceipt;
  };

  return { approve, hasApproval };
};

export default useApprove;
