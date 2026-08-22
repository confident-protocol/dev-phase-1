// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract ComplianceRegistry is Ownable, AccessControl {
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    enum Tier {
        NONE,
        TIER_0,
        TIER_1,
        TIER_2,
        TIER_3
    }

    struct Profile {
        Tier tier;
        bool sanctioned;
        bool active;
    }

    mapping(address => Profile) private profiles;
    mapping(address => mapping(bytes32 => bool)) private disclosureKeys;

    event ProfileUpdated(address indexed account, Tier tier, bool active);
    event SanctionsStatusUpdated(address indexed account, bool sanctioned);
    event DisclosureKeyAuthorized(address indexed account, bytes32 indexed keyHash, bool allowed);

    constructor(address initialOwner) Ownable(initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    function setComplianceOfficer(address officer, bool enabled) external onlyOwner {
        if (enabled) _grantRole(COMPLIANCE_ROLE, officer);
        else _revokeRole(COMPLIANCE_ROLE, officer);
    }

    function setProfile(address account, Tier tier, bool active)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        profiles[account] = Profile(tier, profiles[account].sanctioned, active);
        emit ProfileUpdated(account, tier, active);
    }

    function setSanctioned(address account, bool sanctioned)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        profiles[account].sanctioned = sanctioned;
        emit SanctionsStatusUpdated(account, sanctioned);
    }

    function authorizeDisclosureKey(
        address account,
        bytes32 keyHash,
        bool allowed
    ) external onlyRole(COMPLIANCE_ROLE) {
        disclosureKeys[account][keyHash] = allowed;
        emit DisclosureKeyAuthorized(account, keyHash, allowed);
    }

    function isAllowed(address account) public view returns (bool) {
        Profile memory p = profiles[account];
        return p.active && !p.sanctioned && p.tier != Tier.NONE;
    }

    function tierOf(address account) external view returns (Tier) {
        return profiles[account].tier;
    }

    function isDisclosureKeyAuthorized(address account, bytes32 keyHash)
        external
        view
        returns (bool)
    {
        return disclosureKeys[account][keyHash];
    }
}
