import Head from "next/head";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import styles from "./featureBoxPU.module.css";
import { useState, ReactNode } from "react";
type FeatureItem = {
  id: string;
  img: string;
  alt: string;
  title: ReactNode;
  explain?: ReactNode;
};
const FeatureBox = (props: { removeMask: () => void }) => {
  const { t } = useTranslation();
  const features: FeatureItem[] = [
    {
      id: "followers",
      img: "/marketlink/market-follower.webp",
      alt: "follower",
      title: t(LanguageKey.marketProperties_followersrate),
      explain: t(LanguageKey.marketProperties_followersrateExplain),
    },
    {
      id: "rating",
      img: "/marketlink/market-rate.webp",
      alt: "review rate",
      title: t(LanguageKey.marketProperties_successRating),
      explain: t(LanguageKey.marketProperties_successRatingExplain),
    },
    {
      id: "work_hours",
      img: "/marketlink/icon-work.webp",
      alt: "work hours",
      title: t(LanguageKey.marketProperties_bussinessHours),
      explain: t(LanguageKey.marketProperties_bussinessHoursExplain),
    },
    {
      id: "verified",
      img: "/marketlink/market-enamad.webp",
      alt: "verified",
      title: t(LanguageKey.marketProperties_Enamadverified),
      explain: t(LanguageKey.marketProperties_EnamadverifiedExplain),
    },
    {
      id: "terms",
      img: "/marketlink/icon-terms.webp",
      alt: "terms",
      title: t(LanguageKey.marketProperties_BusinessTerms),
      explain: t(LanguageKey.marketProperties_BusinessTermsExplain),
    },
    {
      id: "price",
      img: "/marketlink/icon-price.webp",
      alt: "price",
      title: t(LanguageKey.marketProperties_tariff),
      explain: t(LanguageKey.marketProperties_TariffExplain),
    },
    {
      id: "ads",
      img: "/marketlink/icon-ads.webp",
      alt: "ads",
      title: t(LanguageKey.marketProperties_StartADS),
      explain: t(LanguageKey.marketProperties_StartADSExplain),
    },
    {
      id: "sales",
      img: "/marketlink/icon-successful.webp",
      alt: "successful sale",
      title: t(LanguageKey.marketProperties_StartSALES),
      explain: t(LanguageKey.marketProperties_StartSALESExplain),
    },
  ];
  const [selected, setSelected] = useState<string[]>([]);
  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSave = async () => {
    const payload = {
      selectedFeatures: selected,
    };
    console.log("SEND TO SERVER:", payload);
  };
  return (
    <>
      <Head>
        <title>Bran.cy ▸ {t(LanguageKey.marketPropertiesFeaturebox)}</title>
      </Head>
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.marketPropertiesFeaturebox)}</div>
        <div className="explain">{t(LanguageKey.marketPropertiesFeatureboxexplain)}</div>
      </div>
      <div className={styles.features}>
        {features.map((item) => {
          const isChecked = selected.includes(item.id);
          return (
            <div
              key={item.id}
              className={`${styles.tile} ${isChecked ? styles.checked : ""}`}
              onClick={() => toggleSelect(item.id)}>
              <CheckBoxButton
                value={isChecked}
                name={item.id}
                title=""
                handleToggle={(e) => {
                  e.stopPropagation();
                  toggleSelect(item.id);
                }}
                className={styles.checkbox}
              />

              <div className={styles.tileimage}>
                <img loading="lazy" decoding="async" className={styles.idimage} alt={item.alt} src={item.img} />
              </div>

              <div className="headerandinput">
                <div className="title2">{item.title}</div>
                <div className="explain">{item.explain}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="ButtonContainer">
        <div className="cancelButton" onClick={props.removeMask}>
          {t(LanguageKey.cancel)}
        </div>
        <div className="saveButton" onClick={handleSave}>
          {t(LanguageKey.save)}
        </div>
      </div>
    </>
  );
};

export default FeatureBox;
