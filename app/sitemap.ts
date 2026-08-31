import type { MetadataRoute } from "next";
import { categorySlugs, siteConfig } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/avis-clients", "/contact", "/mentions-legales", "/politique-confidentialite"];
  return [
    ...routes.map((route) => ({
      url: `${siteConfig.siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("monthly" as const) : ("yearly" as const),
      priority: route === "" ? 1 : 0.6,
    })),
    ...categorySlugs.map((slug) => ({
      url: `${siteConfig.siteUrl}/galerie/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
