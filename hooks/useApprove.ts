import { MAX_256, ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { IAsset, LeverContext } from '../context/LeverContext';

const useApprove = (
  asset: IAsset,
  spenderAddress: string,
  amount: BigNumber,
  approveType: 'approve' | 'permit' = 'approve', //default approve
  enabled: boolean = false
) => {
  // () => ERC1155__factory.connect(reqSig.target.address, signer).setApprovalForAll(spender, true)
  // () => ERC20Permit__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),
  // () => ERC20__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),

  const { address: account } = useAccount();
  const [approved, setApproved] = useState<boolean>(false);

  const { data: approvedAmount } = useContractRead({
    address: asset?.address,
    abi: asset?.assetContract.interface as any,
    functionName: 'allowance',
    args: [account, spenderAddress],
    enabled: !!asset && !!account && !approved,
    cacheTime: 10_000,
    onSuccess: (v: any) => console.log('Allowance checked: ', asset.symbol, v.toString()),
  });

  // watch the approved Amount contract reads and update approved accordingly
  useEffect(() => {
    approvedAmount! && console.log('Approval > amount: ', (approvedAmount! as BigNumber).gte(amount));
    (approvedAmount as BigNumber)?.gte(amount) ? setApproved(true) : setApproved(false);
  }, [approvedAmount]);

  const { config } = usePrepareContractWrite({
    address: asset?.address,
    abi: asset?.assetContract.interface as any,
    functionName: 'approve',
    args: [spenderAddress, amount],
    enabled: enabled && !!asset && !!spenderAddress && !!account && !approved,
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

  const notReadyFn = () => console.log('Transaction not ready');
  const alreadyApprovedFn = async () => console.log('Already approved');

  /* return either the write fn or an dummy async fn is approval has has been done */
  const returnFn = approved ? alreadyApprovedFn : write;

  return returnFn || notReadyFn;
};

export default useApprove;
