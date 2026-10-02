// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IZKVerifier {
    /// @notice Verifies a private payment proof.
    /// @dev Public inputs should be a commitment/nullifier/root/etc. defined by the production circuit.
    function verifyPayment(
        bytes calldata proof,
        uint256[] calldata publicInputs
    ) external view returns (bool);
}
