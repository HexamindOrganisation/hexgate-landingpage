import type { ArtLine } from "@/lib/blog";

const LABEL = { allow: "ALLOW", deny: "DENY", hold: "APPROVAL" } as const;

/**
 * Generated cover art: a slice of the decision log that tells the post's
 * story, drawn over a hex lattice. Pure markup, so it stays crisp and costs
 * no image bytes.
 */
export function PostArt({ lines, size = "md", id }: { lines: ArtLine[]; size?: "sm" | "md" | "lg"; id: string }) {
  const pid = `hexgrid-${id}`;
  return (
    <div className={`post-art post-art--${size}`} aria-hidden="true">
      <svg className="post-art-grid" width="100%" height="100%">
        <defs>
          <pattern id={pid} width="28" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(1.1)">
            <path
              d="M14 0 28 8.08v16.17L14 32.33 0 24.25V8.08Z M14 32.33V48.5"
              fill="none"
              stroke="rgba(96,165,250,0.09)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pid})`} />
      </svg>
      <div className="post-art-glow" />
      <div className="post-art-console">
        <div className="post-art-top">
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
          <span className="post-art-fn">
            <b>decide</b>(role, tool, args)
          </span>
        </div>
        {lines.map(([verdict, call, reason], i) => (
          <div className="post-art-row" key={i}>
            <span className={`post-art-v v-${verdict}`}>{LABEL[verdict]}</span>
            <span className="post-art-call">
              {call}
              <span className="post-art-why">↳ {reason}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
