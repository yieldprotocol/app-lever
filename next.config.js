/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    infuraKey: process.env.INFURA_KEY,
    defaultChainId: process.env.DEFAULT_CHAIN_ID,
    alchemyKeyArbitrumRinkeby: ALCHEMY_KEY_ARBITRUM_RINKEBYALCHEMY_KEY_ARBITRUM_RINKEBY,
    tenderlyRpc: TENDERLY_RPC,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/lever',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
