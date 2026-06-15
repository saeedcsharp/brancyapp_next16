import { LanguageKey } from "brancy/i18n";
import { useTranslation } from "react-i18next";

export default function NotAllowedCard() {
  const { t } = useTranslation();
  return (
    <div
      className="headerandinput"
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}>
      <img
        style={{ width: "60px", height: "60px", padding: "5px" }}
        title="ℹ️ not allowed"
        src="/Icon_NonFollower.svg"
      />

      <div className="headertext">{t(LanguageKey.notallowedExplain)}</div>
    </div>
  );
}
