// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
contract energyAvailability{
    function isEnergyAvailable(uint256 availablePower, uint256 amount) public pure returns (bool) {
        return availablePower >= amount; // Use the provided value for validation
    }
}