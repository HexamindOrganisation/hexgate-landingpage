import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hexgate.ai"),
  title: "Per-User Authorization for AI Agents | Hexgate",
  description:
    "Per-user, per-tool authorization for AI agents. Wrap your OpenAI Agents, LangChain, Google ADK, or Pydantic AI agent in one line. Every tool call is gated by role, enforced in-process from a signed WASM bundle, audited end to end. MIT.",
  keywords: [
    "per-user AI agent authorization",
    "multi-tenant AI agent",
    "on-behalf-of LLM agent",
    "AI agent authorization",
    "agent policy enforcement",
    "LLM agent security",
    "biscuit token agent",
    "OpenAI Agents",
    "LangChain",
    "Google ADK",
    "Pydantic AI",
    "RBAC for AI agents",
    "WASM policy",
    "OPA Rego",
    "deny by default",
  ],
  alternates: {
    canonical: "https://hexgate.ai/",
  },
  openGraph: {
    type: "website",
    url: "https://hexgate.ai/",
    siteName: "Hexgate",
    title: "Per-User Authorization for AI Agents | Hexgate",
    description:
      "One agent, many users, each gated by their own role. Per-request user identity threaded through every tool call, enforced from a signed WASM bundle, audited end to end.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Per-User Authorization for AI Agents | Hexgate",
    description:
      "One agent, many users, each gated by their own role. Per-request user identity threaded through every tool call.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://hexgate.ai/#sdk",
      name: "Hexgate",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Authorization SDK for AI agents",
      operatingSystem: "Linux, macOS, Windows",
      description:
        "Per-user authorization SDK for AI agents. Wraps OpenAI Agents, LangChain, Google ADK, or Pydantic AI without rewrite; every tool call is gated by a deny-by-default policy enforced in-process from a signed WASM bundle.",
      url: "https://hexgate.ai/",
      downloadUrl: "https://pypi.org/project/hexgate/",
      codeRepository: "https://github.com/HexamindOrganisation/hexgate",
      license: "https://opensource.org/licenses/MIT",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": "https://hexamind.ai/#org" },
    },
    {
      "@type": "Organization",
      "@id": "https://hexamind.ai/#org",
      name: "Hexamind",
      url: "https://hexamind.ai/",
      logo: "https://hexgate.ai/icon.svg",
      sameAs: ["https://github.com/HexamindOrganisation"],
    },
    {
      "@type": "FAQPage",
      "@id": "https://hexgate.ai/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I have to rewrite my agent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Hexgate ships adapters that wrap an existing OpenAI Agents, LangChain / LangGraph, Google ADK, or Pydantic AI agent without touching its logic. Swap your runner for HexgateRunner (or call wrap_langchain_agent / wrap_pydantic_agent) once. Your original agent object is left intact; the wrapper holds the policy and gates every tool the agent can invoke.",
          },
        },
        {
          "@type": "Question",
          name: "Does gating every call add latency or a network round-trip?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No per-decision round-trip. Policy is evaluated in-process, either by the default pydantic engine or in production by a compiled WASM bundle run via wasmtime. The bundle is fetched once and refreshed only at turn boundaries with an ETag / 304 check, so individual decide() calls never leave the process.",
          },
        },
        {
          "@type": "Question",
          name: "What happens when a call is denied?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A denial isn't a crash. The tool returns a [policy_denied] (or [approval_required]) marker that the model sees as the tool result, so the agent can recover or try a fallback instead of aborting the run. On Pydantic AI it surfaces as a ModelRetry; on LangChain as a structured {ok: false} result.",
          },
        },
        {
          "@type": "Question",
          name: "How do approval-required tools work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Mark a tool approval_required in policy, then pass an approval_handler when you wrap: True (auto-approve), False (auto-deny), or a sync/async (action, context) -> bool callback that inspects the specific call. hexgate chat prompts the terminal, hexgate serve auto-approves, and native code does whatever you wire.",
          },
        },
        {
          "@type": "Question",
          name: "How does per-user scope work if one agent serves everyone?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Identity and rules are decoupled. A per-request User context manager carries who is calling (user_id, role, session_id, optional ttl) as a signed biscuit token; role policy files decide what that role can do. Role is resolved at call time from a contextvar, so a single wrapped agent serves many users concurrently without seeing each other's policies. Unlike governance toolkits that key policy on agent_id alone, Hexgate threads the end-user identity through every decision. The same agent code runs with different effective permissions depending on which user invoked it.",
          },
        },
        {
          "@type": "Question",
          name: "What does a policy actually look like?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A policy.yaml is deny-by-default with a tools map; each tool gets a mode (allow / deny / approval_required) and optional constraints like args.amount <= 500. Operators are ==, !=, <, <=, >, >=, in, not in, all ANDed. The same constraint strings compile to OPA Rego for the WASM engine and run in-process for pydantic. A parity test suite proves both produce identical decisions.",
          },
        },
        {
          "@type": "Question",
          name: "What makes a production bundle trustworthy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bundles are signed. The manifest carries a SHA-256 of every artifact (including the wasm_hash) plus a detached Ed25519 signature over that manifest. The hashes authenticate the files; the signature authenticates the manifest. Set HEXGATE_BUNDLE_REQUIRE_SIGNATURE=true to refuse anything unsigned or unverifiable. The signing key is the same root that signs your biscuit tokens.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need the platform, or can I run the SDK alone?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The SDK runs standalone: YAML on disk, in-process enforcement, no Docker or browser. The optional platform (a FastAPI control plane + React dashboard) adds browser policy editing, mintable tokens, a live Playground decision stream, and an append-only audit log in ClickHouse. Edit policy in the UI and the next turn picks it up.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
