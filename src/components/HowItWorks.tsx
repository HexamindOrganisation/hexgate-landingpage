// Building blocks for the "How it works" chapter of the home page:
// the SDK ↔ Platform architecture, the two component cards and the
// context-aware rules example.

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

export function ArchDiagram() {
  return (
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
  );
}

export function ComponentCards() {
  return (
    <div className="features" data-stagger>
      <article className="feat">
        <span className="eyebrow">The Hexgate SDK · inside your agent</span>
        <p style={{ marginTop: 14 }}>
          The SDK wraps your agent and your application logic. It fetches policies from the platform,
          enforces them on every step and reports each decision back. You keep your agent code as it is.
        </p>
        <p className="feat-meta">Compatible with OpenAI Agents SDK · LangChain · Google ADK · Pydantic AI</p>
        <a className="feat-link" href="https://pypi.org/project/hexgate/" target="_blank" rel="noopener">
          pypi.org/project/hexgate →
        </a>
      </article>
      <article className="feat">
        <span className="eyebrow">The Hexgate platform · your control center</span>
        <p style={{ marginTop: 14 }}>
          The platform is where you define policies, watch agents live and analyze their behavior over
          time. It runs as SaaS or on-premise.
        </p>
        <p className="feat-meta">Open source · self-host or managed</p>
        <a className="feat-link" href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
          github.com/HexamindOrganisation/hexgate →
        </a>
      </article>
    </div>
  );
}

export function ContextRules() {
  return (
    <div className="code-grid rules">
      <div className="ctx-list" data-stagger>
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
  );
}
