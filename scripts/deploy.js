const { ethers } = require("hardhat");

async function main() {
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy({ value: ethers.utils.parseEther("10") });
  await staking.deployed();
  console.log(`contract deployed at: ${staking.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
