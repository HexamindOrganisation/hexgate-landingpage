/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

type Verdict = "allow" | "deny" | "hold";
type DecisionEvent = {
  role: string;
  tool: string;
  args: string;
  verdict: Verdict;
  reason?: string;
};

const EVENTS: DecisionEvent[] = [
  { role: "member", tool: "web_search", args: '"Q3 refund policy"', verdict: "allow" },
  { role: "billing", tool: "refund_order", args: 'amount=200, currency="USD"', verdict: "allow" },
  { role: "billing", tool: "refund_order", args: "amount=600", verdict: "deny", reason: "args.amount <= 500" },
  { role: "support", tool: "delete_user", args: '"u_8842"', verdict: "deny", reason: "not allowed for role support" },
  { role: "admin", tool: "wire_transfer", args: "amount=50000", verdict: "hold", reason: "awaiting human approval" },
  { role: "member", tool: "read_file", args: '"policy.yaml"', verdict: "allow" },
  { role: "support", tool: "issue_credit", args: "amount=25", verdict: "allow" },
  { role: "member", tool: "edit_file", args: '"prod.env"', verdict: "deny", reason: "default_policy: deny" },
];

const VLABEL: Record<Verdict, string> = { allow: "ALLOW", deny: "DENY", hold: "APPROVAL" };
const VCLASS: Record<Verdict, string> = { allow: "v-allow", deny: "v-deny", hold: "v-hold" };
const MAX_ROWS = 5;

function HexMark() {
  return (
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
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CopyInstall({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText("pip install hexgate");
    } catch {
      /* no-op */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="install">
      <span>
        <span className="prompt">$</span> pip install <span className="pkg">hexgate</span>
      </span>
      <button
        id={id}
        className={`copy-btn${copied ? " copied" : ""}`}
        aria-label="Copy install command"
        onClick={onClick}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

function LiveFeed() {
  const feedRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const push = () => {
      const ev = EVENTS[indexRef.current % EVENTS.length];
      indexRef.current += 1;

      const row = document.createElement("div");
      row.className = "row";
      const reason = ev.reason ? `<span class="reason">↳ ${ev.reason}</span>` : "";
      row.innerHTML =
        `<span class="role">${ev.role}</span>` +
        `<span class="call"><span class="tool">${ev.tool}</span><span class="args">(${ev.args})</span>${reason}</span>` +
        `<span class="verdict ${VCLASS[ev.verdict]}"><span class="vd"></span>${VLABEL[ev.verdict]}</span>`;
      if (!reduce) row.classList.add("entering");
      feed.appendChild(row);
      if (!reduce) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => row.classList.remove("entering"))
        );
      }
      while (feed.children.length > MAX_ROWS) {
        feed.removeChild(feed.firstChild!);
      }
    };

    for (let s = 0; s < MAX_ROWS; s += 1) push();
    if (reduce) return;
    const id = window.setInterval(push, 2100);
    return () => window.clearInterval(id);
  }, []);

  return <div className="feed" ref={feedRef} />;
}

