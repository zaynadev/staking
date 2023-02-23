import { ethers } from "ethers";

export const toString = (bytes32) => ethers.decodeBytes32String(bytes32);
export const toWei = (ether) => ethers.parseEther(ether);
export const toEther = (wei) => ethers.formatEther(wei);

export const calcDaysRemaining = (unlockDate) => {
  const timeNow = Date.now() / 1000;
  const secondsRemaining = unlockDate - timeNow;
  return Math.max((secondsRemaining / 60 / 60 / 24).toFixed(0), 0);
};
