import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

/** WalletConnect Cloud project ID — optional for browser-extension wallets; required for mobile / QR. */
if (import.meta.env.DEV && !projectId) {
  console.warn(
    "[wallet] Set VITE_WALLETCONNECT_PROJECT_ID in apps/web/.env for WalletConnect (https://cloud.walletconnect.com).",
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "Confidential RWA Vault",
  projectId: projectId || "00000000000000000000000000000000",
  chains: [sepolia],
  ssr: false,
});
