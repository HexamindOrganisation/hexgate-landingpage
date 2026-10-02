import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import { visit, SKIP } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Element, ElementContent, Root, Text } from "hast";

export const SITE_URL = "https://hexgate.ai";
export const BLOG_URL = `${SITE_URL}/blog`;

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export type Verdict = "allow" | "deny" | "hold";
/** One line of the decision-log cover art: [verdict, call, reason]. */
export type ArtLine = [Verdict, string, string];

export type Author = { id: string; name: string; initials: string; org: string };

export const AUTHORS: Record<string, Author> = {
  "quang-le": { id: "quang-le", name: "Quang Le", initials: "QL", org: "Hexamind" },
  "guillaume-potel": { id: "guillaume-potel", name: "Guillaume Potel", initials: "GP", org: "Hexamind" },
};

// Intrinsic sizes of the images under public/blog, so every <img> ships
// width/height (no layout shift, better Core Web Vitals).
const IMAGE_SIZES: Record<string, [number, number]> = {
  "/blog/comic.png": [1086, 1448],
  "/blog/api-key.webp": [1440, 932],
  "/blog/agent-registered.webp": [1440, 810],
  "/blog/policy-editor.webp": [1440, 810],
  "/blog/decision-log.webp": [1440, 810],
};

export type TocItem = { id: string; text: string; depth: 2 | 3 };

export type PostMeta = {
  slug: string;
  url: string;
  title: string;
  description: string;
  dek?: string;
  hook?: string;
  date: string;
  updated: string;
  author: Author;
  tags: string[];
  cover?: { src: string; alt: string; width: number; height: number };
  art: ArtLine[];
  readingMinutes: number;
  wordCount: number;
};

export type Post = PostMeta & { html: string; toc: TocItem[] };

function readSource(slug: string) {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = fs.readFileSync(file, "utf8");
  return matter(raw);
}

function toMeta(slug: string, data: Record<string, unknown>, body: string): PostMeta {
  const author = AUTHORS[String(data.author)];
  if (!author) throw new Error(`Unknown author "${data.author}" in ${slug}.md`);
  const stats = readingTime(body);
  const cover =
    typeof data.cover === "string"
      ? {
          src: data.cover,
          alt: String(data.coverAlt ?? ""),
          width: Number(data.coverWidth),
          height: Number(data.coverHeight),
        }
      : undefined;
  return {
    slug,
    url: `${BLOG_URL}/${slug}`,
    title: String(data.title),
    description: String(data.description),
    dek: data.dek ? String(data.dek) : undefined,
    hook: data.hook ? String(data.hook) : undefined,
    date: String(data.date),
    updated: String(data.updated ?? data.date),
    author,
    tags: (data.tags as string[]) ?? [],
    cover,
    art: (data.art as ArtLine[]) ?? [],
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
    wordCount: stats.words,
  };
}

/** All posts, newest first. */
export const getAllPosts = cache((): PostMeta[] => {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data, content } = readSource(slug);
      return toMeta(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
});

export const getPostMeta = cache((slug: string): PostMeta | undefined =>
  getAllPosts().find((p) => p.slug === slug),
);

export const getPost = cache(async (slug: string): Promise<Post | undefined> => {
  const meta = getPostMeta(slug);
  if (!meta) return undefined;
  const { content } = readSource(slug);
  const toc: TocItem[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeCollectToc, toc)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["h-anchor"], ariaHidden: "true", tabIndex: -1 },
      content: { type: "text", value: "#" },
    })
    .use(rehypeFigures)
    .use(rehypeExternalLinks)
    .use(rehypeAsiCodes)
    .use(rehypeCodeFrames)
    .use(rehypeShiki, { theme: "github-dark-default" })
    .use(rehypeStringify)
    .process(content);
  return { ...meta, html: String(file), toc };
});

/* ---------- rehype plugins ---------- */

function rehypeCollectToc(toc: TocItem[]) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        toc.push({
          id: String(node.properties.id),
          text: toString(node),
          depth: node.tagName === "h2" ? 2 : 3,
        });
      }
    });
  };
}

/** A paragraph holding a lone image becomes <figure> with the title as caption. */
function rehypeFigures() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "p" || !parent || index === undefined) return;
      const kids = node.children.filter((c) => !(c.type === "text" && !c.value.trim()));
      if (kids.length !== 1 || kids[0].type !== "element" || kids[0].tagName !== "img") return;
      const img = kids[0];
      const src = String(img.properties.src ?? "");
      const size = IMAGE_SIZES[src];
      const caption = img.properties.title ? String(img.properties.title) : "";
      delete img.properties.title;
      img.properties.loading = "lazy";
      img.properties.decoding = "async";
      if (size) {
        img.properties.width = size[0];
        img.properties.height = size[1];
      }
      const children: ElementContent[] = [img];
      if (caption) {
        children.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] });
      }
      parent.children[index] = { type: "element", tagName: "figure", properties: { className: ["post-figure"] }, children };
      return SKIP;
    });
  };
}

function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      const href = node.tagName === "a" ? String(node.properties.href ?? "") : "";
      if (/^https?:\/\//.test(href) && !href.startsWith(SITE_URL)) {
        node.properties.target = "_blank";
        node.properties.rel = ["noopener", "noreferrer"];
      }
    });
  };
}

/** OWASP codes (ASI01…ASI10) in prose render as small chips. */
function rehypeAsiCodes() {
  const RE = /\bASI(0[1-9]|10)\b/g;
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined || parent.type !== "element") return;
      if (["code", "pre", "a", "h2", "h3"].includes(parent.tagName)) return;
      if (!RE.test(node.value)) return;
      RE.lastIndex = 0;
      const out: ElementContent[] = [];
      let last = 0;
      for (const m of node.value.matchAll(RE)) {
        if (m.index! > last) out.push({ type: "text", value: node.value.slice(last, m.index) });
        out.push({ type: "element", tagName: "span", properties: { className: ["asi"] }, children: [{ type: "text", value: m[0] }] });
        last = m.index! + m[0].length;
      }
      if (last < node.value.length) out.push({ type: "text", value: node.value.slice(last) });
      parent.children.splice(index, 1, ...out);
      return [SKIP, index + out.length];
    });
  };
}

/** Wraps fenced code in an editor-style frame: traffic lights, filename or language, copy button slot. */
function rehypeCodeFrames() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      if (parent.type === "element" && parent.tagName === "div") return;
      const code = node.children.find((c): c is Element => c.type === "element" && c.tagName === "code");
      if (!code) return;
      const cls = (code.properties.className as string[] | undefined) ?? [];
      const lang = cls.find((c) => c.startsWith("language-"))?.slice(9) ?? "text";
      const meta = String((code.data as { meta?: string } | undefined)?.meta ?? "");
      const title = meta.match(/title="([^"]+)"/)?.[1] ?? lang;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-frame"], dataLang: lang },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["code-top"] },
            children: [
              { type: "element", tagName: "span", properties: { className: ["dots"], ariaHidden: "true" }, children: [
                { type: "element", tagName: "i", properties: {}, children: [] },
                { type: "element", tagName: "i", properties: {}, children: [] },
                { type: "element", tagName: "i", properties: {}, children: [] },
              ] },
              { type: "element", tagName: "span", properties: { className: ["code-file"] }, children: [{ type: "text", value: title }] },
              { type: "element", tagName: "span", properties: { className: ["code-lang"] }, children: [{ type: "text", value: lang }] },
            ],
          },
          node,
        ],
      };
      return SKIP;
    });
  };
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
