import {
  CRVMark,
  DaiMark,
  ENSMark,
  EthMark,
  FRAXMark,
  LinkMark,
  MakerMark,
  NotionalMark,
  StEthMark,
  TSTMark,
  UNIMark,
  USDCMark,
  USDTMark,
  WBTCMark,
  WethMark,
} from '../components/logos';

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
  ['CURVE', <CRVMark key='crv' />]
]);

export default logoMap;
