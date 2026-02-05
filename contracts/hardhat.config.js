const { config } = require("hardhat");

config.setupAll({
  networks: {
    hardhat: {
      chainId: 31337,
    },
    base: {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
      gasPrice: 20000000000, // 20 Gwei
      gasMultiplier: 1.2,
    },
    "base-fork": {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
      forking: {
        url: "https://sepolia.base.org",
        enabled: true,
      },
    },
  },

  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "london",
    },
  },

  mocha: {
    timeout: 1000000,
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
});

module.exports = config;
