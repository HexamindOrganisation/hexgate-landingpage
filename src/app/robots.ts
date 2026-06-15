import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://hexgate.ai/sitemap.xml",
    host: "https://hexgate.ai",
  };
}
