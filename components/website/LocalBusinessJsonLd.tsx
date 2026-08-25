import { headers } from "next/headers";

export default async function LocalBusinessJsonLd() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.split(":")[0].toLowerCase() || "";
  const isIranianHost =
    host === "localhost" || host === "127.0.0.1" || host === "brancy.ir" || host.endsWith(".brancy.ir");

  if (!isIranianHost) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.brancy.ir/#localbusiness",
    name: "Brancy",
    url: "https://www.brancy.ir/",
    telephone: "+989138664066",
    address: {
      "@type": "PostalAddress",
      streetAddress: "خیابان هاتف، کوچه یخچال، ساختمان برنسی",
      addressLocality: "اصفهان",
      addressCountry: "IR",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
