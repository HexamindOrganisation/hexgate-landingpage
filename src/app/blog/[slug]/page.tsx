/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubNav, SiteFooter } from "../../../components/SiteChrome";
import { HexamindBand } from "../../../components/Hexamind";
import { CopyInstall } from "../../../components/CopyInstall";
import { PostArt } from "../../../components/blog/PostArt";
import { CodeCopy, ReadingProgress, ShareBar, Toc } from "../../../components/blog/ArticleClient";
import { APP_URL } from "@/lib/links";
import { BLOG_URL, SITE_URL, formatDate, getAllPosts, getPost } from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Hexgate Blog`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: post.url,
      types: { "application/rss+xml": [{ url: `${BLOG_URL}/rss.xml`, title: "Hexgate Blog" }] },
    },
    openGraph: {
      type: "article",
      url: post.url,
      siteName: "Hexgate",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const related = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 2);
  const primaryTag = post.tags[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${post.url}#article`,
        headline: post.title,
        description: post.description,
        image: [`${post.url}/opengraph-image`, ...(post.cover ? [`${SITE_URL}${post.cover.src}`] : [])],
        datePublished: post.date,
        dateModified: post.updated,
        author: { "@type": "Person", name: post.author.name, worksFor: { "@id": "https://hexamind.ai/#org" } },
        publisher: { "@id": "https://hexamind.ai/#org" },
        mainEntityOfPage: { "@type": "WebPage", "@id": post.url },
        isPartOf: { "@id": `${BLOG_URL}#blog` },
        articleSection: primaryTag,
        keywords: post.tags.join(", "),
        wordCount: post.wordCount,
        timeRequired: `PT${post.readingMinutes}M`,
        inLanguage: "en",
        about: { "@id": "https://hexgate.ai/#sdk" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hexgate", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
          { "@type": "ListItem", position: 3, name: post.title, item: post.url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SubNav current="blog" />
      <ReadingProgress />

      <main>
        <article className="post" aria-labelledby="post-title">
          <header className="hero post-hero">
            <div className="glow" />
            <div className="grid-bg" />
            <div className="wrap post-head">
              <nav className="crumbs" aria-label="Breadcrumb">
                <ol>
                  <li>
                    <Link href="/blog">Blog</Link>
                  </li>
                  <li aria-current="page">{primaryTag}</li>
                </ol>
              </nav>
              <h1 id="post-title">{post.title}</h1>
              {post.dek ? <p className="post-dek">{post.dek}</p> : null}
              <div className="byline">
                <span className="avatar" aria-hidden="true">
                  {post.author.initials}
                </span>
                <span className="byline-text">
                  <span className="byline-name">{post.author.name}</span>
                  <span className="byline-sub">
                    {post.author.org} · <time dateTime={post.date}>{formatDate(post.date)}</time> ·{" "}
                    {post.readingMinutes} min read
                  </span>
                </span>
              </div>
            </div>
          </header>

          <div className="wrap">
            {post.cover ? (
              <figure className="post-cover">
                <img
                  src={post.cover.src}
                  alt={post.cover.alt}
                  width={post.cover.width}
                  height={post.cover.height}
                  fetchPriority="high"
                />
              </figure>
            ) : (
              <div className="post-cover post-cover--art">
                <PostArt lines={post.art} size="lg" id={`p-${post.slug}`} />
              </div>
            )}

            <div className="post-layout">
              <aside className="post-aside">
                <nav className="toc" aria-label="Table of contents">
                  <p className="toc-k">On this page</p>
                  <Toc items={post.toc} />
                </nav>
              </aside>

              <div className="post-main">
                {post.hook ? (
                  <p className="post-hook">
                    <span className="post-hook-v">DENY</span>
                    {post.hook}
                  </p>
                ) : null}
                <details className="toc-mobile">
                  <summary>On this page</summary>
                  <ol>
                    {post.toc
                      .filter((t) => t.depth === 2)
                      .map((t) => (
                        <li key={t.id}>
                          <a href={`#${t.id}`}>{t.text}</a>
                        </li>
                      ))}
                  </ol>
                </details>

                <div id="post-body" className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
                <CodeCopy />

                <footer className="post-foot">
                  <div className="post-tags">
                    {post.tags.map((t) => (
                      <span className="post-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <ShareBar url={post.url} title={post.title} />
                  <div className="author-card">
                    <span className="avatar lg" aria-hidden="true">
                      {post.author.initials}
                    </span>
                    <div>
                      <p className="author-k">Written by</p>
                      <p className="author-name">{post.author.name}</p>
                      <p className="author-sub">
                        {post.author.org}, the team behind Hexgate. Updated{" "}
                        <time dateTime={post.updated}>{formatDate(post.updated)}</time>.
                      </p>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </article>

        <section className="block" aria-labelledby="post-cta-title" style={{ paddingTop: 24, paddingBottom: 40 }}>
          <div className="wrap">
            <div className="post-cta">
              <div>
                <span className="eyebrow">Put a gate in front of your agent</span>
                <h2 id="post-cta-title">Per-user rules on every tool call, in two lines.</h2>
                <p>Wrap your OpenAI Agents, LangChain, Google ADK or Pydantic AI agent. Deny by default, audited end to end.</p>
              </div>
              <div className="post-cta-actions">
                <CopyInstall id="copyBtnPost" />
                <a className="btn btn-primary" href={APP_URL}>
                  Try the cloud version
                </a>
              </div>
            </div>
          </div>
        </section>

        {related.length ? (
          <section className="block" aria-labelledby="related-title" style={{ paddingTop: 32 }}>
            <div className="wrap">
              <div className="sec-head" style={{ marginBottom: 28 }}>
                <span className="eyebrow">Keep reading</span>
                <h2 id="related-title">More from the blog</h2>
              </div>
              <ul className="post-grid two">
                {related.map((p) => (
                  <li key={p.slug}>
                    <article className="post-card">
                      <Link href={`/blog/${p.slug}`} className="post-card-link" aria-label={p.title}>
                        <PostArt lines={p.art} size="sm" id={`r-${p.slug}`} />
                      </Link>
                      <div className="post-card-body">
                        <h3>
                          <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                        </h3>
                        <p>{p.description}</p>
                        <div className="post-meta">
                          <time dateTime={p.date}>{formatDate(p.date)}</time>
                          <span aria-hidden="true">·</span>
                          <span>{p.readingMinutes} min read</span>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>

      <HexamindBand />
      <SiteFooter />
    </>
  );
}
