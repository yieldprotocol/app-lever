import { ethers } from 'ethers';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LeverContext } from '../context/LeverContext';
import { copyToClipboard } from '../utils/appUtils';

const useTestFunctions = () => {
  
  const [leverState] = useContext(LeverContext);
  const {account} = leverState;

  const fillEther = useCallback(async () => {
    try {
      const tenderlyProvider = new ethers.providers.JsonRpcProvider(
        "https://rpc.tenderly.co/fork/9d6c6c94-9bda-423d-88e7-bc95af3b8116"
      );
      const transactionParameters = [
        [account],
        ethers.utils.hexValue(BigInt("100000000000000000000")),
      ];
      await tenderlyProvider?.send(
        "tenderly_addBalance",
        transactionParameters
      );
      console.log("Eth funded.");
    } catch (e) {
      console.log("Could not fill eth on tenderly fork");
    }
  }, [account]);

  return { fillEther };
};

export default useTestFunctions;
