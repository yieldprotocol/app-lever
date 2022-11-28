import { TokenType } from '../lib/types';

export interface IAssetRoot {
  id: string;
  address: string;
  joinAddress: string;

  tokenType: TokenType;
  tokenIdentifier?: number | string; // used for identifying tokens in a multitoken contract

  name: string;
  version: string;
  symbol: string;
  decimals: number;

  isBaseAsset?: boolean;
  isLongAsset?: boolean;
  showToken?: boolean; // Display/hide the token on the UI

  displayDigits: number; // this is the 'reasonable' number of digits to show. accuracy equivalent to +- 1 us cent.
  displaySymbol?: string; // override for symbol display

  limitToSeries?: string[];

  wrapHandlerAddresses?: Map<number, string>; // mapping a chain id to the corresponding wrap handler address
  unwrapHandlerAddresses?: Map<number, string>; // mapping a chain id to the correpsonding unwrap handler address
  proxyId?: string;

  imageId?: string;
  chartId?: string;
}

export const UNKNOWN = '0x000000000000';
export const ETH = '0x100000000000';

export const WETH = '0x303000000000';
export const DAI = '0x303100000000';
export const USDC = '0x303200000000';
export const WBTC = '0x303300000000';
export const STETH = '0x303500000000';
export const WSTETH = '0x303400000000';
export const LINK = '0x303600000000';
export const ENS = '0x303700000000';
export const UNI = '0x313000000000';
export const yvUSDC = '0x303900000000';
export const FRAX = '0x313800000000';

/* Notional fCash assets */

/* Convex Curve LP token assets */
export const CVX3CRV = '0x313900000000';


export const CONVEX_BASED_ASSETS = [
  'CVX3CRV',
  CVX3CRV,
  'CVX3CRV MOCK',
  'Curve.fi DAI/USDC/USDT Convex Deposit Mock',
  'cvx3Crv',
];
export const ETH_BASED_ASSETS = ['WETH', 'ETH', WETH];
export const IGNORE_BASE_ASSETS = ['ENS'];
export const ASSETS = new Map<string, IAssetRoot>();

ASSETS.set(DAI, {
  id: DAI,
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  joinAddress: '0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc',
  version: '1',
  name: 'Dai stable coin',
  decimals: 18,
  symbol: 'DAI',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20_DAI_PERMIT,
  isBaseAsset: true,
  chartId: 'dai',
});

ASSETS.set(USDC, {
  id: USDC,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  joinAddress: '0x0d9A1A773be5a83eEbda23bf98efB8585C3ae4f4',
  version: '1',
  name: 'USDC Stable coin',
  decimals: 6,
  symbol: 'USDC',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20_PERMIT,
  isBaseAsset: true,
  chartId: 'usd-coin',
});

ASSETS.set(ETH, {
  id: ETH,
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // here we are using the weth address
  joinAddress: '0x3bDb887Dc46ec0E964Df89fFE2980db0121f0fD0', // here we are using the weth join
  version: '1',
  name: 'Ether',
  decimals: 18,
  symbol: 'ETH',
  displaySymbol: 'ETH',
  showToken: false,
  displayDigits: 3,
  tokenType: TokenType.NATIVE,
  isBaseAsset: false,
  chartId: 'weth',
});

ASSETS.set(WETH, {
  id:WETH,
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  joinAddress: '0x3bDb887Dc46ec0E964Df89fFE2980db0121f0fD0',
  version: '1',
  name: 'Wrapped Ether',
  decimals: 18,
  symbol: 'WETH',
  displaySymbol: 'WETH',
  showToken: true,
  displayDigits: 3,
  tokenType: TokenType.ERC20,
  isBaseAsset: true,
  chartId: 'weth',
});

ASSETS.set(FRAX, {
  id: FRAX,
  address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  joinAddress: '0x5655A973A49e1F9c1408bb9A617Fd0DBD0352464',
  version: '1',
  name: 'frax',
  decimals: 18,
  symbol: 'FRAX',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20,
  limitToSeries: [],
  isBaseAsset: true,
  chartId: 'frax',
});

ASSETS.set(ENS, {
  id:ENS,
  address: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
  joinAddress: '0x5AAfd8F0bfe3e1e6bAE781A6641096317D762969',
  version: '1',
  name: 'Ethereum Naming Service',
  decimals: 18,
  symbol: 'ENS',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20_PERMIT,
  chartId: 'ethereum-name-service',
});

ASSETS.set(WBTC, {
  id: WBTC,
  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  joinAddress: '0x00De0AEFcd3069d88f85b4F18b144222eaAb92Af',
  version: '1',
  name: 'Wrapped Bitcoin',
  decimals: 18,
  symbol: 'WBTC',
  showToken: true,
  displayDigits: 6,
  tokenType: TokenType.ERC20,
  chartId: 'wrapped-bitcoin',
});

