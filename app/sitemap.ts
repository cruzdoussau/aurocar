import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://aurocar.cl";
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/agendar`, lastModified: new Date() },
    { url: `${base}/servicios`, lastModified: new Date() }
  ];
}
