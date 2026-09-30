import type { ArtLine } from "@/lib/blog";

const VC = {
  allow: { fg: "#2dd4a7", bg: "rgba(45,212,167,0.14)", label: "ALLOW" },
  deny: { fg: "#f4566b", bg: "rgba(244,86,107,0.14)", label: "DENY" },
  hold: { fg: "#f5a524", bg: "rgba(245,165,36,0.14)", label: "APPROVAL" },
} as const;

/** 1200×630 social card shared by the blog index and every post (rendered by next/og). */
export function OgCard({ title, kicker, line, footer }: { title: string; kicker: string; line?: ArtLine; footer: string }) {
  const v = line ? VC[line[0]] : null;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#08090d",
        color: "#f3f5f9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px",
        fontFamily: "system-ui, sans-serif",
        backgroundImage: "radial-gradient(circle at 88% 0%, rgba(59,130,246,0.28), rgba(59,130,246,0.06) 38%, rgba(8,9,13,0) 62%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <path d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z" stroke="#3b82f6" strokeWidth="1.6" fill="rgba(59,130,246,0.08)" />
            <path d="M16 9.5 21.5 12.7v6.6L16 22.5 10.5 19.3v-6.6L16 9.5Z" stroke="#60a5fa" strokeWidth="1.4" fill="none" />
            <circle cx="16" cy="16" r="2.1" fill="#60a5fa" />
          </svg>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#f3f5f9" }}>Hex</span>
            <span style={{ color: "#60a5fa" }}>gate</span>
            <span style={{ color: "#6b7382", fontSize: 24, fontWeight: 500, marginLeft: 18, alignSelf: "center" }}>by Hexamind</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.18em", color: "#60a5fa", textTransform: "uppercase" }}>{kicker}</div>
      </div>

      <div style={{ display: "flex", fontSize: title.length > 60 ? 62 : 72, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.06, maxWidth: 1040 }}>
        {title}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {line && v ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "14px 22px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#0e1118",
              fontFamily: "monospace",
              fontSize: 24,
            }}
          >
            <span style={{ display: "flex", color: v.fg, background: v.bg, padding: "4px 12px", borderRadius: 8, fontWeight: 700 }}>{v.label}</span>
            <span style={{ display: "flex", color: "#aab2c0" }}>{line[1].length > 44 ? `${line[1].slice(0, 42)}…` : line[1]}</span>
          </div>
        ) : (
          <div style={{ display: "flex" }} />
        )}
        <div style={{ display: "flex", fontSize: 22, color: "#6b7382" }}>{footer}</div>
      </div>
    </div>
  );
}
