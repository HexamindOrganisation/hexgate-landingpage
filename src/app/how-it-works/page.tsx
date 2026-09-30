import type { Metadata } from "next";
import { CopyInstall } from "../../components/CopyInstall";
import { HexamindBand } from "../../components/Hexamind";
import { SubNav, SiteFooter } from "../../components/SiteChrome";
import { APP_URL, demoHref } from "@/lib/links";

export const metadata: Metadata = {
  title: "How Hexgate Works: SDK + Platform for AI Agent Governance | Hexgate",
  description:
    "Hexgate has two parts: an SDK that enforces deterministic policy on every step of your agent, and a platform where you define policies, watch agents live, and analyze their behavior after the fact. The control loop, hot and cold governance, and context-aware rules explained.",
  alternates: { canonical: "https://hexgate.ai/how-it-works" },
  openGraph: {
    type: "website",
    url: "https://hexgate.ai/how-it-works",
    siteName: "Hexgate",
    title: "How Hexgate works",
    description:
      "Every agent decision, checked against your rules. An SDK inside your agent, a platform that governs it, one control loop.",
  },
  twitter: {
    card: "summary_large_image",
    title: "How Hexgate works",
    description: "Every agent decision, checked against your rules.",
  },
};

// Context-aware rule: identity, arguments, agent state and global context in one policy.
const POLICY = `version: 1

roles:
  finance:
    default_policy: { mode: deny }   # deny by default
    tools:
      send_payment:
        mode: allow
        constraints:
          - args.amount <= 10000               # what
          - args.currency in ["EUR", "USD"]
          - turn.tokens <= 50000               # agent state
          - turn.tool_calls <= 10
          - now.weekday not in ["sat", "sun"]  # context
      wire_transfer:
        mode: approval_required

  support:                           # who
    inherits: [read_only]
    tools:
      send_payment: { mode: deny }`;

