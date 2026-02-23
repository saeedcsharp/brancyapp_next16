import type { Metadata } from "next";
import LandingPageClient from "brancy/app/LandingPageClient";

export const metadata: Metadata = {
  title: "Brancy | Social Media Management Tool",
  description: "Advanced Instagram post management tool",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.Brancy.app/page/posts",
  },
};

export default function Page() {
  return <LandingPageClient />;
}
