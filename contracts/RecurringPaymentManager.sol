// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ProtocolTypes} from "./libraries/ProtocolTypes.sol";
import {ComplianceRegistry} from "./ComplianceRegistry.sol";

contract RecurringPaymentManager is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_INTERVAL = 365 days;

    IERC20 public immutable asset;
    ComplianceRegistry public immutable compliance;
    address public executor;

    mapping(bytes32 => ProtocolTypes.RecurringPayment) public schedules;

    event ScheduleCreated(
        bytes32 indexed id,
        address indexed owner,
        bytes32 indexed recipientCommitment,
        uint256 amount,
        uint64 interval,
        uint64 executions
    );
    event ScheduleExecuted(bytes32 indexed id, uint64 nextExecution, uint64 remaining);
    event ScheduleCancelled(bytes32 indexed id);

    error InvalidSchedule();
    error NotOwner();
    error NotExecutable();
    error ComplianceBlocked();
    error InvalidAddress();

    constructor(
        address initialOwner,
        address asset_,
        address compliance_,
        address executor_
    ) Ownable(initialOwner) {
        if (
            asset_ == address(0) ||
            compliance_ == address(0) ||
            executor_ == address(0)
        ) revert InvalidAddress();
        asset = IERC20(asset_);
        compliance = ComplianceRegistry(compliance_);
        executor = executor_;
    }

    modifier onlyScheduleOwner(bytes32 id) {
        if (schedules[id].owner != msg.sender) revert NotOwner();
        _;
    }

    function setExecutor(address executor_) external onlyOwner {
        if (executor_ == address(0)) revert InvalidAddress();
        executor = executor_;
    }

    function createSchedule(
        bytes32 id,
        bytes32 recipientCommitment,
        uint256 amount,
        uint64 interval,
        uint64 firstExecution,
        uint64 executions
    ) external whenNotPaused {
        if (
            id == bytes32(0) ||
            recipientCommitment == bytes32(0) ||
            amount == 0 ||
            interval == 0 ||
            interval > MAX_INTERVAL ||
            firstExecution < block.timestamp ||
            executions == 0
        ) revert InvalidSchedule();
        if (!compliance.isAllowed(msg.sender)) revert ComplianceBlocked();

        schedules[id] = ProtocolTypes.RecurringPayment({
            id: id,
            owner: msg.sender,
            recipientCommitment: recipientCommitment,
            amount: amount,
            interval: interval,
            nextExecution: firstExecution,
            remainingExecutions: executions,
            active: true
        });

        // Funds remain under the user's ERC-20 allowance until each execution.
        emit ScheduleCreated(
            id,
            msg.sender,
            recipientCommitment,
            amount,
            interval,
            executions
        );
    }

    function execute(bytes32 id) external nonReentrant whenNotPaused {
        if (msg.sender != executor) revert NotOwner();
        ProtocolTypes.RecurringPayment storage s = schedules[id];

        if (
            !s.active ||
            block.timestamp < s.nextExecution ||
            s.remainingExecutions == 0
        ) revert NotExecutable();

        if (!compliance.isAllowed(s.owner)) revert ComplianceBlocked();

        asset.safeTransferFrom(s.owner, address(this), s.amount);

        unchecked {
            s.remainingExecutions -= 1;
        }

        if (s.remainingExecutions == 0) {
            s.active = false;
        } else {
            s.nextExecution += s.interval;
        }

        emit ScheduleExecuted(id, s.nextExecution, s.remainingExecutions);
    }

    function cancel(bytes32 id) external onlyScheduleOwner(id) {
        schedules[id].active = false;
        emit ScheduleCancelled(id);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
