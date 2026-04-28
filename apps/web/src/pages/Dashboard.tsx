import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAddress } from "ethers";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import "../App.css";
import {
  createVaultReadContract,
  createVaultWriteContract,
  getVaultAddress,
} from "../lib/contract";
import { publicClientToProvider, walletClientToSigner } from "../lib/ethersAdapter";

const SEPOLIA_EXP = "https://sepolia.etherscan.io";
const SEPOLIA_CHAIN_ID = 11155111;

type InvestorMetadata = {
  isRegistered: boolean;
  kycTier: number;
  riskClass: number;
};

type ToastState = {
  kind: "success" | "error";
  message: string;
};

type BusyAction = "updatePolicy" | "registerInvestor" | "fetchMetadata" | null;

function Dashboard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [policyMinTier, setPolicyMinTier] = useState<string>("1");
  const [policyMaxRisk, setPolicyMaxRisk] = useState<string>("5");
  const [investorAddress, setInvestorAddress] = useState<string>("");
  const [investorTier, setInvestorTier] = useState<string>("2");
  const [investorRisk, setInvestorRisk] = useState<string>("3");
  const [lookupAddress, setLookupAddress] = useState<string>("");
  const [metadata, setMetadata] = useState<InvestorMetadata | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const contractAddress = useMemo(() => getVaultAddress(), []);
  const hasValidVaultAddress = useMemo(() => isAddress(contractAddress), [contractAddress]);
  const isWrongNetwork = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  const shortHash = (h: string) => (h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  const vaultExplorerUrl =
    hasValidVaultAddress ? `${SEPOLIA_EXP}/address/${contractAddress}` : null;

  const toErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) return error.message;
    return "Something went wrong. Please try again.";
  };

  const notify = (message: string, kind: ToastState["kind"]) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message, kind });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  const toUint8 = (value: string, fieldLabel: string) => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > 255) {
      throw new Error(`${fieldLabel} must be an integer between 0 and 255.`);
    }
    return n;
  };

  const ensureWriteReady = () => {
    if (!walletClient) throw new Error("Connect a wallet first.");
    if (!hasValidVaultAddress) throw new Error("Set a valid VITE_VAULT_ADDRESS.");
    if (isWrongNetwork) throw new Error("Switch your wallet network to Sepolia.");
  };

  const updatePolicy = async () => {
    if (busyAction) return;
    try {
      ensureWriteReady();
      const currentWallet = walletClient;
      if (!currentWallet) throw new Error("Connect a wallet first.");
      const minTier = toUint8(policyMinTier, "Minimum KYC tier");
      const maxRisk = toUint8(policyMaxRisk, "Maximum risk class");
      if (minTier > maxRisk) throw new Error("Minimum KYC tier cannot be greater than maximum risk class.");
      setBusyAction("updatePolicy");
      const signer = await walletClientToSigner(currentWallet);
      const contract = createVaultWriteContract(signer);
      const tx = await contract.updatePolicy(minTier, maxRisk);
      await tx.wait();
      setLastTxHash(tx.hash);
      notify("Policy updated successfully.", "success");
    } catch (error: unknown) {
      const msg = toErrorMessage(error);
      console.error(msg);
      notify(msg, "error");
    } finally {
      setBusyAction(null);
    }
  };

  const registerInvestor = async () => {
    if (busyAction) return;
    try {
      ensureWriteReady();
      const currentWallet = walletClient;
      if (!currentWallet) throw new Error("Connect a wallet first.");
      if (!isAddress(investorAddress.trim())) throw new Error("Enter a valid investor address.");
      const kycTier = toUint8(investorTier, "Investor KYC tier");
      const riskClass = toUint8(investorRisk, "Investor risk class");
      setBusyAction("registerInvestor");
      const signer = await walletClientToSigner(currentWallet);
      const contract = createVaultWriteContract(signer);
      const tx = await contract.registerInvestor(investorAddress.trim(), kycTier, riskClass);
      await tx.wait();
      setLastTxHash(tx.hash);
      notify("Investor registered successfully.", "success");
    } catch (error: unknown) {
      const msg = toErrorMessage(error);
      console.error(msg);
      notify(msg, "error");
    } finally {
      setBusyAction(null);
    }
  };

  const fetchMetadata = async () => {
    if (busyAction) return;
    try {
      if (!publicClient) {
        console.error("Network client not ready.");
        return;
      }
      if (!hasValidVaultAddress) throw new Error("Set a valid VITE_VAULT_ADDRESS.");
      if (!isAddress(lookupAddress.trim())) throw new Error("Enter a valid address to fetch metadata.");
      setBusyAction("fetchMetadata");
      const provider = publicClientToProvider(publicClient);
      const contract = createVaultReadContract(provider);
      const result = await contract.getInvestorMetadata(lookupAddress.trim());
      setMetadata({
        isRegistered: result[0],
        kycTier: Number(result[1]),
        riskClass: Number(result[2]),
      });
      notify("Investor metadata fetched.", "success");
    } catch (error: unknown) {
      setMetadata(null);
      const msg = toErrorMessage(error);
      console.error(msg);
      notify(msg, "error");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-bg-gradient" aria-hidden />
      <div className="dashboard-grid-bg" aria-hidden />

      <header className="dashboard-header">
        <div className="dashboard-shell dashboard-header-inner">
          <Link to="/" className="dashboard-logo">
            <span className="dashboard-logo-mark" aria-hidden />
            <span className="dashboard-logo-text">
              <span className="dashboard-logo-name">Confidential Vault</span>
              <span className="dashboard-logo-tag">Operations console</span>
            </span>
          </Link>
          <nav className="dashboard-header-actions" aria-label="Console">
            <a
              className="dashboard-link-ghost"
              href="https://docs.zama.ai/protocol/solidity-guides/getting-started/overview"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
            <div className="dashboard-rk-connect">
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>
            <div className="nav-actions">
              <span className="pill">Sepolia</span>
              <span className={`pill ${isConnected ? "pill-success" : ""}`}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-shell">
          {toast && (
            <div
              className={`dashboard-toast ${toast.kind === "success" ? "dashboard-toast-success" : "dashboard-toast-error"}`}
              role="status"
              aria-live="polite"
            >
              {toast.message}
            </div>
          )}
          <header className="hero card-animate">
            <div className="hero-top">
              <p className="dashboard-page-label">Live operations</p>
            </div>
            <div className="dashboard-activity-block">
              {!hasValidVaultAddress && (
                <p className="hint">Set a valid <code className="inline-code">VITE_VAULT_ADDRESS</code> to enable writes.</p>
              )}
              {isWrongNetwork && <p className="hint">Switch wallet network to Sepolia for contract operations.</p>}
              {lastTxHash && (
                <div className="tx-pill">
                  <code title={lastTxHash}>{shortHash(lastTxHash)}</code>
                  <button type="button" className="btn-tiny" onClick={() => copyText(lastTxHash, "tx")}>
                    {copied === "tx" ? "Copied" : "Copy"}
                  </button>
                  <a
                    className="btn-tiny-link"
                    href={`${SEPOLIA_EXP}/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Etherscan
                  </a>
                </div>
              )}
            </div>
            <h1 className="dashboard-hero-title">
              Confidential RWA vault — <span className="dashboard-title-accent">operational console</span>
            </h1>
            <p className="dashboard-hero-lede">
              Manage encrypted balances with compliance-aware controls and role-based permissions. Track every successful
              write directly from the transaction strip and open it on Etherscan for audit visibility.
            </p>
          </header>

          <section className="kpi-grid card-animate delay-1">
            <article className="kpi kpi-vault">
              <p className="kpi-label">Vault contract</p>
              <code className="kpi-contract-address">{contractAddress || "Set VITE_VAULT_ADDRESS in .env"}</code>
              {hasValidVaultAddress && (
                <div className="kpi-actions">
                  <button type="button" className="btn-tiny" onClick={() => copyText(contractAddress, "vault")}>
                    {copied === "vault" ? "Copied" : "Copy address"}
                  </button>
                  {vaultExplorerUrl && (
                    <a className="btn-tiny-link" href={vaultExplorerUrl} target="_blank" rel="noopener noreferrer">
                      Contract
                    </a>
                  )}
                </div>
              )}
            </article>
          </section>

          <section className="workspace">
            <article className="card card-animate delay-2 workspace-card">
              <div className="workspace-card-grid">
                <div className="workspace-card-stack">
                  <article className="card card-featured workspace-nested-card">
                <h2>Compliance actions</h2>
                <p className="card-lede">On-chain writes for your video proof — each success surfaces an Etherscan link above.</p>
                <div className="field-grid">
                  <div>
                    <label htmlFor="min-kyc">Minimum KYC tier</label>
                    <input id="min-kyc" value={policyMinTier} onChange={(e) => setPolicyMinTier(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="max-risk">Maximum risk class</label>
                    <input id="max-risk" value={policyMaxRisk} onChange={(e) => setPolicyMaxRisk(e.target.value)} />
                  </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={updatePolicy} disabled={busyAction !== null}>
                  {busyAction === "updatePolicy" ? "Processing..." : "Update policy"}
                </button>

                <div className="divider" />

                <label htmlFor="inv-addr">Investor address</label>
                <input id="inv-addr" value={investorAddress} onChange={(e) => setInvestorAddress(e.target.value)} />
                <div className="field-grid">
                  <div>
                    <label htmlFor="inv-tier">Investor KYC tier</label>
                    <input id="inv-tier" value={investorTier} onChange={(e) => setInvestorTier(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="inv-risk">Investor risk class</label>
                    <input id="inv-risk" value={investorRisk} onChange={(e) => setInvestorRisk(e.target.value)} />
                  </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={registerInvestor} disabled={busyAction !== null}>
                  {busyAction === "registerInvestor" ? "Processing..." : "Register investor"}
                </button>
                  </article>

                  <article className="card workspace-nested-card">
                <h2>Investor metadata</h2>
                <label htmlFor="lookup-addr">Address</label>
                <input id="lookup-addr" value={lookupAddress} onChange={(e) => setLookupAddress(e.target.value)} />
                <button type="button" className="btn btn-secondary" onClick={fetchMetadata} disabled={busyAction !== null}>
                  {busyAction === "fetchMetadata" ? "Processing..." : "Fetch metadata"}
                </button>
                {metadata && (
                  <dl className="metadata-dl">
                    <div>
                      <dt>Registered</dt>
                      <dd>{metadata.isRegistered ? "Yes" : "No"}</dd>
                    </div>
                    <div>
                      <dt>KYC tier</dt>
                      <dd>{metadata.kycTier}</dd>
                    </div>
                    <div>
                      <dt>Risk class</dt>
                      <dd>{metadata.riskClass}</dd>
                    </div>
                  </dl>
                )}
                <p className="hint">
                  Confidential deposits still need client-side encryption + proofs; call that out in your pitch as the next
                  layer on this foundation.
                </p>
                  </article>
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
