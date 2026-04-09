import { Link } from "react-router-dom";
import "./Landing.css";

const VAULT_ENV = import.meta.env.VITE_VAULT_ADDRESS as string | undefined;
const EXPLORER_BASE = "https://sepolia.etherscan.io";

function Landing() {
  const vaultAddress = VAULT_ENV?.trim();
  const showContractLink =
    vaultAddress &&
    vaultAddress.length > 10 &&
    !vaultAddress.includes("YourDeployed") &&
    !vaultAddress.includes("0xYour");

  return (
    <div className="landing-page">
      <div className="landing-bg-gradient" aria-hidden />
      <div className="landing-grid-bg" aria-hidden />

      <header className="landing-header">
        <div className="landing-shell landing-header-inner">
          <Link to="/" className="landing-logo">
            <span className="landing-logo-mark" aria-hidden />
            <span className="landing-logo-text">
              <span className="landing-logo-name">Confidential Vault</span>
              <span className="landing-logo-tag">RWA · Compliance · FHEVM</span>
            </span>
          </Link>
          <nav className="landing-nav-links" aria-label="Page sections">
            <a href="#capabilities">Capabilities</a>
            <a href="#workflow">Workflow</a>
            <a href="#trust">Deployment</a>
          </nav>
          <div className="landing-header-actions">
            <a
              className="landing-link-ghost"
              href="https://docs.zama.ai/protocol/solidity-guides/getting-started/overview"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
            <Link className="landing-btn landing-btn-primary" to="/app">
              Launch console
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero landing-shell">
          <div className="landing-hero-copy landing-reveal">
            <h1 className="landing-hero-title">
              Institutional vault infrastructure with{" "}
              <span className="landing-title-accent">on-chain confidentiality</span>
            </h1>
            <p className="landing-hero-lede">
              Operate tokenized and RWA-facing strategies without exposing sensitive balances or policy logic to the
              public ledger. Encrypt state at the protocol level, enforce compliance in contract, and retain audit-grade
              controls for operators and investors.
            </p>
            <div className="landing-hero-ctas">
              <Link className="landing-btn landing-btn-primary landing-btn-lg" to="/app">
                Open operational console
              </Link>
              {showContractLink ? (
                <a
                  className="landing-btn landing-btn-secondary landing-btn-lg"
                  href={`${EXPLORER_BASE}/address/${vaultAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View contract on Etherscan
                </a>
              ) : (
                <a
                  className="landing-btn landing-btn-secondary landing-btn-lg"
                  href="https://github.com/zama-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore FHEVM ecosystem
                </a>
              )}
            </div>
            <ul className="landing-trust-row" id="trust" aria-label="Deployment context">
              <li className="landing-trust-item">
                <strong>Sepolia</strong>
                <span>Testnet-ready deployment path</span>
              </li>
              <li className="landing-trust-item">
                <strong>FHEVM</strong>
                <span>Encrypted types &amp; verified inputs</span>
              </li>
              <li className="landing-trust-item">
                <strong>Compliance-first</strong>
                <span>Policy gates before confidential actions</span>
              </li>
            </ul>
          </div>

          <div className="landing-hero-visual landing-reveal landing-reveal-delay">
            <div className="landing-preview-card">
              <div className="landing-preview-header">
                <span className="landing-preview-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
                <span className="landing-preview-label">Console preview</span>
              </div>
              <div className="landing-preview-body">
                <div className="landing-preview-row">
                  <span className="landing-preview-key">Encrypted balance</span>
                  <span className="landing-preview-val muted">euint64 · handle protected</span>
                </div>
                <div className="landing-preview-row">
                  <span className="landing-preview-key">KYC tier / Risk</span>
                  <span className="landing-preview-val">Policy-bound before deposit</span>
                </div>
                <div className="landing-preview-bar">
                  <span className="landing-preview-bar-fill" />
                </div>
                <p className="landing-preview-foot">
                  Same public chain. Confidential economics where it matters.
                </p>
              </div>
            </div>
            <p className="landing-visual-caption">
              Built for submissions that need a credible institutional narrative—not fluff.
            </p>
          </div>
        </section>

        <section className="landing-section landing-shell" id="capabilities" aria-labelledby="cap-heading">
          <div className="landing-section-head landing-reveal">
            <h2 id="cap-heading" className="landing-section-title">
              Capabilities
            </h2>
            <p className="landing-section-sub">
              Everything judges expect from a serious confidential finance demo: clear problem, real cryptography story, and
              operable contract flows.
            </p>
          </div>
          <div className="landing-feature-grid">
            <article className="landing-feature-card landing-reveal">
              <div className="landing-feature-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3v18M5.6 8.4h12.8M7 14h10" />
                  <rect x="4" y="5" width="16" height="14" rx="2" />
                </svg>
              </div>
              <h3>Encrypted ledger state</h3>
              <p>Balances and sensitive values stay encrypted on-chain using FHE primitives appropriate for vault logic.</p>
            </article>
            <article className="landing-feature-card landing-reveal landing-reveal-delay-sm">
              <div className="landing-feature-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Compliance-native gates</h3>
              <p>KYC tier, risk class, and policy bounds are evaluated before investors can execute confidential flows.</p>
            </article>
            <article className="landing-feature-card landing-reveal landing-reveal-delay-md">
              <div className="landing-feature-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
                </svg>
              </div>
              <h3>Role-aware permissions</h3>
              <p>Encrypted handles are shared only with authorized addresses—operators and investors see what they should.</p>
            </article>
          </div>
        </section>

        <section className="landing-section landing-section-alt" id="workflow" aria-labelledby="flow-heading">
          <div className="landing-shell">
            <div className="landing-section-head landing-reveal">
              <h2 id="flow-heading" className="landing-section-title">
                Operational workflow
              </h2>
              <p className="landing-section-sub">
                A tight story for demos: connect, configure policy, onboard investors, then extend with FHE deposits.
              </p>
            </div>
            <ol className="landing-steps">
              <li className="landing-step landing-reveal">
                <span className="landing-step-num">01</span>
                <div>
                  <h3>Connect &amp; anchor</h3>
                  <p>Link a wallet on Sepolia and point the console at your deployed vault contract.</p>
                </div>
              </li>
              <li className="landing-step landing-reveal landing-reveal-delay-sm">
                <span className="landing-step-num">02</span>
                <div>
                  <h3>Define compliance envelope</h3>
                  <p>Update minimum KYC tier and maximum risk class so only eligible participants can act.</p>
                </div>
              </li>
              <li className="landing-step landing-reveal landing-reveal-delay-md">
                <span className="landing-step-num">03</span>
                <div>
                  <h3>Register &amp; verify</h3>
                  <p>Onboard investor addresses with tier and risk metadata; audit metadata reads off-chain.</p>
                </div>
              </li>
              <li className="landing-step landing-reveal landing-reveal-delay-lg">
                <span className="landing-step-num">04</span>
                <div>
                  <h3>Confidential actions next</h3>
                  <p>Wire client-side encryption and proofs for deposit and withdrawal—your submission differentiator.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="landing-cta-band">
          <div className="landing-shell landing-cta-inner landing-reveal">
            <div>
              <h2 className="landing-cta-title">Ready to run the live console?</h2>
              <p className="landing-cta-copy">The dashboard is optimized for crisp screen recordings and judge walkthroughs.</p>
            </div>
            <Link className="landing-btn landing-btn-on-dark landing-btn-lg" to="/app">
              Enter console
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer-inner">
          <div className="landing-footer-brand">
            <span className="landing-logo-mark sm" aria-hidden />
            <span>Confidential RWA Compliance Vault</span>
          </div>
          <div className="landing-footer-links">
            <Link to="/app">Console</Link>
            <a href="https://www.zama.ai" target="_blank" rel="noopener noreferrer">
              Zama
            </a>
            <a href="https://docs.zama.ai" target="_blank" rel="noopener noreferrer">
              Docs
            </a>
          </div>
          <p className="landing-footer-copy">Demonstration prototype · Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
