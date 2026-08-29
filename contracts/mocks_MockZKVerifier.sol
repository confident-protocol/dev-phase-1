// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IZKVerifier} from "./interfaces/IZKVerifier.sol";

contract MockZKVerifier is IZKVerifier {
    bool public result = true;

    function setResult(bool value) external {
        result = value;
    }

    function verifyPayment(
        bytes calldata,
        uint256[] calldata
    ) external view returns (bool) {
        return result;
    }
}
