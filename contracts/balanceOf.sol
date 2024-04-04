// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ERC20Interface {
    function balanceOf(address account) external view returns (uint256);
}

contract BalanceViewer {
    function getTokenBalance(address tokenAddress, address walletAddress) external view returns (uint256) {
        ERC20Interface token = ERC20Interface(tokenAddress);
        return token.balanceOf(walletAddress);
    }
}