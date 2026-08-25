import type { MetadataRoute } from "next";

const siteUrl = "https://www.brancy.app";
const supportedLocales = ["en", "fa", "ar", "fr", "ru", "tr", "gr", "az"];
const topics = ["management", "automation", "analytics", "marketing", "ai"];

const publicRoutes = [
  "/",
  "/Accessibility/About-Us",
  "/Accessibility/Articles",
  "/Accessibility/Contact-Us",
  "/Accessibility/Cookie-Notice",
  "/Accessibility/FAQ",
  "/Accessibility/Follow-Us",
  "/Accessibility/Help-Center",
  "/Accessibility/join-Us",
  "/Accessibility/Latest-news",
  "/Accessibility/privacy-policy",
  "/Accessibility/Product-Updates",
  "/Accessibility/Report-an-Issue",
  "/Accessibility/Support",
  "/Accessibility/Terms-and-conditions",
  "/llms.txt",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const localizedRoutes = supportedLocales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
  const topicRoutes = supportedLocales.flatMap((locale) =>
    topics.map((topic) => ({
      url: `${siteUrl}/${locale}/resources/${topic}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  const publicEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${siteUrl}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "/" ? 1 : 0.6,
  }));

  return [...localizedRoutes, ...topicRoutes, ...publicEntries];
}
