# Confidential Vault Console (Web)

React operations console for the `ConfidentialComplianceVault` contract.

## Stack

- Vite 7
- React + TypeScript
- RainbowKit + wagmi
- ethers (contract calls)

## Environment

Create `apps/web/.env`:

```bash
cp .env.example .env
```

Required:

- `VITE_VAULT_ADDRESS` - deployed vault contract address

Optional:

- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect Cloud project id

## Run

From repo root:

```bash
npm run dev --workspace apps/web
```

or from `apps/web`:

```bash
npm run dev
```

## Build

```bash
npm run build --workspace apps/web
```

## Console capabilities

- update policy (`updatePolicy`)
- register investor (`registerInvestor`)
- fetch investor metadata (`getInvestorMetadata`)

## Notes

- Writes are intended for Sepolia.
- UI validates wallet connection, chain, address format, and basic numeric inputs.
