import type { MetadataRoute } from "next";

const siteUrl = "https://www.brancy.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en", "/fa", "/ar", "/fr", "/ru", "/tr", "/gr", "/az", "/Accessibility/"],
        disallow: [
          "/api/",
          "/dev/",
          "/directlogin",
          "/feature",
          "/invitation/",
          "/payment/",
          "/redirectInterface",
          "/test/",
          "/store/",
          "/page/",
          "/message/",
          "/market/",
          "/wallet/",
          "/setting/",
          "/advertise/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
