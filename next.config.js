/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    infuraKey: process.env.INFURA_KEY,
    defaultChainId: process.env.DEFAULT_CHAIN_ID,
    alchemyKeyArbitrumRinkeby: process.env.ALCHEMY_KEY_ARBITRUM_RINKEBY,
    tenderlyRpc: process.env.TENDERLY_RPC,
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
