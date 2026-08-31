// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IZKVerifier.sol";

/**
 * @title ShieldedPool
 * @notice Unlink-style shielded pool for private transfer after CCTP mint (pipeline stages 5–6).
 */
contract ShieldedPool {
    IZKVerifier public immutable zkVerifier;

    mapping(bytes32 => bool) public nullifiers;
    mapping(bytes32 => bool) public commitments;
    bytes32 public merkleRoot;

    event Deposited(bytes32 indexed commitment, bytes32 newRoot);
    event Withdrawn(bytes32 indexed nullifier, address indexed recipient, bytes32 newRoot);

    constructor(address zkVerifier_) {
        zkVerifier = IZKVerifier(zkVerifier_);
    }

    function deposit(
        bytes32 commitment,
        bytes calldata zkProof,
        bytes32[] calldata publicInputs,
        bytes32 newRoot
    ) external {
        require(!commitments[commitment], "SP: commitment used");
        require(zkVerifier.verify(zkProof, publicInputs), "SP: zk failed");
        commitments[commitment] = true;
        merkleRoot = newRoot;
        emit Deposited(commitment, newRoot);
    }

    function privateTransfer(
        bytes32 nullifier,
        bytes32 newCommitment,
        address recipient,
        bytes calldata zkProof,
        bytes32[] calldata publicInputs,
        bytes32 newRoot
    ) external {
        require(!nullifiers[nullifier], "SP: nullifier used");
        require(zkVerifier.verify(zkProof, publicInputs), "SP: zk failed");
        nullifiers[nullifier] = true;
        commitments[newCommitment] = true;
        merkleRoot = newRoot;
        emit Withdrawn(nullifier, recipient, newRoot);
    }
}
