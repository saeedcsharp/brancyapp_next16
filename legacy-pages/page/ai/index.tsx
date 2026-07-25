import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import { useEffect, useState } from "react";
import Soon from "brancy/components/notOk/soon";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import styles from "./pageAI.module.css";
import Link from "next/link";
import Modal from "brancy/components/design/modal";
import NotFeature from "brancy/components/notOk/notFeature";
import { checkPackageFeature, fetchAndCheckFeature } from "brancy/helper/checkFeature";
import { PsgFeatureType } from "brancy/models/enums";

export default function PageAI() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    if (!session) return;
    if (session.user.currentIndex === -1) router.push("/user");
    if (!LoginStatus(session)) router.push("/");
    setLoading(false);
  }, [session]);
  const typeCards = [
    {
      slug: "createImage",
      label: "Create Image",
      description: "Generate images using AI.",
      icon: " 🖼️",
      cardClass: styles.typeCardShop,
      iconClass: styles.typeCardIconShop,
    },
    {
      slug: "createVideo",
      label: "Create Video",
      description: "Generate videos using AI.",
      icon: "🎥",
      cardClass: styles.typeCardVShop,
      iconClass: styles.typeCardIconVShop,
    },
  ];
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
      {/* {!loading && <Soon />} */}
      <div className={styles.container}>
        <div className={styles.typeGrid}>
          {typeCards.map((card) => (
            <button
              key={card.slug}
              onClick={async () => {
                if (!(await fetchAndCheckFeature(PsgFeatureType.AI, session))) {
                  setShowPopup(true);
                  return;
                }
                window.location.href = `/page/ai/${card.slug}`;
              }}
              className={`${styles.typeCard} ${card.cardClass}`}>
              <div className={`${styles.typeCardIcon} ${card.iconClass}`}>{card.icon}</div>
              <p className={styles.typeCardTitle}>{card.label}</p>
              <p className={styles.typeCardDesc}>{card.description}</p>
              <span className={styles.typeCardArrow}>→</span>
            </button>
          ))}
        </div>
      </div>
      <Modal
        closePopup={function (): void {
          setShowPopup(false);
        }}
        classNamePopup={"popupSendFile"}
        showContent={showPopup}>
        <NotFeature
          onClose={function (): void {
            setShowPopup(false);
          }}
        />
      </Modal>
    </>
  );
}
