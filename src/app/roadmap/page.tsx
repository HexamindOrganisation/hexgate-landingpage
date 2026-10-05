import type { Metadata } from "next";
import Link from "next/link";
import { CopyInstall } from "../../components/CopyInstall";
import { MobileMenu } from "../../components/MobileMenu";
import { ByHexamind, HexamindBand } from "../../components/Hexamind";
import { APP_URL, demoHref } from "@/lib/links";

export const metadata: Metadata = {
  title: "Roadmap | Hexgate",
  description:
    "What Hexgate has shipped and what is next. Enforcement at the tool call, an enriched policy language, an MCP gate, a ban kill-switch, and an audit dashboard are live. Fine-grained resource access, smarter anomaly detection, a transparent proxy, LLM routing with guardrails, and DLP are planned.",
  alternates: { canonical: "https://hexgate.ai/roadmap" },
  openGraph: {
    type: "website",
    url: "https://hexgate.ai/roadmap",
    siteName: "Hexgate",
    title: "Hexgate Roadmap",
    description:
      "Shipped: tool-call enforcement, enriched policy, MCP gate, ban kill-switch, audit. Next: resource access, smarter anomaly detection, transparent proxy, LLM routing + guardrails, DLP.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hexgate Roadmap",
    description: "What is shipped, and what is next.",
  },
};

// A representative policy: constraints on the actual arguments, not just allow/deny.
const POLICY = `version: 1

consts:
  max_recipients: 5
  prod_env: "production"

roles:
  base:                          # shared mixin
    is_mixin: true
    consts: { max_recipients: 5 }

  default:
    inherits: [base]
    default_policy: { mode: deny }   # deny by default
    tools:
      send_email:
        mode: allow
        constraints:
          - count(args.to) <= consts.max_recipients      # count() + const
          - every(args.to, endswith(., "@acme.com"))     # quantifier
      refund:
        mode: allow
        constraints:
          - args.amount <= args.limit                    # cross-field
          - matches(args.ticket, "^INC-[0-9]+$")         # regex
      read_file:
        mode: allow
        constraints:
          - startswith(args.path, "/srv/") and not contains(args.path, "..")
      deploy:
        mode: approval_required
        constraints:
          - args.env != consts.prod_env or role == "admin"   # or + role

  admin:
    inherits: [base]
    tools:
      deploy: { mode: allow }`;

// Fixed illustrative data for the audit preview charts.
const allow = [26, 34, 30, 28, 40, 24, 38, 30, 34, 27, 42, 25, 40, 30, 44, 38];
const approval = [6, 10, 5, 8, 7, 9, 6, 11, 5, 8, 7, 10, 6, 9, 8, 12];
const deny = [14, 20, 11, 18, 22, 12, 24, 15, 20, 11, 19, 13, 28, 16, 9, 24];
const N = allow.length;

function sparkPaths(vals: number[]) {
  const W = 120;
  const H = 32;
  const p = 3;
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  const rng = mx - mn || 1;
  const x = (i: number) => p + (i * (W - 2 * p)) / (N - 1);
  const y = (v: number) => H - p - ((v - mn) / rng) * (H - 2 * p - 2);
  let line = "";
  for (let i = 0; i < N; i++) line += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(vals[i]).toFixed(1) + " ";
  let area = "M" + x(0).toFixed(1) + " " + H;
  for (let i = 0; i < N; i++) area += " L" + x(i).toFixed(1) + " " + y(vals[i]).toFixed(1);
  area += " L" + x(N - 1).toFixed(1) + " " + H + " Z";
  return { line, area, cx: x(N - 1).toFixed(1), cy: y(vals[N - 1]).toFixed(1) };
}

