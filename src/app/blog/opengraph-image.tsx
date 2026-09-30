import { ImageResponse } from "next/og";
import { OgCard } from "../../components/blog/OgCard";

export const alt = "The Hexgate blog: field notes on AI agent security";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        title="Field notes from the gate: AI agent security, OWASP and authorization."
        kicker="Blog"
        line={["deny", "delete_volume(env=\"prod\")", "token scope exceeds task"]}
        footer="hexgate.ai/blog"
      />
    ),
    { ...size },
  );
}
