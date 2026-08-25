import type { Metadata } from "next";
import LandingPageClient from "brancy/app/LandingPageClient";
import SeoJsonLd from "brancy/components/website/SeoJsonLd";

const siteUrl = "https://www.brancy.app";
const localizedLandingRoutes = {
  en: `${siteUrl}/en`,
  fa: `${siteUrl}/fa`,
  ar: `${siteUrl}/ar`,
  fr: `${siteUrl}/fr`,
  ru: `${siteUrl}/ru`,
  tr: `${siteUrl}/tr`,
  de: `${siteUrl}/gr`,
  az: `${siteUrl}/az`,
  "x-default": `${siteUrl}/en`,
};

export const metadata: Metadata = {
  title: "Brancy | Social Media Management Tool",
  description:
    "Brancy helps businesses manage Instagram content, messaging, advertising, shops, and customer workflows in one platform.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.brancy.app/",
    languages: localizedLandingRoutes,
  },
};

export default function Page() {
  return (
    <>
      <SeoJsonLd
        locale="en"
        url={siteUrl}
        title="Brancy | Instagram Management and Marketing Platform"
        description="Brancy helps businesses manage Instagram content, messaging, advertising, shops, analytics, and customer workflows in one platform."
      />
      <LandingPageClient />
    </>
  );
}
