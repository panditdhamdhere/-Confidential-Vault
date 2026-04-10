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

const SEPOLIA_EXP = "https://sepolia.etherscan.io";

type InvestorMetadata = {
  isRegistered: boolean;
  kycTier: number;
  riskClass: number;
};

function Dashboard() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [activityLabel, setActivityLabel] = useState<string>("Ready");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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

  const shortHash = (h: string) => (h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setActivityLabel("Could not copy to clipboard.");
    }
  };

  const vaultExplorerUrl =
    contractAddress && contractAddress.startsWith("0x") && contractAddress.length > 20
      ? `${SEPOLIA_EXP}/address/${contractAddress}`
      : null;

  const updatePolicy = async () => {
    try {
      if (!walletClient) {
        setActivityLabel("Connect a wallet (header).");
        return;
      }
      setActivityLabel("Submitting transaction…");
      const signer = await walletClientToSigner(walletClient);
      const contract = createVaultWriteContract(signer);
      const tx = await contract.updatePolicy(Number(policyMinTier), Number(policyMaxRisk));
      await tx.wait();
      setActivityLabel("Policy updated on-chain.");
      setLastTxHash(tx.hash);
    } catch (error) {
      setActivityLabel((error as Error).message);
    }
  };

  const registerInvestor = async () => {
    try {
      if (!walletClient) {
        setActivityLabel("Connect a wallet (header).");
        return;
      }
      setActivityLabel("Submitting transaction…");
      const signer = await walletClientToSigner(walletClient);
      const contract = createVaultWriteContract(signer);
      const tx = await contract.registerInvestor(investorAddress, Number(investorTier), Number(investorRisk));
      await tx.wait();
      setActivityLabel("Investor registered on-chain.");
      setLastTxHash(tx.hash);
    } catch (error) {
      setActivityLabel((error as Error).message);
    }
  };

  const fetchMetadata = async () => {
    try {
      if (!publicClient) {
        setActivityLabel("Network client not ready.");
        return;
      }
      setActivityLabel("Reading on-chain metadata…");
      const provider = publicClientToProvider(publicClient);
      const contract = createVaultReadContract(provider);
      const result = await contract.getInvestorMetadata(lookupAddress);
      setMetadata({
        isRegistered: result[0],
        kycTier: Number(result[1]),
        riskClass: Number(result[2]),
      });
      setActivityLabel("Metadata loaded (public fields).");
    } catch (error) {
      setMetadata(null);
      setActivityLabel((error as Error).message);
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
            </div>
            <div className="dashboard-activity-block">
              <p className="status-chip status-chip-static">{activityLabel}</p>
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
            <ul className="dashboard-hero-badges" aria-label="Product signals">
              <li>FHEVM</li>
              <li>Encrypted balances</li>
              <li>Compliance gates</li>
              <li>Sepolia-ready</li>
            </ul>
            <p className="dashboard-hero-lede">
              Encrypted balances, compliance gates, and role-aware permissions. Judges can follow the demo path below,
              then verify any successful write on Etherscan from the transaction strip.
            </p>
          </header>

          <section className="demo-rail card-animate delay-1" aria-label="Suggested demo order">
            <div className="demo-rail-head">
              <span className="demo-rail-kicker">Submission demo</span>
              <h2 className="demo-rail-title">90-second storyboard</h2>
            </div>
            <ol className="demo-rail-steps">
              <li>
                <span className="demo-rail-num">1</span>
                <div>
                  <strong>Connect</strong>
                  <span>Pick Sepolia in RainbowKit; fund with test ETH.</span>
                </div>
              </li>
              <li>
                <span className="demo-rail-num">2</span>
                <div>
                  <strong>Policy</strong>
                  <span>Update min KYC / max risk — watch Etherscan link appear.</span>
                </div>
              </li>
              <li>
                <span className="demo-rail-num">3</span>
                <div>
                  <strong>Onboard</strong>
                  <span>Register an investor wallet you control.</span>
                </div>
              </li>
              <li>
                <span className="demo-rail-num">4</span>
                <div>
                  <strong>Prove read path</strong>
                  <span>Fetch public metadata; mention FHE client for deposits next.</span>
                </div>
              </li>
            </ol>
          </section>

          <section className="kpi-grid card-animate delay-1">
            <article className="kpi">
              <p className="kpi-label">Vault contract</p>
              <code>{contractAddress || "Set VITE_VAULT_ADDRESS in .env"}</code>
              {!!contractAddress && contractAddress.startsWith("0x") && (
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
            <article className="kpi">
              <p className="kpi-label">Active wallet</p>
              <p className="kpi-value">{address ? shortAddress(address) : "Not connected"}</p>
            </article>
            <article className="kpi">
              <p className="kpi-label">Console state</p>
              <p className="kpi-value kpi-value-muted">{activityLabel}</p>
            </article>
          </section>

          <section className="workspace">
            <article className="card card-animate delay-2">
              <h2>What this proves</h2>
              <ul className="check-list">
                <li>Institutional narrative: RWA + compliance without exposing sensitive balances on a public ledger.</li>
                <li>
                  Technical depth: FHE types, policy checks, and <code className="inline-code">FHE.allow</code> patterns
                  in the contract.
                </li>
                <li>Ship-quality UI: wallet UX, explorer links, and a repeatable judge flow.</li>
              </ul>

              <div className="divider" />
              <h3 className="subhead">Wallet</h3>
              <p className="hint">
                Use the RainbowKit control in the header (WalletConnect works when{" "}
                <code className="inline-code">VITE_WALLETCONNECT_PROJECT_ID</code> is set).
              </p>
            </article>

            <div className="stack">
              <article className="card card-featured card-animate delay-2">
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
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
