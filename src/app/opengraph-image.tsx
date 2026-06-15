import { ImageResponse } from "next/og";

export const alt = "Hexgate — AI agent authorization and policy enforcement";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#08090d",
          color: "#f3f5f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -300,
            left: 50,
            display: "flex",
            width: 1100,
            height: 1100,
            background:
              "radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.07) 32%, transparent 62%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <path
              d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z"
              stroke="#3b82f6"
              strokeWidth="1.6"
              fill="rgba(59,130,246,0.08)"
            />
            <path
              d="M16 9.5 21.5 12.7v6.6L16 22.5 10.5 19.3v-6.6L16 9.5Z"
              stroke="#60a5fa"
              strokeWidth="1.4"
              fill="none"
            />
            <circle cx="16" cy="16" r="2.1" fill="#60a5fa" />
          </svg>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#f3f5f9" }}>Hex</span>
            <span style={{ color: "#60a5fa" }}>gate</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            AI agent authorization & policy enforcement
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#aab2c0",
              maxWidth: 940,
              lineHeight: 1.35,
            }}
          >
            Gate every tool call — allow, deny, or approval. Local, signed, audited. MIT.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 22,
            color: "#6b7382",
          }}
        >
          <div>● MIT licensed</div>
          <div>● Signed WASM bundle</div>
          <div>● Deny-by-default</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
