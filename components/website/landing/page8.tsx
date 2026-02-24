import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import useMousePosition from "brancy/helper/useMousePosition";
import styles from "./page8.module.css";

const Page8 = () => {
  const { t } = useTranslation();
  useMousePosition();

  return (
    <section className={styles.page8}>
      <div className={styles.fadecircle} />
      <div className={styles.header}>
        <div className={styles.goli} />
        <div className={styles.title}>{t(LanguageKey.page8_HelpCenter)} </div>
      </div>

      <div className={styles.cardsrowone}>
        <div className={`${styles.card} ${styles.effect}`}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.helpcardimage}
            alt="community"
            src="brancy/components/website/landing/landing/page8_community.png"
          />
          <div className={styles.helpcardcontent}>
            <div className={styles.helpcardtitle}> {t(LanguageKey.page8_Community)}</div>
            <div className={styles.helpcardexplain}>{t(LanguageKey.page8_CommunityExplain)}</div>

            <a href="/Accessibility/Help-Center" className={styles.button}>
              {t(LanguageKey.page8_CommunityBTN)}

              <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6.7-6.7m6.7 6.7-6.7 6.8" />
              </svg>
            </a>
          </div>
        </div>

        <div className={`${styles.card} ${styles.effect}`}>
          <div className={styles.helpcardcontent}>
            <div className={styles.helpcardtitle}> {t(LanguageKey.page8_learn)}</div>
            <div className={styles.helpcardexplain}>{t(LanguageKey.page8_learnExplain)}</div>
            <a href="/Accessibility/Articles" className={styles.button}>
              {t(LanguageKey.page8_learnBTN)}

              <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6.7-6.7m6.7 6.7-6.7 6.8" />
              </svg>
            </a>
          </div>
          <img
            loading="lazy"
            decoding="async"
            className={styles.helpcardimage}
            alt="learn"
            src="brancy/components/website/landing/landing/page8_learn.png"
          />
        </div>
      </div>
      <div className={styles.cardsrowtwo}>
        <div className={`${styles.card} ${styles.effect}`}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.helpcardimage}
            alt="blog"
            src="brancy/components/website/landing/landing/page8_blog.png"
          />
          <div className={styles.helpcardcontent}>
            <div className={styles.helpcardtitle}>{t(LanguageKey.page8_Blog)}</div>
            <div className={styles.helpcardexplain}>{t(LanguageKey.page8_BlogExplain)}</div>
            <a href="/Accessibility/Latest-news" className={styles.button}>
              {t(LanguageKey.page8_BlogBTN)}
              <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6.7-6.7m6.7 6.7-6.7 6.8" />
              </svg>
            </a>
          </div>
        </div>

        <div className={`${styles.card} ${styles.effect}`}>
          <div className={styles.helpcardcontent}>
            <div className={styles.helpcardtitle}>{t(LanguageKey.page8_FAQ)}</div>
            <div className={styles.helpcardexplain}>{t(LanguageKey.page8_FAQExplain)}</div>
            <a href="/Accessibility/FAQ" className={styles.button}>
              {t(LanguageKey.page8_FAQBTN)}
              <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6.7-6.7m6.7 6.7-6.7 6.8" />
              </svg>
            </a>
          </div>
          <img
            loading="lazy"
            decoding="async"
            className={styles.helpcardimage}
            alt="faq"
            src="brancy/components/website/landing/landing/page8_faq.png"
          />
        </div>
      </div>
      <div className={styles.cardsrowthree}>
        <div className={`${styles.card} ${styles.effect}`}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.helpcardimage}
            alt="support"
            src="brancy/components/website/landing/landing/page8_support.png"
          />
          <div className={styles.helpcardcontent}>
            <div className={styles.helpcardtitle}>{t(LanguageKey.page8_Support)}</div>
            <div className={styles.helpcardexplain}>{t(LanguageKey.page8_SupportExplain)}</div>
            <a href="/Accessibility/Support" className={styles.button}>
              {t(LanguageKey.page8_SupportBTN)}

              <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6.7-6.7m6.7 6.7-6.7 6.8" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page8;
