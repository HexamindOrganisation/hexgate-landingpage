import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { ByHexamind } from "./Hexamind";
import { APP_URL } from "@/lib/links";

export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z" stroke="#3b82f6" strokeWidth="1.6" fill="rgba(59,130,246,0.08)" />
      <path d="M16 9.5 21.5 12.7v6.6L16 22.5 10.5 19.3v-6.6L16 9.5Z" stroke="#60a5fa" strokeWidth="1.4" fill="none" />
      <circle cx="16" cy="16" r="2.1" fill="#60a5fa" />
    </svg>
  );
}

type Section = "roadmap" | "blog";

/** Sticky nav for sub-pages (always in its "scrolled" state). */
export function SubNav({ current }: { current?: Section }) {
  const cur = (s: Section) => (current === s ? { "aria-current": "page" as const } : {});
  return (
    <nav className="site-nav scrolled" id="nav">
      <div className="nav-inner">
        <div className="brand-lockup">
          <Link className="brand" href="/" aria-label="Hexgate home">
            <Mark />
            <span className="brand-name">
              Hex<b>gate</b>
            </span>
          </Link>
          <ByHexamind />
        </div>
        <div className="nav-links">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/roadmap" {...cur("roadmap")}>
            Roadmap
          </Link>
          <Link href="/blog" {...cur("blog")}>
            Blog
          </Link>
          <a href="https://docs.hexgate.ai" target="_blank" rel="noopener">
            Docs
          </a>
        </div>
        <div className="nav-cta">
          <a className="btn btn-ghost" href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
            GitHub
          </a>
          <a className="btn btn-primary" href={APP_URL}>
            Try the cloud version
          </a>
        </div>
        <MobileMenu />
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-inner">
          <Link className="brand" href="/">
            <Mark />
            <span className="brand-name">
              Hex<b>gate</b>
            </span>
          </Link>
          <div className="foot-links">
            <Link href="/">Home</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/roadmap">Roadmap</Link>
            <Link href="/blog">Blog</Link>
            <a href="https://github.com/HexamindOrganisation/hexgate" target="_blank" rel="noopener">
              GitHub
            </a>
            <a href="https://pypi.org/project/hexgate/" target="_blank" rel="noopener">
              PyPI
            </a>
            <Link href="/#faq">FAQ</Link>
          </div>
          <span className="foot-meta">
            ©&nbsp;2026{" "}
            <a href="https://hexamind.ai" target="_blank" rel="noopener">
              Hexamind
            </a>{" "}
            · MIT
          </span>
        </div>
      </div>
    </footer>
  );
}
