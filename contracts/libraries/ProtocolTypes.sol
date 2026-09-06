// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library ProtocolTypes {
    enum PaymentStatus {
        NONE,
        PENDING,
        COMPLETED,
        CANCELLED
    }

    struct PaymentRequest {
        bytes32 paymentId;
        bytes32 senderCommitment;
        bytes32 recipientCommitment;
        uint256 amount;
        uint256 fee;
        uint64 sourceChainId;
        uint64 destinationChainId;
        uint64 deadline;
        bytes32 privacyCommitment;
    }

    struct RecurringPayment {
        bytes32 id;
        address owner;
        bytes32 recipientCommitment;
        uint256 amount;
        uint64 interval;
        uint64 nextExecution;
        uint64 remainingExecutions;
        bool active;
    }
}
