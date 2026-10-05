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
          <b>Checks each step</b> in-process, with no network round-trip
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
            Policy editor
            <small>roles, rules, signed bundles</small>
          </div>
          <div className="arch-cell">
            Audit &amp; anomalies
            <small>every decision, live and after</small>
          </div>
        </div>
        <span className="arch-note">
          <b>SaaS or on-premise</b>: Hexgate Cloud or your own infrastructure
        </span>
      </div>
    </div>
  );
}

/** The two halves of the product, each paired with what it does for you. */
export function ComponentCards() {
  return (
    <div className="pillars" data-stagger>
      <article className="pillar">
        <span className="eyebrow">Hexgate SDK · Enforce</span>
        <h3>Access control inside the agent</h3>
        <p>
          The SDK wraps your agent and checks each tool call against your policy before it runs, using the identity
          of the user who asked. Your agent code stays as it is.
        </p>
        <div className="chips">
          <span className="chip c-allow">allow</span>
          <span className="chip c-deny">deny</span>
          <span className="chip c-hold">approval</span>
        </div>
        <p className="pillar-meta">Works with OpenAI Agents SDK · LangChain · Google ADK · Pydantic AI</p>
        <div className="pillar-links">
          <a className="pillar-link" href="#loop">
            How enforcement works →
          </a>
          <a className="pillar-link quiet" href="https://pypi.org/project/hexgate/" target="_blank" rel="noopener">
            pypi.org/project/hexgate
          </a>
        </div>
      </article>
      <article className="pillar alt">
        <span className="eyebrow">Hexgate Platform · Analyze</span>
        <h3>Hot and cold analysis</h3>
        <p>
          The platform is where you write policies, watch agents while they run and go back over what they did. It
          flags unusual behavior and suggests policy changes to stop it.
        </p>
        <div className="chips">
          <span className="chip c-hot">Hot · live</span>
          <span className="chip c-cold">Cold · after the fact</span>
        </div>
        <p className="pillar-meta">Open source · SaaS on Hexgate Cloud or on-premise</p>
        <div className="pillar-links">
          <a className="pillar-link" href="#audit">
            How analysis works →
          </a>
          <a
            className="pillar-link quiet"
            href="https://github.com/HexamindOrganisation/hexgate"
            target="_blank"
            rel="noopener"
          >
            github.com/HexamindOrganisation/hexgate
          </a>
        </div>
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
