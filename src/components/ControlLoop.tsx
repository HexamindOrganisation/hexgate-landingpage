// The five-step control loop on the home page's "How it works" chapter.

const LOOP = [
  { n: "01 / DEFINE", title: "Define", body: "You write deterministic rules for each agent, MCP server or tool.", tag: "PLATFORM" },
  { n: "02 / FETCH", title: "Fetch", body: "The SDK pulls the signed policy bundle that applies to the agent at runtime.", tag: "SDK" },
  {
    n: "03 / ENFORCE",
    title: "Enforce",
    body: "Each step the agent takes is checked in-process, before any tool call goes out.",
    tag: "SDK · HOT",
  },
  { n: "04 / REPORT", title: "Report", body: "Every decision (allowed, denied, held, and why) goes back to the platform.", tag: "SDK → PLATFORM" },
  { n: "05 / IMPROVE", title: "Improve", body: "The platform flags anomalies and suggests how to change your policies.", tag: "PLATFORM · COLD" },
];

export function ControlLoop() {
  return (
    <ol className="steps five" data-stagger>
      {LOOP.map((s) => (
        <li className="step" key={s.n}>
          <div className="n">{s.n}</div>
          <h4>{s.title}</h4>
          <p>{s.body}</p>
          <span className="step-tag">{s.tag}</span>
        </li>
      ))}
    </ol>
  );
}
