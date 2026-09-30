import type { Metadata } from "next";
import Link from "next/link";
import { SubNav, SiteFooter } from "../../components/SiteChrome";
import { HexamindBand } from "../../components/Hexamind";
import { PostArt } from "../../components/blog/PostArt";
import { PostGrid } from "../../components/blog/PostGrid";
import { BLOG_URL, SITE_URL, formatDate, getAllPosts } from "@/lib/blog";

const TITLE = "Hexgate Blog: AI Agent Security, OWASP & Authorization";
const DESCRIPTION =
  "Field notes on securing AI agents from the team behind Hexgate: the OWASP Top 10 for Agentic Applications, identity-aware authorization, real incidents, and hands-on guides.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: BLOG_URL,
    types: { "application/rss+xml": [{ url: `${BLOG_URL}/rss.xml`, title: "Hexgate Blog" }] },
  },
  openGraph: {
    type: "website",
    url: BLOG_URL,
    siteName: "Hexgate",
    title: "The Hexgate Blog",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "The Hexgate Blog", description: DESCRIPTION },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${BLOG_URL}#blog`,
        name: "The Hexgate Blog",
        description: DESCRIPTION,
        url: BLOG_URL,
        inLanguage: "en",
        publisher: { "@id": "https://hexamind.ai/#org" },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: p.url,
          datePublished: p.date,
          dateModified: p.updated,
          author: { "@type": "Person", name: p.author.name },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hexgate", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
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

      <header className="hero blog-hero">
        <div className="glow" />
        <div className="grid-bg" />
        <div className="wrap">
          <div className="blog-hero-inner">
            <p className="kicker">The Hexgate blog</p>
            <h1>
              Field notes
              <br />
              <span className="accent">from the gate.</span>
            </h1>
            <p className="lede">
              Agent security, the OWASP agentic Top 10, and what we learn building Hexgate. Written by the team at
              Hexamind.
            </p>
            <a className="rss-link" href="/blog/rss.xml">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1.4" fill="currentColor" />
              </svg>
              Subscribe via RSS
            </a>
          </div>
        </div>
      </header>

      <main>
        {featured ? (
          <section className="block" aria-labelledby="featured-title" style={{ paddingTop: 8, paddingBottom: 40 }}>
            <div className="wrap">
              <article className="featured">
                <Link href={`/blog/${featured.slug}`} className="featured-art" aria-label={featured.title}>
                  <PostArt lines={featured.art} size="lg" id={`f-${featured.slug}`} />
                </Link>
                <div className="featured-body">
                  <span className="eyebrow">Latest</span>
                  <h2 id="featured-title">
                    <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
                  </h2>
                  <p>{featured.description}</p>
                  <div className="post-meta">
                    <span>{featured.author.name}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{featured.readingMinutes} min read</span>
                  </div>
                  <Link className="btn btn-primary featured-cta" href={`/blog/${featured.slug}`}>
                    Read the article
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        <section className="block" aria-labelledby="all-title" style={{ paddingTop: 24 }}>
          <div className="wrap">
            <div className="sec-head" style={{ marginBottom: 28 }}>
              <span className="eyebrow">Archive</span>
              <h2 id="all-title">All articles</h2>
            </div>
            <PostGrid
              posts={[featured, ...rest].filter(Boolean).map((p) => ({
                slug: p.slug,
                title: p.title,
                description: p.description,
                date: p.date,
                dateLabel: formatDate(p.date),
                tags: p.tags,
                readingMinutes: p.readingMinutes,
                art: p.art,
                author: p.author.name,
              }))}
            />
          </div>
        </section>
      </main>

      <HexamindBand />
      <SiteFooter />
    </>
  );
}
