import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const useTestFunctions = () => {
  const { address: account } = useAccount();

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (account) {
      (async () => {
        const tenderlyProvider = new ethers.providers.JsonRpcProvider(process.env.FORKED_ENV_RPC);
        const bal = await tenderlyProvider.getBalance(account);
        setBalance(parseFloat(ethers.utils.formatEther(bal)));
      })();
      console.log( 'RPC URL: ', process.env.FORKED_ENV_RPC  )
    }
  }, [account]);

  const fillEther = async () => {
    try {
      const tenderlyProvider = new ethers.providers.JsonRpcProvider(process.env.FORKED_ENV_RPC);
      const transactionParameters = [[account!], ethers.utils.hexValue(BigInt('100000000000000000000'))];
      /* only fill if balance is less than 100 */
      if (balance < 100 ) {
        setLoading(true)
        await tenderlyProvider?.send('tenderly_addBalance', transactionParameters);
        const bal_ = await tenderlyProvider.getBalance(account!);
        setBalance(parseFloat(ethers.utils.formatEther(bal_)));
        setLoading(false)
        console.log('Eth funded.');
      } else {
        setLoading(false)
        console.log("Don't be silly, you have more than enough ETH!!.");
      }
    } catch (e) {
      setLoading(false)
      console.log('Could not fill eth on tenderly fork :: ', e);
    }
  };

  return { fillEther, balance, loading };
};

export default useTestFunctions;
