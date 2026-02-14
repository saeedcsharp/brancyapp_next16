import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import BlurInputText from "saeed/components/design/blurInputText";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import useHideDiv from "saeed/hook/useHide";
import { LanguageKey } from "saeed/i18n";
import { IAdsOption } from "saeed/models/advertise/peoperties";
import styles from "./propertiesComponent.module.css";
const numbersRegex = /^[0-9]+$/;
function AdsOption(props: { adsOption: IAdsOption }) {
  const { t } = useTranslation();
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 36);
  const [concurrentAds, setConcurrentAds] = useState<string>(props.adsOption.concurrentAds.toString());
  const [adsPageNumber, setAdsPageNumber] = useState<string>(props.adsOption.AdsPageNumber.toString());
  const [campaign, setCampaign] = useState(props.adsOption.capmpaign);
  const handleChangeConcurrent = (e: ChangeEvent<HTMLInputElement>) => {
    var value = e.currentTarget.value;
    if (numbersRegex.test(value) || value.length === 0) {
      setConcurrentAds(value);
    }
  };
  const handleChangeAdsPageNumber = (e: ChangeEvent<HTMLInputElement>) => {
    var value = e.currentTarget.value;
    if (numbersRegex.test(value) || value.length === 0) {
      setAdsPageNumber(value);
    }
  };
  const handleSaveConCurrent = () => {
    var concurrentNum: number = 1;
    if (concurrentAds.length === 0) concurrentNum = 1;
    else concurrentNum = parseInt(concurrentAds);
    //Api to save concurrent based on <<< concurrentNum >>>
  };
  const handleSavepagesAdsNumber = () => {
    var adsNumberNum: number = 1;
    if (adsPageNumber.length === 0) adsNumberNum = 1;
    else adsNumberNum = parseInt(adsPageNumber);
    //Api to save Number of Ads Pages based on <<< adsNumberNum >>>
  };
  const handleChangeCampaign = () => {
    var newCampaign = campaign;
    newCampaign = !newCampaign;
    //Api to active and not active campaign based on <<< newCampaign >>>
    setCampaign(newCampaign);
  };
  return (
    <section className="bigcard" style={gridSpan}>
      <div className="frameParent" title="↕ Resize the Card">
        <div onClick={toggle} className="headerChild">
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.advertiseProperties_adsoptions)}</h2>
        </div>
      </div>
      <div className={styles.all}>
        {hidePage && (
          <>
            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className="title">{t(LanguageKey.advertiseProperties_Concurrentads)}</div>
                <div style={{ width: "80px" }}>
                  <BlurInputText
                    className="textinputbox"
                    placeHolder="1 "
                    handleInputChange={handleChangeConcurrent}
                    handleBlur={handleSaveConCurrent}
                    value={concurrentAds}
                    maxLength={undefined}
                    name="concurrentAds" // Updated name
                  />
                </div>
              </div>
              <div className="explain">{t(LanguageKey.advertiseProperties_Concurrentadsexplain)}</div>
            </div>
            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className="title">{t(LanguageKey.advertiseProperties_numberofads)} </div>
                <div style={{ width: "80px" }}>
                  <BlurInputText
                    className="textinputbox"
                    placeHolder="1 "
                    handleInputChange={handleChangeAdsPageNumber}
                    handleBlur={handleSavepagesAdsNumber}
                    value={adsPageNumber}
                    maxLength={undefined}
                    name="adsPageNumber"
                  />
                </div>
              </div>
              <div className="explain">{t(LanguageKey.advertiseProperties_numberofadsexplain)}</div>
            </div>

            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className="title">{t(LanguageKey.advertiseProperties_campaign)} </div>
                <ToggleCheckBoxButton
                  name="campaignToggle"
                  handleToggle={handleChangeCampaign}
                  checked={campaign}
                  aria-label={t(LanguageKey.advertiseProperties_campaign)}
                  title={t(LanguageKey.advertiseProperties_campaign)}
                  role={" switch button"}
                />
              </div>
              <div className="explain">{t(LanguageKey.advertiseProperties_campaignexplain)}</div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default AdsOption;
