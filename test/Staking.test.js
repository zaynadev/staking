const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking", () => {
  async function deployContract() {
    const [signer1, signer2, signer3] = await ethers.getSigners();
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy({ value: ethers.utils.parseEther("10") });
    await staking.deployed();
    const time1 = 1;
    const time2 = 2;
    const time3 = 3;

    return { signer1, signer2, signer3, staking, time1, time2, time3 };
  }

  describe("Deploy", () => {
    it("should have balance of 10 ethers", async () => {
      const { staking } = await loadFixture(deployContract);
      const balance = ethers.utils.formatEther(await ethers.provider.getBalance(staking.address));
      expect(balance).to.equal("10.0");
    });

    it("should have 3 lock period", async () => {
      const { staking, time1, time2, time3 } = await loadFixture(deployContract);
      const periods = await staking.getLockPeriods();
      expect(periods[0]).to.equal(time1);
      expect(periods[1]).to.equal(time2);
      expect(periods[2]).to.equal(time3);
    });
    it("should have 3 tires", async () => {
      const { staking, time1, time2, time3 } = await loadFixture(deployContract);
      const tiers1 = await staking.getLockPeriods();
      expect(await staking.getInterestRate(time1)).to.equal(200);
      expect(await staking.getInterestRate(time2)).to.equal(1000);
      expect(await staking.getInterestRate(time3)).to.equal(1500);
    });
  });
  describe("Stack Ether", () => {
    it("should stack ether", async () => {
      const { staking, signer2, time1 } = await loadFixture(deployContract);
      const tx = await staking
        .connect(signer2)
        .stackEther(time1, { value: ethers.utils.parseEther("1") });
      const stack = await staking.getPositionById(1);
      expect(stack["walletAddress"]).to.equal(signer2.address);
      expect(stack["percentIntereset"]).to.equal(200);
      expect(stack["open"]).to.equal(true);
      expect(stack["unlockDate"]).to.equal(+stack["createDate"] + time1 * 60);
      expect(stack["weiStaked"]).to.equal(ethers.utils.parseEther("1"));
      expect(+ethers.utils.formatEther(stack["weiIntereset"])).to.equal(0.02);
      expect(tx).to.changeEtherBalances([signer2.address, staking.address], [-1, 1]);
    });

    it("should add position id to positionsIdsByAddress", async () => {
      const { staking, signer1, signer2, time1, time2, time3 } = await loadFixture(deployContract);
      await staking.connect(signer2).stackEther(time1, { value: ethers.utils.parseEther("1") });
      await staking.connect(signer1).stackEther(time2, { value: ethers.utils.parseEther("0.5") });
      await staking.connect(signer2).stackEther(time3, { value: ethers.utils.parseEther("2") });
      const positionIds = await staking.getPositionIdsForAddress(signer2.address);
      const _positionIds = await staking.getPositionIdsForAddress(signer1.address);
      expect(positionIds[0]).to.equal(1);
      expect(positionIds[1]).to.equal(3);
      expect(_positionIds[0]).to.equal(2);
    });

    it("should not add position, invalid number of minutes", async () => {
      const { staking, signer1, signer2 } = await loadFixture(deployContract);
      await expect(
        staking.connect(signer2).stackEther(10, { value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Invalid number of minutes");
    });

    it("should not add position, cannot stack 0 ether", async () => {
      const { staking, signer1, signer2, time1 } = await loadFixture(deployContract);
      await expect(
        staking.connect(signer2).stackEther(time1, { value: ethers.utils.parseEther("0") })
      ).to.be.revertedWith("Cannot stack 0 ether");
    });
  });
  describe("Close position", () => {
    it("should not close position, invalid position", async () => {
      const { staking, signer1, signer2, time1 } = await loadFixture(deployContract);
      await staking.connect(signer2).stackEther(time1, { value: ethers.utils.parseEther("1") });
      await expect(staking.closePosition(1)).to.be.revertedWith("Invalid position");
    });
    it("should not close position, already closed", async () => {
      const { staking, signer1, signer2, time1 } = await loadFixture(deployContract);
      await staking.stackEther(time1, { value: ethers.utils.parseEther("1") });
      await staking.closePosition(1);
      await expect(staking.closePosition(1)).to.be.revertedWith("Position closed");
    });
    it("should close position without interest", async () => {
      const { staking, signer1, signer2, time1 } = await loadFixture(deployContract);
      await staking.connect(signer2).stackEther(time1, { value: ethers.utils.parseEther("1") });
      const tx = await staking.connect(signer2).closePosition(1);
      const position = await staking.getPositionById(1);
      expect(position["open"]).to.be.false;
      expect(tx).to.changeEtherBalances([staking.address, signer2.address], [-1, 1]);
    });
    it("should close position with interest", async () => {
      const { staking, signer1, signer2, time1 } = await loadFixture(deployContract);
      await staking.connect(signer2).stackEther(time1, { value: ethers.utils.parseEther("1") });
      time.increase((time1 + 1) * 60);
      const tx = await staking.connect(signer2).closePosition(1);
      const position = await staking.getPositionById(1);
      expect(position["open"]).to.be.false;
      expect(tx).to.changeEtherBalances([staking.address, signer2.address], [-1.2, 1.2]);
    });
  });
});
