// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ProtocolTypes} from "./libraries/ProtocolTypes.sol";
import {IZKVerifier} from "./interfaces/IZKVerifier.sol";
import {IFHEEngine} from "./interfaces/IFHEEngine.sol";
import {ComplianceRegistry} from "./ComplianceRegistry.sol";

contract ConfidentialPaymentCore is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BPS = 10_000;
    uint256 public constant MAX_BATCH_SIZE = 200;

    IERC20 public immutable settlementToken;
    IZKVerifier public zkVerifier;
    IFHEEngine public fheEngine;
    ComplianceRegistry public compliance;

    uint256 public feeBps;
    address public feeCollector;

    mapping(bytes32 => ProtocolTypes.PaymentStatus) public paymentStatus;
    mapping(bytes32 => bytes32) public encryptedPaymentState;
    mapping(bytes32 => bool) public consumedProof;

    event PaymentCommitted(
        bytes32 indexed paymentId,
        bytes32 indexed senderCommitment,
        bytes32 indexed recipientCommitment,
        uint256 fee,
        uint64 destinationChainId
    );
    event PaymentCompleted(bytes32 indexed paymentId, bytes32 indexed privacyCommitment);
    event PaymentCancelled(bytes32 indexed paymentId);
    event BatchPaymentCommitted(bytes32 indexed batchId, uint256 count);
    event EncryptedStateRegistered(bytes32 indexed paymentId, bytes32 indexed ciphertextId);
    event FeeConfigUpdated(uint256 feeBps, address feeCollector);

    error InvalidPaymentId();
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidDeadline();
    error PaymentAlreadyExists();
    error PaymentNotPending();
    error InvalidProof();
    error ProofAlreadyConsumed();
    error BatchTooLarge();
    error InvalidBatch();
    error FeeTooHigh();
    error InvalidAddress();
    error ComplianceBlocked();

    constructor(
        address initialOwner,
        address token,
        address verifier,
        address fhe,
        address complianceRegistry,
        address collector,
        uint256 initialFeeBps
    ) Ownable(initialOwner) {
        if (
            token == address(0) ||
            verifier == address(0) ||
            fhe == address(0) ||
            complianceRegistry == address(0) ||
            collector == address(0)
        ) revert InvalidAddress();
        if (initialFeeBps > 500) revert FeeTooHigh();

        settlementToken = IERC20(token);
        zkVerifier = IZKVerifier(verifier);
        fheEngine = IFHEEngine(fhe);
        compliance = ComplianceRegistry(complianceRegistry);
        feeCollector = collector;
        feeBps = initialFeeBps;
    }

    function setFeeConfig(uint256 newFeeBps, address newCollector)
        external
        onlyOwner
    {
        if (newFeeBps > 500 || newCollector == address(0)) revert FeeTooHigh();
        feeBps = newFeeBps;
        feeCollector = newCollector;
        emit FeeConfigUpdated(newFeeBps, newCollector);
    }

    function setModules(
        address verifier,
        address fhe,
        address complianceRegistry
    ) external onlyOwner {
        if (
            verifier == address(0) ||
            fhe == address(0) ||
            complianceRegistry == address(0)
        ) revert InvalidAddress();
        zkVerifier = IZKVerifier(verifier);
        fheEngine = IFHEEngine(fhe);
        compliance = ComplianceRegistry(complianceRegistry);
    }

    function commitPayment(
        bytes32 paymentId,
        bytes32 senderCommitment,
        bytes32 recipientCommitment,
        uint256 amount,
        uint64 destinationChainId,
        uint64 deadline,
        bytes32 privacyCommitment,
        bytes calldata proof,
        uint256[] calldata publicInputs
    ) external nonReentrant whenNotPaused {
        if (paymentId == bytes32(0)) revert InvalidPaymentId();
        if (recipientCommitment == bytes32(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (paymentStatus[paymentId] != ProtocolTypes.PaymentStatus.NONE) {
            revert PaymentAlreadyExists();
        }
        if (consumedProof[privacyCommitment]) revert ProofAlreadyConsumed();
        if (!compliance.isAllowed(msg.sender)) revert ComplianceBlocked();
        if (!zkVerifier.verifyPayment(proof, publicInputs)) revert InvalidProof();

        uint256 fee = (amount * feeBps) / BPS;
        uint256 total = amount + fee;

        consumedProof[privacyCommitment] = true;
        paymentStatus[paymentId] = ProtocolTypes.PaymentStatus.PENDING;

        settlementToken.safeTransferFrom(msg.sender, address(this), total);
        if (fee != 0) settlementToken.safeTransfer(feeCollector, fee);

        emit PaymentCommitted(
            paymentId,
            senderCommitment,
            recipientCommitment,
            fee,
            destinationChainId
        );
    }

    function registerEncryptedPaymentState(
        bytes32 paymentId,
        bytes32 ciphertextId,
        bytes calldata ciphertext
    ) external onlyOwner {
        if (paymentStatus[paymentId] != ProtocolTypes.PaymentStatus.PENDING) {
            revert PaymentNotPending();
        }
        fheEngine.registerCiphertext(ciphertextId, ciphertext);
        encryptedPaymentState[paymentId] = ciphertextId;
        emit EncryptedStateRegistered(paymentId, ciphertextId);
    }

    function completePayment(
        bytes32 paymentId,
        bytes32 privacyCommitment
    ) external onlyOwner whenNotPaused {
        if (paymentStatus[paymentId] != ProtocolTypes.PaymentStatus.PENDING) {
            revert PaymentNotPending();
        }
        paymentStatus[paymentId] = ProtocolTypes.PaymentStatus.COMPLETED;
        emit PaymentCompleted(paymentId, privacyCommitment);
    }

    function cancelPayment(bytes32 paymentId) external onlyOwner {
        if (paymentStatus[paymentId] != ProtocolTypes.PaymentStatus.PENDING) {
            revert PaymentNotPending();
        }
        paymentStatus[paymentId] = ProtocolTypes.PaymentStatus.CANCELLED;
        emit PaymentCancelled(paymentId);
    }

    function batchCommit(
        bytes32 batchId,
        bytes32[] calldata paymentIds,
        bytes32[] calldata recipientCommitments,
        uint256[] calldata amounts,
        uint64 destinationChainId,
        uint64 deadline,
        bytes calldata proof,
        uint256[] calldata publicInputs
    ) external nonReentrant whenNotPaused {
        uint256 count = paymentIds.length;
        if (
            count == 0 ||
            count > MAX_BATCH_SIZE ||
            count != recipientCommitments.length ||
            count != amounts.length
        ) revert InvalidBatch();
        if (batchId == bytes32(0)) revert InvalidPaymentId();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (!compliance.isAllowed(msg.sender)) revert ComplianceBlocked();
        if (!zkVerifier.verifyPayment(proof, publicInputs)) revert InvalidProof();

        uint256 totalAmount;
        uint256 totalFee;

        for (uint256 i; i < count; ++i) {
            if (
                paymentIds[i] == bytes32(0) ||
                recipientCommitments[i] == bytes32(0) ||
                amounts[i] == 0 ||
                paymentStatus[paymentIds[i]] != ProtocolTypes.PaymentStatus.NONE
            ) revert InvalidBatch();

            paymentStatus[paymentIds[i]] = ProtocolTypes.PaymentStatus.PENDING;
            uint256 fee = (amounts[i] * feeBps) / BPS;
            totalAmount += amounts[i];
            totalFee += fee;

            emit PaymentCommitted(
                paymentIds[i],
                bytes32(0),
                recipientCommitments[i],
                fee,
                destinationChainId
            );
        }

        settlementToken.safeTransferFrom(
            msg.sender,
            address(this),
            totalAmount + totalFee
        );

        if (totalFee != 0) {
            settlementToken.safeTransfer(feeCollector, totalFee);
        }

        emit BatchPaymentCommitted(batchId, count);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function rescueToken(address token, address to, uint256 amount)
        external
        onlyOwner
    {
        if (to == address(0)) revert InvalidAddress();
        IERC20(token).safeTransfer(to, amount);
    }
}
