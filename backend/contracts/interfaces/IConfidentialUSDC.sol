// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IConfidentialUSDC {
    function confidentialTransferFrom(address from, address to, bytes32 encryptedAmount) external;
    function confidentialBalanceOf(address account) external view returns (bytes32);
}