function stackPaths() {
  const W = 520;
  const H = 150;
  const padB = 5;
  const padT = 8;
  const totals = allow.map((a, i) => a + approval[i] + deny[i]);
  const maxT = Math.max(...totals) * 1.08;
  const x = (i: number) => (i * W) / (N - 1);
  const y = (v: number) => H - padB - (v / maxT) * (H - padB - padT);
  const b1 = allow;
  const b2 = allow.map((a, i) => a + approval[i]);
  const zeros = allow.map(() => 0);
  const area = (lo: number[], hi: number[]) => {
    let d = "";
    for (let i = 0; i < N; i++) d += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(hi[i]).toFixed(1) + " ";
    for (let i = N - 1; i >= 0; i--) d += "L" + x(i).toFixed(1) + " " + y(lo[i]).toFixed(1) + " ";
    return d + "Z";
  };
  const line = (vals: number[]) => {
    let d = "";
    for (let i = 0; i < N; i++) d += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(vals[i]).toFixed(1) + " ";
    return d;
  };
  return {
    aAllow: area(zeros, b1),
    aAppr: area(b1, b2),
    aDeny: area(b2, totals),
    lAllow: line(b1),
    lAppr: line(b2),
    lDeny: line(totals),
  };
}

const S = { decisions: sparkPaths(allow.map((a, i) => a + approval[i] + deny[i])), allow: sparkPaths(allow), deny: sparkPaths(deny), approval: sparkPaths(approval) };
const A = stackPaths();

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z" stroke="#3b82f6" strokeWidth="1.6" fill="rgba(59,130,246,0.08)" />
      <path d="M16 9.5 21.5 12.7v6.6L16 22.5 10.5 19.3v-6.6L16 9.5Z" stroke="#60a5fa" strokeWidth="1.4" fill="none" />
      <circle cx="16" cy="16" r="2.1" fill="#60a5fa" />
    </svg>
  );
}

