import { t } from "i18next";
import React, { useState } from "react";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import InputText from "saeed/components/design/inputText";
import TextArea from "saeed/components/design/textArea/textArea";
import { LanguageKey } from "saeed/i18n";

interface PopupCommentProps {
  onClose: () => void;
}

const PopupComment: React.FC<PopupCommentProps> = ({ onClose }) => {
  const [isPopupCOMMENT, setIsPopupCOMMENT] = useState(false);
  const [COMMENTinputText, setCOMMENTInputText] = useState("");
  const [COMMENTtextAreaText, setCOMMENTTextAreaText] = useState("");
  const [editIndexCOMMENT, setEditIndexCOMMENT] = useState<number | null>(null); // برای نگه‌داری ایندکس ویرایش
  const [COMMENTprompts, setCOMMENTPrompts] = useState<any[]>([]);
  const handlePasteClickCOMMENT = async () => {
    try {
      const text = await navigator.clipboard.readText(); // خواندن محتوای کلیپ‌بورد
      setCOMMENTTextAreaText((prevText) => prevText + text); // اضافه کردن محتوای کلیپ‌بورد به متغیر state
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };
  const handleSaveClickCOMMENT = () => {
    if (editIndexCOMMENT !== null) {
      // اگر در حالت ویرایش است
      setCOMMENTPrompts((prevPrompts) =>
        prevPrompts.map((prompt, i) =>
          i === editIndexCOMMENT
            ? {
                ...prompt,
                textlabel: COMMENTinputText,
                promptanswer: COMMENTtextAreaText,
              }
            : prompt
        )
      );
      setEditIndexCOMMENT(null); // پاک کردن ایندکس ویرایش پس از ذخیره
    } else {
      // اگر حالت جدید است
      setCOMMENTPrompts((prevPrompts) => [
        ...prevPrompts,
        { textlabel: COMMENTinputText, promptanswer: COMMENTtextAreaText },
      ]);
    }
    setCOMMENTInputText("");
    setCOMMENTTextAreaText("");
    onClose();
  };
  return (
    <>
      <div className="title">{t(LanguageKey.addcommentexplain)}</div>
      <div className="headerandinput">
        <div className="headerparent">
          <div className="headertext">{t(LanguageKey.receivedcomment)}</div>
          <div className="counter">
            ( <strong>{COMMENTinputText.length}</strong> / <strong>50</strong> ){" "}
          </div>
        </div>

        <InputText
          className="textinputbox"
          placeHolder={t(LanguageKey.receivedcomment)}
          handleInputChange={(e) => setCOMMENTInputText(e.target.value)}
          value={COMMENTinputText}
          maxLength={50}
          name=""
        />
      </div>
      <div className="headerandinput" style={{ height: "100%" }} role="region" aria-label="Comment Response Section">
        <div className="headerparent">
          <div className="headertext" role="heading" aria-level={2}>
            {t(LanguageKey.commentresponse)}
          </div>
          <div className="counter" role="status" aria-label="Character count">
            ( <strong>{COMMENTtextAreaText.length}</strong> / <strong>2200</strong> ){" "}
            <img
              style={{
                cursor: "pointer",
                width: "20px",
                height: "20px",
              }}
              src="/copy.svg"
              onClick={handlePasteClickCOMMENT}
              alt="Paste icon"
              title="Paste from clipboard"
              role="button"
              aria-label="Paste text from clipboard"
            />
          </div>
        </div>
        <TextArea
          className="message"
          placeHolder={t(LanguageKey.pageToolspopup_typehere)}
          handleInputChange={(e) => setCOMMENTTextAreaText(e.target.value)}
          value={COMMENTtextAreaText}
          maxLength={2200}
          name="comment-response-input"
          title="Comment Response Input"
          role="textbox"
          aria-label="Enter comment response"
          aria-multiline="true"
          aria-required="true"
        />
        <CheckBoxButton
          handleToggle={() => {}}
          value={true}
          textlabel={t(LanguageKey.Sendresponseifthepageisfollowed)}
          name="send-if-followed-checkbox"
          title="Send if page is followed"
          aria-label="Send response if page is followed"
        />
        <CheckBoxButton
          handleToggle={() => {}}
          value={true}
          textlabel={t(LanguageKey.Likethereceivedcomment)}
          name="like-received-comment-checkbox"
          title="Like received comment"
          aria-label="Like the received comment"
        />
      </div>
      <div className="ButtonContainer">
        <button className="cancelButton" onClick={onClose}>
          {t(LanguageKey.cancel)}
        </button>
        <button className="saveButton" onClick={handleSaveClickCOMMENT}>
          {t(LanguageKey.save)}
        </button>
      </div>
    </>
  );
};

export default PopupComment;
