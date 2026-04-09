import { BrowserProvider, Contract } from "ethers";

export const VAULT_ABI = [
  "function complianceOfficer() view returns (address)",
  "function minKycTier() view returns (uint8)",
  "function maxRiskClass() view returns (uint8)",
  "function updatePolicy(uint8 newMinKycTier, uint8 newMaxRiskClass)",
  "function registerInvestor(address investor, uint8 kycTier, uint8 riskClass)",
  "function getInvestorMetadata(address investor) view returns (bool isRegistered, uint8 kycTier, uint8 riskClass)",
];

export const getVaultAddress = (): string => {
  return import.meta.env.VITE_VAULT_ADDRESS || "";
};

export const getBrowserProvider = async (): Promise<BrowserProvider> => {
  const ethereum = (window as Window & { ethereum?: unknown }).ethereum;
  if (!ethereum) {
    throw new Error("MetaMask (or compatible wallet) not found.");
  }

  return new BrowserProvider(ethereum as never);
};

export const getReadContract = async (): Promise<Contract> => {
  const provider = await getBrowserProvider();
  const address = getVaultAddress();
  if (!address) {
    throw new Error("Missing VITE_VAULT_ADDRESS in frontend .env file.");
  }
  return new Contract(address, VAULT_ABI, provider);
};

export const getWriteContract = async (): Promise<Contract> => {
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  const address = getVaultAddress();
  if (!address) {
    throw new Error("Missing VITE_VAULT_ADDRESS in frontend .env file.");
  }
  return new Contract(address, VAULT_ABI, signer);
};
