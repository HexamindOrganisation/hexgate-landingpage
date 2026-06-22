import type { Metadata } from "next";
import Link from "next/link";
import { CopyInstall } from "../../../components/CopyInstall";

export const metadata: Metadata = {
  title:
    "Hexgate vs Microsoft Agent Governance Toolkit (AGT): Which Authorization Layer for AI Agents?",
  description:
    "Honest comparison: Microsoft's Agent Governance Toolkit (AGT) is a policy decision engine keyed on agent identity. Hexgate is a per-user authorization SDK with Biscuit-token attenuation. When each one fits, where they overlap, and how to combine them.",
  alternates: {
    canonical: "https://hexgate.ai/vs/microsoft-agent-governance-toolkit",
  },
  openGraph: {
    type: "article",
    url: "https://hexgate.ai/vs/microsoft-agent-governance-toolkit",
    siteName: "Hexgate",
    title:
      "Hexgate vs Microsoft Agent Governance Toolkit: Per-User Authorization vs Agent-Level Policy",
    description:
      "AGT gates the agent. Hexgate gates the user, through the agent. A field guide to picking the right authorization layer for AI agents in 2026.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hexgate vs Microsoft Agent Governance Toolkit",
    description: "AGT gates the agent. Hexgate gates the user, through the agent.",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline:
    "Hexgate vs Microsoft Agent Governance Toolkit (AGT): Per-User Authorization vs Agent-Level Policy",
  description:
    "A technical comparison of Microsoft's Agent Governance Toolkit and Hexgate, the per-user authorization SDK for AI agents.",
  about: [
    { "@type": "Thing", name: "AI agent authorization" },
    { "@type": "Thing", name: "Microsoft Agent Governance Toolkit" },
    { "@type": "Thing", name: "Per-user agent permissions" },
  ],
  mainEntityOfPage: "https://hexgate.ai/vs/microsoft-agent-governance-toolkit",
  publisher: {
    "@type": "Organization",
    name: "Hexamind",
    url: "https://hexamind.ai/",
  },
};

const ROWS: { dimension: string; agt: string; hexgate: string; advantage: "agt" | "hexgate" | "tie" }[] = [
  {
    dimension: "Identity model",
    agt: "Agent identity (SPIFFE / DID / mTLS)",
    hexgate: "Agent identity + per-request user (signed Biscuit token)",
    advantage: "hexgate",
  },
  {
    dimension: "Policy subjects",
    agt: "agent_id, tool, action.type",
    hexgate: "role, user_id, tool, args constraints",
    advantage: "hexgate",
  },
  {
    dimension: "Same code, many users",
    agt: "Container-per-agent",
    hexgate: "Contextvar lookup; one wrapped agent serves every user concurrently",
    advantage: "hexgate",
  },
  {
    dimension: "Capability attenuation",
    agt: "Not supported. Policies are pre-declared, evaluated server-side",
    hexgate: "Biscuit caveats narrow rights at request time",
    advantage: "hexgate",
  },
  {
    dimension: "Enforcement point",
    agt: "Application middleware (tool-call wrapper)",
    hexgate: "Application middleware (tool-call wrapper)",
    advantage: "tie",
  },
  {
    dimension: "Policy engine",
    agt: "YAML / OPA / Cedar, same-process",
    hexgate: "OPA Rego compiled to signed WASM (Ed25519) + in-process pydantic engine",
    advantage: "tie",
  },
  {
    dimension: "OWASP Agentic Top 10",
    agt: "10 / 10 risks addressed (broad framework)",
    hexgate: "Opinionated subset: tool-call authorization, audit, approval flows",
    advantage: "agt",
  },
  {
    dimension: "Integration footprint",
    agt: "Framework-agnostic policy engine; you wire the tool wrappers",
    hexgate: "Drop-in adapters: OpenAI Agents, LangChain, Google ADK, Pydantic AI",
    advantage: "hexgate",
  },
  {
    dimension: "Approval workflow",
    agt: "approvers list in policy",
    hexgate: "approval_handler callback (sync/async, per-call)",
    advantage: "tie",
  },
  {
    dimension: "License & install",
    agt: "MIT, GitHub + PyPI",
    hexgate: "MIT, pip install hexgate",
    advantage: "tie",
  },
];

function Verdict({ value }: { value: "agt" | "hexgate" | "tie" }) {
  if (value === "tie") return <span className="vs-tag vs-tag-tie">Even</span>;
  if (value === "agt") return <span className="vs-tag vs-tag-agt">AGT</span>;
  return <span className="vs-tag vs-tag-hex">Hexgate</span>;
}

export default function ComparisonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav className="site-nav scrolled" id="nav">
        <div className="nav-inner">
          <Link className="brand" href="/" aria-label="Hexgate home">
            <svg className="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z"
                stroke="#3b82f6"
                strokeWidth="1.6"
                fill="rgba(59,130,246,0.08)"
              />
              <path
                d="M16 9.5 21.5 12.7v6.6L16 22.5 10.5 19.3v-6.6L16 9.5Z"
                stroke="#60a5fa"
                strokeWidth="1.4"
                fill="none"
              />
              <circle cx="16" cy="16" r="2.1" fill="#60a5fa" />
            </svg>
            <span className="brand-name">
              Hex<b>gate</b>
            </span>
          </Link>
          <div className="nav-links">
            <Link href="/#frameworks">Frameworks</Link>
            <Link href="/#features">Capabilities</Link>
            <Link href="/#faq">FAQ</Link>
            <a href="https://docs.hexgate.ai" target="_blank" rel="noopener">
              Docs
            </a>
          </div>
          <div className="nav-cta">
            <a
              className="btn btn-ghost"
              href="https://github.com/HexamindOrganisation/hexgate"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <Link className="btn btn-primary" href="/#book">
              Book a demo
            </Link>
          </div>
        </div>
      </nav>

      <header className="hero" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <div className="glow" />
        <div className="grid-bg" />
        <div className="wrap" style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
          <span className="pill">
            <span className="dot" /> Comparison · updated June 2026
          </span>
          <h1>
            Hexgate vs Microsoft Agent Governance&nbsp;Toolkit.
            <br />
            <span className="accent">Per-user authorization, or agent-level policy?</span>
          </h1>
          <p className="lede" style={{ maxWidth: 720 }}>
            Microsoft&apos;s <b>Agent Governance Toolkit</b> (AGT, April 2026) and Hexgate both sit
            between an AI agent and its tools. They look similar from the outside (policy YAML,
            tool-call interception, audit logs), but they answer different questions. AGT controls{" "}
            <b>what the agent is allowed to do</b>. Hexgate controls{" "}
            <b>what each end-user is allowed to do, through the agent</b>.
          </p>
        </div>
      </header>

      <section className="block" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="vs-tldr">
            <div className="vs-tldr-row">
              <span className="eyebrow">TL;DR</span>
            </div>
            <ul className="vs-tldr-list">
              <li>
                <b>Pick AGT</b>{" "}when you need broad governance coverage across the OWASP Agentic
                Top 10, run on the Microsoft stack, or operate a fleet of internal agents that each
                have their own identity.
              </li>
              <li>
                <b>Pick Hexgate</b>{" "}when one agent serves many end-users (B2B SaaS, support
                copilots, billing assistants) and decisions must depend on which user invoked it,
                not just which agent is running.
              </li>
              <li>
                <b>Use both</b>{" "}when you want AGT&apos;s wider governance surface plus
                Hexgate&apos;s per-user enforcement: AGT as the org-wide control plane, Hexgate as
                the per-request authorization gate.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Feature by feature</span>
            <h2>Where they overlap, where they diverge.</h2>
            <p>
              Ten dimensions that matter when you&apos;re picking an authorization layer for AI
              agents in production. &quot;Even&quot; means both ship a credible answer; the label
              names which one we&apos;d give the edge to.
            </p>
          </div>
          <div className="vs-table-wrap">
            <table className="vs-table">
              <thead>
                <tr>
                  <th scope="col">Dimension</th>
                  <th scope="col">Microsoft AGT</th>
                  <th scope="col">Hexgate</th>
                  <th scope="col" className="vs-th-edge">
                    Edge
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.dimension}>
                    <th scope="row">{r.dimension}</th>
                    <td>{r.agt}</td>
                    <td>{r.hexgate}</td>
                    <td>
                      <Verdict value={r.advantage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">The wedge</span>
            <h2>Per-user authorization is where the toolkits diverge.</h2>
            <p>
              Both products gate tool calls. The difference is what the gate <em>knows</em> about who
              is calling.
            </p>
          </div>

          <div className="features">
            <article className="feat">
              <h3>Microsoft AGT: agent as the principal</h3>
              <p>
                AGT&apos;s policy schema keys decisions on <code>agent_id</code>, <code>tool</code>,
                and <code>action.type</code>. The README is explicit:{" "}
                <em>
                  &quot;AGT enforces governance at the application middleware layer, not at the OS
                  kernel level. The policy engine and agents share the same process boundary.&quot;
                </em>{" "}
                There is no <code>user_id</code> in the schema, no on-behalf-of (OBO) flow, and no
                capability attenuation. End-user identity, if you need it, has to be layered on
                outside, typically via Microsoft Entra and OAuth OBO (<code>sub</code> +{" "}
                <code>act.sub</code> claims).
              </p>
            </article>

            <article className="feat">
              <h3>Hexgate: the user travels with the call</h3>
              <p>
                Hexgate threads end-user identity through every decision. A per-request{" "}
                <code>User</code> context manager carries <code>user_id</code>, <code>role</code>,
                and <code>session_id</code> as a signed Biscuit token; role policies decide what
                that role can do. Identity is resolved at call time from a contextvar, so the same
                wrapped agent serves many users concurrently, with different effective permissions,
                without seeing each other&apos;s policies. Biscuit&apos;s caveat system lets you
                narrow rights at request time, the way macaroons do.
              </p>
            </article>

            <article className="feat">
              <h3>Why this matters in production</h3>
              <p>
                Most real agentic products aren&apos;t fleets of distinct agents. They&apos;re one
                agent serving thousands of customers, each with their own role, plan, and data scope.
                If your authorization layer only knows <em>which agent is running</em>, every tool
                wrapper has to re-implement &quot;which customer is this, what can they touch,&quot;
                and that&apos;s where bugs live. Hexgate moves that question into policy.
              </p>
            </article>

            <article className="feat">
              <h3>Where AGT pulls ahead</h3>
              <p>
                AGT is the first open-source toolkit advertising coverage of all 10 OWASP Agentic
                Top 10 risks, with a broader surface: MCP security gateway, agent hypervisor, trust
                scoring across delegation chains, EU AI Act / HIPAA / SOC 2 mapping. If your audit
                team wants a single artifact that maps to a compliance framework, AGT has more
                ground covered out of the box.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Combining them</span>
            <h2>You don&apos;t have to pick one.</h2>
            <p>
              They live at different points in the stack. AGT can be your org-wide policy decision
              engine and compliance map; Hexgate can sit inside it as the per-request authorization
              gate. The combination looks like this:
            </p>
          </div>
          <div className="features">
            <article className="feat">
              <h3>AGT as the outer ring</h3>
              <p>
                Use AGT for organization-wide policy posture: block dangerous tool classes globally,
                enforce MCP gateway checks, run the trust / delegation chain audits, and feed your
                compliance dashboards.
              </p>
            </article>
            <article className="feat">
              <h3>Hexgate as the per-user gate</h3>
              <p>
                Inside the agent, Hexgate handles the per-request user identity, runs the
                role-keyed policy against signed Biscuit tokens, and emits the decision stream your
                application needs to know which customer was allowed to do what.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="final" id="book">
        <div className="glow" />
        <div className="wrap">
          <div className="final-card">
            <span className="eyebrow">Get started</span>
            <h2 style={{ marginTop: 16 }}>
              Try per-user authorization in&nbsp;minutes.
              <br />
              <span style={{ color: "var(--tx-1)", fontWeight: 500 }}>
                Same agent code, different effective permissions per user.
              </span>
            </h2>
            <p>
              Install the SDK and wrap your existing OpenAI Agents, LangChain, Google ADK, or
              Pydantic AI agent in one line. Or book a walkthrough of the platform, audit log, and
              signed-bundle workflow.
            </p>
            <div className="final-cta">
              <CopyInstall id="copyBtnVs" />
              <a
                className="btn btn-primary"
                href="mailto:hello@hexamind.ai?subject=Hexgate%20demo%20request"
              >
                Book a demo
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-inner">
            <Link className="brand" href="/">
              <svg className="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                  d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z"
                  stroke="#3b82f6"
                  strokeWidth="1.6"
                  fill="rgba(59,130,246,0.08)"
                />
                <path
                  d="M16 9.5 21.5 12.7v6.6L16 22.5 10.5 19.3v-6.6L16 9.5Z"
                  stroke="#60a5fa"
                  strokeWidth="1.4"
                  fill="none"
                />
                <circle cx="16" cy="16" r="2.1" fill="#60a5fa" />
              </svg>
              <span className="brand-name">
                Hex<b>gate</b>
              </span>
            </Link>
            <div className="foot-links">
              <Link href="/">Home</Link>
              <a href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
                GitHub
              </a>
              <a href="https://pypi.org/project/hexgate/" target="_blank" rel="noopener">
                PyPI
              </a>
              <Link href="/#features">Capabilities</Link>
              <Link href="/#faq">FAQ</Link>
            </div>
            <span className="foot-meta">
              ©&nbsp;2026{" "}
              <a href="https://hexamind.ai" target="_blank" rel="noopener">
                Hexamind
              </a>{" "}
              · MIT
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
