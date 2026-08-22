import CounterDownNotRing, { CounterDownColor } from "brancy/components/design/counterDown/counterDownNotRing";
import { LanguageKey } from "brancy/i18n";
import { useTranslation } from "react-i18next";

interface InvalidIpModalContentProps {
  expireTime: number;
  onContinue: () => void;
  onClose: () => void;
}

function InvalidIpModalContent({ expireTime, onContinue, onClose }: InvalidIpModalContentProps) {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        aria-label={t(LanguageKey.close)}
        title={t(LanguageKey.close)}
        onClick={onClose}
        style={{
          alignSelf: "flex-end",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          padding: "4px",
        }}>
        <svg
          aria-hidden="true"
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg">
          <path d="m7 7 10 10M17 7 7 17" stroke="var(--color-dark-blue)" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </button>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          aria-hidden="true"
          fill="none"
          height="64"
          viewBox="0 0 64 64"
          width="64"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8 58 54H6L32 8Z" fill="var(--color-light-red)" opacity=".18" />
          <path
            d="M32 8 58 54H6L32 8Z"
            stroke="var(--color-dark-red)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path d="M32 24v14M32 45h.01" stroke="var(--color-dark-red)" strokeLinecap="round" strokeWidth="4" />
        </svg>
      </div>
      <h2 id="modal-title" style={{ margin: 0, textAlign: "center" }}>
        {t(LanguageKey.Notify_IpInvalid)}
      </h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CounterDownNotRing
          unixTime={expireTime}
          timerColor={CounterDownColor.Red}
          isDead={onContinue}
          messageAfterTimer=""
        />
      </div>
      <div className="ButtonContainer" style={{ justifyContent: "center", width: "100%" }}>
        <button type="button" className="saveButton" onClick={onContinue}>
          {t(LanguageKey.Continue)}
        </button>
        <button type="button" className="cancelButton" onClick={onClose}>
          {t(LanguageKey.close)}
        </button>
      </div>
    </>
  );
}

export default InvalidIpModalContent;
