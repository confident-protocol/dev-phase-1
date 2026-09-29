// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ConfidentialPayroll
 * @notice Encrypted batch payroll with FHE salary ciphertext and ACL-gated decryption.
 * @dev Mirrors ConfidentialPay whitepaper §3.5 — salaries never appear in plaintext events.
 */

import "./interfaces/IConfidentialUSDC.sol";
import "./interfaces/IZKVerifier.sol";
import "./libraries/FHEHelpers.sol";
import "./libraries/PayrollMath.sol";

contract ConfidentialPayroll {
    using FHEHelpers for bytes32;
    using PayrollMath for uint256;

    struct Employee {
        address wallet;
        bytes32 nameHash;
        bytes32 roleHash;
        bytes32 salaryCipher; // euint64 commitment / FHE handle
        bool active;
        uint256 lastPaidAt;
        uint64 chainIdHint;
    }

    struct PayrollRunMeta {
        bytes32 rosterRoot;
        bytes32 zkProofId;
        uint256 employeeCount;
        uint256 executedAt;
        address executor;
        uint64 sourceChainId;
        uint64 destChainId;
    }

    IConfidentialUSDC public immutable cUSDC;
    IZKVerifier public immutable zkVerifier;
    address public owner;
    address public complianceOfficer;

    uint256 public employeeCount;
    mapping(uint256 => Employee) public employees;
    mapping(address => uint256) public walletToEmployeeId;
    mapping(bytes32 => PayrollRunMeta) public runs;
    mapping(address => bool) public payrollOperators;

    event EmployeeRegistered(uint256 indexed id, address indexed wallet, bytes32 salaryCipher);
    event EmployeeStatusChanged(uint256 indexed id, bool active);
    event PayrollExecuted(bytes32 indexed runId, bytes32 rosterRoot, uint256 employeeCount);
    event SelectiveDisclosureGranted(uint256 indexed id, address indexed viewer, uint256 expiresAt);
    event ComplianceOfficerUpdated(address indexed officer);

    modifier onlyOwner() {
        require(msg.sender == owner, "CP: not owner");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == owner || payrollOperators[msg.sender], "CP: not operator");
        _;
    }

    constructor(address cUsdc_, address zkVerifier_, address complianceOfficer_) {
        require(cUsdc_ != address(0) && zkVerifier_ != address(0), "CP: zero addr");
        cUSDC = IConfidentialUSDC(cUsdc_);
        zkVerifier = IZKVerifier(zkVerifier_);
        owner = msg.sender;
        complianceOfficer = complianceOfficer_;
        payrollOperators[msg.sender] = true;
    }

    function setOperator(address op, bool allowed) external onlyOwner {
        payrollOperators[op] = allowed;
    }

    function setComplianceOfficer(address officer) external onlyOwner {
        complianceOfficer = officer;
        emit ComplianceOfficerUpdated(officer);
    }

    function batchAddEmployees(
        address[] calldata wallets,
        bytes32[] calldata nameHashes,
        bytes32[] calldata roleHashes,
        bytes32[] calldata salaryCiphers,
        bytes[] calldata fheProofs,
        uint64[] calldata chainIdHints
    ) external onlyOperator {
        uint256 len = wallets.length;
        require(
            len == nameHashes.length &&
                len == roleHashes.length &&
                len == salaryCiphers.length &&
                len == fheProofs.length &&
                len == chainIdHints.length,
            "CP: length mismatch"
        );

        for (uint256 i = 0; i < len; ) {
            require(wallets[i] != address(0), "CP: zero wallet");
            require(walletToEmployeeId[wallets[i]] == 0, "CP: exists");
            require(FHEHelpers.verifyExternalInput(salaryCiphers[i], fheProofs[i]), "CP: bad FHE proof");

            unchecked {
                employeeCount += 1;
            }
            uint256 id = employeeCount;
            employees[id] = Employee({
                wallet: wallets[i],
                nameHash: nameHashes[i],
                roleHash: roleHashes[i],
                salaryCipher: salaryCiphers[i],
                active: true,
                lastPaidAt: 0,
                chainIdHint: chainIdHints[i]
            });
            walletToEmployeeId[wallets[i]] = id;
            FHEHelpers.allow(salaryCiphers[i], owner);
            FHEHelpers.allow(salaryCiphers[i], wallets[i]);
            emit EmployeeRegistered(id, wallets[i], salaryCiphers[i]);
            unchecked {
                ++i;
            }
        }
    }

    function setEmployeeActive(uint256 id, bool active) external onlyOperator {
        require(id > 0 && id <= employeeCount, "CP: bad id");
        employees[id].active = active;
        emit EmployeeStatusChanged(id, active);
    }

    /**
     * @notice Execute confidential payroll. Amounts stay encrypted; only cipher handles move.
     * @param runId Unique run identifier (off-chain orchestrator)
     * @param rosterRoot Merkle root of encrypted roster leaves
     * @param zkProof Ligero/Arc proof bytes for batch validity
     * @param publicInputs Public ZK inputs (nullifiers, commitments)
     */
    function runPayroll(
        bytes32 runId,
        bytes32 rosterRoot,
        bytes calldata zkProof,
        bytes32[] calldata publicInputs,
        uint64 sourceChainId,
        uint64 destChainId
    ) external onlyOperator {
        require(runs[runId].executedAt == 0, "CP: run exists");
        require(zkVerifier.verify(zkProof, publicInputs), "CP: zk failed");

        uint256 paid;
        for (uint256 id = 1; id <= employeeCount; ) {
            Employee storage emp = employees[id];
            if (emp.active) {
                cUSDC.confidentialTransferFrom(address(this), emp.wallet, emp.salaryCipher);
                emp.lastPaidAt = block.timestamp;
                unchecked {
                    paid += 1;
                }
            }
            unchecked {
                ++id;
            }
        }

        runs[runId] = PayrollRunMeta({
            rosterRoot: rosterRoot,
            zkProofId: keccak256(zkProof),
            employeeCount: paid,
            executedAt: block.timestamp,
            executor: msg.sender,
            sourceChainId: sourceChainId,
            destChainId: destChainId
        });

        emit PayrollExecuted(runId, rosterRoot, paid);
    }

    function getSalaryCipher(uint256 id) external view returns (bytes32) {
        require(id > 0 && id <= employeeCount, "CP: bad id");
        Employee storage emp = employees[id];
        require(
            msg.sender == owner || msg.sender == emp.wallet || msg.sender == complianceOfficer,
            "CP: not authorized"
        );
        return emp.salaryCipher;
    }

    function grantSelectiveDisclosure(uint256 id, address viewer, uint256 ttl) external {
        require(msg.sender == owner || msg.sender == complianceOfficer, "CP: not compliance");
        require(id > 0 && id <= employeeCount, "CP: bad id");
        FHEHelpers.allowTransient(employees[id].salaryCipher, viewer, ttl);
        emit SelectiveDisclosureGranted(id, viewer, block.timestamp + ttl);
    }
}
