"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
 * Audit → Analyze → Act, as one scripted loop that mirrors the platform:
 * decisions stream into the audit log, a user's deny burst shows up on the
 * decisions chart and gets flagged as an anomaly, an admin bans the user, and
 * the next run is refused before the model executes.
 *
 * Everything is a pure function of `tick`, so the server render and the first
 * client render match, and reduced-motion users get one static frame.
 */

type Verdict = "allow" | "deny" | "hold" | "ban";
type Ev = { user: string; tool: string; args: string; verdict: Verdict; reason?: string };

const CYCLE = 26;
const WINDOW = 24;
const ROWS = 5;
const SUSPECT = "u_8842";

const NORMAL: Ev[] = [
  { user: "alice", tool: "web_search", args: '"Q3 refund policy"', verdict: "allow" },
  { user: "bob", tool: "refund_order", args: "amount=200", verdict: "allow" },
  { user: "u_1207", tool: "read_file", args: '"policy.yaml"', verdict: "allow" },
  { user: "alice", tool: "refund_order", args: "amount=600", verdict: "deny", reason: "args.amount <= 500" },
  { user: "dana", tool: "wire_transfer", args: "amount=50000", verdict: "hold", reason: "awaiting human approval" },
  { user: "bob", tool: "issue_credit", args: "amount=25", verdict: "allow" },
  { user: "u_1207", tool: "send_email", args: 'to="ops@acme.com"', verdict: "allow" },
];

const BURST: Ev[] = [
  { user: SUSPECT, tool: "export_pii", args: '"customers"', verdict: "deny", reason: "not allowed for role support" },
  { user: SUSPECT, tool: "delete_user", args: '"u_0001"', verdict: "deny", reason: "not allowed for role support" },
  { user: SUSPECT, tool: "refund_order", args: "amount=5000", verdict: "deny", reason: "args.amount <= 500" },
  { user: SUSPECT, tool: "read_file", args: '"prod.env"', verdict: "deny", reason: "default_policy: deny" },
  { user: SUSPECT, tool: "send_email", args: 'to="x@evil.io"', verdict: "deny", reason: 'endswith(to, "@acme.com")' },
];

const REFUSED: Ev = { user: SUSPECT, tool: "agent.run", args: "…", verdict: "ban", reason: "user banned · refused before the model ran" };

const LABEL: Record<Verdict, string> = { allow: "ALLOW", deny: "DENY", hold: "APPROVAL", ban: "BANNED" };
const CLS: Record<Verdict, string> = { allow: "v-allow", deny: "v-deny", hold: "v-hold", ban: "v-ban" };

const hash = (t: number) => ((t * 2654435761) >>> 0) % 997;
const phase = (t: number) => ((t % CYCLE) + CYCLE) % CYCLE;
const isBurst = (t: number) => phase(t) >= 10 && phase(t) <= 14;

function eventAt(t: number): Ev {
  const p = phase(t);
  if (isBurst(t)) return BURST[p - 10];
  if (p === 18) return REFUSED;
  return NORMAL[((t % NORMAL.length) + NORMAL.length) % NORMAL.length];
}

function pointsAt(t: number) {
  const p = phase(t);
  const allow = 6 + (hash(t) % 4);
  const deny = isBurst(t) ? [5, 8, 11, 9, 6][p - 10] : 1 + (hash(t + 7) % 2);
  return { allow, deny };
}

// Chart geometry (SVG user units).
const W = 520;
const H = 150;
const PAD_T = 26;
const PAD_B = 6;
const Y_MAX = 14;
const x = (i: number) => (i * W) / (WINDOW - 1);
const y = (v: number) => H - PAD_B - (v / Y_MAX) * (H - PAD_T - PAD_B);

