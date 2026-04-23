// contracts/MockUSDC.sol
// Mock USDC token for testing purposes

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing, mimics USDC.e on Avalanche
 */
contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("Mock USDC", "USDC") {}

    /**
     * @dev Mint new tokens (for testing)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Returns 6 decimals, matching real USDC
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
