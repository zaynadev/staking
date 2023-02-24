//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Staking {
    struct Position {
        uint256 positionId;
        address walletAddress;
        uint256 createDate;
        uint256 unlockDate;
        uint256 percentIntereset;
        uint256 weiStaked;
        uint256 weiIntereset;
        bool open;
    }
    uint256 public currentPositionId;
    mapping(uint256 => Position) public positions; // position id => position
    mapping(address => uint256[]) public positionsIdsByAddress; // user address => user position ids
    mapping(uint256 => uint256) public tiers; // number of minutes => percent interset to earn
    uint256[3] public lockPeriods = [1, 2, 3];

    constructor() payable {
        tiers[1] = 200; // 2%
        tiers[2] = 1000; // 10%
        tiers[3] = 1500; // 15%
    }

    receive() external payable {}

    function stackEther(uint256 numberOfMinutes) external payable {
        uint256 percentIntereset = tiers[numberOfMinutes];
        require(percentIntereset > 0, "Invalid number of minutes");
        require(msg.value > 0, "Cannot stack 0 ether");
        currentPositionId++;
        positions[currentPositionId] = Position({
            positionId: currentPositionId,
            walletAddress: msg.sender,
            createDate: block.timestamp,
            unlockDate: block.timestamp + (numberOfMinutes * 1 minutes),
            percentIntereset: percentIntereset,
            weiStaked: msg.value,
            weiIntereset: _calculateInterest(percentIntereset, msg.value),
            open: true
        });
        positionsIdsByAddress[msg.sender].push(currentPositionId);
    }

    function _calculateInterest(uint256 _percentIntereset, uint256 weiAmount)
        private
        pure
        returns (uint256)
    {
        return (_percentIntereset * weiAmount) / 10000;
    }

    function getLockPeriods() external view returns (uint256[3] memory) {
        return lockPeriods;
    }

    function getInterestRate(uint256 numMinutes)
        external
        view
        returns (uint256)
    {
        return tiers[numMinutes];
    }

    function getPositionById(uint256 id)
        external
        view
        returns (Position memory)
    {
        return positions[id];
    }

    function getPositionIdsForAddress(address _addr)
        external
        view
        returns (uint256[] memory)
    {
        return positionsIdsByAddress[_addr];
    }

    function closePosition(uint256 positionId) external {
        Position storage position = positions[positionId];
        require(position.walletAddress == msg.sender, "Invalid position");
        require(position.open, "Position closed");
        uint256 balance = position.weiStaked;
        if (block.timestamp > position.unlockDate) {
            balance += position.weiIntereset;
        }
        position.open = false;
        (bool sent, ) = position.walletAddress.call{value: balance}("");
        require(sent, "transfer failed");
    }
}
