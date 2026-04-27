# Confidential RWA Compliance Vault

Confidential on-chain operations console and Solidity vault built for Zama FHEVM.

This repo contains:

- an FHE-enabled compliance vault contract (`contracts/`)
- a production-ready React operations console (`apps/web/`)
- deployment + verification scripts for Sepolia

## Architecture

### Contracts (`contracts/`)

Core contract: `ConfidentialComplianceVault`

- uses `euint64` balances with `@fhevm/solidity`
- supports compliance policy updates (`minKycTier`, `maxRiskClass`)
- supports investor onboarding and metadata reads
- supports confidential `deposit` and `requestWithdrawal` flows
- grants encrypted handle access using `FHE.allow` / `FHE.allowThis`

### Web console (`apps/web/`)

- Vite + React + TypeScript
- RainbowKit + wagmi wallet integration
- Sepolia-focused write actions:
  - update policy
  - register investor
- public metadata read flow (`getInvestorMetadata`)
- production safeguards:
  - env validation for `VITE_VAULT_ADDRESS`
  - address and input validation
  - Sepolia chain checks before writes

## Project layout

- `contracts/` - Hardhat v3 workspace
- `apps/web/` - frontend workspace
- `package.json` - npm workspaces root

## Requirements

- Node.js 20+
- npm 10+
- Sepolia RPC URL
- funded Sepolia deployer wallet

## Setup

Install all dependencies from repo root:

```bash
npm install
```

## Contracts workflow

Create env file:

```bash
cp contracts/.env.example contracts/.env
```

Set:

- `SEPOLIA_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`
- `ETHERSCAN_API_KEY` (for verification)
- `VAULT_CONTRACT_ADDRESS` (for verify script)

Compile:

```bash
npm run compile --workspace contracts
```

Deploy:

```bash
npm run deploy:sepolia --workspace contracts
```

Verify:

```bash
npm run verify:sepolia --workspace contracts
```

## Web workflow

Create env file:

```bash
cp apps/web/.env.example apps/web/.env
```

Set:

- `VITE_VAULT_ADDRESS` (required)
- `VITE_WALLETCONNECT_PROJECT_ID` (recommended for WalletConnect/mobile)

Run locally:

```bash
npm run dev --workspace apps/web
```

Production build:

```bash
npm run build --workspace apps/web
```

## Deployment notes

- Web app expects Sepolia for on-chain writes.
- Do not commit private env files (`contracts/.env`, `apps/web/.env`).
- If using Vercel, set root directory to `apps/web` and configure `VITE_*` env vars.

## Current deployed vault

- Network: Sepolia
- Contract: `0x2d11447C92016dB7965CF4B8964F40873739EA81`

## Security and next steps

- rotate any leaked private keys immediately
- move privileged roles to multisig for production
- add end-to-end tests for policy + registration flows
- integrate frontend encryption/proof generation for full confidential deposit UX
