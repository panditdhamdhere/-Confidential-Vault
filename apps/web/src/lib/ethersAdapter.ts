import { BrowserProvider, type JsonRpcSigner } from "ethers";
import type { PublicClient, WalletClient } from "viem";

/**
 * Bridge viem clients (from wagmi) to ethers v6 for existing Contract code.
 * Viem's client `request` matches EIP-1193 closely enough for BrowserProvider.
 */
export function publicClientToProvider(client: PublicClient): BrowserProvider {
  const chainId = client.chain?.id;
  if (chainId === undefined) {
    throw new Error("Public client has no chain.");
  }
  return new BrowserProvider(client as unknown as import("ethers").Eip1193Provider, chainId);
}

export async function walletClientToSigner(client: WalletClient): Promise<JsonRpcSigner> {
  const address = client.account?.address;
  if (!address) {
    throw new Error("Wallet is not connected.");
  }
  const chainId = client.chain?.id;
  if (chainId === undefined) {
    throw new Error("Wallet client has no chain.");
  }
  const provider = new BrowserProvider(client as unknown as import("ethers").Eip1193Provider, chainId);
  return provider.getSigner(address);
}
