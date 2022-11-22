import { MAX_256, ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber } from 'ethers';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { IAsset, LeverContext } from '../context/LeverContext';

const useApprove = (
  asset: IAsset,
  spenderAddress: string,
  amount: BigNumber = BigNumber.from(MAX_256), // default MAX
  approveType: 'approve' | 'permit' = 'approve', //default approve
  enabled: boolean= false,
) => {

  // () => ERC1155__factory.connect(reqSig.target.address, signer).setApprovalForAll(spender, true)
  // () => ERC20Permit__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),
  // () => ERC20__factory.connect(reqSig.target.address, signer).approve(spender, amount as string),
  
  // const [ leverState ] = useContext(LeverContext)
  // const { selectedLever } = leverState
  const { address : account} = useAccount();
  
  const [approved, setApproved] = useState<boolean>(false); 

  const checkIfApproved = async () => {
    if (account) {
      const approvedAmount = await asset.assetContract.allowance(account, spenderAddress)
      approvedAmount.gte(amount) ? setApproved(true) : setApproved(false)
    }
  }

  const { config } = usePrepareContractWrite({
    address: asset.address,
    abi: asset.assetContract.interface as any,
    functionName: 'approve',
    args: [spenderAddress, amount],
    enabled: enabled && account && !approved,
    // cacheTime: approved ? Infinity : 0,
    staleTime: approved ? Infinity : undefined,
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

export default useApprove;
