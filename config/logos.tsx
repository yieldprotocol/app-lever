import DaiMark from '../components/logos/DaiMark';
import ENSMark from '../components/logos/ENSMark';
import EthMark from '../components/logos/EthMark';
import FRAXMark from '../components/logos/FRAXMark';
import LinkMark from '../components/logos/LinkMark';
import MakerMark from '../components/logos/MakerMark';
import NotionalMark from '../components/logos/NotionalMark';
import StEthMark from '../components/logos/StEthMark';
import TSTMark from '../components/logos/TSTMark';
import UNIMark from '../components/logos/UNIMark';
import USDCMark from '../components/logos/USDCMark';
import USDTMark from '../components/logos/USDTMark';
import WBTCMark from '../components/logos/WBTCMark';

import WethMark from '../components/logos/WethMark';

const logoMap = new Map([
  ['DAI', <DaiMark key="dai" />],
  ['USDC', <USDCMark key="usdc" />],
  ['WBTC', <WBTCMark key="wbtc" />],
  ['TST', <TSTMark key="tst" />],
  ['ETH', <EthMark key="eth" />],
  ['WETH', <WethMark key="weth" />],
  ['USDT', <USDTMark key="usdt" />],
  ['LINK', <LinkMark key="link" />],
  ['WSTETH', <StEthMark key="wsteth" />],
  ['STETH', <StEthMark key="steth" />],
  ['ENS', <ENSMark key="ens" />],
  ['UNI', <UNIMark key="uni" />],
  ['MKR', <MakerMark key="mkr" />],
  ['Notional', <NotionalMark key="notional" />],
  ['FRAX', <FRAXMark key="frax" />],
]);

export default logoMap;
