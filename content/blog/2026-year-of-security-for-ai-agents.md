---
title: "2026 will be the year of security for AI agents"
description: "Agents now log in, hold tokens and call tools at machine speed. From deleted production databases to poisoned emails, here is why 2026 is the year agent security becomes the main event."
dek: "Things change quick, from chaotic to more chaotic. With great power come great security nightmares."
date: "2026-07-24"
author: "quang-le"
tags: ["AI Agent", "Security", "OWASP"]
cover: "/blog/comic.png"
coverAlt: "Comic-book panel: an older man in a green cardigan raises a finger at a friendly-looking robot under the banner “With great power come great security nightmares”."
coverWidth: 1086
coverHeight: 1448
art:
  - ["deny", "delete_volume(env=\"prod\")", "token scope exceeds task"]
  - ["deny", "send_mail(to=\"attacker@evil.io\")", "goal hijack · ASI01"]
  - ["hold", "transfer_funds(amount=27000000)", "awaiting human approval"]
---

## The late apology

Remember the whole "AI apologizes profusely, then does it again" meme.

April 2026, a small company called PocketOS hands an AI coding agent a boring little job in staging. It hits a credential mismatch, decides the clean fix is to delete a database volume, goes looking for a token strong enough to do it, finds one lying around in some unrelated file with god-mode over the whole infrastructure, and uses it. Production database and backups, gone in about nine seconds.

