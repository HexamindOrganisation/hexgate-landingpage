"use client";

import { useEffect } from "react";

/**
 * Plays each `.slide` section's entrance once, when it scrolls into view.
 * The hidden starting state only applies under `html.js-slides` (set by an
 * inline script in the root layout) and when motion is allowed, so crawlers,
 * no-JS visitors and reduced-motion users always get the full content.
 */
export function SlideReveal() {
  useEffect(() => {
    const root = document.documentElement;
    (window as unknown as { __slides?: boolean }).__slides = true;
    const slides = Array.from(document.querySelectorAll<HTMLElement>(".slide"));
    if (!("IntersectionObserver" in window)) {
      slides.forEach((s) => s.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    slides.forEach((s) => io.observe(s));
    root.classList.add("slides-ready");
    return () => io.disconnect();
  }, []);
  return null;
}
