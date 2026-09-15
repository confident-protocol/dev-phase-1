// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Boundary for a production FHE provider such as the selected FHE network.
/// @dev This interface deliberately avoids pretending ciphertext bytes are directly computable
///      by ordinary EVM Solidity. The production adapter should wrap the provider's native types.
interface IFHEEngine {
    function registerCiphertext(bytes32 ciphertextId, bytes calldata ciphertext) external;
    function deleteCiphertext(bytes32 ciphertextId) external;
    function ciphertextExists(bytes32 ciphertextId) external view returns (bool);
}
