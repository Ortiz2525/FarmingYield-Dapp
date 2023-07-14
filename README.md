clear metamask nonce.
npx hardhat node --fork https://mainnet.infura.io/v3/9302aa8d88b44d37a7b45271ecaaeb25
npx hardhat run scripts/deploy.js --network localhost

cd frontend
npm start