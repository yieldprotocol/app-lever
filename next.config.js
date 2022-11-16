/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    DEFAULT_CHAIN_ID: process.env.DEFAULT_CHAIN_ID,

    INFURA_KEY: process.env.INFURA_KEY,

    ALCHEMY_ARBITRUM_KEY: process.env.ALCHEMY_ARBITRUM_KEY,
    ALCHEMY_MAINNET_KEY: process.env.ALCHEMY_MAINNET_KEY,

    FORKED_ENV_RPC: process.env.FORKED_ENV_RPC,

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
