import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "solidity-coverage";
require("dotenv").config();

const ALCHEMY_RINKEBY_API_KEY_URL =
  process.env.ALCHEMY_RINKEBY_API_KEY_URL || "";
const ALCHEMY_GOERLI_API_KEY_URL = process.env.ALCHEMY_GOERLI_API_KEY_URL || "";
const ALCHEMY_MAINNET_API_KEY_URL =
  process.env.ALCHEMY_MAINNET_API_KEY_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
let PRIVATE_KEY = process.env.PRIVATE_KEY || "";

if (!PRIVATE_KEY) {
  console.log("⚠️ Please set PRIVATE_KEY in the .env file");
  throw Error();
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      saveDeployments: true,
      accounts: [PRIVATE_KEY],
    },
    hardhat: {
      mining: {
        auto: true,
      },
    },
    mainnet: {
      url: `${ALCHEMY_MAINNET_API_KEY_URL}`,
      chainId: 1,
      accounts: [PRIVATE_KEY],
    },
    rinkeby: {
      url: `${ALCHEMY_RINKEBY_API_KEY_URL}`,
      chainId: 4,
      accounts: [PRIVATE_KEY],
    },
    goerli: {
      url: `${ALCHEMY_GOERLI_API_KEY_URL}`,
      chainId: 5,
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: "https://rpc-mumbai.matic.today",
      chainId: 80001,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
  },
  mocha: {
    timeout: 2000000000,
  },
  // typechain: {
  //   outDir: "typechain",
  //   target: "ethers-v5",
  // },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    // currency: "USD",
  },
};
