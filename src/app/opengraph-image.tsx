import { ImageResponse } from "next/og";

export const alt = "Hexgate by Hexamind — take back control of your AI agents";
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
              strokeWidth="1.8"
              fill="rgba(59,130,246,0.14)"
            />
            <circle cx="16" cy="13.6" r="2.7" stroke="#60a5fa" strokeWidth="1.7" fill="none" />
            <path d="M14.4 15.9 13.4 21.6h5.2l-1-5.7" stroke="#60a5fa" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
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
            Take back control of your AI agents.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#aab2c0",
              maxWidth: 940,
              lineHeight: 1.35,
            }}
          >
            Open-source agent governance: deterministic rules, enforced in real time, analyzed live and after the fact.
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
          <div>● by Hexamind</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
