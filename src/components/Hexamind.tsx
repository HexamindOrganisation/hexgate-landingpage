// Product → company links. Every page shows the same "by Hexamind" lockup in
// the nav and the same "Built by Hexamind" band above the footer.

export const HEXAMIND_URL = "https://hexamind.ai";
const GITHUB_URL = "https://github.com/HexamindOrganisation/hexgate";

/** Sits next to the Hexgate brand in the nav. */
export function ByHexamind() {
  return (
    <a className="by-hexamind" href={HEXAMIND_URL} target="_blank" rel="noopener">
      by Hexamind
    </a>
  );
}

/** Full-width band placed right above the footer. */
export function HexamindBand() {
  return (
    <section className="maker" aria-labelledby="maker-title">
      <div className="wrap">
        <div className="maker-card">
          <div className="maker-copy">
            <span className="eyebrow">Built by Hexamind</span>
            <h2 id="maker-title">Hexgate is an open-source project created by Hexamind.</h2>
            <p>
              Hexamind builds and maintains Hexgate in the open. The SDK is MIT licensed, and every
              line of it is on GitHub.
            </p>
          </div>
          <div className="maker-cta">
            <a className="btn btn-primary" href={HEXAMIND_URL} target="_blank" rel="noopener">
              Visit hexamind.ai
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a className="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noopener">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
