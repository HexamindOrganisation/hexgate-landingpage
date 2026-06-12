import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hexgate — Authorization infrastructure for AI agents",
  description:
    "Hexgate controls what AI agents do at the tool and resource level — every call allowed, denied, or held for approval. Policy is enforced locally from a signed WASM bundle, so there's no per-decision round-trip and no latency tax. Wrap your OpenAI Agents, LangChain, Google ADK, or Pydantic AI agent in one line. Deny-by-default, per-request user scope, full audit trail.",
  keywords: [
    "AI agent authorization",
    "agent policy enforcement",
    "LLM agent security",
    "OpenAI Agents",
    "LangChain",
    "Google ADK",
    "Pydantic AI",
    "RBAC for AI agents",
    "WASM policy",
    "OPA Rego",
    "audit log",
    "deny by default",
  ],
  alternates: {
    canonical: "https://github.com/HexamindOrganisation/hexgate",
  },
  openGraph: {
    type: "website",
    title: "Hexgate — Authorization infrastructure for AI agents",
    description:
      "Gate every agent tool call through a typed decision: allow, deny, or approval-required. Deny-by-default, signed in production, audited end to end.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hexgate — Authorization infrastructure for AI agents",
    description:
      "Gate every agent tool call through a typed decision: allow, deny, or approval-required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
