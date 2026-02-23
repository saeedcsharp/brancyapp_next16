import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import FeatureListModal from "./FeatureListModal";
import styles from "./instagramerupgrade.module.css";
const SKIP_KEY = "instagramer-upgrade-skip";
const FIRST_LOGIN_KEY = "first-login-date";

const getSkipUntil = () => {
  if (typeof window === "undefined") return null;
  const skipUntil = localStorage.getItem(SKIP_KEY);
  return skipUntil ? new Date(skipUntil) : null;
};

const getFirstLoginDate = () => {
  if (typeof window === "undefined") return null;
  const firstLogin = localStorage.getItem(FIRST_LOGIN_KEY);
  return firstLogin ? new Date(firstLogin) : null;
};

const setFirstLoginDate = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(FIRST_LOGIN_KEY)) {
    localStorage.setItem(FIRST_LOGIN_KEY, new Date().toISOString());
  }
};

const setSkipFor3Days = () => {
  if (typeof window === "undefined") return;
  const skipUntil = new Date();
  skipUntil.setDate(skipUntil.getDate() + 3);
  localStorage.setItem(SKIP_KEY, skipUntil.toISOString());
};

const shouldShowUpgrade = () => {
  if (typeof window === "undefined") return false;

  const skipUntil = getSkipUntil();
  if (skipUntil && new Date() <= skipUntil) {
    return false;
  }

  const firstLoginDate = getFirstLoginDate();
  if (!firstLoginDate) {
    setFirstLoginDate();
    return false;
  }

  const threeDaysAfterFirstLogin = new Date(firstLoginDate);
  threeDaysAfterFirstLogin.setDate(threeDaysAfterFirstLogin.getDate() + 3);

  return new Date() >= threeDaysAfterFirstLogin;
};

const cardData = [
  {
    key: "shopper",
    style: "cardshopper",
    svg: (
      <svg
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="68"
        height="68"
        viewBox="0 0 56 56"
        aria-hidden="true"
        focusable="false">
        <rect x=".5" y=".5" width="55" height="55" rx="11.5" fill="var(--color-light-green30)" />
        <rect x=".5" y=".5" width="55" height="55" rx="11.5" stroke="var(--color-light-green60)" />
        <path
          d="M16.4 39.6C18.4 42 23.2 42 28 42s9.6-.1 11.6-2.4C42 37.6 42 32.8 42 28s-.1-9.6-2.4-11.6C37.6 14 32.8 14 28 14s-9.6.1-11.6 2.4C14 18.4 14 23.2 14 28s.1 9.6 2.4 11.6"
          fill="var(--color-light-green60)"
        />
        <path
          d="M31 20.3a4 4 0 0 1 4 3.6l.8 7v.3a4.3 4.3 0 0 1-4.3 4.5h-7a4.3 4.3 0 0 1-4.3-4.7l.8-7.1a4 4 0 0 1 4-3.6zM25 22q-1.8.2-2.2 2l-.7 7c-.2 1.5 1 2.8 2.4 2.8h7c1.4 0 2.5-1.2 2.4-2.6v-.1l-.7-7.1q-.4-1.8-2.2-2zm-.3 2.7a1 1 0 0 1 1.9 0 1.4 1.4 0 1 0 2.8 0 1 1 0 0 1 1.9 0 3.3 3.3 0 0 1-6.6 0"
          fill="var(--color-light-green)"
        />
      </svg>
    ),
    titleKey: LanguageKey.onlinestore,
    subtitleKey: LanguageKey.onlinestoreExplain,
  },
  {
    key: "advertiser",
    style: "cardadvertiser",
    svg: (
      <svg
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="68"
        height="68"
        viewBox="0 0 56 56"
        aria-hidden="true"
        focusable="false">
        <rect x=".5" y=".5" width="55" height="55" rx="11.5" fill="var(--color-purple30)" />
        <rect x=".5" y=".5" width="55" height="55" rx="11.5" stroke="var(--color-purple60)" />
        <path
          d="M23.7 14h8.6q1.6 0 2.5 1l6.2 6.2q1 1 1 2.5v8.6q0 1.5-1 2.5L34.8 41q-1 1-2.5 1h-8.6q-1.5 0-2.5-1L15 34.8q-1-1-1-2.5v-8.6q0-1.5 1-2.5l6.2-6.2q1-1 2.5-1"
          fill="var(--color-purple60)"
        />
        <path
          d="m36 30.6-2-1a1 1 0 0 0-1.5.4 1 1 0 0 0 .5 1.4l2 1a1 1 0 0 0 1.5-.4 1 1 0 0 0-.5-1.4m-6.2-8q-.7-.3-1.3 0s-1.5 1-3 1h-2.4c-2 0-3.7 1.7-3.7 3.7q.1 2.6 2.4 3.4v1.5a1.2 1.2 0 0 0 2.5 0V31h1.2c1.5 0 3 1 3 1q.7.3 1.3 0t.6-1v-7.3q0-.8-.6-1.1m-1.4 6.7q-1.2-.5-2.8-.6h-2.8q-1.3-.1-1.4-1.4.1-1.3 1.4-1.4h2.8q1.6 0 2.8-.5zm5.1-.9h2q1-.1 1.1-1-.1-1-1-1.1h-2.1a1 1 0 0 0-1.1 1q.1 1 1 1m.6-3.2 2-1q.8-.6.5-1.4a1 1 0 0 0-1.4-.5l-2.1 1a1 1 0 0 0-.5 1.4q.5 1 1.4.5"
          fill="var(--color-purple)"
        />
      </svg>
    ),
    titleKey: LanguageKey.influencer,
    subtitleKey: LanguageKey.influencerExplain,
  },
];

