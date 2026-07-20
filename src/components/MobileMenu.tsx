"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#frameworks", label: "Frameworks" },
  { href: "/#features", label: "Capabilities" },
  { href: "/roadmap", label: "Roadmap" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="mnav">
      <button
        type="button"
        className="mnav-btn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </>
          )}
        </svg>
      </button>
      {open ? (
        <div className="mnav-panel">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={close}>
              {l.label}
            </Link>
          ))}
          <a href="https://docs.hexgate.ai" target="_blank" rel="noopener" onClick={close}>
            Docs
          </a>
          <a
            className="btn btn-ghost"
            href="https://github.com/HexamindOrganisation/hexgate"
            target="_blank"
            rel="noopener"
            onClick={close}
          >
            GitHub
          </a>
          <Link className="btn btn-primary" href="/#book" onClick={close}>
            Book a demo
          </Link>
        </div>
      ) : null}
    </div>
  );
}
