import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import "../App.css";
import {
  createVaultReadContract,
  createVaultWriteContract,
  getVaultAddress,
} from "../lib/contract";
import { publicClientToProvider, walletClientToSigner } from "../lib/ethersAdapter";

type InvestorMetadata = {
  isRegistered: boolean;
  kycTier: number;
  riskClass: number;
};

function Dashboard() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [status, setStatus] = useState<string>("Idle");
  const [policyMinTier, setPolicyMinTier] = useState<string>("1");
  const [policyMaxRisk, setPolicyMaxRisk] = useState<string>("5");
  const [investorAddress, setInvestorAddress] = useState<string>("");
  const [investorTier, setInvestorTier] = useState<string>("2");
  const [investorRisk, setInvestorRisk] = useState<string>("3");
  const [lookupAddress, setLookupAddress] = useState<string>("");
  const [metadata, setMetadata] = useState<InvestorMetadata | null>(null);

  const contractAddress = useMemo(() => getVaultAddress(), []);

  const shortAddress = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

  const updatePolicy = async () => {
    try {
      if (!walletClient) {
        setStatus("Connect a wallet first (use the button in the header).");
        return;
      }
      setStatus("Submitting updatePolicy transaction...");
      const signer = await walletClientToSigner(walletClient);
      const contract = createVaultWriteContract(signer);
      const tx = await contract.updatePolicy(Number(policyMinTier), Number(policyMaxRisk));
      await tx.wait();
      setStatus(`Policy updated. Tx: ${tx.hash}`);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const registerInvestor = async () => {
    try {
      if (!walletClient) {
        setStatus("Connect a wallet first (use the button in the header).");
        return;
      }
      setStatus("Submitting registerInvestor transaction...");
      const signer = await walletClientToSigner(walletClient);
      const contract = createVaultWriteContract(signer);
      const tx = await contract.registerInvestor(investorAddress, Number(investorTier), Number(investorRisk));
      await tx.wait();
      setStatus(`Investor registered. Tx: ${tx.hash}`);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const fetchMetadata = async () => {
    try {
      if (!publicClient) {
        setStatus("Network client not ready.");
        return;
      }
      setStatus("Reading investor metadata...");
      const provider = publicClientToProvider(publicClient);
      const contract = createVaultReadContract(provider);
      const result = await contract.getInvestorMetadata(lookupAddress);
      setMetadata({
        isRegistered: result[0],
        kycTier: Number(result[1]),
        riskClass: Number(result[2]),
      });
      setStatus("Metadata loaded.");
    } catch (error) {
      setMetadata(null);
      setStatus((error as Error).message);
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
          <header className="hero card-animate">
            <div className="hero-top">
              <p className="dashboard-page-label">Live operations</p>
              <p className="status-chip">{status}</p>
            </div>
            <h1 className="dashboard-hero-title">
              Confidential RWA vault — <span className="dashboard-title-accent">operational console</span>
            </h1>
            <p className="dashboard-hero-lede">
              Encrypted balances, compliance gates, and role-aware permissions. Configure policy, onboard investors, and
              extend with FHE client flows when you wire proofs.
            </p>
          </header>

          <section className="kpi-grid card-animate delay-1">
            <article className="kpi">
              <p className="kpi-label">Vault contract</p>
              <code>{contractAddress || "VITE_VAULT_ADDRESS not set"}</code>
            </article>
            <article className="kpi">
              <p className="kpi-label">Wallet</p>
              <p className="kpi-value">
                {address ? shortAddress(address) : "Not connected"}
              </p>
            </article>
            <article className="kpi">
              <p className="kpi-label">Last activity</p>
              <p className="kpi-value">{status}</p>
            </article>
          </section>

          <section className="workspace">
            <article className="card card-animate delay-2">
              <h2>Overview &amp; wallet</h2>
              <ul className="check-list">
                <li>Encrypted investor balances using `euint64` values.</li>
                <li>KYC tier and risk-policy checks before confidential actions.</li>
                <li>Role-aware encrypted state for investor and compliance officer.</li>
                <li>Deploy on Sepolia; point `VITE_VAULT_ADDRESS` at your vault.</li>
              </ul>

              <div className="divider" />
              <h3 className="subhead">Wallet connection</h3>
              <p className="hint">
                RainbowKit supports browser wallets and WalletConnect. Use the control in the header, or connect here:
              </p>
              <div className="dashboard-rk-inline">
                <ConnectButton showBalance={false} />
              </div>
            </article>

            <div className="stack">
              <article className="card card-animate delay-2">
                <h2>Compliance actions</h2>
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
                <button type="button" className="btn btn-primary" onClick={updatePolicy}>
                  Update policy
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
                <button type="button" className="btn btn-primary" onClick={registerInvestor}>
                  Register investor
                </button>
              </article>

              <article className="card card-animate delay-3">
                <h2>Investor metadata</h2>
                <label htmlFor="lookup-addr">Address</label>
                <input id="lookup-addr" value={lookupAddress} onChange={(e) => setLookupAddress(e.target.value)} />
                <button type="button" className="btn btn-secondary" onClick={fetchMetadata}>
                  Fetch metadata
                </button>
                {metadata && <pre>{JSON.stringify(metadata, null, 2)}</pre>}
                <p className="hint">
                  Deposit and withdraw require encrypted inputs and proofs from the FHE client SDK; this panel covers
                  admin and read paths.
                </p>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
