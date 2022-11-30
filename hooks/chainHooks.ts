import { useEffect, useState } from 'react';
import { useNetwork, useProvider } from 'wagmi';

/**
 * Uses the connected chain or the default network, to only be used when fetching data
 * @returns chain id to use when fetching data
 */
export const useChainId = () => {
  const DEFAULT_CHAIN_ID = 1;
  const { chain } = useNetwork();
  return chain ? chain.id : DEFAULT_CHAIN_ID;
};

export const useBlockTime = () => {
    
    const provider = useProvider();
    const [currentBlock, setCurrentBlock] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
  
    useEffect(() => {
      provider && (async () => {
        const blockNum = await provider?.getBlockNumber();
        if (blockNum) {
          setCurrentBlock(blockNum);
          const timestamp = (await provider?.getBlock(blockNum))?.timestamp;
          timestamp && setCurrentTime(timestamp);
        }
      })();
    }, [provider]);
  
    return { currentBlock, currentTime };
  };
