import { ZERO_BN } from '@yield-protocol/ui-math';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { WETH } from '../config/assets';
import { IInputContextState, InputContext } from '../context/InputContext';
import { ILeverContextState, LeverContext } from '../context/LeverContext';
import { PositionContext } from '../context/PositionContext';
import { useDebounce } from './generalHooks';
import useApprove from './useApprove';

const useInvest= (
  txArgs: any[],
  enabled: boolean
  // overrides: { value: BigNumber } = { value: ZERO_BN }
) => {
  const [leverState] = useContext(LeverContext);
  const { assets } = leverState as ILeverContextState;
  const [, positionActions] = useContext(PositionContext);
  
  const [inputState] = useContext(InputContext);
  const { selectedLever } = inputState
  const debouncedInputState = useDebounce( inputState, 500 );
  const { input, inputNativeToken  } = debouncedInputState;
  
  const shortAsset = assets.get(selectedLever?.baseId!);

  const { approve, hasApproval } = useApprove(
    shortAsset!, // asset to approve
    selectedLever?.leverAddress!, // spender
    input?.big!, // amountToApprove
    enabled && inputNativeToken,
  );

  /* Logic to enable tx */
  const [ txnEnabled, setTxnEnabled ] = useState<boolean>(false);
  useEffect(() => {
    const commonChecks = enabled && !!selectedLever && txArgs.length > 0;
    const investChecks = commonChecks && input?.big.gte(selectedLever.minDebt.big)!;
    investChecks && setTxnEnabled(investChecks);
  }, [selectedLever, txArgs, enabled, input]);

  /* set the override to include value if using native token */
  const overrides = inputNativeToken ? { value: input?.big!, gasLimit: ethers.BigNumber.from('2000000') } : { gasLimit: ethers.BigNumber.from('2000000') };
  // const overrides = { gasLimit: ethers.BigNumber.from('2000000') };

  const { config, error } = usePrepareContractWrite({
    address: selectedLever?.leverAddress,
    abi: notional_abi,
    functionName: 'invest',
    args: txArgs,
    overrides,
    enabled: true, // txnEnabled,
    cacheTime: 0,
  });

  const { write, isLoading, data: writeData } = useContractWrite({ ...config });
  const {
    data: waitData,
    error: waitError,
    status,
  } = useWaitForTransaction({
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

const notional_abi = [{"inputs":[{"internalType":"contract Giver","name":"giver_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"FlashLoanFailure","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"enum YieldLeverBase.Operation","name":"operation","type":"uint8"},{"indexed":true,"internalType":"bytes12","name":"vaultId","type":"bytes12"},{"indexed":false,"internalType":"bytes6","name":"seriesId","type":"bytes6"},{"indexed":true,"internalType":"address","name":"investor","type":"address"},{"indexed":false,"internalType":"uint256","name":"profit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"debt","type":"uint256"}],"name":"Divested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes12","name":"vaultId","type":"bytes12"},{"indexed":false,"internalType":"bytes6","name":"seriesId","type":"bytes6"},{"indexed":true,"internalType":"address","name":"investor","type":"address"},{"indexed":false,"internalType":"uint256","name":"investment","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"debt","type":"uint256"}],"name":"Invested","type":"event"},{"inputs":[],"name":"FLASH_LOAN_RETURN","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cauldron","outputs":[{"internalType":"contract ICauldron","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes12","name":"vaultId","type":"bytes12"},{"internalType":"bytes6","name":"seriesId","type":"bytes6"},{"internalType":"bytes6","name":"ilkId","type":"bytes6"},{"internalType":"uint256","name":"ink","type":"uint256"},{"internalType":"uint256","name":"art","type":"uint256"},{"internalType":"uint256","name":"minOut","type":"uint256"}],"name":"divest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"giver","outputs":[{"internalType":"contract Giver","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes6","name":"","type":"bytes6"}],"name":"ilkInfo","outputs":[{"internalType":"contract FlashJoin","name":"join","type":"address"},{"internalType":"uint40","name":"maturity","type":"uint40"},{"internalType":"uint16","name":"currencyId","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes6","name":"seriesId","type":"bytes6"},{"internalType":"bytes6","name":"ilkId","type":"bytes6"},{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"uint256","name":"borrowAmount","type":"uint256"}],"name":"invest","outputs":[{"internalType":"bytes12","name":"vaultId","type":"bytes12"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"ladle","outputs":[{"internalType":"contract ILadle","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC1155BatchReceived","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC1155Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"initiator","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"borrowAmount","type":"uint256"},{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"onFlashLoan","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"weth","outputs":[{"internalType":"contract IWETH9","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]
