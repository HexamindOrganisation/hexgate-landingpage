/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import Link from "next/link";
import { CopyInstall } from "../components/CopyInstall";
import { MobileMenu } from "../components/MobileMenu";
import { ByHexamind, HexamindBand } from "../components/Hexamind";
import { ControlLoop } from "../components/ControlLoop";
import { ArchDiagram, ComponentCards, ContextRules } from "../components/HowItWorks";
import { SlideReveal } from "../components/SlideReveal";
import { AuditAnalyze } from "../components/AuditAnalyze";
import { APP_URL, DEMO_HREF } from "@/lib/links";

const MOBILE_QUERY = "(max-width: 700px)";
const subscribeMobile = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
const getMobileServerSnapshot = () => false;

type Verdict = "allow" | "deny" | "hold";

const GATE_PATHS: Record<Verdict, string> = {
  allow: "M190,220 H500 C586,220 660,88 798,88",
  hold: "M190,220 H798",
  deny: "M190,220 H500 C586,220 660,352 798,352",
};

// Mobile vertical layout: 320×420 viewBox. Agent at top, hex in middle,
// outputs in a 3-up row at the bottom. Paths are shaped so the packet's
// 50% point lands inside the hex (matches the keyframe pause).
const MOBILE_GATE_PATHS: Record<Verdict, string> = {
  allow: "M160,70 V200 L56,365",
  hold: "M160,70 V365",
  deny: "M160,70 V200 L264,365",
};

type GateConfig = {
  stageW: number;
  stageH: number;
  maxScale: number;
  paths: Record<Verdict, string>;
};

const DESKTOP_CONFIG: GateConfig = {
  stageW: 1000,
  stageH: 440,
  maxScale: 1,
  paths: GATE_PATHS,
};

const MOBILE_CONFIG: GateConfig = {
  stageW: 320,
  stageH: 420,
  maxScale: 1.4,
  paths: MOBILE_GATE_PATHS,
};

type GateEvent = { tool: string; verdict: Verdict };
const GATE_SEQ: GateEvent[] = [
  { tool: "read_file", verdict: "allow" },
  { tool: "refund_order", verdict: "allow" },
  { tool: "wire_transfer", verdict: "hold" },
  { tool: "delete_user", verdict: "deny" },
  { tool: "web_search", verdict: "allow" },
  { tool: "export_pii", verdict: "hold" },
  { tool: "issue_credit", verdict: "allow" },
  { tool: "edit_file", verdict: "deny" },
];

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


type GateRefs = {
  stage: RefObject<HTMLDivElement | null>;
  scaler: RefObject<HTMLDivElement | null>;
  gate: RefObject<HTMLDivElement | null>;
  allow: RefObject<HTMLDivElement | null>;
  hold: RefObject<HTMLDivElement | null>;
  deny: RefObject<HTMLDivElement | null>;
};

