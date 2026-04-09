// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, ebool, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialComplianceVault is Ownable, ZamaEthereumConfig {
    struct InvestorRecord {
        bool isRegistered;
        uint8 kycTier;
        uint8 riskClass;
        euint64 encryptedBalance;
    }

    mapping(address => InvestorRecord) private investorRecords;
    address public complianceOfficer;
    uint8 public minKycTier;
    uint8 public maxRiskClass;

    event InvestorRegistered(address indexed investor, uint8 kycTier, uint8 riskClass);
    event CompliancePolicyUpdated(uint8 minKycTier, uint8 maxRiskClass);
    event ConfidentialDeposit(address indexed investor);
    event ConfidentialWithdrawalRequested(address indexed investor);

    error NotComplianceOfficer();
    error InvestorNotRegistered();
    error InvalidPolicy();
    error InvalidInvestorData();

    constructor(address initialOwner, address initialComplianceOfficer) Ownable(initialOwner) {
        complianceOfficer = initialComplianceOfficer;
        minKycTier = 1;
        maxRiskClass = 5;
    }

    modifier onlyComplianceOfficer() {
        if (msg.sender != complianceOfficer) revert NotComplianceOfficer();
        _;
    }

    function setComplianceOfficer(address newOfficer) external onlyOwner {
        if (newOfficer == address(0)) revert InvalidInvestorData();
        complianceOfficer = newOfficer;
    }

    function updatePolicy(uint8 newMinKycTier, uint8 newMaxRiskClass) external onlyComplianceOfficer {
        if (newMinKycTier == 0 || newMaxRiskClass == 0) revert InvalidPolicy();
        minKycTier = newMinKycTier;
        maxRiskClass = newMaxRiskClass;
        emit CompliancePolicyUpdated(newMinKycTier, newMaxRiskClass);
    }

    function registerInvestor(address investor, uint8 kycTier, uint8 riskClass) external onlyComplianceOfficer {
        if (investor == address(0) || kycTier == 0 || riskClass == 0) revert InvalidInvestorData();

        investorRecords[investor].isRegistered = true;
        investorRecords[investor].kycTier = kycTier;
        investorRecords[investor].riskClass = riskClass;

        emit InvestorRegistered(investor, kycTier, riskClass);
    }

    function deposit(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        InvestorRecord storage record = investorRecords[msg.sender];
        if (!record.isRegistered) revert InvestorNotRegistered();
        _assertPolicy(record);

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        euint64 updatedBalance = FHE.add(record.encryptedBalance, amount);
        record.encryptedBalance = updatedBalance;

        FHE.allowThis(record.encryptedBalance);
        FHE.allow(record.encryptedBalance, msg.sender);
        FHE.allow(record.encryptedBalance, complianceOfficer);

        emit ConfidentialDeposit(msg.sender);
    }

    function requestWithdrawal(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        InvestorRecord storage record = investorRecords[msg.sender];
        if (!record.isRegistered) revert InvestorNotRegistered();
        _assertPolicy(record);

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        ebool canWithdraw = FHE.le(amount, record.encryptedBalance);
        euint64 nextBalance = FHE.select(canWithdraw, FHE.sub(record.encryptedBalance, amount), record.encryptedBalance);
        record.encryptedBalance = nextBalance;

        FHE.allowThis(record.encryptedBalance);
        FHE.allow(record.encryptedBalance, msg.sender);
        FHE.allow(record.encryptedBalance, complianceOfficer);
        FHE.allow(canWithdraw, msg.sender);
        FHE.allow(canWithdraw, complianceOfficer);

        emit ConfidentialWithdrawalRequested(msg.sender);
    }

    function getEncryptedBalanceHandle(address investor) external view returns (euint64) {
        InvestorRecord storage record = investorRecords[investor];
        if (!record.isRegistered) revert InvestorNotRegistered();
        return record.encryptedBalance;
    }

    function getInvestorMetadata(address investor) external view returns (bool isRegistered, uint8 kycTier, uint8 riskClass) {
        InvestorRecord memory record = investorRecords[investor];
        return (record.isRegistered, record.kycTier, record.riskClass);
    }

    function _assertPolicy(InvestorRecord memory record) internal view {
        if (record.kycTier < minKycTier || record.riskClass > maxRiskClass) revert InvalidPolicy();
    }
}
