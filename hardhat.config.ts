import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    // forking: {
    //   url: "https://mainnet.infura.io/v3/9302aa8d88b44d37a7b45271ecaaeb25",
    // },
    // Your network configurations
  },
};

export default config;
