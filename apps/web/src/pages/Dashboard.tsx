import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { getBrowserProvider, getReadContract, getVaultAddress, getWriteContract } from "../lib/contract";

type InvestorMetadata = {
  isRegistered: boolean;
  kycTier: number;
  riskClass: number;
};

function Dashboard() {
  const [wallet, setWallet] = useState<string>("");
  const [status, setStatus] = useState<string>("Idle");
  const [policyMinTier, setPolicyMinTier] = useState<string>("1");
  const [policyMaxRisk, setPolicyMaxRisk] = useState<string>("5");
  const [investorAddress, setInvestorAddress] = useState<string>("");
  const [investorTier, setInvestorTier] = useState<string>("2");
  const [investorRisk, setInvestorRisk] = useState<string>("3");
  const [lookupAddress, setLookupAddress] = useState<string>("");
  const [metadata, setMetadata] = useState<InvestorMetadata | null>(null);

  const contractAddress = useMemo(() => getVaultAddress(), []);

  const connectWallet = async () => {
    try {
      setStatus("Connecting wallet...");
      const provider = await getBrowserProvider();
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setWallet(await signer.getAddress());
      setStatus("Wallet connected.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const updatePolicy = async () => {
    try {
      setStatus("Submitting updatePolicy transaction...");
      const contract = await getWriteContract();
      const tx = await contract.updatePolicy(Number(policyMinTier), Number(policyMaxRisk));
      await tx.wait();
      setStatus(`Policy updated. Tx: ${tx.hash}`);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const registerInvestor = async () => {
    try {
      setStatus("Submitting registerInvestor transaction...");
      const contract = await getWriteContract();
      const tx = await contract.registerInvestor(investorAddress, Number(investorTier), Number(investorRisk));
      await tx.wait();
      setStatus(`Investor registered. Tx: ${tx.hash}`);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const fetchMetadata = async () => {
    try {
      setStatus("Reading investor metadata...");
      const contract = await getReadContract();
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
            <div className="nav-actions">
              <span className="pill">Sepolia</span>
              <span className={`pill ${wallet ? "pill-success" : ""}`}>{wallet ? "Connected" : "Disconnected"}</span>
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
              <p className="kpi-value">{wallet || "Not connected"}</p>
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
              <h3 className="subhead">Connect wallet</h3>
              <p className="hint">Use a funded Sepolia account to submit transactions.</p>
              <button type="button" className="btn btn-primary" onClick={connectWallet}>
                Connect wallet
              </button>
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