ASSETS.set(WSTETH, {
  id:WSTETH,
  address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  joinAddress: '0x5364d336c2d2391717bD366b29B6F351842D7F82',
  version: '1',
  name: 'Wrapped Staked Ether',
  decimals: 18,
  symbol: 'wstETH',
  displaySymbol: 'wstETH',
  showToken: true,
  displayDigits: 6,
  tokenType: TokenType.ERC20_PERMIT,
  wrapHandlerAddresses: new Map([]),
  unwrapHandlerAddresses: new Map([
    [1, '0x491aB93faa921C8E634F891F96512Be14fD3DbB1'],
    [4, '0x64BA0F1D2E5479BF132936328e8c533c95646fE8'],
    [5, '0x9f65A6c2b2F12117573323443C8C2290f4C1e675'],
  ]),
  chartId: 'staked-ether', // 'wrapped-steth',
});

ASSETS.set(STETH, {
  id:STETH,
  address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  joinAddress: '0x5364d336c2d2391717bD366b29B6F351842D7F82',
  version: '1',
  name: 'Liquid staked Ether 2.0',
  decimals: 18,
  symbol: 'stETH',
  showToken: false,
  displayDigits: 6,
  tokenType: TokenType.ERC20_PERMIT,
  wrapHandlerAddresses: new Map([[1, '0x491aB93faa921C8E634F891F96512Be14fD3DbB1']]),
  unwrapHandlerAddresses: new Map([]),
  proxyId: WSTETH,
  chartId: 'staked-ether',
});


ASSETS.set(LINK, {
  id: LINK,
  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  joinAddress: '0xbDaBb91cDbDc252CBfF3A707819C5f7Ec2B92833',
  version: '1',
  name: 'ChainLink',
  decimals: 18,
  symbol: 'LINK',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20,
  chartId: 'chainlink'
});

ASSETS.set(yvUSDC, {
  id:yvUSDC,
  address: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
  joinAddress: '0x403ae7384E89b086Ea2935d5fAFed07465242B38',
  version: '1',
  name: 'Yearn Vault USDC',
  decimals: 18,
  symbol: 'yvUSDC',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20,
  limitToSeries: ['0x303230350000', '0x303230360000', '0x303230370000', '0x303230380000', '0x303230390000'],
  chartId: 'usd-coin',
  imageId: 'YEARN'
});

ASSETS.set(UNI, {
  id:UNI,
  address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  joinAddress: '0x41567f6A109f5bdE283Eb5501F21e3A0bEcbB779',
  version: '1',
  name: 'Uniswap token',
  decimals: 18,
  symbol: 'UNI',
  showToken: true,
  displayDigits: 4,
  tokenType: TokenType.ERC20_PERMIT,
  chartId: 'uniswap'
});

export const YSDAI6MJD = "0x333100000000"
ASSETS.set( YSDAI6MJD, {
  id:YSDAI6MJD,
  address: '0x1144e14E9B0AA9e181342c7e6E0a9BaDB4ceD295',
  joinAddress: '0xfEC8457d1BDdfc52633Da3323F812FC5c1800f61',
  version: '1',
  name: 'Yield Strategy DAI 6M Jun Dec',
  decimals: 18,
  symbol: 'YSDAI6MJD',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20_DAI_PERMIT,
  chartId: '',
  imageId: 'YIELD'
});

export const YSUSDC6MJD = '0x333300000000'
ASSETS.set( YSUSDC6MJD, {
  id:YSUSDC6MJD,
  address: '0x8e8D6aB093905C400D583EfD37fbeEB1ee1c0c39',
  joinAddress: '0xd947360575E6F01Ce7A210C12F2EE37F5ab12d11',
  version: '1',
  name: 'Yield Strategy USDC 6M Jun Dec',
  decimals: 6,
  symbol: 'YSUSDC6MJD',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20_PERMIT,
  chartId: '',
  imageId: 'YIELD'
});

export const YSETH6MJD = "0x333500000000"
ASSETS.set( YSETH6MJD, {
  id:YSETH6MJD,
  address: '0x831dF23f7278575BA0b136296a285600cD75d076',
  joinAddress: '0x5Bb78E530D9365aeF75664c5093e40B0001F7CCd',
  version: '1',
  name: 'Yield Strategy ETH 6M Jun Dec',
  decimals: 18,
  symbol: 'YSETH6MJD',
  showToken: true,
  displayDigits: 2,
  tokenType: TokenType.ERC20_PERMIT,
  chartId: '',
  imageId: 'YIELD'
});