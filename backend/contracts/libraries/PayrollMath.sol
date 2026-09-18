// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library PayrollMath {
    uint256 internal constant FEE_BPS_MIN = 30; // 0.3%
    uint256 internal constant FEE_BPS_MAX = 70; // 0.7%

    function applyProtocolFee(uint256 amount, uint256 bps) internal pure returns (uint256 net, uint256 fee) {
        require(bps >= FEE_BPS_MIN && bps <= FEE_BPS_MAX, "fee bps");
        fee = (amount * bps) / 10_000;
        net = amount - fee;
    }

    function microUsdc(uint256 dollars) internal pure returns (uint256) {
        return dollars * 1_000_000;
    }
}
