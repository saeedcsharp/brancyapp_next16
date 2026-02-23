import Head from "next/head";
import { useTranslation } from "react-i18next";
import FiveStar from "brancy/components/fiveStar";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/market/properties/popups/featureBoxPU.module.css";
const FeatureBox = (props: { removeMask: () => void }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.marketPropertiesFeaturebox)}</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className="title">{t(LanguageKey.marketPropertiesFeaturebox)}</div>

      <div className={styles.features}>
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="follower"
            src="/marketlink/market-follower.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.tiletitleblue}>1.1 M</div>
            <div className={styles.tileexplainblue}>{t(LanguageKey.home_Followers)}</div>
          </div>
        </div>

        {/* tile rating */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="review rate"
            src="/marketlink/market-rate.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.tileexplainyellow}>732</div>
            <FiveStar rating={4.5} />
          </div>
        </div>

        {/* WORK HOURS */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="work hours"
            src="/marketlink/icon-work.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.tileexplainred}>{t(LanguageKey.marketProperties_yourBusinesshours)}</div>
          </div>
        </div>

        {/* verified */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="verified"
            src="/marketlink/market-enamad.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.tileexplaingreen}>
              {" "}
              <img
                className={styles.verfiedicon}
                style={{ height: "16px" }}
                alt="badge-verified"
                src="/badge-verified1.svg"
              />{" "}
              {t(LanguageKey.VERFIED)}
            </div>
          </div>
        </div>

        {/* terms */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="terms"
            src="/marketlink/icon-terms.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.tileexplainred}>{t(LanguageKey.marketProperties_yourBusinessTerms)}</div>
          </div>
        </div>

        {/* tariff and price */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="price"
            src="/marketlink/icon-price.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.tileexplainblue}>{t(LanguageKey.marketProperties_yourtariff)}</div>
          </div>
        </div>

        {/* ads */}
        <div className={styles.tile}>
          <img loading="lazy" decoding="async" className={styles.tileimage} alt="ads" src="/marketlink/icon-ads.webp" />
          <div className={styles.tiledescription}>
            <div className={styles.tiletitlered}>1.2 K</div>
            <div className={styles.tileexplainred}>{t(LanguageKey.SuccessADS)}</div>
          </div>
        </div>

        {/* successful */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="successful sale"
            src="/marketlink/icon-successful.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.tiletitlegreen}>1.2 K</div>
            <div className={styles.tileexplaingreen}>{t(LanguageKey.SuccessSALES)}</div>
          </div>
        </div>

        {/* start ads */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="start ads"
            src="/marketlink/market-startorder.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.btn}>{t(LanguageKey.StartOrder)}</div>
          </div>
        </div>
        {/* start shop */}
        <div className={styles.tile}>
          <img
            loading="lazy"
            decoding="async"
            className={styles.tileimage}
            alt="start shop"
            src="/marketlink/market-startorder.webp"
          />
          <div className={styles.tiledescription}>
            <div className={styles.btn}>{t(LanguageKey.Startshoping)}</div>
          </div>
        </div>
      </div>

      <div className="ButtonContainer">
        <div className="cancelButton" onClick={props.removeMask}>
          {t(LanguageKey.cancel)}
        </div>
        <div className="saveButton"> {t(LanguageKey.save)}</div>
      </div>
    </>
  );
};

export default FeatureBox;
