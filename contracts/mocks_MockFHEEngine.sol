// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IFHEEngine} from "./interfaces/IFHEEngine.sol";

contract MockFHEEngine is IFHEEngine {
    mapping(bytes32 => bytes32) public ciphertextHashes;

    function registerCiphertext(
        bytes32 ciphertextId,
        bytes calldata ciphertext
    ) external {
        ciphertextHashes[ciphertextId] = keccak256(ciphertext);
    }

    function deleteCiphertext(bytes32 ciphertextId) external {
        delete ciphertextHashes[ciphertextId];
    }

    function ciphertextExists(bytes32 ciphertextId)
        external
        view
        returns (bool)
    {
        return ciphertextHashes[ciphertextId] != bytes32(0);
    }
}
