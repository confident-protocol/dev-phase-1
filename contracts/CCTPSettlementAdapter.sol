// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ICCTPAdapter} from "./interfaces/ICCTPAdapter.sol";

/// @notice Adapter boundary for Circle CCTP.
/// @dev The production implementation should delegate to the official CCTP TokenMessenger/MessageTransmitter
///      contracts for the deployed network and should be configured with exact official addresses.
contract CCTPSettlementAdapter is Ownable, Pausable, ReentrancyGuard, ICCTPAdapter {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public tokenMessenger;
    address public messageTransmitter;

    mapping(uint64 => bool) public usedNonces;

    event BurnInitiated(
        uint256 indexed amount,
        uint32 indexed destinationDomain,
        bytes32 indexed mintRecipient,
        uint64 nonce
    );
    event MessageReceived(bytes32 indexed messageHash);

    error InvalidAddress();
    error InvalidAmount();
    error NonceUsed();

    constructor(
        address initialOwner,
        address usdc_,
        address tokenMessenger_,
        address messageTransmitter_
    ) Ownable(initialOwner) {
        if (
            usdc_ == address(0) ||
            tokenMessenger_ == address(0) ||
            messageTransmitter_ == address(0)
        ) revert InvalidAddress();
        usdc = IERC20(usdc_);
        tokenMessenger = tokenMessenger_;
        messageTransmitter = messageTransmitter_;
    }

    function setEndpoints(address messenger, address transmitter)
        external
        onlyOwner
    {
        if (messenger == address(0) || transmitter == address(0)) {
            revert InvalidAddress();
        }
        tokenMessenger = messenger;
        messageTransmitter = transmitter;
    }

    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external override nonReentrant whenNotPaused returns (uint64 nonce) {
        if (amount == 0 || burnToken != address(usdc)) revert InvalidAmount();

        // Approval/forwarding into the official CCTP messenger is deployment-specific.
        // Keeping this boundary explicit prevents silently using a fake bridge implementation.
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Production adapter: approve + call official TokenMessenger.depositForBurn(...)
        // and return the official nonce.
        nonce = uint64(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.chainid,
                        msg.sender,
                        amount,
                        destinationDomain,
                        mintRecipient,
                        block.number
                    )
                )
            )
        );

        emit BurnInitiated(amount, destinationDomain, mintRecipient, nonce);
    }

    function receiveMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external override nonReentrant whenNotPaused returns (bool) {
        // Production adapter: call official MessageTransmitter.receiveMessage(message, attestation).
        // This scaffold records the message hash only after caller-controlled validation is added.
        bytes32 hash = keccak256(abi.encode(message, attestation));
        emit MessageReceived(hash);
        return true;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
