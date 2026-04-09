import { Contract, type BrowserProvider, type JsonRpcSigner } from "ethers";

export const VAULT_ABI = [
  "function complianceOfficer() view returns (address)",
  "function minKycTier() view returns (uint8)",
  "function maxRiskClass() view returns (uint8)",
  "function updatePolicy(uint8 newMinKycTier, uint8 newMaxRiskClass)",
  "function registerInvestor(address investor, uint8 kycTier, uint8 riskClass)",
  "function getInvestorMetadata(address investor) view returns (bool isRegistered, uint8 kycTier, uint8 riskClass)",
] as const;

export const getVaultAddress = (): string => {
  return import.meta.env.VITE_VAULT_ADDRESS || "";
};

export function createVaultReadContract(provider: BrowserProvider): Contract {
  const address = getVaultAddress();
  if (!address) {
    throw new Error("Missing VITE_VAULT_ADDRESS in frontend .env file.");
  }
  return new Contract(address, VAULT_ABI, provider);
}

export function createVaultWriteContract(signer: JsonRpcSigner): Contract {
  const address = getVaultAddress();
  if (!address) {
    throw new Error("Missing VITE_VAULT_ADDRESS in frontend .env file.");
  }
  return new Contract(address, VAULT_ABI, signer);
}
