import { useState } from 'react';
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { useConnectModal, ConnectButton, useAccountModal } from '@rainbow-me/rainbowkit';
import Button from './common/Button';

const Account = () => {
  const { data: ensName } = useEnsName();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  const { address: account } = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected: ', { address, connector, isReconnected });
    },
  });

  const { data: ethBalance } = useBalance({ address: account });

  return (
    <div onClick={()=>!!openAccountModal && openAccountModal() }>
      {ethBalance?.formatted} ETH

        {!account && 
            <Button action={() => !!openConnectModal && openConnectModal() } > Connect Wallet </Button>
        }  
        {/* <ConnectButton /> */}
    </div>
  );
};

export default Account;
