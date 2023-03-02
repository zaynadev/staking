# Staking Ethereum Dapp

Solidity, Hardhat, ReactJS, MetaMask

#### 1. Install dependencies for hardhat project

First you need to install project dependencies by running this command:

```shell
npm install
```

#### 2. Deploy smart contract

Second you need to run a hardhat node and deploy te smart contract by running the following commands:

```shell
npx hardhat node
npx hardhat run scripts/deploy.js
```

#### 3. Install dependencies for client

Finally, go to the client directory, install dependencies and start the project by running the following commands:

```shell
cd client
npm install
npm run start
```

**_Note_**
You have to keep the hardhat node running while using the app
