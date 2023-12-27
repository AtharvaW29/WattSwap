// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WattSwapToken is ERC20 {
    constructor() ERC20("WattSwap", "WTSWP") {
        _mint(msg.sender, 1000000 * 10**18); // Mint 1 million WTSWP tokens (18 decimals)
    }
}
