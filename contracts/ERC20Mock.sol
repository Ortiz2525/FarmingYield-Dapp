// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
   function decimals() public view virtual override returns (uint8) {
        return 0;
    }
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}