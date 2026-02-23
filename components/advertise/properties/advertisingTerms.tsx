import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import TextArea from "brancy/components/design/textArea/textArea";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { IAdvertisingTerms } from "brancy/models/advertise/peoperties";
import styles from "brancy/components/advertise/properties/propertiesComponent.module.css";

function AdvertisingTerms(props: { advertisinfTerms: IAdvertisingTerms }) {
  const { t } = useTranslation();
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 82);

  const [advertisinfTerms, setAdvertisinfTerms] = useState<IAdvertisingTerms>({
    activeTerm1: false,
    activeTerm2: true,
    activeTerm3: false,
    activeTerm4: false,
    term1: "",
    term2: "",
    term3: "",
    term4: "",
  });
  const [loading, setLoading] = useState(true);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAdvertisinfTerms((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setIsFormChanged(true);
  };

  const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setAdvertisinfTerms((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
    setIsFormChanged(true);
  };

  function submit() {
    console.log(advertisinfTerms);
    setIsFormChanged(false); // Reset the form change state after submitting
  }

  useEffect(() => {
    const res = {
      activeTerm1: false,
      activeTerm2: true,
      activeTerm3: false,
      activeTerm4: false,
      term1: t(LanguageKey.advertiseProperties_AdvertisingTerm1),
      term2: t(LanguageKey.advertiseProperties_AdvertisingTerm2),
      term3: t(LanguageKey.advertiseProperties_AdvertisingTerm3),
      term4: t(LanguageKey.advertiseProperties_AdvertisingTerm4),
    };
    setAdvertisinfTerms(res);
    setLoading(false);
  }, []);

  return (
    <section className="tooBigCard" style={gridSpan}>
      <div className="frameParent">
        <div title="↕ Resize the Card" onClick={toggle} className="headerChild">
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.advertiseProperties_AdvertisingTerms)}</h2>
        </div>
      </div>
      {loading && <h2>...Loading</h2>}
      {!loading && (
        <div className={styles.all}>
          {hidePage && (
            <>
              <h2 className="explain">{t(LanguageKey.advertiseProperties_AdvertisingTermsexplain)}</h2>

              <div className="headerandinput">
                <div className="headerChild">
                  <CheckBoxButton
                    value={advertisinfTerms.activeTerm1}
                    handleToggle={handleToggle}
                    textlabel={t(LanguageKey.advertiseProperties_AdvertisingTerm1)}
                    name="activeTerm1"
                    title={"Enable Advertising Term 1"}
                  />
                </div>
                <TextArea
                  className={"message"}
                  placeHolder={""}
                  fadeTextArea={!advertisinfTerms.activeTerm1}
                  value={advertisinfTerms.term1}
                  handleKeyDown={undefined}
                  handleInputChange={handleInputChange}
                  name="term1-textarea"
                  maxLength={2200}
                  role={" textbox"}
                  title={" Advertising Term 1"}
                />
              </div>

              <div className="headerandinput">
                <div className="headerChild">
                  <CheckBoxButton
                    value={advertisinfTerms.activeTerm2}
                    handleToggle={handleToggle}
                    name="activeTerm2"
                    textlabel={t(LanguageKey.advertiseProperties_AdvertisingTerm2)}
                    title={" Enable Advertising Term 2"}
                  />
                </div>
                <TextArea
                  value={advertisinfTerms.term2}
                  fadeTextArea={!advertisinfTerms.activeTerm2}
                  className={"message"}
                  placeHolder={""}
                  handleInputChange={handleInputChange}
                  handleKeyDown={undefined}
                  name="term2-textarea"
                  maxLength={2200}
                  role={" textbox"}
                  title={" Advertising Term 2"}
                />
              </div>

              <div className="headerandinput">
                <div className="headerChild">
                  <CheckBoxButton
                    value={advertisinfTerms.activeTerm3}
                    handleToggle={handleToggle}
                    name="activeTerm3"
                    textlabel={t(LanguageKey.advertiseProperties_AdvertisingTerm3)}
                    title={" Enable Advertising Term 3"}
                  />
                </div>
                <TextArea
                  value={advertisinfTerms.term3}
                  className={"message"}
                  placeHolder={""}
                  fadeTextArea={!advertisinfTerms.activeTerm3}
                  handleKeyDown={undefined}
                  handleInputChange={handleInputChange}
                  name="term3-textarea"
                  maxLength={2200}
                  role={" textbox"}
                  title={" Advertising Term 3"}
                />
              </div>

              <div className="headerandinput">
                <div className="headerChild">
                  <CheckBoxButton
                    value={advertisinfTerms.activeTerm4}
                    handleToggle={handleToggle}
                    name="activeTerm4"
                    textlabel={t(LanguageKey.advertiseProperties_AdvertisingTerm4)}
                    title={" Enable Advertising Term 4"}
                  />
                </div>
                <TextArea
                  value={advertisinfTerms.term4}
                  className={"message"}
                  placeHolder={""}
                  fadeTextArea={!advertisinfTerms.activeTerm4}
                  handleKeyDown={undefined}
                  handleInputChange={handleInputChange}
                  name="term4-textarea"
                  maxLength={2200}
                  role={" textbox"}
                  title={" Advertising Term 4"}
                />
              </div>

              <button
                className={isFormChanged ? "saveButton" : "disableButton"}
                onClick={isFormChanged ? submit : undefined}
                disabled={!isFormChanged}>
                {t(LanguageKey.advertiseProperties_AdvertisingTermsave)}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default AdvertisingTerms;
