# Confidential RWA Compliance Vault (Zama Season 2)

Production-oriented starter for a Builder Track submission:

- FHEVM smart contract with encrypted balances and compliance-gated participation
- React frontend for demo, submission messaging, and deployment handoff
- Sepolia deployment script and environment setup

## Project Structure

- `contracts`: Hardhat + Solidity contracts
- `apps/web`: Vite + React frontend

## Smart Contract Highlights

`ConfidentialComplianceVault` includes:

- encrypted balance storage using `euint64`
- investor registration and compliance policy checks
- confidential deposit and withdrawal request flow
- handle permissions for investor and compliance officer via `FHE.allow`

## Prerequisites

- Node.js 20+
- npm 10+
- Sepolia RPC endpoint
- funded deployer wallet (test ETH)

## Quickstart

### 1) Install dependencies

```bash
cd contracts && npm install
cd ../apps/web && npm install
```

### 2) Compile contracts

```bash
cd contracts
npm run compile
```

### 3) Configure deployment env

```bash
cd contracts
cp .env.example .env
```

Fill:

- `SEPOLIA_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`

### 4) Deploy to Sepolia

```bash
cd contracts
npm run deploy:sepolia
```

### 5) Run frontend

```bash
cd apps/web
cp .env.example .env
npm run dev
```

Set `VITE_VAULT_ADDRESS` in `apps/web/.env` using the deployed contract address.

## Submission Notes

For final Builder submission, add:

- transaction links and verified contract address
- 3-minute demo video (problem -> architecture -> live tx flow)
- docs describing confidentiality model, compliance logic, and failure modes

## Next Production Enhancements

- wallet + signer integration (wagmi/viem/ethers)
- FHE input encryption/proof generation in frontend using official SDK
- robust role management (multisig owner/compliance)
- end-to-end integration tests on Sepolia
