import { ethers } from "ethers";

// export const toString = (bytes32) => ethers.decodeBytes32String(bytes32);
export const toWei = (ether) => ethers.parseEther(ether);
export const toEther = (wei) => ethers.formatEther(wei);

export const calcDaysRemaining = (unlockDate) => {
  const timeNow = Date.now() / 1000;
  const secondsRemaining = Number(unlockDate) - timeNow;
  const totalMinutes = Math.floor(secondsRemaining / 60);
  const seconds = (secondsRemaining % 60).toFixed(0);
  const minutes = totalMinutes % 60;
  return +secondsRemaining > 0
    ? +minutes > 0
      ? `${minutes}min:${seconds}s`
      : `${seconds}s`
    : "0s";
};
