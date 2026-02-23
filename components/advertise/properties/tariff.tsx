import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PriceFormater, { PriceFormaterClassName, PriceType } from "../../priceFormater";
import useHideDiv from "../../../hook/useHide";
import { LanguageKey } from "../../../i18n";
import { ITariff } from "../../../models/advertise/peoperties";
import styles from "./propertiesComponent.module.css";
function Tariff(props: { setShowTariffPopup: (showTarifPopup: boolean) => void; tariif: ITariff }) {
  const { t } = useTranslation();
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 82);
  const [lastModified, setLastModified] = useState("");

  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${
      now.getMonth() + 1
    }/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    setLastModified(formattedDate);
  }, []);

  return (
    <section className="tooBigCard" style={gridSpan}>
      <div className={styles.all}>
        <div className="frameParent">
          <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
            <div className="circle"></div>
            <h2 className="Title">{t(LanguageKey.advertiseProperties_advertisetariff)}</h2>
          </div>
          <div
            title="◰ Edit price tariff"
            onClick={() => props.setShowTariffPopup(true)}
            className="twoDotIconContainer">
            <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5">
              <path
                fill="var(--color-gray)"
                d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
              />
            </svg>
          </div>
        </div>
        {hidePage && (
          <div className={styles.all}>
            <div className={styles.section2}>
              <div className={styles.section}>
                <div className={styles.headerparent} style={{ justifyContent: "center" }}>
                  <div className={styles.headertitle2}>
                    <strong>{t(LanguageKey.advertiseProperties_onlyToday)}</strong>
                  </div>
                </div>
                <div className={styles.explain1}>{t(LanguageKey.advertiseProperties_onlyTodayexplain)}</div>
              </div>
              <div className={styles.content}>
                <div className={styles.price}>
                  <div className={styles.priceheader}>{t(LanguageKey.navbar_Post)}</div>

                  <div className={styles.post}>
                    <PriceFormater
                      fee={props.tariif.todayTariff.post.semiDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.halfday}>{t(LanguageKey.advertiseProperties_tariff12hours)}</div>
                  </div>

                  <div className={styles.story}>
                    <PriceFormater
                      fee={props.tariif.todayTariff.post.fullDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
                  </div>
                </div>
                <div className={styles.line}></div>
                <div className={styles.price}>
                  <div className={styles.priceheader}>{t(LanguageKey.navbar_Story)}</div>
                  <div className={styles.post}>
                    <PriceFormater
                      fee={props.tariif.todayTariff.story.semiDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.halfday}>{t(LanguageKey.advertiseProperties_tariff12hours)}</div>
                  </div>
                  <div className={styles.story}>
                    <PriceFormater
                      fee={props.tariif.todayTariff.story.fullDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section2}>
              <div className={styles.section}>
                <div className={styles.headerparent} style={{ justifyContent: "center" }}>
                  <div className={styles.headertitle2}>
                    <strong>{t(LanguageKey.advertiseProperties_otherdays)}</strong>
                  </div>
                </div>
                <div className={styles.explain1}>{t(LanguageKey.advertiseProperties_otherdaysexplain)}</div>
              </div>
              <div className={styles.content}>
                <div className={styles.price}>
                  <div className={styles.priceheader}>{t(LanguageKey.navbar_Post)}</div>
                  <div className={styles.post}>
                    <PriceFormater
                      fee={props.tariif.basicTariif.post.semiDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.halfday}>{t(LanguageKey.advertiseProperties_tariff12hours)}</div>
                  </div>
                  <div className={styles.story}>
                    <PriceFormater
                      fee={props.tariif.basicTariif.post.fullDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
                  </div>
                </div>
                <div className={styles.line}></div>
                <div className={styles.price}>
                  <div className={styles.priceheader}>{t(LanguageKey.navbar_Story)}</div>
                  <div className={styles.post}>
                    <PriceFormater
                      fee={props.tariif.basicTariif.story.semiDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.halfday}>{t(LanguageKey.advertiseProperties_tariff12hours)}</div>
                  </div>
                  <div className={styles.story}>
                    <PriceFormater
                      fee={props.tariif.basicTariif.story.fullDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section2}>
              <div className={styles.section}>
                <div className={styles.headerparent} style={{ justifyContent: "center" }}>
                  <div className={styles.headertitle2}>
                    <strong> {t(LanguageKey.advertiseProperties_Campaign)}</strong>
                  </div>
                </div>
                <div className={styles.explain1}>{t(LanguageKey.advertiseProperties_Campaignexplain)}</div>
              </div>
              <div className={styles.content}>
                <div className={styles.price}>
                  <div className={styles.priceheader}>{t(LanguageKey.navbar_Post)}</div>
                  <div className={styles.post}>
                    <PriceFormater
                      fee={props.tariif.campaign.post.fullDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
                  </div>
                </div>
                <div className={styles.line}></div>
                <div className={styles.price}>
                  <div className={styles.priceheader}>{t(LanguageKey.navbar_Story)}</div>
                  <div className={styles.post}>
                    <PriceFormater
                      fee={props.tariif.campaign.story.fullDayPrice}
                      pricetype={PriceType.Dollar}
                      className={PriceFormaterClassName.PostPrice}
                    />
                    <div className={styles.fullday}>{t(LanguageKey.advertiseProperties_tariff24hours)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.advertiseProperties_lastModified)}: <strong>{lastModified}</strong>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Tariff;
