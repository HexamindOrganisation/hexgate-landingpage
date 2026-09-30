"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog";

/** Thin progress bar under the nav that tracks how far through the article you are. */
export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const body = document.getElementById("post-body");
    if (!body) return;
    const onScroll = () => {
      const r = body.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="read-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

/** Adds a copy button to every code frame rendered from Markdown. */
export function CodeCopy() {
  useEffect(() => {
    const frames = document.querySelectorAll<HTMLElement>("#post-body .code-frame");
    const cleanups: (() => void)[] = [];
    frames.forEach((frame) => {
      const top = frame.querySelector(".code-top");
      const code = frame.querySelector("pre");
      if (!top || !code || top.querySelector(".code-copy")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code");
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          btn.textContent = "Copied";
          btn.classList.add("done");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("done");
          }, 1600);
        } catch {
          /* clipboard blocked: leave the button as is */
        }
      };
      btn.addEventListener("click", onClick);
      top.appendChild(btn);
      cleanups.push(() => btn.remove());
    });
    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}

/** Table of contents with the section in view highlighted. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const heads = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!heads.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    heads.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [items]);
  return (
    <ol className="toc-list">
      {items.map((i) => (
        <li key={i.id} className={`toc-d${i.depth}${active === i.id ? " on" : ""}`}>
          <a href={`#${i.id}`}>{i.text}</a>
        </li>
      ))}
    </ol>
  );
}

export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no-op */
    }
  };
  return (
    <div className="share">
      <span className="share-k">Share</span>
      <a
        className="share-btn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <a
        className="share-btn"
        href={`https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className="share-btn"
        href={`https://news.ycombinator.com/submitlink?u=${enc(url)}&t=${enc(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Hacker News
      </a>
      <button type="button" className="share-btn" onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
