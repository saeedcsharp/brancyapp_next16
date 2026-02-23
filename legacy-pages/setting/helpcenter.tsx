import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";

import Soon from "../../components/notOk/soon";
import { packageStatus } from "../../helper/loadingStatus";

const HelpCenter = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);
  const { t } = useTranslation();

  return (
    <>
      {/* head for SEO */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.navbar_HelpCenter)}</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="Get help and support for your Bran.cy account" />
        <meta name="theme-color" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="keywords" content="brancy help, help center, support, customer service, faq" />
        <meta name="author" content="Bran.cy Team" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.brancy.app/setting/helpcenter" aria-label="Canonical link" />
      </Head>

      <div className="pinContainer">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Soon />
        </div>
      </div>
    </>
  );
};

export default HelpCenter;
