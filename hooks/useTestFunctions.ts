import { ethers } from 'ethers';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LeverContext } from '../context/LeverContext';
import { copyToClipboard } from '../utils/appUtils';

const useTestFunctions = () => {
  
  const [leverState] = useContext(LeverContext);

  const fillEther = useCallback(async () => {
    try {
      const tenderlyProvider = new ethers.providers.JsonRpcProvider(
        process.env.tenderlyRpc
      );
      const transactionParameters = [
        [leverState?.account],
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
  }, [leverState?.account]);

  return { fillEther };
};

export default useTestFunctions;
