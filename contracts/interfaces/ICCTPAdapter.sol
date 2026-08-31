// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICCTPAdapter {
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce);

    function receiveMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external returns (bool);
}
