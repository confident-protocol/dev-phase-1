// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IHyperlaneAdapter} from "./interfaces/IHyperlaneAdapter.sol";

contract HyperlaneStateAdapter is Ownable, Pausable, IHyperlaneAdapter {
    address public mailbox;
    mapping(bytes32 => bool) public outboundMessages;

    event StateDispatched(
        bytes32 indexed messageId,
        uint32 indexed destinationDomain,
        bytes32 indexed recipient,
        bytes body
    );

    error InvalidAddress();

    constructor(address initialOwner, address mailbox_)
        Ownable(initialOwner)
    {
        if (mailbox_ == address(0)) revert InvalidAddress();
        mailbox = mailbox_;
    }

    function setMailbox(address mailbox_) external onlyOwner {
        if (mailbox_ == address(0)) revert InvalidAddress();
        mailbox = mailbox_;
    }

    function quoteDispatch(
        uint32,
        bytes32,
        bytes calldata body
    ) external view override returns (uint256) {
        // Production implementation must query the official Hyperlane Mailbox quote.
        return body.length * 1 gwei;
    }

    function dispatch(
        uint32 destinationDomain,
        bytes32 recipient,
        bytes calldata body
    ) external payable override whenNotPaused returns (bytes32 messageId) {
        messageId = keccak256(
            abi.encodePacked(
                block.chainid,
                msg.sender,
                destinationDomain,
                recipient,
                body,
                block.number
            )
        );
        outboundMessages[messageId] = true;

        // Production implementation must call the official Hyperlane Mailbox.
        emit StateDispatched(messageId, destinationDomain, recipient, body);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
