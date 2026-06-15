import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL("https://hexgate.ai"),
  title: "AI Agent Authorization & Policy Enforcement | Hexgate",
  description:
    "Deny-by-default authorization for AI agents. Gate every tool call with allow / deny / approval — local, signed, audited. MIT, one-line install.",
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
    canonical: "https://hexgate.ai/",
  },
  openGraph: {
    type: "website",
    url: "https://hexgate.ai/",
    siteName: "Hexgate",
    title: "AI Agent Authorization & Policy Enforcement | Hexgate",
    description:
      "Gate every agent tool call through a typed decision: allow, deny, or approval-required. Deny-by-default, signed in production, audited end to end.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent Authorization & Policy Enforcement | Hexgate",
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
