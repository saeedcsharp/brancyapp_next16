import { KeyboardEvent, memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import { IClientBanner } from "saeed/models/market/myLink";
import styles from "./abouts.module.css";

const CURRENT_YEAR = new Date().getFullYear();
const BRANCY_URL = "https://www.brancy.app";

interface AboutusProps {
  data?: IClientBanner;
}

const Aboutus = memo<AboutusProps>(({ data }) => {
  const { t } = useTranslation();

  const getOwnerName = useCallback(() => {
    return data?.profile?.fullName || data?.profile?.username || t(LanguageKey.admin);
  }, [data?.profile?.fullName, data?.profile?.username, t]);

  const getAboutText = useCallback(() => {
    const owner = getOwnerName();
    return `${t(LanguageKey.marketpropertise_aboutus)}. ${t(LanguageKey.marketpropertise_copyright)}  ${owner}`;
  }, [t, getOwnerName]);

  const getCopyrightText = useCallback(() => {
    return `© ${CURRENT_YEAR} ${t(LanguageKey.marketpropertise_madeby)}`;
  }, [t]);

  const ownerName = useMemo(() => getOwnerName(), [getOwnerName]);
  const aboutText = useMemo(() => getAboutText(), [getAboutText]);
  const copyrightText = useMemo(() => getCopyrightText(), [getCopyrightText]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.open(BRANCY_URL, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <section className={styles.copyright} role="contentinfo" aria-labelledby="about-heading">
      <img
        className={styles.copyrightimg}
        loading="lazy"
        decoding="async"
        alt="Copyright information"
        title="ℹ️ copyright"
        src="/marketlink/market-copyright.webp"
        width="90"
        height="90"
      />
      <p id="about-heading">{aboutText}</p>
      <p>{t(LanguageKey.marketpropertise_aboutusslogan)}</p>
      <p className={styles.madeby}>
        {copyrightText}{" "}
        <strong className={`${styles.brancylogo} translate`}>
          <img
            loading="lazy"
            decoding="async"
            style={{ cursor: "pointer", width: "20px" }}
            title="ℹ️ Brancy"
            src="/icons/Brancy.svg"
            alt="Brancy logo"
            width="20"
            height="20"
          />
          <a
            style={{
              textDecoration: "none",
              color: "var(--color-light-blue)",
            }}
            target="_blank"
            rel="noopener noreferrer"
            href={BRANCY_URL}
            aria-label="Visit Brancy App website"
            tabIndex={0}
            onKeyDown={handleKeyDown}>
            Brancy.App
          </a>
        </strong>
      </p>
    </section>
  );
});
Aboutus.displayName = "Aboutus";
export default Aboutus;
