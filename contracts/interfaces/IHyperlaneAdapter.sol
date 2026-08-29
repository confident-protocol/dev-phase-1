// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IHyperlaneAdapter {
    function dispatch(
        uint32 destinationDomain,
        bytes32 recipient,
        bytes calldata body
    ) external payable returns (bytes32 messageId);

    function quoteDispatch(
        uint32 destinationDomain,
        bytes32 recipient,
        bytes calldata body
    ) external view returns (uint256);
}