export default function RoadmapPage() {
  return (
    <>
      <nav className="site-nav scrolled" id="nav">
        <div className="nav-inner">
          <div className="brand-lockup">
            <Link className="brand" href="/" aria-label="Hexgate home">
              <Mark />
              <span className="brand-name">
                Hex<b>gate</b>
              </span>
            </Link>
            <ByHexamind />
          </div>
          <div className="nav-links">
            <Link href="/#governance">Capabilities</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/roadmap" aria-current="page">
              Roadmap
            </Link>
            <Link href="/blog">Blog</Link>
            <a href="https://docs.hexgate.ai" target="_blank" rel="noopener">
              Docs
            </a>
          </div>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
              GitHub
            </a>
            <a className="btn btn-primary" href={APP_URL}>
              Try the cloud version
            </a>
          </div>
          <MobileMenu />
        </div>
      </nav>

      <header className="hero" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <div className="glow" />
        <div className="grid-bg" />
        <div className="wrap" style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
          <p className="kicker">Roadmap · updated July 2026</p>
          <h1>
            What&apos;s shipped,
            <br />
            <span className="accent">and what&apos;s next.</span>
          </h1>
          <p className="lede" style={{ maxWidth: 640 }}>
            One idea, pushed further down the stack: a single decision at the tool call. Here is where that stands. The
            security kind of surprise is the one you do not want, so we would rather show the list.
          </p>
          <div className="rm-legend">
            <span>
              <i style={{ background: "var(--allow)" }} /> Shipped
            </span>
            <span>
              <i style={{ background: "var(--blue-bright)" }} /> Planned
            </span>
          </div>
        </div>
      </header>

      <section className="block" style={{ paddingTop: 8 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <p className="rm-group">Shipped</p>
          <div className="rm-wrap">
            <article className="rm-item">
              <span className="rm-dot now" />
              <div className="rm-head">
                <h3>Enforcement at the tool call</h3>
                <span className="rm-status now">Shipped</span>
              </div>
              <p>
                The foundation. Wrap your agent (OpenAI Agents, LangChain, Google ADK, Pydantic AI) and every tool call
                is checked before it runs. Per-request user identity as a signed Biscuit token, signed WASM bundles, an
                audit record on every decision.
              </p>
            </article>

            <article className="rm-item">
              <span className="rm-dot now" />
              <div className="rm-head">
                <h3>Enriched policy language</h3>
                <span className="rm-status now">Shipped</span>
              </div>
              <p>
                Past allow and deny: constraints on the actual arguments. Quantifiers, string functions, cross-field
                checks, constants, inherited roles. Two engines, one for dev and one for prod, return the same verdict.
              </p>
              <details className="rm-toggle">
                <summary>See a policy</summary>
                <div className="rm-body">
                  <pre className="rm-code">{POLICY}</pre>
                  <div className="rm-grammar">
                    <span className="g">count() · any() · every()</span>
                    <span className="g">cross-field</span>
                    <span className="g">matches · startswith · endswith · contains</span>
                    <span className="g">and / or / not</span>
                    <span className="g">consts</span>
                    <span className="g">roles + inheritance</span>
                  </div>
                  <p className="rm-note">
                    <b>Two engines, one verdict:</b> pydantic in dev, signed WASM in prod, checked at parity.
                  </p>
                </div>
              </details>
            </article>

            <article className="rm-item">
              <span className="rm-dot now" />
              <div className="rm-head">
                <h3>MCP gate</h3>
                <span className="rm-status now">Shipped</span>
              </div>
              <p>
                Plug into a third-party MCP server and your agent inherits every tool it ships. That is the problem.
                Hexgate runs each MCP call through the same policy as native tools: deny by default, an allowlist, and
                per-argument constraints.
              </p>
              <details className="rm-toggle">
                <summary>See the schema</summary>
                <div className="rm-body">
                  <div className="rm-flow">
                    <div className="rm-node ext">
                      Third-party MCP
                      <br />
                      server (stdio / HTTP)
                    </div>
                    <div className="rm-arr">›</div>
                    <div className="rm-node">
                      MCPToolset
                      <br />
                      enumerate + namespace
                      <br />
                      <span className="dim">mcp-&lt;srv&gt;-&lt;tool&gt;</span>
                    </div>
                    <div className="rm-arr">›</div>
                    <div className="rm-node gate">
                      PolicyEnforcer
                      <br />
                      decide(role, tool, args)
                    </div>
                    <div className="rm-arr">›</div>
                    <div className="rm-outcomes">
                      <div className="oc a">
                        <span className="t">allow</span>reaches the server
                      </div>
                      <div className="oc d">
                        <span className="t">deny</span>stopped before it
                      </div>
                      <div className="oc h">
                        <span className="t">approval</span>held for a human
                      </div>
                    </div>
                  </div>
                  <p className="rm-note">
                    Tools are auto-enumerated at connect time and namespaced, so gating an MCP tool is no different from
                    gating a native one. <b>Deny by default:</b> a server that ships 50 tools cannot smuggle in the 47 you
                    never vetted. A denied call never reaches the server.
                  </p>
                </div>
              </details>
            </article>

            <article className="rm-item">
              <span className="rm-dot now" />
              <div className="rm-head">
                <h3>Ban gate (the big red button)</h3>
                <span className="rm-status now">Shipped</span>
              </div>
              <p>
                A kill-switch. Ban an agent or a user, checked on every invocation before the model even runs,
                independent of policy. Revocable, with active-bans and blocked-attempts views. The natural next step after
                anomaly detection: spot it, then pull the plug.
              </p>
            </article>

            <article className="rm-item">
              <span className="rm-dot now" />
              <div className="rm-head">
                <h3>Audit &amp; decision logs</h3>
                <span className="rm-status now">Shipped</span>
              </div>
              <p>
                Every allow, deny, and approval, plus every LLM call, logged as typed events. A dashboard to explore them:
                KPIs, decisions over time, a breakdown, filters (agent, role, tool, date, user), and a first
                anomaly-detection card.
              </p>
              <details className="rm-toggle">
                <summary>See the dashboard</summary>
                <div className="rm-body">
                  <div className="dash">
                    <div className="dash-top">
                      <div>
                        <h4>Audit</h4>
                        <p className="sb">
                          Every policy decision · project <code>support-bot</code>
                        </p>
                      </div>
                      <div className="seg">
                        <span>24h</span>
                        <span>7d</span>
                        <span className="on">30d</span>
                        <span>90d</span>
                      </div>
                    </div>
                    <div className="kpis">
                      <div className="kpi dec">
                        <div className="lab">Decisions</div>
                        <div className="big">861</div>
                        <div className="sub">29 / day</div>
                        <svg className="spark" viewBox="0 0 120 32">
                          <path d={S.decisions.area} fill="#6aa0f5" opacity="0.16" />
                          <path d={S.decisions.line} fill="none" stroke="#6aa0f5" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
                          <circle cx={S.decisions.cx} cy={S.decisions.cy} r="2.4" fill="#6aa0f5" />
                        </svg>
                      </div>
                      <div className="kpi al">
                        <div className="lab">Allowed</div>
                        <div className="big">495</div>
                        <div className="sub">57%</div>
                        <svg className="spark" viewBox="0 0 120 32">
                          <path d={S.allow.area} fill="#2dd4a7" opacity="0.16" />
                          <path d={S.allow.line} fill="none" stroke="#2dd4a7" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
                          <circle cx={S.allow.cx} cy={S.allow.cy} r="2.4" fill="#2dd4a7" />
                        </svg>
                      </div>
                      <div className="kpi de">
                        <div className="lab">Denied</div>
                        <div className="big">245</div>
                        <div className="sub">28.5%</div>
                        <svg className="spark" viewBox="0 0 120 32">
                          <path d={S.deny.area} fill="#f4566b" opacity="0.16" />
                          <path d={S.deny.line} fill="none" stroke="#f4566b" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
                          <circle cx={S.deny.cx} cy={S.deny.cy} r="2.4" fill="#f4566b" />
                        </svg>
                      </div>
                      <div className="kpi ap">
                        <div className="lab">Needs approval</div>
                        <div className="big">121</div>
                        <div className="sub">14%</div>
                        <svg className="spark" viewBox="0 0 120 32">
                          <path d={S.approval.area} fill="#f5a524" opacity="0.16" />
                          <path d={S.approval.line} fill="none" stroke="#f5a524" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
                          <circle cx={S.approval.cx} cy={S.approval.cy} r="2.4" fill="#f5a524" />
                        </svg>
                      </div>
                    </div>
                    <div className="dash-charts">
                      <div className="panel">
                        <div className="ph">
                          <h5>Decisions over time</h5>
                          <div className="dleg">
                            <span>
                              <i style={{ background: "#2dd4a7" }} />
                              allow
                            </span>
                            <span>
                              <i style={{ background: "#f5a524" }} />
                              approval
                            </span>
                            <span>
                              <i style={{ background: "#f4566b" }} />
                              deny
                            </span>
                          </div>
                        </div>
                        <svg className="area-svg" viewBox="0 0 520 150" preserveAspectRatio="none">
                          <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
                            <line x1="0" y1="40" x2="520" y2="40" />
                            <line x1="0" y1="80" x2="520" y2="80" />
                            <line x1="0" y1="120" x2="520" y2="120" />
                          </g>
                          <path d={A.aAllow} fill="rgba(45,212,167,0.22)" />
                          <path d={A.aAppr} fill="rgba(245,165,36,0.22)" />
                          <path d={A.aDeny} fill="rgba(244,86,107,0.24)" />
                          <path d={A.lDeny} fill="none" stroke="#f4566b" strokeWidth="1.5" />
                          <path d={A.lAppr} fill="none" stroke="#f5a524" strokeWidth="1.5" />
                          <path d={A.lAllow} fill="none" stroke="#2dd4a7" strokeWidth="1.5" />
                        </svg>
                        <div className="xaxis">
                          <span>May 4</span>
                          <span>May 18</span>
                          <span>Jun 2</span>
                        </div>
                      </div>
                      <div className="panel">
                        <div className="ph">
                          <h5>Breakdown</h5>
                        </div>
                        <div className="donut-wrap">
                          <svg width="130" height="130" viewBox="0 0 148 148">
                            <g transform="rotate(-90 74 74)" fill="none" strokeWidth="17">
                              <circle cx="74" cy="74" r="52" stroke="#2dd4a7" strokeDasharray="186.2 140.5" strokeDashoffset="0" />
                              <circle cx="74" cy="74" r="52" stroke="#f5a524" strokeDasharray="45.7 281" strokeDashoffset="-186.2" />
                              <circle cx="74" cy="74" r="52" stroke="#f4566b" strokeDasharray="94.8 232" strokeDashoffset="-231.9" />
                            </g>
                            <text x="74" y="70" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="800">
                              861
                            </text>
                            <text x="74" y="89" textAnchor="middle" fill="#8a93a3" fontSize="11">
                              decisions
                            </text>
                          </svg>
                          <div className="dlegend">
                            <div className="r">
                              <i style={{ background: "#2dd4a7" }} />
                              <span>allow</span>
                              <span>495</span>
                              <span className="pct">57%</span>
                            </div>
                            <div className="r">
                              <i style={{ background: "#f5a524" }} />
                              <span>approval</span>
                              <span>121</span>
                              <span className="pct">14%</span>
                            </div>
                            <div className="r">
                              <i style={{ background: "#f4566b" }} />
                              <span>deny</span>
                              <span>245</span>
                              <span className="pct">28%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="anomaly">
                      <span className="ic">!</span>
                      <span>
                        <b>Anomaly flagged</b> · alice: 12 refunds today (usual is 2 / day)
                      </span>
                    </div>
                    <p className="dash-disc">Preview of the platform Audit dashboard</p>
                  </div>
                </div>
              </details>
            </article>
          </div>

          <p className="rm-group g2">Planned</p>
          <div className="rm-wrap">
            <article className="rm-item">
              <span className="rm-dot next" />
              <div className="rm-head">
                <h3>Fine-grained resource access</h3>
                <span className="rm-status next">Planned</span>
              </div>
              <p>
                Extend policy past tools, down to the resources a call reaches: internet egress (domains), API endpoints,
                and database queries (tables, read or write). An allowed tool still cannot touch a resource it should not.
              </p>
            </article>
            <article className="rm-item">
              <span className="rm-dot next" />
              <div className="rm-head">
                <h3>Smarter anomaly detection</h3>
                <span className="rm-status next">Planned</span>
              </div>
              <p>
                Finer algorithms over the audit history: adaptive thresholds, per-user behavior profiles, drift
                detection, feeding an automatic policy tightening. Spot the odd one out, then narrow its rights on the
                next turn.
              </p>
            </article>
            <article className="rm-item">
              <span className="rm-dot next" />
              <div className="rm-head">
                <h3>Transparent proxy</h3>
                <span className="rm-status next">Planned</span>
              </div>
              <p>
                A proxy to intercept requests from agents and MCP servers you do not control in code. Same policy, same
                audit, no code change. The transparent twin of the SDK wrapper.
              </p>
            </article>
            <article className="rm-item">
              <span className="rm-dot next" />
              <div className="rm-head">
                <h3>LLM routing + guardrails</h3>
                <span className="rm-status next">Planned</span>
              </div>
              <p>
                Route model calls (multi-provider, fallback, budgets) and apply input and output guardrails. The text
                channel, alongside the action channel we already cover.
              </p>
            </article>
            <article className="rm-item">
              <span className="rm-dot next" />
              <div className="rm-head">
                <h3>DLP (data loss prevention)</h3>
                <span className="rm-status next">Planned</span>
              </div>
              <p>
                Catch and block sensitive data (PII, secrets) leaking through inputs, outputs, and tool arguments, at the
                same decision point as policy.
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
              Start with what is shipped.
              <br />
              <span style={{ color: "var(--tx-1)", fontWeight: 500 }}>Wrap your agent in one line, gate every tool call.</span>
            </h2>
            <p>
              Install the SDK and wrap your existing OpenAI Agents, LangChain, Google ADK, or Pydantic AI agent. Or book a
              walkthrough of the policy language, MCP gate, audit dashboard, and where the roadmap is headed.
            </p>
            <div className="final-cta">
              <CopyInstall id="copyBtnRoadmap" />
              <a className="btn btn-primary" href={APP_URL}>
                Try the cloud version
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a className="btn btn-ghost" href={demoHref("Hexgate roadmap walkthrough")}>
                Book a demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <HexamindBand />

      <footer>
        <div className="wrap">
          <div className="foot-inner">
            <Link className="brand" href="/">
              <Mark />
              <span className="brand-name">
                Hex<b>gate</b>
              </span>
            </Link>
            <div className="foot-links">
              <Link href="/">Home</Link>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/roadmap">Roadmap</Link>
              <Link href="/blog">Blog</Link>
              <a href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
                GitHub
              </a>
              <a href="https://pypi.org/project/hexgate/" target="_blank" rel="noopener">
                PyPI
              </a>
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
