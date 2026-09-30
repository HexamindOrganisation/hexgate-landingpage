"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { PostArt } from "./PostArt";

type Card = Pick<PostMeta, "slug" | "title" | "description" | "date" | "tags" | "readingMinutes" | "art"> & {
  author: string;
  dateLabel: string;
};

/** Topic chips + card grid. Chips only filter what is already in the page, so every post stays crawlable. */
export function PostGrid({ posts }: { posts: Card[] }) {
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags)));
  const [tag, setTag] = useState<string | null>(null);
  const shown = tag ? posts.filter((p) => p.tags.includes(tag)) : posts;
  return (
    <>
      <div className="topics" role="group" aria-label="Filter by topic">
        <button type="button" className={`topic${tag === null ? " on" : ""}`} aria-pressed={tag === null} onClick={() => setTag(null)}>
          All <span>{posts.length}</span>
        </button>
        {tags.map((t) => (
          <button
            type="button"
            key={t}
            className={`topic${tag === t ? " on" : ""}`}
            aria-pressed={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
          >
            {t} <span>{posts.filter((p) => p.tags.includes(t)).length}</span>
          </button>
        ))}
      </div>
      <ul className="post-grid">
        {shown.map((p) => (
          <li key={p.slug}>
            <article className="post-card">
              <Link href={`/blog/${p.slug}`} className="post-card-link" aria-label={p.title}>
                <PostArt lines={p.art} size="sm" id={`g-${p.slug}`} />
              </Link>
              <div className="post-card-body">
                <div className="post-tags">
                  {p.tags.map((t) => (
                    <span className="post-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <h3>
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                </h3>
                <p>{p.description}</p>
                <div className="post-meta">
                  <span>{p.author}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={p.date}>{p.dateLabel}</time>
                  <span aria-hidden="true">·</span>
                  <span>{p.readingMinutes} min read</span>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
