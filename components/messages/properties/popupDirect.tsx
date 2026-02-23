import { t } from "i18next";
import React, { useState } from "react";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import InputText from "brancy/components/design/inputText";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";

interface PopupCommentProps {
  onClose: () => void;
}

const PopupDirect: React.FC<PopupCommentProps> = ({ onClose }) => {
  const [DIRECTinputText, setDIRECTInputText] = useState("");
  const [DIRECTtextAreaText, setDIRECTTextAreaText] = useState("");
  const [DIRECTprompts, setDIRECTPrompts] = useState<any[]>([]);
  const [editIndexDIRECT, setEditIndexDIRECT] = useState<number | null>(null); // برای نگه‌داری ایندکس ویرایش

  const handlePasteClickDIRECT = async () => {
    try {
      const text = await navigator.clipboard.readText(); // خواندن محتوای کلیپ‌بورد
      setDIRECTTextAreaText((prevText) => prevText + text); // اضافه کردن محتوای کلیپ‌بورد به متغیر state
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  const handleSaveClickDIRECT = () => {
    if (editIndexDIRECT !== null) {
      // اگر در حالت ویرایش است
      setDIRECTPrompts((prevPrompts) =>
        prevPrompts.map((prompt, i) =>
          i === editIndexDIRECT
            ? {
                ...prompt,
                textlabel: DIRECTinputText,
                promptanswer: DIRECTtextAreaText,
              }
            : prompt
        )
      );
      setEditIndexDIRECT(null); // پاک کردن ایندکس ویرایش پس از ذخیره
    } else {
      // اگر حالت جدید است
      setDIRECTPrompts((prevPrompts) => [
        ...prevPrompts,
        { textlabel: DIRECTinputText, promptanswer: DIRECTtextAreaText },
      ]);
    }
    setDIRECTInputText("");
    setDIRECTTextAreaText("");
    onClose();
  };
  return (
    <>
      <div className="title">{t(LanguageKey.adddirectexplain)}</div>
      <div className="headerandinput">
        <div className="headerparent">
          <div className="headertext">{t(LanguageKey.receivedmessage)}</div>
          <div className="counter">
            ( <strong>{DIRECTinputText.length}</strong> / <strong>50</strong> ){" "}
          </div>
        </div>

        <InputText
          className="textinputbox"
          placeHolder={t(LanguageKey.receivedmessage)}
          handleInputChange={(e) => setDIRECTInputText(e.target.value)}
          value={DIRECTinputText}
          maxLength={50}
          name=""
        />
      </div>
      <div className="headerandinput" style={{ height: "100%" }}>
        <div className="headerparent">
          <div className="headertext">{t(LanguageKey.Messageresponse)}</div>
          <div className="counter">
            ( <strong>{DIRECTtextAreaText.length}</strong> / <strong>2200</strong> ){" "}
            <img
              style={{
                cursor: "pointer",
                width: "20px",
                height: "20px",
              }}
              title="Paste from clipboard"
              src="/copy.svg"
              onClick={handlePasteClickDIRECT}
              alt="Paste icon"
              role="button"
              aria-label="Paste text from clipboard"
            />
          </div>
        </div>
        <TextArea
          className="message"
          placeHolder={t(LanguageKey.pageToolspopup_typehere)}
          handleInputChange={(e) => setDIRECTTextAreaText(e.target.value)}
          value={DIRECTtextAreaText}
          maxLength={2200}
          name="direct-message-response"
          title="Message Response Input"
          role="textbox"
          aria-label="Enter response message"
        />
        <CheckBoxButton
          handleToggle={() => {}}
          value={true}
          textlabel={t(LanguageKey.Sendresponseifthepageisfollowed)}
          name="send-if-followed"
          title="Send if page is followed"
        />
        <CheckBoxButton
          handleToggle={() => {}}
          value={true}
          textlabel={t(LanguageKey.Likethereceivedmessage)}
          name="like-received-message"
          title="Like received message"
        />
      </div>
      <div className="ButtonContainer">
        <button className="cancelButton" onClick={onClose}>
          {t(LanguageKey.cancel)}
        </button>
        <button className="saveButton" onClick={handleSaveClickDIRECT}>
          {t(LanguageKey.save)}
        </button>
      </div>
    </>
  );
};

export default PopupDirect;
