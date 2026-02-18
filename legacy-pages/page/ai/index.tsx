import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import { useEffect, useState } from "react";
import Soon from "saeed/components/notOk/soon";
import AIPage from "saeed/components/page/ai/AI_Img_Video";
import { LoginStatus } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";

export default function PageAI() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!session) return;
    if (session.user.currentIndex === -1) router.push("/user");
    if (!LoginStatus(session)) router.push("/");
    setLoading(false);
  }, [session]);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.navbar_AI)}</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="Manage your Bran.cy account settings, preferences, and profile information" />
        <meta name="theme-color" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta
          name="keywords"
          content="brancy settings, account settings, profile settings, instagram management, user preferences"
        />
        <meta name="author" content="Bran.cy Team" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.brancy.app/setting/general" aria-label="Canonical link" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Bran.cy Settings" />
        <meta property="og:description" content="Manage your Bran.cy account settings and preferences" />
        <meta property="og:site_name" content="Bran.cy" />
        <meta property="og:url" content="https://www.brancy.app/setting/general" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:alt" content="Bran.cy Settings Page" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bran.cy Settings" />
        <meta name="twitter:site" content="@brancyapp" />
        <meta name="twitter:description" content="Manage your Bran.cy account settings and preferences" />
        <meta name="twitter:image:alt" content="Bran.cy Settings Page" />
      </Head>
      {!loading && <Soon />}
    </>
  );
}
