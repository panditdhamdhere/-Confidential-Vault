import { useMemo, useState } from "react";
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
    <main className="container">
      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />

      <nav className="top-nav card-animate">
        <div className="brand-wrap">
          <div className="brand-mark">
            <span className="brand-dot" />
          </div>
          <div>
            <p className="brand-title">Confidential Vault Console</p>
            <p className="brand-subtitle">Institution-grade onchain compliance workspace</p>
          </div>
        </div>
        <div className="nav-actions">
          <span className="pill">Sepolia</span>
          <span className={`pill ${wallet ? "pill-success" : ""}`}>{wallet ? "Connected" : "Disconnected"}</span>
        </div>
      </nav>

      <header className="hero card-animate delay-1">
        <div className="hero-top">
          <p className="badge">Season 2 Builder Submission</p>
          <p className="status-chip">{status}</p>
        </div>
        <h1 className="hero-title">Confidential RWA Compliance Vault</h1>
        <p>
          Institutional-style vault logic with encrypted balances, policy-gated participation, and FHEVM-native
          confidentiality primitives.
        </p>
      </header>

      <section className="kpi-grid card-animate delay-2">
        <article className="kpi card-animate">
          <p className="kpi-label">Vault Address</p>
          <code>{contractAddress || "VITE_VAULT_ADDRESS not set"}</code>
        </article>
        <article className="kpi card-animate delay-1">
          <p className="kpi-label">Wallet</p>
          <p className="kpi-value">{wallet || "Not connected"}</p>
        </article>
        <article className="kpi card-animate delay-2">
          <p className="kpi-label">Status</p>
          <p className="kpi-value">{status}</p>
        </article>
      </section>

      <section className="workspace">
        <article className="card card-animate delay-3">
          <h2>What this dApp demonstrates</h2>
          <ul className="check-list">
            <li>Encrypted investor balances using `euint64` values.</li>
            <li>KYC tier and risk-policy checks before confidential actions.</li>
            <li>Role-aware encrypted state permissions for investor and compliance officer.</li>
            <li>Production deployment path for Sepolia and Ethereum-ready architecture.</li>
          </ul>

          <div className="divider" />
          <h3 className="subhead">Wallet and Network</h3>
          <p className="hint">Set `VITE_VAULT_ADDRESS` in `apps/web/.env` to your deployed Sepolia vault.</p>
          <button className="btn btn-primary" onClick={connectWallet}>
            Connect Wallet
          </button>
        </article>

        <div className="stack">
          <article className="card card-animate delay-3">
            <h2>Compliance Actions</h2>
            <div className="field-grid">
              <div>
                <label>Minimum KYC tier</label>
                <input value={policyMinTier} onChange={(e) => setPolicyMinTier(e.target.value)} />
              </div>
              <div>
                <label>Maximum risk class</label>
                <input value={policyMaxRisk} onChange={(e) => setPolicyMaxRisk(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={updatePolicy}>
              Update Policy
            </button>

            <div className="divider" />

            <label>Investor address</label>
            <input value={investorAddress} onChange={(e) => setInvestorAddress(e.target.value)} />
            <div className="field-grid">
              <div>
                <label>Investor KYC tier</label>
                <input value={investorTier} onChange={(e) => setInvestorTier(e.target.value)} />
              </div>
              <div>
                <label>Investor risk class</label>
                <input value={investorRisk} onChange={(e) => setInvestorRisk(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={registerInvestor}>
              Register Investor
            </button>
          </article>

          <article className="card card-animate delay-3">
            <h2>Investor Metadata Lookup</h2>
            <label>Address</label>
            <input value={lookupAddress} onChange={(e) => setLookupAddress(e.target.value)} />
            <button className="btn btn-secondary" onClick={fetchMetadata}>
              Fetch Metadata
            </button>
            {metadata && <pre>{JSON.stringify(metadata, null, 2)}</pre>}
            <p className="hint">
              FHE deposit/withdraw calls require encrypted input handles and proofs from the FHE client SDK; this app
              is wired for admin and read flows now.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