function Nav() {
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav ref={navRef} className="site-nav" id="nav">
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="Hexgate home">
          <HexMark />
          <span className="brand-name">
            Hex<b>gate</b>
          </span>
        </a>
        <div className="nav-links">
          <a href="#frameworks">Frameworks</a>
          <a href="#features">Capabilities</a>
          <a href="#code">Quickstart</a>
          <a href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
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
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
            GitHub
          </a>
          <a className="btn btn-primary" href="#book">
            Book a demo
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <>
      <Nav />

      <a id="top" />
      <header className="hero">
        <div className="glow" />
        <div className="grid-bg" />
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="pill">
                <span className="dot" /> Enforced locally · <b>zero added latency</b>
              </span>
              <h1>
                Control what your agents&nbsp;do.
                <br />
                <span className="accent">Not just what they&nbsp;say.</span>
              </h1>
              <p className="lede">
                Guardrails stop at the prompt. Hexgate governs what your agents actually <b>do</b> —
                every tool call and resource access, allowed, denied, or held for approval. The policy
                is enforced <b>locally from a signed bundle</b>, so fine-grained control costs you nothing
                on the critical path.
              </p>
              <div className="cta-row">
                <CopyInstall id="copyBtn" />
                <a className="btn btn-primary" href="#book">
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
              <div className="trust">
                <span>
                  <span className="tk">MIT</span> licensed
                </span>
                <span>
                  <span className="tk">●</span> No per-call round-trips
                </span>
                <span>
                  <span className="tk">●</span> Ed25519 signed bundles
                </span>
              </div>
            </div>

            <div className="console" aria-label="Live policy decision stream">
              <div className="console-top">
                <div className="dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="fn">
                  <b>PolicyEnforcer</b>.decide(role, tool, args)
                </span>
                <span className="live">
                  <span className="blink" /> live
                </span>
              </div>
              <LiveFeed />
              <div className="console-bottom">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
                every decision streamed to the audit log
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="logos" id="frameworks">
        <div className="wrap">
          <p className="logos-label">Wraps the agent you already built</p>
          <div className="logos-row">
            <span className="fw">
              <img
                className="fwlogo"
                src="https://cdn.jsdelivr.net/npm/simple-icons@14/icons/openai.svg"
                alt="OpenAI"
                width={18}
                height={18}
                loading="lazy"
              />{" "}
              OpenAI Agents
            </span>
            <span className="fw">
              <img
                className="fwlogo"
                src="https://cdn.jsdelivr.net/npm/simple-icons@14/icons/langchain.svg"
                alt="LangChain"
                width={18}
                height={18}
                loading="lazy"
              />{" "}
              LangChain / LangGraph
            </span>
            <span className="fw">
              <img
                className="fwlogo"
                src="https://cdn.jsdelivr.net/npm/simple-icons@14/icons/google.svg"
                alt="Google"
                width={18}
                height={18}
                loading="lazy"
              />{" "}
              Google ADK
            </span>
            <span className="fw">
              <img
                className="fwlogo"
                src="https://cdn.jsdelivr.net/npm/simple-icons@14/icons/pydantic.svg"
                alt="Pydantic"
                width={18}
                height={18}
                loading="lazy"
              />{" "}
              Pydantic AI
            </span>
            <span className="fw native">+ any native runtime</span>
          </div>
        </div>
      </section>

      <section className="block" id="features">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">The control plane for agentic systems</span>
            <h2>Authorization that travels with every&nbsp;tool&nbsp;call.</h2>
            <p>
              Capable agents are only as safe as the boundary around them. Hexgate is that boundary —
              four primitives, one enforcement seam.
            </p>
          </div>
          <div className="features">
            <article className="feat">
              <div className="feat-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
                </svg>
              </div>
              <h3>Policy enforcement</h3>
              <p>
                Deny-by-default. Every tool call returns a typed <code>Decision</code> — allow, deny, or
                approval-required — evaluated against the caller&apos;s role at call time.
              </p>
            </article>
            <article className="feat">
              <div className="feat-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3>Signed bundles, local speed</h3>
              <p>
                The signed WASM bundle is fetched <b>once per run</b> and enforced in-process — no security
                service on the hot path, no round-trip per decision. Fast by design, verified before it&apos;s
                trusted.
              </p>
            </article>
            <article className="feat">
              <div className="feat-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-3.5 3.6-6 8-6s8 2.5 8 6" />
                </svg>
              </div>
              <h3>Per-request user scope</h3>
              <p>
                Biscuit tokens carry <em>who</em> is calling; role policies decide <em>what</em> they can
                do. One wrapped agent serves every user, scoped per request.
              </p>
            </article>
            <article className="feat">
              <div className="feat-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m7 14 3-3 3 3 5-6" />
                </svg>
              </div>
              <h3>Audit trail</h3>
              <p>
                Every decision streams to the audit log — who acted, which tool, the verdict, and the
                exact constraint that allowed or blocked it. Answerable, not hand-wavy.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="block" id="code" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Quickstart</span>
            <h2>Wrap your agent in one line. Ship enforcement on day&nbsp;one.</h2>
            <p>
              No rewrite, no config object. Set a key, wrap the runner, and the same agent code gates
              every tool boundary.
            </p>
          </div>
          <div className="code-grid">
            <div className="editor">
              <div className="editor-top">
                <div className="dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="file">agent.py</span>
              </div>
              <pre>
                <code className="block-code">
                  <span className="c-kw">from</span> hexgate.adapters.openai{" "}
                  <span className="c-kw">import</span> <span className="c-fn">HexgateRunner</span>
                  {"\n"}
                  <span className="c-kw">from</span> hexgate.runtime{" "}
                  <span className="c-kw">import</span> <span className="c-fn">User</span>
                  {"\n\n"}
                  <span className="c-com"># picks up HEXGATE_KEY from env — no rewrite</span>
                  {"\n"}
                  runner = <span className="c-fn">HexgateRunner</span>()
                  {"\n\n"}
                  <span className="c-kw">await</span> runner.<span className="c-fn">run</span>(
                  {"\n"}
                  {"    "}my_agent,
                  {"\n"}
                  {"    "}<span className="c-str">&quot;refund order 30&quot;</span>,
                  {"\n"}
                  {"    "}user=<span className="c-fn">User</span>(user_id=
                  <span className="c-str">&quot;alice&quot;</span>, role=
                  <span className="c-str">&quot;billing&quot;</span>),
                  {"\n"}
                  )
                  {"\n"}
                  <span className="c-com"># ↳ every tool call now routes through policy</span>
                </code>
              </pre>
            </div>
            <div className="editor">
              <div className="editor-top">
                <div className="dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="file">policies/billing.yaml</span>
              </div>
              <pre>
                <code className="block-code">
                  <span className="c-key">version</span>: <span className="c-num">1</span>
                  {"\n"}
                  <span className="c-key">inherits</span>: [read_only]
                  {"\n\n"}
                  <span className="c-key">default_policy</span>:
                  {"\n"}
                  {"  "}<span className="c-key">mode</span>: <span className="c-deny">deny</span>
                  {"\n\n"}
                  <span className="c-key">tools</span>:
                  {"\n"}
                  {"  "}<span className="c-key">refund_order</span>:
                  {"\n"}
                  {"    "}<span className="c-key">mode</span>: <span className="c-str">allow</span>
                  {"\n"}
                  {"    "}<span className="c-key">constraints</span>:
                  {"\n"}
                  {"      "}- args.amount <span className="c-mut">&lt;=</span>{" "}
                  <span className="c-num">500</span>
                  {"\n"}
                  {"      "}- args.currency == <span className="c-str">&quot;USD&quot;</span>
                  {"\n"}
                  {"  "}<span className="c-key">wire_transfer</span>:
                  {"\n"}
                  {"    "}<span className="c-key">mode</span>:{" "}
                  <span className="c-num">approval_required</span>
                </code>
              </pre>
            </div>
          </div>
          <p className="code-note">
            <span className="tk">✓</span> Identical decisions in dev (in-process) and prod (signed WASM)
            — proven by a parity test suite.
          </p>

          <div className="steps">
            <div className="step">
              <div className="n">01 / WRAP</div>
              <h4>Keep your agent</h4>
              <p>
                OpenAI, LangChain, Google ADK, or Pydantic AI — wrap it once. Your original object is left
                untouched.
              </p>
            </div>
            <div className="step">
              <div className="n">02 / DECIDE</div>
              <h4>Gate every call</h4>
              <p>
                Each tool invocation resolves the caller&apos;s role and returns allow, deny, or
                approval-required — recoverable, never a crash.
              </p>
            </div>
            <div className="step">
              <div className="n">03 / PROVE</div>
              <h4>Audit it all</h4>
              <p>
                Decisions stream to the log with the exact constraint behind each verdict. Hot-reload
                policy without a restart.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="final" id="book">
        <div className="glow" />
        <div className="wrap">
          <div className="final-card">
            <span className="eyebrow">Get started</span>
            <h2 style={{ marginTop: 16 }}>
              Let your agents do more —
              <br />
              because nothing they do is unchecked.
            </h2>
            <p>
              Install the SDK and gate your first agent in minutes, or book a walkthrough of the platform,
              audit log, and signed-bundle workflow.
            </p>
            <div className="final-cta">
              <CopyInstall id="copyBtn2" />
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
            <a className="brand" href="#top">
              <HexMark />
              <span className="brand-name">
                Hex<b>gate</b>
              </span>
            </a>
            <div className="foot-links">
              <a href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
                GitHub
              </a>
              <a href="https://pypi.org/project/hexgate/" target="_blank" rel="noopener">
                PyPI
              </a>
              <a href="#frameworks">Frameworks</a>
              <a href="#features">Capabilities</a>
              <a href="#book">Book a demo</a>
            </div>
            <span className="foot-meta">© 2026 Hexamind · MIT</span>
          </div>
        </div>
      </footer>
    </>
  );
}
