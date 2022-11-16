import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';

const useBlockTime = () => {
    
  const provider = useProvider();

  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    (async () => {
      // const blockNum = await provider?.getBlockNumber();
      // if (blockNum) {
      //   setCurrentBlock(blockNum);
      //   const timestamp = (await provider?.getBlock(blockNum))?.timestamp;
      //   timestamp && setCurrentTime(timestamp);
      // }
    })();
  }, [provider]);

  return { currentBlock, currentTime };
};

export default useBlockTime;
