const { ethers } = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy({ value: ethers.utils.parseEther("90") });
  await staking.deployed();
  console.log(`contract deployed at: ${staking.address}`);

  const data = {
    address: staking.address,
    abi: staking.interface.format(),
  };
  fs.writeFile("./client/src/artifacts.json", JSON.stringify(data), {
    encoding: "utf-8",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
