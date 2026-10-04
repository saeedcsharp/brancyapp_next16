import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { unixToFormattedDate } from "brancy/helper/formatTimeAgo";
import { LanguageKey } from "brancy/i18n";
import { IFlowPhoneNumber } from "brancy/models/interfaces";
import router from "next/router";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import autoReplyStyles from "./autoreply.module.css";
import styles from "./phoneNumbers.module.css";

const basePictureUrl = getClientMediaBaseUrl();

function PhoneNumbers({
  phoneNumbers,
  hasMore,
  handleGetNextPhoneNumbers,
}: {
  phoneNumbers: IFlowPhoneNumber[];
  hasMore: boolean;
  handleGetNextPhoneNumbers: () => void;
}) {
  const { t } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);

  const handleSliderReachEnd = useCallback(() => {
    if (hasMore) handleGetNextPhoneNumbers();
  }, [hasMore, handleGetNextPhoneNumbers]);

  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" onClick={() => setIsHidden((prev) => !prev)}>
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.messagesetting_PhoneNumbers)}</div>
      </div>
      <div className={`${autoReplyStyles.all} ${isHidden ? "" : autoReplyStyles.show}`}>
        <div className="explain">{t(LanguageKey.messagesetting_PhoneNumbersExplain)}</div>
        {phoneNumbers.length === 0 ? (
          <>
            <div className="explain">{t(LanguageKey.messagesetting_PhoneNumbersEmpty)}</div>
            <div className="headerandinput">
              <button className="saveButton" onClick={() => void router.push({ pathname: "/Ai/FlowandAgent" })}>
                {t(LanguageKey.AIFlow_show_graph)}
              </button>
            </div>
          </>
        ) : (
          <div className={autoReplyStyles.autoreply} role="region" aria-label="Collected phone numbers">
            <Slider className={autoReplyStyles.swiperContent} onReachEnd={handleSliderReachEnd} itemsPerSlide={2}>
              {phoneNumbers.map((item) => (
                <SliderSlide key={item.id}>
                  <div className={styles.card}>
                    <div className={autoReplyStyles.responseparent}>
                      <div className={styles.profile}>
                        <img
                          className={styles.profileImage}
                          loading="lazy"
                          alt="instagram profile picture"
                          src={`${basePictureUrl}${item.profileUrl}`}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            const fallback = "/no-profile.svg";
                            if (!target.src.endsWith(fallback)) target.src = fallback;
                          }}
                        />
                        <div className={styles.profileInfo}>
                          <div className="headertext">{item.fullName || item.username}</div>
                          <div className="explain">@{item.username}</div>
                        </div>
                      </div>
                      <div className={autoReplyStyles.headertitle2}>{t(LanguageKey.phonenumber)}</div>
                      <div className={styles.phone} dir="ltr">
                        {item.phoneNumber}
                      </div>
                      <div className={styles.meta}>
                        <span>{item.masterFlowTitle}</span>
                        <span>{unixToFormattedDate(item.createdTime)}</span>
                      </div>
                      <div className="headerandinput">
                        <button
                          className="saveButton"
                          onClick={() =>
                            void router.push({ pathname: "/Ai/FlowandAgent", query: { id: item.masterFlowId } })
                          }>
                          {t(LanguageKey.AIFlow_show_graph)}
                        </button>
                      </div>
                    </div>
                  </div>
                </SliderSlide>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PhoneNumbers);