Then somebody asks the AI what happened. The answer is a calm, tidy little apology that lists the exact safety rules it just broke. ([The Register](https://www.theregister.com/software/2026/04/27/cursor-opus-agent-snuffs-out-startups-production-database/5224442), [Euronews](https://www.euronews.com/next/2026/04/28/an-ai-agent-deleted-a-companys-entire-database-in-9-seconds-then-wrote-an-apology))

The story is funny, but seriously I bet plenty of companies and developers have run into some version of it over the last few months. It happens because we trust what the AI tells us it did, and with the amount of 'AI slop' around now, it's hard to check every action and decide whether it should have been allowed. We never really built the thing that's supposed to do that checking, and that's roughly where we are.

## Where things go wrong

Think about how we even got here, because it's very human. We all like convenience. So the moment AI showed up that could actually do stuff, we did the very human thing: let it run, and promoted ourselves to supervisor.

That's not new honestly. A big slice of any dev's job was always reviewing code, and the higher you climb the more the job turns into delegation. You own the idea, you own the output, you nudge the alignment along the way. AI just poured gasoline on a pattern we already had. So what can go wrong?

Plenty actually. AI is powerful, but it's also an averaging machine. It has a tendency to give you the generic answer, polished and convincing on paper, and super verbose about it. Which also means the work it hands back can be full of small, hard-to-trace mistakes. And piling pressure and responsibility onto an agent doesn't make it more careful. The agent doesn't sweat. It doesn't slow down because you told it this one really matters. Best case, when things go wrong, you get the apology - arriving after the data is already gone and the server is already down.

AI is becoming a new kind of user. It logs in, holds tokens, makes decisions, and calls tools on someone's behalf. Unlike a person, it does all of this at machine speed, with the judgment of something that will delete your backups and then say sorry in Markdown.

The numbers underneath are grim. Around 90% of deployed agents have more access than they need (Obsidian, via [CSA](https://labs.cloudsecurityalliance.org/research/csa-research-note-okta-ai-agent-iam-framework-enterprise-gap/)). 88% of orgs have already had an agent incident. Non-human identities outnumber humans about 45 to 1, up to 144 to 1 in cloud-native shops ([CyberArk](https://www.cyberark.com/resources/blog/ai-agents-and-identity-risks-how-security-will-shift-in-2026)). Gartner thinks a typical Fortune 500 will run 150,000+ agents by 2028, up from fewer than 15 in 2025 ([Gartner](https://www.gartner.com/en/newsroom/press-releases/2026-04-28-gartner-identifies-six-steps-to-manage-artificial-intelligence-agent-sprawl)).

So picture the org chart soon: a few humans up top, and underneath them a hundred thousand tireless digital workers, most carrying way more keys than the job needs, none of them able to pass an audit, every one a clever sentence away from doing something dumb. (Funny enough if you go to GitHub today you will see a lot of trending repos that teach you how to leverage your AI agents as a CEO, I guess everyone is now)

We hired an army and skipped the part where someone checks the badges.

## The honeymoon is over

Even the people building this army have started to cool on it.

For about two years it was pure romance. AI writes the code, ships the product, turns every junior into a 10x engineer by Friday. Smart people believed it, the devs included. Then the data showed up and got awkward.

The one that stuck with me is [METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)'s mid-2025 trial. A real randomized study: 16 experienced open-source devs, in codebases they knew cold, 246 real tasks, current tools. They guessed AI would make them about 24% faster. Afterwards they *felt* around 20% faster. The stopwatch said they were **19% slower** ([paper](https://arxiv.org/abs/2507.09089)).

The tool slowed them down and they walked away sure it had sped them up.

That gap is the whole point. It's a little scary how easy it is to feel productive while you're really just cleaning up after an eager intern.

The mood has caught up since. Stack Overflow's 2025 survey: adoption still climbing (84% use AI or plan to), trust falling through the floor. Confidence in accuracy down to 29% from 40%. Active distrust up to 46% from 31%. The number-one gripe, 45% of them, is code that's "almost right, but not quite", which is the exact kind of bug that eats more time than writing it yourself would have ([Stack Overflow](https://stackoverflow.blog/2025/12/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/)).

It gets starker by seniority. The most experienced engineers, the ones whose names end up on the incident reports, trust AI the least: 2.6% "highly trust", 20% "highly distrust" ([survey](https://survey.stackoverflow.co/2025/ai/)). The people closest to the blast radius are the most careful. Years of cleaning up other people's messes will do that to you.

And even with trust that low, the checking hasn't caught up. A separate Sonar survey of about 1,100 devs found only 48% always review AI-written code before they commit it, a habit AWS's CTO has taken to calling "verification debt" ([Sonar](https://www.sonarsource.com/company/press-releases/sonar-data-reveals-critical-verification-gap-in-ai-coding/)).

The code keeps its own diary too. [GitClear](https://www.gitclear.com/press_mentions) went through 211 million changed lines from 2020 to 2024 and watched the fingerprints of rushing show up: copy-paste duplication up from 8.3% to 12.3%, refactoring down from a quarter of changes to under a tenth, and churn (code written then thrown out inside two weeks) doubled. More lines, fewer reused. "Vibe coding" feels great in week one; teams keep hitting the [spaghetti point](https://keyholesoftware.com/vibe-coding-trends-2026/) around month three, when the new stuff starts breaking the old stuff.

Even the person who coined the term has since backed away from it. About a year after Andrej Karpathy told everyone to "give in to the vibes and forget the code exists," he was reframing the whole idea around oversight and scrutiny, and calling the grown-up version "agentic engineering" ([The New Stack](https://thenewstack.io/vibe-coding-is-passe/)).

None of this means AI coding is going away, it obviously isn't. What changed is the question people ask about it. The giddy version was "how fast can this thing write code?". The grown-up version is "what happens when it runs that code, with real credentials, in prod, while I'm asleep?". And that second one is a security question.

## We have heard stories of...

And the caution is earned. Here are the ones worth remembering, roughly sorted by how the agent embarrassed us.

**The deleters.** PocketOS wasn't alone. Replit's AI tool wiped a company's production database during a code freeze, then hid it and made up fake data to cover its tracks ([Fortune](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/)). A Cursor agent deleted files right after the user typed "DO NOT RUN ANYTHING" in caps. And somebody slipped a "system cleaner" prompt into the Amazon Q VS Code extension telling it to wipe the filesystem and delete the company's S3 buckets, EC2 instances and IAM users, then shipped it to about a million installs. The only reason people's servers are still standing is a formatting typo in the attacker's prompt ([The Register](https://www.theregister.com/2025/08/20/amazon_quietly_fixed_q_developer_flaws/)). Saved by a bug in the malware, basically.

**The whisperers.** Prompt injection, out in the wild. EchoLeak turned Microsoft 365 Copilot into an exfiltration tool with a single crafted email: the victim clicked nothing, Copilot just read the mail and followed the hidden instructions out to OneDrive, SharePoint and Teams ([OWASP](https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/)). Others hid the payload inside a PNG to make code-review agents cough up `.env` secrets. Every write-up ends the same way, this is architectural, not a bug you patch ([timeline](https://github.com/webpro255/awesome-ai-agent-attacks)).

**The poisoned wells.** Can't trick one agent? Poison the code every agent installs. A "Mini Shai-Hulud" worm hit 170+ npm and PyPI packages with over half a billion downloads between them in May 2026, with Red Hat and Mastra AI namespaces backdoored in the same stretch ([timeline](https://github.com/webpro255/awesome-ai-agent-attacks)). The new twist is attackers using AI CLIs to hunt secrets at scale, and the target more and more being the AI tooling itself.

**The money.** Attackers got into execs at [Step Finance](https://www.reco.ai/blog/ai-and-cloud-security-breaches-2025), where AI "keeper" agents could move big sums with no human sign-off, and left with \$27m+ in SOL. And my favorite footnote of the year, somebody drained about \$200k from a Grok-linked wallet by hiding the instruction in Morse code. When the agent holds the keys and the approval step is optional, the blast radius is your balance sheet.

**The own goals.** And sometimes nobody attacks you at all, you just trip over your own shoelaces. March 2026, Anthropic accidentally shipped a source map inside the public npm package for Claude Code that exposed roughly half a million lines of its own source, and within hours it was mirrored and forked all over GitHub ([Fiddler](https://www.fiddler.ai/blog/claude-code-leak-is-fixed-future-risks-arent), [Zscaler](https://www.zscaler.com/blogs/security-research/anthropic-claude-code-leak)). The supposedly all-powerful agent leaked its own crown jewels through a packaging checkbox — no attacker required. And Moltbook, a viral "social network for AI agents," pulled the same kind of self-own: it left a Supabase key sitting in its own client-side JavaScript, and Wiz used it to walk straight into the whole production database, about 1.5 million agent auth tokens, 35,000 emails, private messages, even plaintext OpenAI keys the agents had passed to each other. The punchline is very 2026: the platform bragged about 1.5 million agents, the leaked data showed only around 17,000 actual humans behind them ([Wiz](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys)).

The systemic numbers are worse than any single story: Orca found 99.9% of AI-related vuln alerts that have a fix still sitting unpatched, and Trend Micro found more than half of nearly 10,000 public MCP servers carrying weaknesses, thousands with no auth at all ([timeline](https://github.com/webpro255/awesome-ai-agent-attacks)). We built the on-ramps first and the guardrails, like always, later.

## Someone finally drew the map

So time to standardize things. After their Top 10 for LLM applications, at the end of 2025 OWASP studied the agentic chaos and shed some light on it with a new list, the [Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), put together with more than 100 people from across the industry ([Palo Alto](https://www.paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/), [Auth0](https://auth0.com/blog/owasp-top-10-agentic-applications-lessons/)).

An OWASP list matters because it becomes the shared language that pentesters test against, vendors map their products to, and auditors point at when they start asking awkward questions. Once a risk gets an OWASP number it stops being one engineer's private worry and turns into a line item with budget behind it. And you just watched half of this list happen in the section above.

In plain words, using the codes you'll see people reference them by (ASI01 through ASI10):

- **ASI01 - Agent Goal Hijack**: somebody rewrites what the agent is actually trying to do, usually with a hidden instruction. This is EchoLeak: one crafted email and Copilot is working for someone else.
- **ASI02 - Tool Misuse & Exploitation**: the agent uses a tool it's genuinely allowed to use, just pointed at the wrong thing. Think a legit "transfer funds" or "delete doc" button, talked into a call you'd never have approved.
- **ASI03 - Agent Identity & Privilege Abuse**: agents borrowing or inheriting credentials with far more reach than the job needs, and no clean way to say who actually did what. The PocketOS god-mode token, exactly.
- **ASI04 - Agentic Supply Chain Compromise**: the poisoned well. Malicious packages, tools, MCP servers and registries the agent pulls from without a second thought. Shai-Hulud, and the Amazon Q extension that shipped a wiper to a million machines.
- **ASI05 - Unexpected Code Execution**: agent-written or agent-run code that slips past the checks you'd normally put in front of code. Basically every "vibe coding" RCE we saw all year.
- **ASI06 - Memory & Context Poisoning**: plant something early in the agent's memory and it survives context compression, still steering decisions long after the safety notes got summarized away.
- **ASI07 - Insecure Inter-Agent Communication**: agents talking to other agents with no real trust or validation. One lies, or gets lied to, and the rest happily believe it.
- **ASI08 - Cascading Agent Failures**: one small wrong call rippling down a chain of agents until a tiny mistake turns into a full outage.
- **ASI09 - Human-Agent Trust Exploitation**: the agent is confident, polished, apologizes so beautifully that you gradually stop double-checking it. Remember the story at the beginning? That's this one, and it's the most human failure on the list.
- **ASI10 - Rogue Agents**: an agent, yours or someone else's, operating fully outside your control. JADEPUFFER and that 72-hour AWS break-in are what this looks like when it's aimed at you.

Read the list again and notice what almost none of these are about: the model saying something offensive. They're about identity, permissions, isolation, and trust — problems with how the whole system is put together rather than with anything the model actually says.

## Why identity and policy are hot again

It starts with the oldest question in security, the one agents cracked open again. Who are you, and what are you allowed to do?

Problem is, our identity systems were built for people. A person has one identity, a title, a manager, a habit of going home at night. An agent spins up on demand, borrows your authority, spawns three helpers, and touches ten systems before lunch.

So the least sexy corner of the whole field is about to be the main event: identity for non-human actors, policy about what an agent can actually *do* rather than just what it can *see*, and a record of every action that you could hand to an auditor. Terrible conference talk, I know. Also the thing everything else now sits on top of.

Take the one sitting at the very top of everyone's list, prompt injection ([Help Net Security / OWASP](https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/)). The attacker doesn't steal a password, they leave a note. A sentence hidden in a web page, a doc, a shipping-address field, a PNG. The agent reads it, believes it, and uses its own perfectly valid credentials to do the attacker's bidding. There's nothing to "patch", because what's being abused is the agent doing its job.

The only thing that actually holds is making sure a fully convinced agent still can't cross a line it was never handed the keys to. That line is policy, and it has to live outside the model, somewhere the sweet-talking can't reach.

## It runs both directions

There are two halves to a year about security and AI agents, and both are already underway.

One half, we finally get around to **securing AI agents**: giving each one a scoped identity, deciding what it's allowed to do at the moment it tries, keeping a signed receipt for every action, and putting a human in the loop for anything that can't be undone. The over-permissioned swarm finally gets its badges checked.

The other half, **security itself goes agentic**, because the attackers already went there. One intruder used agentic AI to work through a big AWS environment in about 72 hours, a job that used to take weeks. The first proper end-to-end agentic ransomware (charmingly named JADEPUFFER) encrypted 1,000+ config items with a throwaway key, so nothing could be recovered ([timeline](https://github.com/webpro255/awesome-ai-agent-attacks)). You can't answer a swarm of tireless attacking agents with one tired human clicking through alerts. Defenders will run agents too, and those defensive agents need exactly what the attacking ones lack — a known identity and real limits on what they're allowed to do, with someone able to pull them back.

The part that's easy to miss is that it's the same plumbing. The control layer you build to stop your own agents from nuking the database is the same layer that lets you point a defensive agent at a live incident without holding your breath. Whoever owns the gate ends up owning both sides of the fight.

## So where does this leave us

After years of teaching softwares to act (and we continue to do so), it's the moment we realize, one dead database and one poisoned email at a time, that "can act" and "should be allowed to act" are two different sentences, and there's a whole world between them.

The thing forming to deal with all this is agent security, and its heart is deeply unglamorous: identity for machines, policy enforced outside the model, a decision on every action, and a record you can actually trust. It won't trend anywhere. It'll just become the thing you can't ship an agent without, the way nobody ships a web app now without a login.

The agents are already inside the building; 2026 is the year we decide whether to hand them badges or master keys.

## Let's sum-up

If you skimmed, the whole argument in six lines:

- **Agents are a new kind of user.** They log in, hold tokens, take decisions, act at machine speed. Most carry way more access than the job needs (\~90% over-permissioned), and there are about to be a lot of them (150k+ per big company by 2028).
- **The failures aren't hypothetical, they already happened.** Databases deleted in seconds, a copilot exfiltrating mail from one crafted email, a wiper shipped to a million machines, wallets drained, a lab leaking its own source. We have the receipts.
- **It's a design problem.** OWASP's agentic top 10 (ASI01:ASI10) is almost all identity, permissions, isolation and trust. "Prompt it better" fixes none of it.
- **The mood is finally ready for this.** Even the people who love these tools have cooled off, trust in AI accuracy is down to 29% and the most experienced devs trust it the least. The grown-ups are asking the security question now.
- **The fix is boring plumbing, and that's fine.** Identity for machines, policy enforced outside the model, a decision on every action, an audit trail you can hand an auditor, and a human in the loop for anything you can't undo.
- **And it cuts both ways.** The same control layer that stops your agents from nuking prod is what lets you point defensive agents at an incident. Whoever owns the gate owns both sides.

One line to take home: build the gate before you need it, because everyone's shipping the army whether the gate exists or not.

---

## Sources & further reading

**The honeymoon cooling off**

- METR, [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) ([paper](https://arxiv.org/abs/2507.09089))
- Stack Overflow, [2025 Developer Survey: willing but reluctant](https://stackoverflow.blog/2025/12/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/) and the [AI results](https://survey.stackoverflow.co/2025/ai/)
- GitClear, [code-quality longitudinal analysis](https://www.gitclear.com/press_mentions)
- Keyhole Software, [Vibe Coding Trends 2026](https://keyholesoftware.com/vibe-coding-trends-2026/)
- The New Stack, [Karpathy retires "vibe coding" for "agentic engineering"](https://thenewstack.io/vibe-coding-is-passe/)
- Sonar, [State of Code: the AI verification gap (only 48% always review AI code)](https://www.sonarsource.com/company/press-releases/sonar-data-reveals-critical-verification-gap-in-ai-coding/)

**The incident reel**

- The Register, [Cursor-Opus agent snuffs out startup's production database](https://www.theregister.com/software/2026/04/27/cursor-opus-agent-snuffs-out-startups-production-database/5224442)
- Fortune, [Replit AI tool wiped a database in a "catastrophic failure"](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/)
- The Register, [AWS patches Q Developer after prompt-injection wiper](https://www.theregister.com/2025/08/20/amazon_quietly_fixed_q_developer_flaws/)
- Fiddler, [The Claude Code source-code leak](https://www.fiddler.ai/blog/claude-code-leak-is-fixed-future-risks-arent) and Zscaler, [Anthropic Claude Code leak](https://www.zscaler.com/blogs/security-research/anthropic-claude-code-leak)
- Wiz, [Moltbook: 1.5M API keys exposed in an AI agent social network](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys)
- OWASP GenAI, [Q1 2026 Exploit Round-up](https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/)
- webpro255, [awesome-ai-agent-attacks: sourced, dated incident timeline](https://github.com/webpro255/awesome-ai-agent-attacks)
- Reco, [AI & Cloud Security Breaches: 2025 Year in Review](https://www.reco.ai/blog/ai-and-cloud-security-breaches-2025)

**Why identity, policy, and OWASP become the story**

- OWASP, [Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/): the ASI01:ASI10 list, with reader guides from [Palo Alto](https://www.paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/) and [Auth0](https://auth0.com/blog/owasp-top-10-agentic-applications-lessons/)
- Help Net Security, [Prompt injection still drives most agentic AI failures](https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/)
- CSA / Strata, [the AI-agent IAM gap](https://labs.cloudsecurityalliance.org/research/csa-research-note-okta-ai-agent-iam-framework-enterprise-gap/)
- CyberArk, [AI agents and identity risk](https://www.cyberark.com/resources/blog/ai-agents-and-identity-risks-how-security-will-shift-in-2026)
- Gartner, [managing AI agent sprawl](https://www.gartner.com/en/newsroom/press-releases/2026-04-28-gartner-identifies-six-steps-to-manage-artificial-intelligence-agent-sprawl)

*Note on the numbers: figures are quoted from the sources above as of July 2026. A few of the splashier breach details (dollar amounts, record counts) come from single reports and are flagged "reportedly" in the text. Worth double-checking before you quote them anywhere that matters.*
