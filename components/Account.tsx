import { useState } from 'react';
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { useConnectModal, ConnectButton, useAccountModal } from '@rainbow-me/rainbowkit';
import Button from './common/Button';
import { ClickableContainer } from './styled';
import { cleanValue } from '../utils/appUtils';
import { EthMark } from './logos';
import tw from 'tailwind-styled-components';

const LinksWrap = tw.div`p-1 flex gap-2 justify-between bg-black bg-opacity-50 rounded-lg `;

const Account = () => {
  const { data: ensName } = useEnsName();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  const { address: account } = useAccount({
    // onConnect({ address, connector, isReconnected }) {
    //   console.log('Connected: ', { address, connector, isReconnected });
    // },
  });
  
  const { data: ethBalance } = useBalance({ address: account });

  return (
    <LinksWrap >
      <ConnectButton /> 
    </LinksWrap>
  );
};

export default Account;
