// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // const Token = await ethers.getContractFactory("Token");
  // const token = await Token.deploy();
  // await token.deployed();

  // console.log("Token address:", token.address);


//--------------------------------------
[owner, addr1, addr2, treasury] = await ethers.getSigners();

const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
stakingToken = await ERC20MockFactory.deploy("Staking Token", "STK");
rewardToken1 = await ERC20MockFactory.deploy("Reward Token 1", "RT1");

const FarmingYieldFactory = await ethers.getContractFactory("FarmingYield");
const lockPeriod = 30 * 24 * 60 * 60;
FarmingYield = await FarmingYieldFactory.deploy(
  stakingToken.address,
  rewardToken1.address,
  1,
  await treasury.getAddress(),
  10000000,
  lockPeriod
);
console.log("stakingToken address:", stakingToken.address);
console.log("rewardToken1 address:", rewardToken1.address);
console.log("FarmingYield address:", FarmingYield.address);
//console.log("treasury address:", FarmingYield.address);

  
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(stakingToken,"stakingToken","ERC20Mock");
  saveFrontendFiles(stakingToken,"rewardToken1","ERC20Mock");
  saveFrontendFiles(stakingToken,"FarmingYield","FarmingYield");
}

function saveFrontendFiles(token,tokenName,contractName) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, tokenName+"contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
    path.join(contractsDir, tokenName+".json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
