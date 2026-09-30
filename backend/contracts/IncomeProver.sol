// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./libraries/FHEHelpers.sol";
import "./interfaces/IZKVerifier.sol";

/**
 * @title IncomeProver
 * @notice Selective proof-of-income where salary ciphertext never reaches the verifier in plaintext.
 * @dev Approval and denial produce indistinguishable on-chain bytes (FHE result handle only).
 */
contract IncomeProver {
    IZKVerifier public immutable zkVerifier;
    address public rosterContract;

    mapping(bytes32 => bytes32) public proofResults; // requestId => encrypted boolean handle
    mapping(bytes32 => address) public requesters;

    event IncomeProofRequested(bytes32 indexed requestId, address indexed subject, address indexed verifier);
    event IncomeProofSettled(bytes32 indexed requestId, bytes32 resultHandle);

    constructor(address zkVerifier_, address rosterContract_) {
        zkVerifier = IZKVerifier(zkVerifier_);
        rosterContract = rosterContract_;
    }

    function requestIncomeThresholdProof(
        bytes32 requestId,
        address subject,
        bytes32 salaryCipher,
        bytes32 thresholdCipher,
        bytes calldata zkProof,
        bytes32[] calldata publicInputs
    ) external {
        require(requesters[requestId] == address(0), "IP: exists");
        require(zkVerifier.verify(zkProof, publicInputs), "IP: zk failed");
        requesters[requestId] = msg.sender;
        bytes32 resultHandle = FHEHelpers.ge(salaryCipher, thresholdCipher);
        FHEHelpers.allow(resultHandle, subject);
        FHEHelpers.allow(resultHandle, msg.sender);
        proofResults[requestId] = resultHandle;
        emit IncomeProofRequested(requestId, subject, msg.sender);
        emit IncomeProofSettled(requestId, resultHandle);
    }
}
