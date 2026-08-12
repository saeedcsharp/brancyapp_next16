import type { Metadata } from "next";
import FeatureKnowledgeBase from "./FeatureKnowledgeBase";

export const metadata: Metadata = {
  title: "Brancy Features",
  description: "Evidence-backed Brancy feature reference for content teams.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FeaturePage() {
  return <FeatureKnowledgeBase />;
}
