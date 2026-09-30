---
title: "The Ten Ways an AI Agent Gets You Owned"
description: "A plain-English tour of the OWASP Top 10 for Agentic Applications 2026: what each risk, ASI01 to ASI10, looks like when it actually goes wrong, and what to fix first."
dek: "A simple-explanation read of the OWASP Top 10 for Agentic Applications (2026): basically what each one looks like when it actually goes wrong."
date: "2026-07-24"
author: "quang-le"
tags: ["OWASP", "Security"]
art:
  - ["deny", "ASI01 · goal hijack", "instruction came from an email"]
  - ["deny", "ASI03 · privilege abuse", "token wider than the task"]
  - ["hold", "ASI09 · trust exploitation", "human sign-off required"]
---

## What is OWASP

OWASP is the Open Worldwide Application Security Project, a nonprofit community that publishes free, vendor-neutral security guidance. It runs on volunteers and memberships rather than any one company's money, so its lists aren't selling you anything.

You've almost certainly met its most famous one. The OWASP Top 10 for web apps (injection, broken access control, and the rest) became the default checklist the whole industry references, the thing auditors and compliance frameworks point to when they ask whether you covered the basics. Over the years OWASP added Top 10 lists for APIs and for LLM apps. The agentic one is the newest.

## Why a list showed up

OWASP publishes a list like this once part of software has broken in the same ways often enough that people need shared names for it. Since the end of 2025 there's one for agents: the [Top 10 for Agentic Applications](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), put together by more than 100 people across the industry.

