// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @dev Stubbed FHE helpers compatible with Fhenix/Zama-style handles used by ConfidentialPay.
 * Production bindings would call precompiles / coprocessor callbacks.
 */
library FHEHelpers {
    function verifyExternalInput(bytes32 cipher, bytes memory proof) internal pure returns (bool) {
        return cipher != bytes32(0) && proof.length > 0;
    }

    function allow(bytes32 cipher, address account) internal pure {
        cipher;
        account;
    }

    function allowTransient(bytes32 cipher, address account, uint256 ttl) internal pure {
        cipher;
        account;
        ttl;
    }

    function ge(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b, "ge"));
    }
}
