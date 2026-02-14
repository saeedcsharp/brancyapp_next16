import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import TextArea from "saeed/components/design/textArea/textArea";
import { LanguageKey } from "saeed/i18n/languageKeys";

interface ReportModalProps {
  report: {
    title: string;
    message: string;
  };
  setReport: (
    report:
      | { title: string; message: string }
      | ((prev: { title: string; message: string }) => {
          title: string;
          message: string;
        })
  ) => void;
  onClose: () => void;
  onSubmit: (report: { title: string; message: string }) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ report, setReport, onClose, onSubmit }) => {
  const { t } = useTranslation();

  const handleSubmit = () => {
    onClose();
    onSubmit(report);
  };

  return (
    <>
      <div className="headerandinput">
        <div className="headerparent">
          <div className="title">{t(LanguageKey.AdvanceSettings)}</div>
          <img
            style={{ cursor: "pointer" }}
            onClick={onClose}
            src="/close-box.svg"
            alt="Close settings"
            width="36"
            height="36"
            role="button"
            aria-label="Close settings dialog"
            title="Close settings"
          />
        </div>
      </div>
      <div className="headerandinput">
        <div className="title">{"title"}</div>
        <InputText
          className={"textinputbox"}
          handleInputChange={(e: ChangeEvent<HTMLInputElement>) =>
            setReport((prev) => ({
              ...prev,
              title: e.currentTarget.value,
            }))
          }
          value={report.title}
        />
      </div>
      <div className="headerandinput">
        <div className="title">{"message"}</div>
        <TextArea
          className={"message"}
          handleInputChange={(e: any) =>
            setReport((prev) => ({
              ...prev,
              message: e.target.value,
            }))
          }
          value={report.message}
          role=""
          title={""}
        />
      </div>
      <div className="headerandinput">
        <div className="headerparent">
          <button
            disabled={report.message.length === 0 || report.title.length === 0}
            onClick={handleSubmit}
            className={report.message.length === 0 || report.title.length === 0 ? "disableButton" : "saveButton"}>
            {t(LanguageKey.save)}
          </button>
          <button onClick={onClose} className="cancelButton">
            {t(LanguageKey.cancel)}
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportModal;