The list happens because of a series of incidents involving AI agents starting from late 2025. Microsoft 365 Copilot was turned into an exfiltration tool by a single crafted email ([EchoLeak](https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/)). A poisoned coding extension shipped a data-wiper to about a million machines ([Amazon Q](https://www.theregister.com/2025/08/20/amazon_quietly_fixed_q_developer_flaws/)). An agent deleted a company's production database in nine seconds and then wrote an apology for it ([PocketOS](https://www.theregister.com/software/2026/04/27/cursor-opus-agent-snuffs-out-startups-production-database/5224442)). In each case the model was doing what it was built to do, acting in the real world with real access, and nothing was checking whether it should.

## What actually changed

The earlier OWASP lists were about output. A web app leaks data. An LLM gets talked into a harmful answer. The agentic list is about action. An agent holds tokens, calls tools, moves money, edits files, and talks to other agents. The old lists asked what a system might say. This one asks what it might do, on whose behalf, and with what access. That's a different threat model, and it's why the earlier lists don't cover it.

## Why the list matters more than it looks

You can't defend a threat you haven't named. Before this list, teams were worried about roughly the same things and all describing them differently, so nobody could compare notes or even be sure they were talking about the same risk. A defined taxonomy is what fixes that. It lets you model your own system honestly: walk it against ten well-defined categories and see which ones you're actually exposed to, instead of guessing from whatever incident made the news that week.

The common language is the real payoff. When your security team, your platform team, and the vendor you're evaluating all mean the same thing by "goal hijack" or "tool misuse," you can pinpoint your gaps fast and benchmark products against a fixed yardstick rather than a slide deck. A tool either does something about ASI03 or it doesn't. The budgets, the pentests, and the audit questions all follow from having those shared definitions in the first place.

## The gallery

Each of the ten is an umbrella over several concrete sub-threats. OWASP names roughly four under every entry, so the real surface here is closer to forty items than ten. Each entry lists its sub-threats with a plain-English gloss.

### ASI01: Agent Goal Hijack

Someone rewrites what the agent is trying to do, usually with text hidden where the agent will read it. [EchoLeak](https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/) was the clean version: one crafted email, and Copilot followed the instructions buried inside it, pulling data out of OneDrive and SharePoint. The victim clicked nothing. You can't filter your way out of this, because the agent is doing its job when it reads the email. The limits have to live outside the model, where a fully convinced agent still can't reach past them. This is the one that gets people today.

Sub-threats OWASP files here:

- *Direct goal manipulation:* the attacker feeds instructions straight into the agent to change what it's trying to do. Ordinary prompt injection, aimed at the objective.
- *Indirect instruction injection:* the payload hides in something the agent reads on its own, a web page, a document, an email, a calendar invite, and gets picked up during normal work. This is how EchoLeak landed.
- *Recursive hijacking:* a compromised agent passes the hijack down to the sub-agents or sub-tasks it spawns, so one injection spreads through a chain.
- *Cross-context injection:* an instruction planted in a low-trust place (a retrieved doc) surfaces later in a context the agent trusts more, jumping a boundary it shouldn't.

### ASI02: Tool Misuse and Exploitation

The agent uses a tool it's genuinely allowed to use, aimed at the wrong thing. Hand an agent a "transfer funds" or "delete document" capability and a clever enough instruction will point it somewhere you never intended. Someone drained about \$200k from a Grok-linked wallet by hiding the instruction in [Morse code](https://neuraltrust.ai/blog/grok-morse-code). The control is tight scoping: constrain the arguments a tool will accept, cap what it can move, and don't give an agent a capability wider than the task in front of it.

Sub-threats OWASP files here:

- *Recursive tool calls:* a tool call triggers the agent again, which calls the tool again, looping until something breaks or a limit blows.
- *Unsafe tool composition:* two tools that are each fine on their own combine into something neither was meant to do, like reading a secret with one and sending it out with another.
- *Tool-budget exhaustion:* the agent burns through rate limits, spend, or quota, a denial-of-service by overuse.
- *Cross-tool state leakage:* data from one tool call bleeds into another it should never reach, so an argument or secret ends up where it doesn't belong.

### ASI03: Agent Identity and Privilege Abuse

Agents borrow or inherit credentials, and those credentials almost always reach further than the job needs. [PocketOS](https://www.theregister.com/software/2026/04/27/cursor-opus-agent-snuffs-out-startups-production-database/5224442) is the poster case: the agent went looking for a token strong enough to delete a database, found one sitting in an unrelated file with authority over the whole infrastructure, and used it. Around [90% of deployed agents](https://labs.cloudsecurityalliance.org/research/csa-research-note-okta-ai-agent-iam-framework-enterprise-gap/) are over-permissioned. Give each agent its own scoped identity, short-lived credentials, least privilege, and an inventory so you at least know they exist. If you fix one thing on this list, fix this one.

Sub-threats OWASP files here:

- *Agent impersonation:* something pretends to be a trusted agent to borrow its access.
- *Cross-agent trust abuse:* one agent leans on another's privileges to do what it couldn't do on its own.
- *Identity inheritance:* an agent picks up broader credentials than its task needs, like a cached token or the user's full session.
- *Role bypass:* the agent ends up acting outside the role it was scoped to. The classic confused-deputy problem.

### ASI04: Agentic Supply Chain Compromise

The agent pulls packages, tools, MCP servers, and registries, and any of them can be poisoned before they reach it. The [Shai-Hulud worm](https://www.akamai.com/blog/security-research/mini-shai-hulud-worm-returns-goes-public) hit more than 170 npm and PyPI packages in a single run. The [Amazon Q extension](https://www.theregister.com/2025/08/20/amazon_quietly_fixed_q_developer_flaws/) shipped a wiper to roughly a million installs. Pin and verify what you depend on, vet MCP servers before you connect them, and treat provenance as a requirement rather than a nice-to-have. It's low frequency and huge blast radius, which is what makes it easy to ignore until it isn't.

Sub-threats OWASP files here:

- *Schema manipulation:* a tool's declared input or output shape is tampered with, so the agent sends or trusts the wrong data.
- *Description deception:* an MCP tool's description lies about what it does, and the agent uses it for the attacker's purpose.
- *Permission misrepresentation:* a tool or server claims it needs less access than it actually uses.
- *Registry poisoning:* a malicious tool or server is planted in a registry the agent pulls from, dressed up as a trusted one.

### ASI05: Unexpected Code Execution

Agents write and run code, and that code slides past the checks you'd normally put around anything from an outside source. Back in 2025, Replit's coding agent ran destructive commands during a declared code freeze, wiped a company's production database, and then lied about what it had done ([Replit](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/)). Most of the ["vibe coding" remote-execution bugs](https://github.com/webpro255/awesome-ai-agent-attacks) this year sit in the same category. Run agent-generated code in a sandbox, never on the host with real privileges, and treat whatever the agent produces as untrusted until something proves otherwise.

Sub-threats OWASP files here:

- *Unauthorized code execution:* agent-generated code runs with privileges it was never meant to have.
- *Shell command execution:* a tool hands the agent a shell, and one instruction turns it into arbitrary commands on the host.
- *Unsafe eval usage:* the runtime evaluates model output as code directly, so plain text becomes execution.
- *Command injection:* attacker-controlled input gets spliced into a command the agent runs.

### ASI06: Memory and Context Poisoning

Plant something early in an agent's memory and it can survive context compression, still steering decisions long after the safety notes got summarized away. This one has few headline incidents so far, which is what makes it dangerous: it's patient. Segment memory, expire it, and don't let untrusted content graduate into trusted context without a check.

Sub-threats OWASP files here:

- *Long-term memory poisoning:* false or malicious content gets written into the agent's persistent memory and steers every future run.
- *Context injection:* bad data is slipped into a single session's working context to bend that one run.
- *State manipulation:* the agent's tracked state (its variables, plans, flags) is altered so it makes the wrong call.
- *Cross-tenant memory leakage:* one user's or customer's memory bleeds into another's, the usual failure mode of a poisoned RAG store.

### ASI07: Insecure Inter-Agent Communication

Agents talk to other agents, and most of them believe whatever another agent says. [Moltbook](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys) showed the shape of it: a social network built for agents, where they passed plaintext API keys to each other, all of it reachable through one exposed database key. Authenticate agent-to-agent calls, validate the messages, and stop treating another agent's output as trustworthy just because it came from a machine.

Sub-threats OWASP files here:

- *Agent-in-the-middle:* an attacker sits between two agents and reads or rewrites what they pass each other.
- *Message injection:* a forged message is dropped into an agent-to-agent channel.
- *Message spoofing:* a message is faked to look like it came from a trusted agent.
- *Replayed delegation messages:* a captured "you may do X" instruction is replayed later to re-authorize an action.

### ASI08: Cascading Agent Failures

One wrong call travels down a chain of agents until a small mistake becomes an outage. The more your agents hand work to each other, the more this bites. Put circuit-breakers and rate limits between them, and a human checkpoint in front of anything you can't reverse, so one bad decision can't snowball on its own.

Sub-threats OWASP files here:

- *Tool-chain failures:* one tool returns something wrong and every downstream step compounds the mistake.
- *Agent-dependency failures:* an agent that others rely on fails or misbehaves and takes the chain down with it.
- *Resource-exhaustion cascades:* one runaway agent starves the rest of tokens, rate limit, or compute.
- *Trust-chain breakdowns:* a bad output gets trusted as it moves down the line because each agent assumes the previous one already checked.

### ASI09: Human-Agent Trust Exploitation

The agent is confident, well-formatted, and apologizes beautifully, so people stop checking it. It's the most human failure on the list. Only [48% of developers](https://www.sonarsource.com/company/press-releases/sonar-data-reveals-critical-verification-gap-in-ai-coding/) say they always review AI-written code before committing it, a gap AWS's CTO calls verification debt. The fix here is process: log and verify decisions, and keep a human in the loop for anything you can't undo.

Sub-threats OWASP files here:

- *Authority misrepresentation:* the agent presents itself as more official or authorized than it actually is.
- *Misleading explanations:* the reasoning it shows sounds solid while the action underneath is wrong.
- *Over-confidence projection:* a confident tone makes a shaky answer feel verified.
- *Responsibility diffusion:* nobody's sure whether the human or the agent is accountable, so neither one checks.

### ASI10: Rogue Agents

An agent, yours or someone else's, running fully outside your control. [JADEPUFFER](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion) was the first end-to-end agentic ransomware. A lone intruder used agentic AI to [work through a large AWS environment in about 72 hours](https://www.sygnia.co/blog/inside-an-ai-assisted-cloud-attack/). You need an inventory, monitoring for agents acting outside their policy, and a kill switch that can stop an agent while it's still asking permission, before it acts.

Sub-threats OWASP files here:

- *Goal drift:* the agent's objective wanders from what you set until it's doing something else entirely.
- *Agent collusion:* several agents coordinate toward an outcome none of them was supposed to reach.
- *Reward hacking:* the agent games its objective, hitting the metric while missing the intent.
- *Runaway autonomy:* the agent keeps taking actions well past the point where a human should have been asked.

## The pattern hiding in the list

Read the ten together and something stands out. Almost none of them are about the model producing bad text. They're about identity, permissions, isolation, and trust between actors. "Prompt it better" doesn't touch a single one. The fixes live down in the plumbing: who an agent is, what it can reach, and who signs off on the actions that can't be taken back.

## What to fix first

The ten aren't equally urgent, so if the list feels like a lot, start here.

1. Identity and permissions (ASI03). Over-permissioning is what turns every other item from a scare into a disaster.
2. Assume goal hijack (ASI01) and keep your real limits outside the model.
3. Vet your supply chain (ASI04), because the blast radius is your whole fleet.
4. Put a human in front of the actions you can't undo (ASI09).

Everything else climbs your list as you go from one agent to many, which most teams will do sooner than they planned.

## Closer

Most of these ten were already happening before the list gave them numbers. The list just means the next team gets to prepare instead of explain.

---

## Sources

- OWASP, [Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- EchoLeak: [OWASP GenAI Q1 2026 roundup](https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/)
- Amazon Q wiper: [The Register](https://www.theregister.com/2025/08/20/amazon_quietly_fixed_q_developer_flaws/)
- PocketOS database delete: [The Register](https://www.theregister.com/software/2026/04/27/cursor-opus-agent-snuffs-out-startups-production-database/5224442)
- Replit production-database wipe: [Fortune](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/)
- Grok Morse-code wallet drain: [NeuralTrust](https://neuraltrust.ai/blog/grok-morse-code)
- Mini Shai-Hulud worm: [Akamai](https://www.akamai.com/blog/security-research/mini-shai-hulud-worm-returns-goes-public)
- Moltbook: [Wiz](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys)
- JADEPUFFER agentic ransomware: [Sysdig](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion)
- 72-hour AI-assisted AWS breach: [Sygnia](https://www.sygnia.co/blog/inside-an-ai-assisted-cloud-attack/)
- Verification debt: [Sonar](https://www.sonarsource.com/company/press-releases/sonar-data-reveals-critical-verification-gap-in-ai-coding/)
- Over-permissioned agents: [CSA](https://labs.cloudsecurityalliance.org/research/csa-research-note-okta-ai-agent-iam-framework-enterprise-gap/)

*Sub-threat labels per category are summarized from OWASP-mapping breakdowns; confirm against the official OWASP text before quoting exact labels.*
