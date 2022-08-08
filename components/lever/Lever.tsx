import { Signer, ethers, BigNumber, utils } from 'ethers';
import { zeroPad } from 'ethers/lib/utils';
import { MutableRefObject, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { CAULDRON, Contracts, getContract, getFyToken, getPool, WETH_ST_ETH_STABLESWAP, WST_ETH } from '../../contracts';
import EstPositionWidget from './EstPositionWidget';

import LeverWidget from './LeverWidget';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const Lever = () => {

  return (
    <div className='flex flex-row'>
        <>
        <LeverWidget />
        <EstPositionWidget />
        </>
    </div>
  );
};

export default Lever;
