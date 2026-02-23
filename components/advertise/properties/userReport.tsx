import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import TextArea from "brancy/components/design/textArea/textArea";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/advertise/properties/propertiesComponent.module.css";
function UserReport() {
  const [inputText, setInputText] = useState<string>("");
  const [textArea, setTextArea] = useState<string>("");
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 46);
  const { t } = useTranslation();
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value;
    if (!value.startsWith("@")) {
      value = "@" + value.replace(/^@+/, "");
    }
    setInputText(value);
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextArea(e.currentTarget.value);
  };

  const isFormValid = inputText.trim() !== "" && textArea.trim() !== "";

  const submit = () => {
    if (isFormValid) {
      console.log("Form submitted with:", inputText, textArea);
    }
  };

  return (
    <section className="bigcard" style={gridSpan}>
      <div className={styles.all}>
        <div className="frameParent">
          <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
            <div className="circle"></div>
            <h2 className="Title">{t(LanguageKey.advertiseProperties_userreport)}</h2>
          </div>
        </div>
        {hidePage && (
          <>
            <div className={styles.section}>
              <div className={styles.terms}>
                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.advertiseProperties_userID)}</div>
                  <InputText
                    className="textinputbox"
                    placeHolder="@ username"
                    handleInputChange={handleInputChange}
                    value={inputText}
                    maxLength={undefined}
                    name="userReportUsername"
                  />
                </div>
              </div>
            </div>
            <div className={styles.terms}>
              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.SettingGeneral_Description)}</div>
                <TextArea
                  className={"message"}
                  placeHolder={""}
                  handleInputChange={handleTextAreaChange}
                  value={textArea}
                  maxLength={2200}
                  fadeTextArea={false}
                  handleKeyDown={undefined}
                  name="userReportDescription"
                  style={{ height: "140px" }}
                  role={"textbox"}
                  title={"User Report Description"}
                />
                <div className="explain">{t(LanguageKey.advertiseProperties_reportexplain)}</div>
              </div>
            </div>
            <div
              title="ℹ️ send report to Brancy Support team"
              onClick={isFormValid ? submit : undefined}
              className="ButtonContainer">
              <button className={isFormValid ? "stopButton" : "disableButton"} disabled={!isFormValid}>
                {t(LanguageKey.advertiseProperties_reportsubmit)}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default UserReport;
