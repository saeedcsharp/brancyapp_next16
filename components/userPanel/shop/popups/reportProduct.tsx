import { LanguageKey } from "saeed/i18n";

import { useSession } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import TextArea from "saeed/components/design/textArea/textArea";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
export default function ReportProduct({
  removeMask,
  productId,
  instagramerId,
}: {
  removeMask: () => void;
  productId: string;
  instagramerId: string;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [inputText, setInputText] = useState<string>("");
  const [textArea, setTextArea] = useState<string>("");
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value;
    setInputText(value);
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextArea(e.currentTarget.value);
  };
  const isFormValid = inputText.trim() !== "" && textArea.trim() !== "";
  async function handleReportProduct() {
    try {
      const res = await GetServerResult<{ subject: "string"; message: "string" }, boolean>(
        MethodType.post,
        session,
        "user/shop/ReportProduct",
        {
          subject: inputText,
          message: textArea,
        },
        [
          { key: "instagramerId", value: instagramerId },
          { key: "productId", value: productId },
        ]
      );
      if (res.succeeded) {
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      removeMask();
    }
  }
  const submit = () => {
    if (isFormValid) {
      handleReportProduct();
    }
  };
  return (
    <>
      <div className="frameParent">
        <div className="headerChild">
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.advertiseProperties_userreport)}</h2>
        </div>
      </div>

      <>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.navbar_Title)}</div>
          <InputText
            className="textinputbox"
            placeHolder=""
            handleInputChange={handleInputChange}
            value={inputText}
            maxLength={undefined}
            name="userReportUsername"
          />
        </div>

        <div className="headerandinput" style={{ height: "100%" }}>
          <div className="headertext">{t(LanguageKey.message)}</div>
          <TextArea
            className={"message"}
            placeHolder={""}
            handleInputChange={handleTextAreaChange}
            value={textArea}
            maxLength={2200}
            fadeTextArea={false}
            handleKeyDown={undefined}
            name="userReportDescription"
            style={{ height: "100%" }}
            role={"textbox"}
            title={"User Report Description"}
          />
          <div className="explain">{t(LanguageKey.advertiseProperties_reportexplain)}</div>
        </div>
        <div
          title="ℹ️ send report to Brancy Support team"
          onClick={isFormValid ? submit : undefined}
          className="ButtonContainer">
          <button className={isFormValid ? "saveButton" : "disableButton"} disabled={!isFormValid}>
            {t(LanguageKey.send)}
          </button>
          <button onClick={removeMask} className={"cancelButton"}>
            {t(LanguageKey.cancel)}
          </button>
        </div>
      </>
    </>
  );
}
