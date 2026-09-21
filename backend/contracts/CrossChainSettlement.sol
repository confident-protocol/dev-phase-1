// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CrossChainSettlement
 * @notice CCTP burn-and-mint attestation sink + Hyperlane mailbox hook for ConfidentialPay.
 */
contract CrossChainSettlement {
    address public cctpMessageTransmitter;
    address public hyperlaneMailbox;
    address public owner;

    mapping(bytes32 => bool) public processedAttestations;
    mapping(uint32 => bytes32) public remoteRouters;

    event AttestationConsumed(bytes32 indexed attestationHash, uint32 sourceDomain, uint256 amount);
    event HyperlaneDispatch(uint32 indexed destDomain, bytes32 indexed recipient, bytes32 messageId);
    event RemoteRouterSet(uint32 domain, bytes32 router);

    modifier onlyOwner() {
        require(msg.sender == owner, "CCS: not owner");
        _;
    }

    constructor(address cctpMessageTransmitter_, address hyperlaneMailbox_) {
        owner = msg.sender;
        cctpMessageTransmitter = cctpMessageTransmitter_;
        hyperlaneMailbox = hyperlaneMailbox_;
    }

    function setRemoteRouter(uint32 domain, bytes32 router) external onlyOwner {
        remoteRouters[domain] = router;
        emit RemoteRouterSet(domain, router);
    }

    function consumeCctpAttestation(
        bytes calldata message,
        bytes calldata attestation,
        uint32 sourceDomain,
        uint256 amount
    ) external returns (bytes32 attestationHash) {
        attestationHash = keccak256(abi.encodePacked(message, attestation));
        require(!processedAttestations[attestationHash], "CCS: replay");
        processedAttestations[attestationHash] = true;
        emit AttestationConsumed(attestationHash, sourceDomain, amount);
    }

    function dispatchHyperlane(uint32 destDomain, bytes32 recipient, bytes calldata body)
        external
        returns (bytes32 messageId)
    {
        require(remoteRouters[destDomain] != bytes32(0), "CCS: no router");
        messageId = keccak256(abi.encode(destDomain, recipient, body, block.number));
        emit HyperlaneDispatch(destDomain, recipient, messageId);
    }
}
