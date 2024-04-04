// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TransferHelper {
    function transferFrom(address tokenContract, address sender, address recipient, uint256 amount) external {
        // Interact with the token contract to perform the transfer
        IERC20(tokenContract).transferFrom(sender, recipient, amount);
    }
}
