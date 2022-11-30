import LogoWrap from '../components/common/logoWrap';
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
  // ['WETH', <WethMark key="weth" />],
  ['USDT', <USDTMark key="usdt" />],
  ['LINK', <LinkMark key="link" />],
  ['wstETH', <StEthMark key="wsteth" />],
  ['stETH', <StEthMark key="steth" />],
  ['ENS', <ENSMark key="ens" />],
  ['UNI', <UNIMark key="uni" />],
  ['MKR', <MakerMark key="mkr" />],
  ['FRAX', <FRAXMark key="frax" />],
  ['NOTIONAL', <NotionalMark key="ntl" />],
  ['YEARN', <YFIMark key="yrn" />],
  ['CURVE', <CRVMark key="crv" />],
  [
    'YIELD',
    <LogoWrap
      innerTwStyle="ring-2 bg-white bg-opacity-80"
      logo={
        <YieldMark
          key="yld"
          colors={['#f79533', '#f37055', '#ef4e7b', '#a166ab', '#5073b8', '#1098ad', '#07b39b', '#6fba82']}
        />
      }
    />,
  ],

  [
    'WETH',
    <LogoWrap
      outerTwStyle="bg-white bg-opacity-80 border border-white"
      innerTwStyle="border border-black border-dashed"
      logo={<EthMark key="weth" />}
    />,
  ],
]);

export default logoMap;
