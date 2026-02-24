import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import { LanguageKey } from "brancy/i18n";
import { IPageSummary } from "brancy/models/homeIndex/home";
import styles from "./accountSummary.module.css";

interface AccountSummaryProps {
  data: IPageSummary | null;
}

const AccountSummary = memo(({ data }: AccountSummaryProps) => {
  const { t, i18n } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);

  const containerStyle = useMemo(
    () => ({
      maxHeight: isHidden ? "0" : "100%",
      opacity: isHidden ? 0 : 1,
    }),
    [isHidden],
  );

  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };

  if (!data || !data.summary) return null;

  const timeAgo = formatTimeAgo(data.createdTime * 1000, i18n.language);

  // Split summary into paragraphs
  const paragraphs = data.summary.split(/\n\n+/).filter((p) => p.trim());

  // Define titles for each paragraph
  const paragraphTitles = [
    t(LanguageKey.summaryGeneralIntro),
    t(LanguageKey.summaryUserEngagement),
    t(LanguageKey.summaryContentStrategy),
    t(LanguageKey.summaryPostingSchedule),
    t(LanguageKey.summaryImprovementSuggestions),
  ];

  // Define icons for each paragraph
  const paragraphIcons = ["/icon-page.svg", "/Icon_follower.svg", "/edit-1.svg", "/calendar-wait.svg", "/msg-like.svg"];

  return (
    <section
      className={`${styles.tooBigCard} ${isHidden ? styles.toobigcardclose : ""} tooBigCard`}
      role="region"
      aria-label="Account Summary">
      <div className={styles.contactBox}>
        <header
          className={styles.headersection}
          onClick={handleCircleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCircleClick()}
          aria-label="Toggle summary visibility">
          <div className={styles.backdropfade} />
          <img style={{ height: "50px" }} src="/home-summary.svg" alt="Summary icon" title="↕ Resize the Card" />
          <div className="headerandinput">
            <span className="title">{t(LanguageKey.pageSummary)}</span>
            <span className="explain">{timeAgo}</span>
          </div>
        </header>
        <div className={isHidden ? styles.frameContainer : styles.frameContainerShow} style={containerStyle}>
          {paragraphs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "28px 20px",
                color: "var(--text-h2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}>
              <img src="/home-summary.svg" alt="" style={{ width: "48px", opacity: 0.5 }} />
              {t(LanguageKey.Notify_PageSummaryNotGenerated)
                .split("\n")
                .map((line, i) => (
                  <p
                    key={i}
                    style={{
                      margin: 0,
                      fontSize: i === 0 ? "0.95rem" : "0.82rem",
                      fontWeight: i === 0 ? 600 : 400,
                      opacity: i === 0 ? 1 : 0.7,
                    }}>
                    {line}
                  </p>
                ))}
            </div>
          ) : (
            paragraphs.map((paragraph, index) => (
              <div key={index} className="headerandinput">
                <div className="headerChild">
                  <img src={paragraphIcons[index] || "/adticket.svg"} alt="" style={{ width: "20px" }} />
                  <span className="title2">{paragraphTitles[index] || `${t(LanguageKey.pageSummary)} ${index + 1}`}</span>
                </div>
                <span className="explain">{paragraph}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
});
AccountSummary.displayName = "AccountSummary";
export default AccountSummary;
