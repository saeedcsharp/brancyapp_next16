import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPageClient from "brancy/app/LandingPageClient";
import SeoJsonLd from "brancy/components/website/SeoJsonLd";

const siteUrl = "https://www.brancy.app";
const supportedLocales = ["en", "fa", "ar", "fr", "ru", "tr", "gr", "az"] as const;
type SupportedLocale = (typeof supportedLocales)[number];
const hreflangLocales: Record<SupportedLocale, string> = {
  en: "en",
  fa: "fa",
  ar: "ar",
  fr: "fr",
  ru: "ru",
  tr: "tr",
  gr: "de",
  az: "az",
};

const localeMetadata: Record<SupportedLocale, { title: string; description: string }> = {
  en: {
    title: "Brancy | Instagram Management and Marketing Platform",
    description:
      "Manage Instagram content, messaging, advertising, shops, analytics, and customer workflows with Brancy.",
  },
  fa: {
    title: "برنسی | پلتفرم مدیریت و بازاریابی اینستاگرام",
    description: "مدیریت محتوا، پیام‌ها، تبلیغات، فروشگاه، تحلیل و ارتباط با مشتریان در برنسی.",
  },
  ar: {
    title: "Brancy | منصة إدارة وتسويق Instagram",
    description: "أدر محتوى Instagram والرسائل والإعلانات والمتجر والتحليلات وتدفقات العملاء مع Brancy.",
  },
  fr: {
    title: "Brancy | Plateforme de gestion et marketing Instagram",
    description:
      "Gérez le contenu Instagram, les messages, la publicité, la boutique, les analyses et vos clients avec Brancy.",
  },
  ru: {
    title: "Brancy | Платформа управления и маркетинга Instagram",
    description: "Управляйте контентом Instagram, сообщениями, рекламой, магазином, аналитикой и клиентами с Brancy.",
  },
  tr: {
    title: "Brancy | Instagram Yönetim ve Pazarlama Platformu",
    description:
      "Brancy ile Instagram içeriklerini, mesajları, reklamları, mağazayı, analizleri ve müşteri süreçlerini yönetin.",
  },
  gr: {
    title: "Brancy | Instagram-Verwaltungs- und Marketingplattform",
    description: "Verwalten Sie Instagram-Inhalte, Nachrichten, Werbung, Shop, Analysen und Kundenprozesse mit Brancy.",
  },
  az: {
    title: "Brancy | Instagram idarəetmə və marketinq platforması",
    description:
      "Brancy ilə Instagram məzmununu, mesajları, reklamları, mağazanı, analitikanı və müştəri proseslərini idarə edin.",
  },
};

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!supportedLocales.includes(locale as SupportedLocale)) return {};

  const localized = localeMetadata[locale as SupportedLocale];
  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        ...Object.fromEntries(
          supportedLocales.map((language) => [hreflangLocales[language], `${siteUrl}/${language}`]),
        ),
        "x-default": `${siteUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}/${locale}`,
      siteName: "Brancy",
      title: localized.title,
      description: localized.description,
      locale: hreflangLocales[locale as SupportedLocale],
      images: [{ url: `${siteUrl}/icons/icon-512x512.png`, alt: "Brancy" }],
    },
    twitter: {
      card: "summary",
      title: localized.title,
      description: localized.description,
      images: [`${siteUrl}/icons/icon-512x512.png`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocalizedLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!supportedLocales.includes(locale as SupportedLocale)) notFound();
  const localized = localeMetadata[locale as SupportedLocale];
  return (
    <>
      <SeoJsonLd
        locale={hreflangLocales[locale as SupportedLocale]}
        url={`${siteUrl}/${locale}`}
        title={localized.title}
        description={localized.description}
      />
      <LandingPageClient initialLanguage={locale} respectInitialLanguage />
    </>
  );
}
