import { useEffect, useState } from 'react';
import useConnector from './useConnector';

const useBlockTime = () => {
    
  const { provider } = useConnector();
  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    (async () => {
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

export default useBlockTime;
