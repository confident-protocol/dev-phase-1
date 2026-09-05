// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IZKVerifier} from "./interfaces/IZKVerifier.sol";

contract ShieldedPool is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    IZKVerifier public verifier;

    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => bool) public nullifiers;

    uint256 public totalShielded;

    event CommitmentInserted(bytes32 indexed commitment);
    event ShieldedDeposit(bytes32 indexed commitment, uint256 amount);
    event ShieldedWithdrawal(bytes32 indexed nullifier, address indexed recipient, uint256 amount);
    event VerifierUpdated(address indexed verifier);

    error InvalidCommitment();
    error CommitmentExists();
    error NullifierUsed();
    error InvalidProof();
    error ZeroAmount();
    error InsufficientShieldedBalance();

    constructor(address initialOwner, address asset_, address verifier_)
        Ownable(initialOwner)
    {
        asset = IERC20(asset_);
        verifier = IZKVerifier(verifier_);
    }

    function setVerifier(address verifier_) external onlyOwner {
        verifier = IZKVerifier(verifier_);
        emit VerifierUpdated(verifier_);
    }

    function deposit(
        bytes32 commitment,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (commitment == bytes32(0)) revert InvalidCommitment();
        if (amount == 0) revert ZeroAmount();
        if (commitments[commitment]) revert CommitmentExists();

        commitments[commitment] = true;
        totalShielded += amount;
        asset.safeTransferFrom(msg.sender, address(this), amount);

        emit CommitmentInserted(commitment);
        emit ShieldedDeposit(commitment, amount);
    }

    function withdraw(
        bytes32 nullifier,
        address recipient,
        uint256 amount,
        bytes calldata proof,
        uint256[] calldata publicInputs
    ) external nonReentrant whenNotPaused {
        if (nullifiers[nullifier]) revert NullifierUsed();
        if (amount == 0 || recipient == address(0)) revert ZeroAmount();
        if (amount > totalShielded) revert InsufficientShieldedBalance();
        if (!verifier.verifyPayment(proof, publicInputs)) revert InvalidProof();

        nullifiers[nullifier] = true;
        totalShielded -= amount;
        asset.safeTransfer(recipient, amount);

        emit ShieldedWithdrawal(nullifier, recipient, amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