const InstagramerUpgrade = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [featureListOpen, setFeatureListOpen] = useState(false);

  useEffect(() => {
    setShow(shouldShowUpgrade());
  }, []);

  const handleSkip = useCallback(() => {
    setSkipFor3Days();
    setShow(false);
  }, []);

  const handleShowFeatures = useCallback(() => {
    setFeatureListOpen(true);
  }, []);

  const handleCloseFeatures = useCallback(() => {
    setFeatureListOpen(false);
  }, []);

  const handleCardUpgrade = useCallback(
    (cardKey: string) => {
      if (cardKey === "shopper") {
        router.push("/store");
      } else if (cardKey === "advertiser") {
        router.push("/advertise");
      }
    },
    [router]
  );

  const cards = useMemo(
    () =>
      cardData.map((card) => (
        <div className={styles[card.style]} key={card.key}>
          <div className={styles.cardheader}>
            {card.svg}
            <div className="headerandinput" style={{ gap: 0 }}>
              <h1 className={styles.cardheadertitle}>{t(card.titleKey)}</h1>
              <p className={styles.cardheadersubtitle}>{t(card.subtitleKey)}</p>
            </div>
          </div>
          <button
            className={styles.upgradeBtn}
            tabIndex={0}
            aria-label={t(card.titleKey)}
            onClick={() => handleCardUpgrade(card.key)}>
            {t(LanguageKey.activate)}
          </button>
        </div>
      )),
    [t, handleCardUpgrade]
  );

  if (!show) return null;

  return (
    <>
      <section className={styles.upgradeContainer} aria-label={t(LanguageKey.freedays)}>
        <div className={styles.freecard}>
          <h1 className={styles.title} tabIndex={0} aria-label={t(LanguageKey.freedays)}>
            {/* {t(LanguageKey.freedays)} */}
            {/* <br /> */}
            <strong>{t(LanguageKey.page9_freeplan)}!</strong>
          </h1>
          <h2 className={styles.subtitle} tabIndex={0} aria-label={t(LanguageKey.instagramerplanactive)}>
            <strong>{t(LanguageKey.instagramerplanactive)}!</strong>
            {t(LanguageKey.freedaysExplain)}
          </h2>
          <div className={styles.buttonContainer}>
            <span
              onClick={handleShowFeatures}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              role="button"
              aria-label={t(LanguageKey.page9_Compare)}>
              {t(LanguageKey.page9_Compare)}
            </span>
            <span onClick={handleSkip} tabIndex={0} role="button" aria-label={t(LanguageKey.skipfornow)}>
              {t(LanguageKey.skipfornow)}
            </span>
          </div>
        </div>
        <div className={styles.cardsparent}>{cards}</div>
      </section>
      <FeatureListModal open={featureListOpen} onClose={handleCloseFeatures} />
    </>
  );
};

export default InstagramerUpgrade;
