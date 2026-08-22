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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          width="64"
          xmlns="http://www.w3.org/2000/svg"
          color="var(--color-light-red)"
          fill="none"
          stroke="var(--color-light-red)"
          strokeWidth="2"
          strokeLinecap="round"
          viewBox="0 0 24 24">
          <path d="M12 8v4m.1 3.8zm.2 0a.2.2 0 1 1-.5 0 .2.2 0 0 1 .5 0" strokeLinejoin="round" />
          <path d="M21 11.2v-3q.1-2.2-.4-3-.5-.5-3.2-1.2l-3.2-1.2L12 2q-.5 0-2.2.8L6.5 4Q4 4.7 3.4 5.3t-.4 3v2.9c0 5.6 5 9 7.6 10.3q.8.5 1.4.5t1.4-.5c2.5-1.3 7.6-4.7 7.6-10.3Z" />
        </svg>
      </div>
      <h2 id="modal-title" style={{ margin: 0, textAlign: "center" }}>
        {t(LanguageKey.Notify_IpInvalid)}
      </h2>
      <p style={{ margin: 0, textAlign: "center" }}>{t(LanguageKey.Notify_InstagramRedirectInTenSeconds)}</p>
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
