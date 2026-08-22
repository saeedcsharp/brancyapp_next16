type SeoJsonLdProps = {
  locale: string;
  url: string;
  title: string;
  description: string;
};

export default function SeoJsonLd({ locale, url, title, description }: SeoJsonLdProps) {
  const graph = [
    {
      "@type": "Organization",
      "@id": "https://www.brancy.app/#organization",
      name: "Brancy",
      url: "https://www.brancy.app/",
      logo: "https://www.brancy.app/icons/icon-192x192.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.brancy.app/#website",
      url,
      name: title,
      description,
      inLanguage: locale,
      publisher: { "@id": "https://www.brancy.app/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${url}#application`,
      name: "Brancy",
      url,
      description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      publisher: { "@id": "https://www.brancy.app/#organization" },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
