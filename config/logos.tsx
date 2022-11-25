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
  YFIMark,
  YieldMark,
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
  ['FRAX', <FRAXMark key="frax" />],

  ['NOTIONAL', <NotionalMark key="ntl" />],
  ['YEARN', <YFIMark key="yrn" />],
  ['CURVE', <CRVMark key="crv" />],
  [
    'YIELD',
    <YieldMark
      key="yld"
      height="100%"
      colors={['#f79533', '#f37055', '#ef4e7b', '#a166ab', '#5073b8', '#1098ad', '#07b39b', '#6fba82']}
    />,
  ],
]);

export default logoMap;
