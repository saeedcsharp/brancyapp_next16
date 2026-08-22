import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicPage, { getTopicCopy, locales, topics } from "brancy/components/website/content/TopicPage";

const siteUrl = "https://www.brancy.app";
const hreflangLocales: Record<string, string> = {
  en: "en",
  fa: "fa",
  ar: "ar",
  fr: "fr",
  ru: "ru",
  tr: "tr",
  gr: "de",
  az: "az",
};

export function generateStaticParams() {
  return locales.flatMap((locale) => topics.map((topic) => ({ locale, topic })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}): Promise<Metadata> {
  const { locale, topic } = await params;
  if (!locales.includes(locale as (typeof locales)[number]) || !topics.includes(topic as (typeof topics)[number]))
    return {};
  const content = getTopicCopy(locale, topic);
  const url = `${siteUrl}/${locale}/resources/${topic}`;
  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          locales.map((language) => [hreflangLocales[language], `${siteUrl}/${language}/resources/${topic}`]),
        ),
        "x-default": `${siteUrl}/en/resources/${topic}`,
      },
    },
    openGraph: {
      type: "article",
      url,
      siteName: "Brancy",
      title: content.title,
      description: content.description,
      locale: hreflangLocales[locale],
    },
    twitter: { card: "summary", title: content.title, description: content.description },
    robots: { index: true, follow: true },
  };
}

export default async function LocalizedTopicRoute({ params }: { params: Promise<{ locale: string; topic: string }> }) {
  const { locale, topic } = await params;
  if (!locales.includes(locale as (typeof locales)[number]) || !topics.includes(topic as (typeof topics)[number]))
    notFound();
  return <TopicPage locale={locale} topic={topic} />;
}