function paths(vals: number[]) {
  const line = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(vals.length - 1).toFixed(1)} ${H} L0 ${H} Z`;
  return { line, area };
}

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduce = () => window.matchMedia(REDUCE_QUERY).matches;
const getReduceServer = () => false;

// One representative frame for reduced motion: burst on the chart, anomaly flagged, user banned.
const STATIC_TICK = CYCLE * 4 + 19;

export function AuditAnalyze() {
  const [liveTick, setTick] = useState(CYCLE * 4 + 7);
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, getReduceServer);
  const tick = reduce ? STATIC_TICK : liveTick;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduce) return;
    let id: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && id === undefined) {
          id = window.setInterval(() => setTick((t) => t + 1), 1500);
        } else if (!entry.isIntersecting && id !== undefined) {
          window.clearInterval(id);
          id = undefined;
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (id !== undefined) window.clearInterval(id);
    };
  }, [reduce]);

  const p = phase(tick);
  const cycleStart = tick - p;
  const flagged = p >= 15;
  const banned = p >= 17;

  // Feed: newest last.
  const rows = Array.from({ length: ROWS }, (_, k) => tick - (ROWS - 1 - k)).map((t) => ({ t, ev: eventAt(t) }));

  // Chart window.
  const ticks = Array.from({ length: WINDOW }, (_, i) => tick - (WINDOW - 1 - i));
  const pts = ticks.map(pointsAt);
  const allow = paths(pts.map((q) => q.allow));
  const deny = paths(pts.map((q) => q.deny));

  // Anomaly marker at the burst peak, shown while the anomaly is flagged.
  const markerLive = flagged;
  const peakIdx = markerLive ? ticks.indexOf(cycleStart + 12) : -1;

  const total = pts.reduce((s, q) => s + q.allow + q.deny, 0);
  const denied = pts.reduce((s, q) => s + q.deny, 0);

  return (
    <div className="aa" ref={rootRef} data-stagger>
      <div className="console aa-feed" aria-label="Live policy decision stream">
        <div className="console-top">
          <div className="dots">
            <i />
            <i />
            <i />
          </div>
          <span className="fn">
            <b>audit</b> · decisions
          </span>
          <span className="live">
            <span className="blink" /> live
          </span>
        </div>
        <div className="feed" aria-live="off">
          {rows.map(({ t, ev }) => (
            <div className={`row${t === tick ? " row-new" : ""}${ev.verdict === "ban" ? " row-ban" : ""}`} key={t}>
              <span className={`role${ev.user === SUSPECT ? " suspect" : ""}`}>{ev.user}</span>
              <span className="call">
                <span className="tool">{ev.tool}</span>
                <span className="args">({ev.args})</span>
                {ev.reason ? <span className="reason">↳ {ev.reason}</span> : null}
              </span>
              <span className={`verdict ${CLS[ev.verdict]}`}>
                <span className="vd" />
                {LABEL[ev.verdict]}
              </span>
            </div>
          ))}
        </div>
        <div className="console-bottom">
          <span className="aa-step">1 · Audit</span>
          every decision lands in the append-only log, with the rule behind it
        </div>
      </div>

      <div className="aa-side">
        <div className="aa-panel">
          <div className="aa-panel-top">
            <span className="aa-step">2 · Analyze</span>
            <span className="aa-kpis">
              <span>
                <b>{total}</b> decisions
              </span>
              <span>
                <b className="k-deny">{Math.round((denied / total) * 100)}%</b> denied
              </span>
              <span>
                <b className={markerLive ? "k-anom" : ""}>{markerLive ? 1 : 0}</b> anomaly
              </span>
            </span>
          </div>
          <div className="aa-chart-wrap">
          <svg className="aa-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
              <line x1="0" y1={y(4)} x2={W} y2={y(4)} />
              <line x1="0" y1={y(8)} x2={W} y2={y(8)} />
              <line x1="0" y1={y(12)} x2={W} y2={y(12)} />
            </g>
            <path d={allow.area} fill="rgba(45,212,167,0.12)" />
            <path d={allow.line} fill="none" stroke="#2dd4a7" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
            <path d={deny.area} fill="rgba(244,86,107,0.16)" />
            <path d={deny.line} fill="none" stroke="#f4566b" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
            {peakIdx >= 0 ? (
              <g className={`aa-marker${markerLive ? " live" : ""}`}>
                <line
                  x1={x(peakIdx)}
                  x2={x(peakIdx)}
                  y1={PAD_T - 8}
                  y2={H}
                  stroke="#f4566b"
                  strokeWidth="1.4"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ) : null}
          </svg>
          {peakIdx >= 0 ? (
            <span
              className={`aa-x${markerLive ? " live" : ""}`}
              style={{ left: `${(x(peakIdx) / W) * 100}%` }}
              aria-hidden="true"
            >
              ✕
            </span>
          ) : null}
          </div>
          <div className="aa-legend">
            <span>
              <i style={{ background: "#2dd4a7" }} /> allow
            </span>
            <span>
              <i style={{ background: "#f4566b" }} /> deny
            </span>
            <span className="aa-legend-x">
              <b>✕</b> anomaly detected
            </span>
          </div>
        </div>

        <div className={`aa-panel aa-act${flagged ? " on" : ""}`} aria-live="polite">
          <div className="aa-panel-top">
            <span className="aa-step">3 · Act</span>
            <span className="aa-act-state">{flagged ? (banned ? "kill-switch engaged" : "anomaly flagged") : "watching"}</span>
          </div>
          {flagged ? (
            <div className="aa-anom">
              <span className="aa-sev">High</span>
              <span className="aa-user">{SUSPECT}</span>
              <span className="aa-num">
                <b>9</b> / 11 denied · 82%
              </span>
              <span className={`aa-ban${banned ? " done" : ""}`}>{banned ? "Banned ✓" : "Ban user"}</span>
            </div>
          ) : (
            <p className="aa-idle">No anomalies. Deny rates are within each user&apos;s usual range.</p>
          )}
          <p className="aa-note">
            {banned
              ? `${SUSPECT} is blocked on every agent. The next run is refused before the model executes.`
              : "A burst of denies from one user gets flagged with its severity. Ban the user or the agent in one click."}
          </p>
        </div>
      </div>
    </div>
  );
}
