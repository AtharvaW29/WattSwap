// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract WTSWPToken {
    using SafeMath for uint256;

    address private hardcodedRecipient = 0x588c0D0a6a974282B95B236d28C4593B1f0B1Ec0;
    string public name = "WTSWP Token";
    string public symbol = "WTSWP";
    uint256 public totalSupply = 15;
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;
    
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply.mul(10**decimals);
        balanceOf[hardcodedRecipient] = totalSupply;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);

    function transfer(address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount);
        balanceOf[recipient] = balanceOf[recipient].add(amount);

        emit Transfer(msg.sender, recipient, amount);
        return true;
    }
    // Add other desired token functionalities (e.g., approve, transferFrom)
}
