import { ImageResponse } from "next/og";
import { OgCard } from "../../../components/blog/OgCard";
import { formatDate, getAllPosts, getPostMeta } from "@/lib/blog";

export const alt = "Hexgate blog article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostMeta(slug);
  return new ImageResponse(
    (
      <OgCard
        title={post?.title ?? "The Hexgate Blog"}
        kicker="Blog"
        line={post?.art.find((l) => l[0] === "deny") ?? post?.art[0]}
        footer={post ? `${post.author.name} · ${formatDate(post.date)}` : "hexgate.ai/blog"}
      />
    ),
    { ...size },
  );
}