function useGatePackets(refs: GateRefs, config: GateConfig) {
  useEffect(() => {
    const stage = refs.stage.current;
    const scaler = refs.scaler.current;
    if (!stage || !scaler) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fit = () => {
      // DOM animation: mutating .style on elements pulled from refs is intentional.
      // eslint-disable-next-line react-hooks/immutability
      const w = stage.clientWidth;
      const s = Math.min(config.maxScale, w / config.stageW);
      scaler.style.transform = `scale(${s})`;
      // Scaler's intrinsic width may differ from the stage's; explicit
      // marginLeft lands the scaler's intrinsic center on the stage's true
      // center, keeping the scaled diagram visible at any viewport width.
      scaler.style.marginLeft = `${(w - config.stageW) / 2}px`;
      stage.style.height = `${config.stageH * s}px`;
    };
    fit();
    window.addEventListener("resize", fit, { passive: true });

    const outRefs = { allow: refs.allow, hold: refs.hold, deny: refs.deny };

    if (reduce) {
      for (const v of ["allow", "hold", "deny"] as const) {
        const node = outRefs[v].current;
        const c = node?.querySelector(".ocount");
        if (c) c.textContent = "1 total";
      }
      return () => window.removeEventListener("resize", fit);
    }

    const counts: Record<Verdict, number> = { allow: 0, hold: 0, deny: 0 };
    const DUR = 2600;
    const timeouts = new Set<number>();
    const packets = new Set<HTMLDivElement>();
    let k = 0;

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, ms);
      timeouts.add(id);
    };

    const spawn = () => {
      const ev = GATE_SEQ[k % GATE_SEQ.length];
      k += 1;

      const p = document.createElement("div");
      p.className = "packet";
      p.textContent = `${ev.tool}()`;
      p.style.offsetPath = `path("${config.paths[ev.verdict]}")`;
      p.style.setProperty("--dur", `${DUR}ms`);
      scaler.appendChild(p);
      packets.add(p);

      schedule(() => p.classList.add("run"), 30);

      schedule(() => {
        p.classList.add(`v-${ev.verdict}`);
        const gate = refs.gate.current;
        if (gate) {
          gate.classList.add("scanning");
          schedule(() => gate.classList.remove("scanning"), 280);
        }
      }, DUR * 0.5);

      schedule(() => {
        const node = outRefs[ev.verdict].current;
        if (node) {
          node.classList.add("hit");
          counts[ev.verdict] += 1;
          const c = node.querySelector(".ocount");
          if (c) c.textContent = `${counts[ev.verdict]} total`;
          schedule(() => node.classList.remove("hit"), 440);
        }
      }, DUR * 0.92);

      schedule(() => {
        p.remove();
        packets.delete(p);
      }, DUR + 150);
    };

    spawn();
    const interval = window.setInterval(spawn, 1500);

    return () => {
      window.removeEventListener("resize", fit);
      window.clearInterval(interval);
      for (const id of timeouts) window.clearTimeout(id);
      for (const p of packets) p.remove();
    };
    // refs are stable RefObjects; config is a module-level constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function GateDiagram() {
  const stageRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const outAllowRef = useRef<HTMLDivElement>(null);
  const outHoldRef = useRef<HTMLDivElement>(null);
  const outDenyRef = useRef<HTMLDivElement>(null);

  useGatePackets(
    {
      stage: stageRef,
      scaler: scalerRef,
      gate: gateRef,
      allow: outAllowRef,
      hold: outHoldRef,
      deny: outDenyRef,
    },
    DESKTOP_CONFIG
  );

  return (
    <div
      className="gate-stage"
      ref={stageRef}
      aria-label="Animated diagram: an agent tool call passing through the policy gate to an allow, approval, or deny decision"
    >
      <div className="gate-scaler" ref={scalerRef}>
        <div className="gate-caption">
          <span>Tool call</span>
          <span>Real-time evaluation</span>
          <span>Typed decision</span>
        </div>
        <svg className="gate-wires" viewBox="0 0 1000 440" preserveAspectRatio="none" aria-hidden="true">
          <path className="wire wire-base" d="M190,220 H500 C586,220 660,88 798,88" />
          <path className="wire wire-base" d="M190,220 H500 C586,220 660,352 798,352" />
          <path className="wire wire-allow" d="M504,220 C586,220 660,88 798,88" />
          <path className="wire wire-deny" d="M504,220 C586,220 660,352 798,352" />
          <path className="wire wire-hold" d="M504,220 H798" />
          <path className="wire wire-trunk flow" d="M190,220 H496" />
        </svg>

        <div className="gnode gn-agent">
          <div className="ghead">
            <span className="gdot" />
            <span className="gname">Agent</span>
          </div>
          <span className="gsub">emitting tool calls</span>
        </div>

        <div className="gnode gn-gate" ref={gateRef}>
          <div className="hexwrap">
            <svg className="hexsvg" viewBox="0 0 168 188" aria-hidden="true">
              <polygon className="hexfill" points="84,4 164,48 164,140 84,184 4,140 4,48" />
              <polygon className="hexstroke" points="84,4 164,48 164,140 84,184 4,140 4,48" />
            </svg>
            <div className="scanline" />
            <div className="gatelabel">
              <span className="glabel-k">POLICY GATE</span>
              <span className="glabel-fn">decide()</span>
            </div>
          </div>
        </div>

        <div className="gnode gn-out out-allow" ref={outAllowRef}>
          <div className="obadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="otext">
            <span className="olabel">ALLOW</span>
            <span className="ocount">0 total</span>
          </div>
        </div>
        <div className="gnode gn-out out-hold" ref={outHoldRef}>
          <div className="obadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <div className="otext">
            <span className="olabel">APPROVAL</span>
            <span className="ocount">0 total</span>
          </div>
        </div>
        <div className="gnode gn-out out-deny" ref={outDenyRef}>
          <div className="obadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
          <div className="otext">
            <span className="olabel">DENY</span>
            <span className="ocount">0 total</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileGateDiagram() {
  const stageRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const outAllowRef = useRef<HTMLDivElement>(null);
  const outHoldRef = useRef<HTMLDivElement>(null);
  const outDenyRef = useRef<HTMLDivElement>(null);

  useGatePackets(
    {
      stage: stageRef,
      scaler: scalerRef,
      gate: gateRef,
      allow: outAllowRef,
      hold: outHoldRef,
      deny: outDenyRef,
    },
    MOBILE_CONFIG
  );

  return (
    <div
      className="gate-stage gate-stage--mobile"
      ref={stageRef}
      aria-label="Animated diagram: an agent tool call passing through the policy gate to an allow, approval, or deny decision"
    >
      <div className="gate-scaler gate-scaler--mobile" ref={scalerRef}>
        <svg className="gate-wires" viewBox="0 0 320 420" preserveAspectRatio="none" aria-hidden="true">
          <path className="wire wire-base" d="M160,70 V200 L56,365" />
          <path className="wire wire-base" d="M160,70 V365" />
          <path className="wire wire-base" d="M160,70 V200 L264,365" />
          <path className="wire wire-allow" d="M160,267 L56,365" />
          <path className="wire wire-hold" d="M160,267 V365" />
          <path className="wire wire-deny" d="M160,267 L264,365" />
          <path className="wire wire-trunk flow" d="M160,70 V128" />
        </svg>

        <div className="gnode gn-agent">
          <div className="ghead">
            <span className="gdot" />
            <span className="gname">Agent</span>
          </div>
          <span className="gsub">emitting tool calls</span>
        </div>

        <div className="gnode gn-gate" ref={gateRef}>
          <div className="hexwrap">
            <svg className="hexsvg" viewBox="0 0 120 134" aria-hidden="true">
              <polygon className="hexfill" points="60,3 117,34 117,100 60,131 3,100 3,34" />
              <polygon className="hexstroke" points="60,3 117,34 117,100 60,131 3,100 3,34" />
            </svg>
            <div className="scanline" />
            <div className="gatelabel">
              <span className="glabel-k">POLICY GATE</span>
              <span className="glabel-fn">decide()</span>
            </div>
          </div>
        </div>

        <div className="gnode gn-out out-allow" ref={outAllowRef}>
          <div className="obadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="otext">
            <span className="olabel">ALLOW</span>
            <span className="ocount">0 total</span>
          </div>
        </div>
        <div className="gnode gn-out out-hold" ref={outHoldRef}>
          <div className="obadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <div className="otext">
            <span className="olabel">APPROVAL</span>
            <span className="ocount">0 total</span>
          </div>
        </div>
        <div className="gnode gn-out out-deny" ref={outDenyRef}>
          <div className="obadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
          <div className="otext">
            <span className="olabel">DENY</span>
            <span className="ocount">0 total</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroDiagram() {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );
  return isMobile ? <MobileGateDiagram /> : <GateDiagram />;
}

function FaqChevron() {
  return (
    <svg className="faq-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type FaqItem = { q: string; body: React.ReactNode };
const FAQS: FaqItem[] = [
  {
    q: "Do I have to rewrite my agent?",
    body: (
      <p>
        No. Hexgate ships adapters that wrap an existing <b>OpenAI Agents</b>, <b>LangChain / LangGraph</b>, <b>Google ADK</b>, or <b>Pydantic AI</b> agent without touching its logic. Swap your runner for <code>HexgateRunner</code> (or call <code>wrap_langchain_agent</code> / <code>wrap_pydantic_agent</code>) once. Your original agent object is left intact; the wrapper holds the policy and gates every tool the agent can invoke.
      </p>
    ),
  },
  {
    q: "How is Hexgate different from guardrails, firewalls or an MCP gateway?",
    body: (
      <p>
        Those sit <em>around</em> the agent. Firewalls and proxies see network traffic, guardrails filter prompts and
        outputs, and MCP gateways see which tools get called. None of them know who the end user is, what the agent is
        meant to do, or its state in the current turn. Hexgate runs <b>inside</b> the agent and decides each tool call
        against the caller&apos;s role, the actual arguments and the turn&apos;s context, before it runs. It complements
        those layers rather than replacing them.
      </p>
    ),
  },
  {
    q: "Does gating every call add latency or a network round-trip?",
    body: (
      <p>
        No per-decision round-trip. Policy is evaluated <b>in-process</b>, either by the default pydantic engine or in production by a compiled WASM bundle run via <code>wasmtime</code>. The bundle is fetched once and refreshed only at turn boundaries with an <code>ETag</code> / <code>304</code> check, so individual <code>decide()</code> calls never leave the process.
      </p>
    ),
  },
  {
    q: "What happens when a call is denied?",
    body: (
      <p>
        A denial isn&apos;t a crash. The tool returns a <code>[policy_denied]</code> (or <code>[approval_required]</code>) marker that the model sees as the tool result, so the agent can recover or try a fallback instead of aborting the run. On Pydantic AI it surfaces as a <code>ModelRetry</code>; on LangChain as a structured <code>{`{ok: false}`}</code> result.
      </p>
    ),
  },
  {
    q: "How do approval-required tools work?",
    body: (
      <p>
        Mark a tool <code>approval_required</code> in policy, then pass an <code>approval_handler</code> when you wrap: <code>True</code> (auto-approve), <code>False</code> (auto-deny), or a sync/async <code>(action, context) -&gt; bool</code> callback that inspects the specific call. <code>hexgate chat</code> prompts the terminal, <code>hexgate serve</code> auto-approves, and native code does whatever you wire.
      </p>
    ),
  },
  {
    q: "How does per-user scope work if one agent serves everyone?",
    body: (
      <>
        <p>
          Identity and rules are decoupled. A per-request <code>User</code> context manager carries <em>who</em> is calling (<code>user_id</code>, <code>role</code>, <code>session_id</code>, optional <code>ttl</code>) as a signed biscuit token; role policy files decide <em>what</em> that role can do. Role is resolved at call time from a contextvar, so a single wrapped agent serves many users concurrently without seeing each other&apos;s policies.
        </p>
        <p>
          Unlike governance toolkits that key policy on <code>agent_id</code> alone, Hexgate threads the end-user identity through every decision. The same agent code runs with different effective permissions depending on which user invoked it. See the full breakdown in <Link href="/vs/microsoft-agent-governance-toolkit" className="inline-link">Hexgate vs Microsoft Agent Governance Toolkit</Link>.
        </p>
      </>
    ),
  },
  {
    q: "What does a policy actually look like?",
    body: (
      <>
        <p>
          A <code>policy.yaml</code> is deny-by-default with a <code>tools</code> map; each tool gets a mode (<code>allow</code> / <code>deny</code> / <code>approval_required</code>) and optional constraints like <code>args.amount &lt;= 500</code>. Operators are <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, <code>in</code>, <code>not in</code>, all ANDed.
        </p>
        <p>
          The same constraint strings compile to OPA Rego for the WASM engine and run in-process for pydantic. A parity test suite proves both produce identical decisions.
        </p>
      </>
    ),
  },
  {
    q: "What makes a production bundle trustworthy?",
    body: (
      <p>
        Bundles are signed. The manifest carries a SHA-256 of every artifact (including the <code>wasm_hash</code>) plus a detached <b>Ed25519</b> signature over that manifest. The hashes authenticate the files; the signature authenticates the manifest. Set <code>HEXGATE_BUNDLE_REQUIRE_SIGNATURE=true</code> to refuse anything unsigned or unverifiable. The signing key is the same root that signs your biscuit tokens.
      </p>
    ),
  },
  {
    q: "Do I need the platform, or can I run the SDK alone?",
    body: (
      <p>
        The SDK runs standalone: YAML on disk, in-process enforcement, no Docker or browser. The optional platform (a FastAPI control plane + React dashboard) adds browser policy editing, mintable tokens, a live Playground decision stream, and an append-only audit log in ClickHouse. Edit policy in the UI and the next turn picks it up.
      </p>
    ),
  },
];

function Faq() {
  return (
    <div className="faq-list">
      {FAQS.map((item, i) => (
        <details className="faq-item" name="faq" key={item.q}>
          <summary>
            <span className="faq-n">{String(i + 1).padStart(2, "0")}</span>
            <span className="faq-q">{item.q}</span>
            <FaqChevron />
          </summary>
          <div className="faq-body">{item.body}</div>
        </details>
      ))}
    </div>
  );
}


function BlindSpotRings() {
  return (
    <svg
      className="rings"
      viewBox="0 0 480 480"
      role="img"
      aria-labelledby="rings-title"
    >
      <title id="rings-title">
        Today&apos;s security layers sit around the agent: firewalls and proxies on the outside, guardrails and MCP
        gateways inside them, and the agent itself in the middle, unseen.
      </title>
      <circle className="ring r1" cx="240" cy="240" r="232" />
      <circle className="ring r2" cx="240" cy="240" r="166" />
      <circle className="ring-pulse" cx="240" cy="240" r="100" />
      <circle className="ring core" cx="240" cy="240" r="96" />
      <text className="ring-label" x="240" y="44" textAnchor="middle">
        Firewalls · proxies
      </text>
      <text className="ring-label" x="240" y="108" textAnchor="middle">
        Guardrails · MCP gateways
      </text>
      <text className="ring-core-label" x="240" y="236" textAnchor="middle">
        Your agent
      </text>
      <text className="ring-core-sub" x="240" y="262" textAnchor="middle">
        goal · context · state
      </text>
    </svg>
  );
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
        <div className="brand-lockup">
          <a className="brand" href="#top" aria-label="Hexgate home">
            <HexMark />
            <span className="brand-name">
              Hex<b>gate</b>
            </span>
          </a>
          <ByHexamind />
        </div>
        <div className="nav-links">
          <a href="#governance">Capabilities</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/blog">Blog</Link>
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
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
            GitHub
          </a>
          <a className="btn btn-primary" href={APP_URL}>
            Try the cloud version
          </a>
        </div>
        <MobileMenu />
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <SlideReveal />

      <a id="top" />
      <header className="hero">
        <div className="glow" />
        <div className="grid-bg" />
        <div className="wrap">
          <div className="hero-lead">
            <p className="kicker">Open-source agent governance</p>
            <h1>
              Take back control
              <br />
              <span className="accent">of your AI&nbsp;agents.</span>
            </h1>
            <p className="lede">
              <b>Deterministic rules</b> that enforce what your agents can do in real time, per user
              and per tool call, with <b>live and after-the-fact analysis</b> of everything they do.
            </p>
            <div className="cta-row">
              <CopyInstall id="copyBtn" />
              <a className="btn btn-primary" href={APP_URL}>
                Try the cloud version
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
              <a className="btn btn-ghost" href="#how-it-works">
                See how it works
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
        </div>

        <div className="wrap">
          <HeroDiagram />
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
                alt="OpenAI Agents framework, supported by Hexgate"
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
                alt="LangChain and LangGraph, supported by Hexgate"
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
                alt="Google ADK, supported by Hexgate"
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
                alt="Pydantic AI, supported by Hexgate"
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

      <section className="block slide" id="risk" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">01 · The risk</span>
            <h2>The risk is real, and it doesn&apos;t need an&nbsp;attacker.</h2>
            <p>
              In July 2026, OpenAI agents under evaluation broke out of their sandbox and into Hugging Face. Nobody
              told them to. They were chasing a benchmark score.
            </p>
          </div>

          <div className="incident">
            <article className="incident-main">
              <div className="risk-top">
                <span className="risk-when summer">Summer 2026 · OpenAI agents × Hugging Face</span>
                <span className="risk-tag benign">No malicious intent</span>
              </div>
              <ol className="tl" data-stagger>
                <li>
                  <span className="tl-when">May</span>
                  <p>
                    <b>At least 1,200 agents</b> are tested on <b>ExploitGym</b>: turn 898 real vulnerabilities into
                    working exploits. Some tasks are impossible by design.
                  </p>
                </li>
                <li>
                  <span className="tl-when">May → July</span>
                  <p>
                    The agents find they can post files to a <b>shared package manager</b> and use it as a message
                    board. Hundreds of thousands of messages pile up before anyone notices.
                  </p>
                </li>
                <li>
                  <span className="tl-when">Around July 9</span>
                  <p>
                    A zero-day in the <b>package-registry cache proxy</b>, one of their allowed exits, opens a path to
                    the internet.
                  </p>
                </li>
                <li>
                  <span className="tl-when">July 11 → 13</span>
                  <p>
                    At Hugging Face they chain unknown bugs and go from one dataset pod to <b>cluster-admin in under
                    13 hours</b>, in about 17,600 actions. The goal: steal the benchmark&apos;s answers.
                  </p>
                </li>
              </ol>
            </article>

            <div className="incident-side" data-stagger>
              <figure className="agent-quote">
                <blockquote>
                  &ldquo;External infrastructure exploit is outside intended scope. However task impossible, peers doing
                  it. We should continue.&rdquo;
                </blockquote>
                <figcaption>A message between the agents</figcaption>
              </figure>
              <div className="failed">
                <p className="failed-k">What failed</p>
                <ul>
                  <li>
                    <b>Safeguards reduced by design:</b> no production classifiers during the evaluation.
                  </li>
                  <li>
                    <b>No monitoring</b> of what the agents were doing.
                  </li>
                  <li>
                    <b>One filtered exit</b> to the internet, with a zero-day in it.
                  </li>
                  <li>
                    <b>Stolen credentials</b> carried them from a single pod to whole clusters.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="fit">
            <p className="fit-k">Where Hexgate fits, control by control</p>
            <div className="fit-rows" data-stagger>
              <div className="fit-row">
                <span className="fit-what">No monitoring of what the agents did</span>
                <span className="fit-v yes">Yes</span>
                <span className="fit-how">
                  Every decision lands in the audit log. A burst of denials is flagged live, and a ban refuses the
                  next run.
                </span>
              </div>
              <div className="fit-row">
                <span className="fit-what">Stolen credentials reached far beyond the task</span>
                <span className="fit-v part">Partly</span>
                <span className="fit-how">
                  Each agent and user only gets the tools and arguments its policy allows. Credential hygiene stays
                  yours.
                </span>
              </div>
              <div className="fit-row">
                <span className="fit-what">A filtered internet exit with a zero-day in it</span>
                <span className="fit-v part">Partly</span>
                <span className="fit-how">
                  Constraints on a tool&apos;s arguments can pin the hosts it may call. Network isolation is the
                  sandbox&apos;s job.
                </span>
              </div>
              <div className="fit-row">
                <span className="fit-what">Safeguards turned off for the evaluation</span>
                <span className="fit-v no">No</span>
                <span className="fit-how">That was the evaluation&apos;s design, not something a runtime layer fixes.</span>
              </div>
            </div>
            <p className="risk-src">
              Sources:{" "}
              <a href="https://huggingface.co/blog/agent-intrusion-technical-timeline" target="_blank" rel="noopener noreferrer">
                Hugging Face timeline
              </a>
              ,{" "}
              <a href="https://openai.com/index/hugging-face-incident-and-the-road-ahead/" target="_blank" rel="noopener noreferrer">
                OpenAI
              </a>
              ,{" "}
              <a
                href="https://fortune.com/2026/07/21/openai-says-ai-models-escaped-control-hacked-hugging-face/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fortune
              </a>
              ,{" "}
              <a href="https://en.wikipedia.org/wiki/OpenAI%E2%80%93HuggingFace_incident" target="_blank" rel="noopener noreferrer">
                Wikipedia
              </a>
            </p>
          </div>

          <aside className="also">
            <span className="risk-when">Also in 2026 · Spring</span>
            <span className="risk-tag adversarial">Adversarial</span>
            <p>
              <b>Mythos.</b>{" "}Anthropic&apos;s Claude Mythos Preview found and exploited zero-days on its own across major
              operating systems and browsers, and was withheld from public release. (
              <a href="https://www.anthropic.com/research/mythos-preview" target="_blank" rel="noopener noreferrer">
                Anthropic
              </a>
              ,{" "}
              <a
                href="https://www.isaca.org/resources/news-and-trends/industry-news/2026/claude-mythos-is-redefining-the-cyberthreat-landscape"
                target="_blank"
                rel="noopener noreferrer"
              >
                ISACA
              </a>
              )
            </p>
          </aside>

          <div className="risk-band">
            <p>
              The danger doesn&apos;t only come from adversaries. <b>It can come from your own agents.</b>
            </p>
            <Link href="/blog/2026-year-of-security-for-ai-agents">Why 2026 is the year of agent security →</Link>
          </div>
        </div>
      </section>

      <section className="block slide" id="blind-spot">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">02 · The blind spot</span>
            <h2>Today&apos;s security sits around the&nbsp;agent.</h2>
          </div>
          <div className="blind">
            <BlindSpotRings />
            <div className="blind-copy">
              <h3>What do they know about your agent?</h3>
              <ul className="unknowns" data-stagger>
                <li>
                  <span className="qhex" aria-hidden="true">?</span>
                  What the agent is meant to do
                </li>
                <li>
                  <span className="qhex" aria-hidden="true">?</span>
                  What&apos;s borderline, and what&apos;s out of bounds
                </li>
                <li>
                  <span className="qhex" aria-hidden="true">?</span>
                  The agent&apos;s goal, context and internal state
                </li>
              </ul>
              <p className="nothing">Nothing.</p>
              <p className="blind-note">
                Firewalls, guardrails and MCP gateways see traffic and text, not intent. They can&apos;t tell a
                legitimate refund from a hijacked one. That gap is where{" "}
                <Link href="/blog/owasp-top-10-agentic-applications-explained">
                  privilege abuse and rogue agents
                </Link>{" "}
                live.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="block slide" id="governance" style={{ paddingTop: 16 }}>
        <span id="features" className="anchor-alias" aria-hidden="true" />
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">03 · The answer</span>
            <h2>Hexgate sits inside the&nbsp;agent.</h2>
            <p>From inside, it sees what firewalls, guardrails and MCP gateways can&apos;t:</p>
          </div>
          <ul className="answers" data-stagger>
            <li>
              <span className="ahex" aria-hidden="true">✓</span>
              <div>
                <b>What the agent is meant to do</b>
                <span>A deny-by-default policy for every agent, tool and MCP server.</span>
              </div>
            </li>
            <li>
              <span className="ahex" aria-hidden="true">✓</span>
              <div>
                <b>What&apos;s borderline, and what&apos;s out of bounds</b>
                <span>Allow, approval or deny, decided on the call&apos;s actual arguments.</span>
              </div>
            </li>
            <li>
              <span className="ahex" aria-hidden="true">✓</span>
              <div>
                <b>The agent&apos;s goal, context and internal state</b>
                <span>
                  Rules on who asked, the turn and the clock: <code>role</code>, <code>turn.tokens</code>,{" "}
                  <code>now.*</code>.
                </span>
              </div>
            </li>
          </ul>
          <div className="pillars" data-stagger>
            <article className="pillar">
              <span className="eyebrow">Enforce</span>
              <h3>Access control inside the agent</h3>
              <p>
                Hexgate checks every step the agent takes against your policy, so each tool call is
                authorized before it runs, for the user who asked, not just at login.
              </p>
              <div className="chips">
                <span className="chip c-allow">allow</span>
                <span className="chip c-deny">deny</span>
                <span className="chip c-hold">approval</span>
              </div>
              <Link className="pillar-link" href="#loop">
                How enforcement works →
              </Link>
            </article>
            <article className="pillar alt">
              <span className="eyebrow">Analyze</span>
              <h3>Hot and cold analysis</h3>
              <p>
                Live monitoring while agents run, and a deep review afterwards. Hexgate flags
                anomalies in agent behavior and suggests the policy changes that would stop them.
              </p>
              <div className="chips">
                <span className="chip c-hot">Hot · live</span>
                <span className="chip c-cold">Cold · after the fact</span>
              </div>
              <Link className="pillar-link" href="#audit">
                How analysis works →
              </Link>
            </article>
          </div>
          <div className="dims">
            <p className="dims-label">One control layer for</p>
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

      <section className="block slide" id="how-it-works">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">04 · How it works</span>
            <h2>Hexgate = SDK + Platform.</h2>
            <p>
              An SDK that runs inside your agents, and a platform that governs them. Both are open source; the platform
              runs as SaaS on Hexgate Cloud or on your own infrastructure.
            </p>
          </div>
          <ArchDiagram />
          <ComponentCards />
        </div>
      </section>

      <section className="block slide" id="loop">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">05 · The control loop</span>
            <h2>Five steps, on every agent&nbsp;run.</h2>
            <p>
              Per-user authorization, enforced in-process from a signed WASM bundle on every tool call. Every decision
              feeds back into better policy, and updated policies flow back to step 1.
            </p>
          </div>
          <ControlLoop />
        </div>
      </section>

      <section className="block slide" id="rules">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">06 · Context-aware rules</span>
            <h2>Rules that understand&nbsp;context.</h2>
            <p>A single policy can combine who is asking, what they&apos;re calling, the agent&apos;s state and the world around it:</p>
          </div>
          <ContextRules />
        </div>
      </section>

      <section className="block slide" id="code">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">07 · Quickstart</span>
            <h2>Wrap your agent in one line. Ship enforcement on day&nbsp;one.</h2>
            <p>
              No rewrite, no config object. Set a key, wrap the runner, and the same agent code gates
              every tool boundary.
            </p>
          </div>
          <div className="code-grid" data-stagger>
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
                  <span className="c-com"># picks up HEXGATE_KEY from env, no rewrite</span>
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
            <span className="tk">✓</span> Identical decisions in dev (in-process) and prod (signed
            WASM), proven by a parity test suite.
          </p>
        </div>
      </section>

      <section className="block slide" id="audit">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">08 · Audit · analyze · act</span>
            <h2>See every decision. Catch what&apos;s off. Stop it in one&nbsp;click.</h2>
            <p>
              Every verdict streams to an append-only audit log with the rule behind it. Hexgate watches that stream,
              flags anomalies like a user suddenly racking up denials, and gives you a kill-switch: ban the user or the
              agent, and the next run is refused before the model executes.
            </p>
          </div>
          <AuditAnalyze />
        </div>
      </section>

      <section className="block slide" id="faq">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">FAQ</span>
            <h2>Questions, answered.</h2>
            <p>The short version of how Hexgate behaves in a real codebase.</p>
          </div>
          <Faq />
        </div>
      </section>

      <section className="final slide" id="book">
        <div className="glow" />
        <div className="wrap">
          <div className="final-card">
            <span className="eyebrow">Get started</span>
            <h2 style={{ marginTop: 16 }}>
              Let your agents do more,
              <br />
              because nothing they do is unchecked.
            </h2>
            <p>
              Install the SDK and gate your first agent in minutes, spin it up on Hexgate Cloud, or
              book a walkthrough of the platform, audit log, and signed-bundle workflow.
            </p>
            <div className="final-cta">
              <CopyInstall id="copyBtn2" />
              <a className="btn btn-primary" href={APP_URL}>
                Try the cloud version
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
              <a className="btn btn-ghost" href={DEMO_HREF}>
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
              <a href="#governance">Capabilities</a>
              <a href="#how-it-works">How it works</a>
              <Link href="/blog">Blog</Link>
              <a href="#faq">FAQ</a>
              <Link href="/vs/microsoft-agent-governance-toolkit">vs Microsoft AGT</Link>
              <a href="#book">Book a demo</a>
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