// Minimal YAML colouring with the same token classes as the home page editor.
function YamlLine({ line }: { line: string }) {
  const hash = line.indexOf("#");
  const body = hash >= 0 ? line.slice(0, hash) : line;
  const comment = hash >= 0 ? line.slice(hash) : "";
  const key = body.match(/^(\s*)([\w]+)(:)(.*)$/);
  const paint = (text: string) =>
    text.split(/("[^"]*"|\b\d+\b|\bdeny\b|\ballow\b|\bapproval_required\b)/).map((t, i) => {
      if (/^"/.test(t)) return <span key={i} className="c-str">{t}</span>;
      if (/^\d+$/.test(t)) return <span key={i} className="c-num">{t}</span>;
      if (t === "deny") return <span key={i} className="c-deny">{t}</span>;
      if (t === "allow") return <span key={i} className="c-str">{t}</span>;
      if (t === "approval_required") return <span key={i} className="c-num">{t}</span>;
      return t;
    });
  return (
    <>
      {key ? (
        <>
          {key[1]}
          <span className="c-key">{key[2]}</span>
          {key[3]}
          {paint(key[4])}
        </>
      ) : (
        paint(body)
      )}
      {comment ? <span className="c-com">{comment}</span> : null}
      {"\n"}
    </>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const LOOP = [
  { title: "Define", body: "You write deterministic rules for each agent, MCP server or tool.", tag: "Platform", owner: "platform" },
  { title: "Fetch", body: "The SDK pulls the signed policy bundle that applies to the agent at runtime.", tag: "SDK", owner: "sdk" },
  {
    title: "Enforce",
    body: "Each step the agent takes is checked in-process, before any tool or model call goes out.",
    tag: "SDK · Hot",
    owner: "hot",
  },
  { title: "Report", body: "Every decision (allowed, denied, held, and why) goes back to the platform.", tag: "SDK → Platform", owner: "sdk" },
  { title: "Improve", body: "The platform flags anomalies and suggests how to change your policies.", tag: "Platform · Cold", owner: "platform" },
];

export default function HowItWorksPage() {
  return (
    <>
      <SubNav current="how-it-works" />

      <header className="hero" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <div className="glow" />
        <div className="grid-bg" />
        <div className="wrap">
          <div className="hero-lead">
            <p className="kicker">How it works</p>
            <h1>
              Every agent decision,
              <br />
              <span className="accent">checked against your rules.</span>
            </h1>
            <p className="lede">
              Hexgate has two parts: an <b>SDK</b> that runs inside your agents and a <b>platform</b> that
              governs them. Both are open source.
            </p>
            <div className="cta-row">
              <CopyInstall id="copyBtnHiw" />
              <a className="btn btn-primary" href={APP_URL}>
                Try the cloud version
                <Arrow />
              </a>
            </div>
          </div>

          <div className="hiw-arch" aria-label="Hexgate architecture: the SDK inside your agent exchanges policies and decisions with the platform">
            <div className="arch-box sdk">
              <span className="arch-k">HEXGATE SDK</span>
              <div className="arch-inner">
                <div className="arch-cell">
                  Your agents
                  <small>OpenAI · LangChain · ADK · Pydantic AI</small>
                </div>
                <div className="arch-cell">
                  Your application logic
                  <small>tools, MCP servers, APIs</small>
                </div>
              </div>
              <span className="arch-note">
                <b>Enforces on every step</b>, in-process, no round-trip
              </span>
            </div>
            <div className="arch-links" aria-hidden="true">
              <span>← policies</span>
              <span>decisions →</span>
            </div>
            <div className="arch-box">
              <span className="arch-k">HEXGATE PLATFORM</span>
              <div className="arch-inner">
                <div className="arch-cell">
                  Hot
                  <small>real time</small>
                </div>
                <div className="arch-cell">
                  Cold
                  <small>after the fact</small>
                </div>
              </div>
              <span className="arch-note">
                <b>SaaS or on-premise</b>: Hexgate Cloud or your own infrastructure
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="block" id="components">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">01 · Two components</span>
            <h2>Hexgate = SDK + Platform</h2>
            <p>Both are open source. The platform is available as SaaS on Hexgate Cloud or on-premise.</p>
          </div>
          <div className="duo">
            <article className="duo-card">
              <span className="duo-k">The Hexgate SDK · inside your agent</span>
              <p>
                The SDK wraps your agent and your application logic. It fetches policies from the platform,
                enforces them on every step and reports each decision back. You keep your agent code as it is.
              </p>
              <p className="duo-meta">Compatible with OpenAI Agents SDK · LangChain · Google ADK · Pydantic AI</p>
              <a className="duo-link" href="https://pypi.org/project/hexgate/" target="_blank" rel="noopener">
                pypi.org/project/hexgate →
              </a>
            </article>
            <article className="duo-card solid">
              <span className="duo-k">The Hexgate platform · your control center</span>
              <p>
                The platform is where you define policies, watch agents live and analyze their behavior over
                time. It runs as SaaS or on-premise.
              </p>
              <p className="duo-meta">Open source · self-host or managed</p>
              <a className="duo-link" href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
                github.com/HexamindOrganisation/hexgate →
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="block band" id="loop">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 40 }}>
            <span className="eyebrow">02 · The control loop</span>
            <h2>Five steps, on every agent run</h2>
          </div>
          <ol className="loop">
            {LOOP.map((s, i) => (
              <li className={`loop-step owner-${s.owner}`} key={s.title}>
                <span className="loop-n">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <span className="loop-tag">{s.tag}</span>
              </li>
            ))}
          </ol>
          <div className="loop-return" aria-hidden="true" />
          <p className="loop-caption">Updated policies flow back to step 1. The loop keeps going.</p>
        </div>
      </section>

      <section className="block" id="hot-cold">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">03 · Hot and cold governance</span>
            <h2>Stop it before it runs. Learn from it after.</h2>
          </div>
          <div className="pillars">
            <article className="pillar">
              <div className="chips">
                <span className="chip c-hot">Hot · real time</span>
              </div>
              <ul className="hc-list">
                <li>Checks every decision before it runs</li>
                <li>Blocks calls that break a policy, or holds them for a human</li>
                <li>No change to your agent logic</li>
              </ul>
            </article>
            <article className="pillar alt">
              <div className="chips">
                <span className="chip c-cold">Cold · after the fact</span>
              </div>
              <ul className="hc-list">
                <li>Stores every policy decision in an append-only log</li>
                <li>Detects anomalies and drift in agent behavior</li>
                <li>Suggests policy changes</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="block band deep" id="rules">
        <div className="wrap rules-split">
          <div>
            <div className="sec-head" style={{ marginBottom: 28 }}>
              <span className="eyebrow">04 · Context-aware rules</span>
              <h2>Rules that understand context</h2>
              <p>A single policy can combine:</p>
            </div>
            <div className="ctx-grid">
              <div className="ctx">
                <h4>Who</h4>
                <p>
                  User ID, role and rights, carried per request as a signed token (<code>role</code>)
                </p>
              </div>
              <div className="ctx">
                <h4>What</h4>
                <p>
                  The tool, the model and the arguments passed (<code>args.*</code>)
                </p>
              </div>
              <div className="ctx">
                <h4>Agent state</h4>
                <p>
                  Tokens used in the turn, number of tools called (<code>turn.*</code>)
                </p>
              </div>
              <div className="ctx">
                <h4>Global context</h4>
                <p>
                  Time of day, weekends, environment (<code>now.*</code>)
                </p>
              </div>
            </div>
          </div>
          <div className="rules-code">
            <p className="rules-k">Example rule</p>
            <div className="editor">
              <div className="editor-top">
                <div className="dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="file">policies/payments.yaml</span>
              </div>
              <pre>
                <code className="block-code">
                  {POLICY.split("\n").map((line, i) => (
                    <YamlLine key={i} line={line} />
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="dimensions">
        <div className="wrap">
          <div className="sec-head center" style={{ marginBottom: 0 }}>
            <span className="eyebrow">05 · Built for every dimension of trust</span>
          </div>
          <div className="dims" style={{ marginTop: 8 }}>
            <div className="dims-row">
              <span className="dim">Security</span>
              <span className="dim">Integrity</span>
              <span className="dim">Usage</span>
              <span className="dim">Performance</span>
              <span className="dim">Compliance</span>
            </div>
          </div>
        </div>
      </section>

      <section className="final" id="book">
        <div className="glow" />
        <div className="wrap">
          <div className="final-card">
            <span className="eyebrow">Get started</span>
            <h2 style={{ marginTop: 16 }}>Take back control of your AI agents.</h2>
            <p>Open source. Runs as SaaS or on your own infrastructure.</p>
            <div className="final-cta">
              <CopyInstall id="copyBtnHiw2" />
              <a className="btn btn-primary" href={APP_URL}>
                Try the cloud version
                <Arrow />
              </a>
              <a className="btn btn-ghost" href={demoHref("Hexgate walkthrough")}>
                Book a demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <HexamindBand />

      <SiteFooter />
    </>
  );
}
