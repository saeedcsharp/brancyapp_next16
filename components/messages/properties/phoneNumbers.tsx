import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import Modal from "brancy/components/design/modal";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { unixToFormattedDate } from "brancy/helper/formatTimeAgo";
import { notify, NotifType, ResponseType } from "brancy/components/notifications/notificationBox";
import { LanguageKey } from "brancy/i18n";
import { IFlowPhoneNumber } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Image from "next/image";
import router from "next/router";
import { memo, useCallback, useState } from "react";
import { createPortal } from "react-dom";
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
  const { data: session } = useSession();
  const [isHidden, setIsHidden] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const now = new Date();
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 6,
    Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth() - 5, 0).getDate()),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  );

  async function handleExport(date: string | undefined) {
    const fromTime = Number(date);
    if (!session || isExporting || !Number.isFinite(fromTime)) return;
    const selectedTime = Math.min(Math.max(fromTime, sixMonthsAgo.getTime()), now.getTime());
    setIsExporting(true);
    try {
      const res = await clientFetchApi<null, string>("/api/flow/getExportPhoneNumbers", {
        methodType: MethodType.get,
        session,
        queries: [
          { key: "fromTime", value: Math.floor(selectedTime / 1000).toString() },
          { key: "timezoneOffset", value: (-new Date().getTimezoneOffset() * 60).toString() },
        ],
      });
      if (res.succeeded && res.value) {
        const link = new URL(res.value.replace(/^\/+/, ""), getClientMediaBaseUrl());
        link.pathname = `${link.pathname.replace(/\/$/, "")}/download`;
        setShowExportModal(false);
        window.location.assign(link.toString());
      } else notify(res.succeeded ? ResponseType.Unexpected : res.info.responseType, NotifType.Warning);
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsExporting(false);
    }
  }

  const handleSliderReachEnd = useCallback(() => {
    if (hasMore) handleGetNextPhoneNumbers();
  }, [hasMore, handleGetNextPhoneNumbers]);

  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className={styles.headerRow}>
        <div className="headerChild" onClick={() => setIsHidden((prev) => !prev)}>
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.messagesetting_PhoneNumbers)}</div>
        </div>
        <button
          type="button"
          className={styles.exportTrigger}
          onClick={() => setShowExportModal(true)}
          title={t(LanguageKey.exportXlxs)}
          aria-label={t(LanguageKey.exportXlxs)}>
          <Image src="/download.svg" width={20} height={20} alt="" aria-hidden="true" />
        </button>
      </div>
      <div className={`${autoReplyStyles.all} ${isHidden ? "" : autoReplyStyles.show}`}>
        <div className="explain">{t(LanguageKey.messagesetting_PhoneNumbersExplain)}</div>
        {phoneNumbers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className="explain">{t(LanguageKey.messagesetting_PhoneNumbersEmpty)}</div>
            <button
              type="button"
              className={styles.flowLink}
              title={t(LanguageKey.AIFlow_show_graph)}
              aria-label={t(LanguageKey.AIFlow_show_graph)}
              onClick={() => void router.push({ pathname: "/Ai/FlowandAgent" })}>
              <Image src="/flow-redirect.svg" width={20} height={20} alt="" aria-hidden="true" />
            </button>
          </div>
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
                        <div className={styles.flowName}>
                          <span className={styles.flowTitle} title={item.masterFlowTitle}>
                            {item.masterFlowTitle}
                          </span>
                          <button
                            type="button"
                            className={styles.flowLink}
                            title={t(LanguageKey.AIFlow_show_graph)}
                            aria-label={t(LanguageKey.AIFlow_show_graph)}
                            onClick={() =>
                              void router.push({ pathname: "/Ai/FlowandAgent", query: { id: item.masterFlowId } })
                            }>
                            <Image src="/flow-redirect.svg" width={20} height={20} alt="" aria-hidden="true" />
                          </button>
                        </div>
                        <span>{unixToFormattedDate(item.createdTime)}</span>
                      </div>
                    </div>
                  </div>
                </SliderSlide>
              ))}
            </Slider>
          </div>
        )}
      </div>
      {showExportModal &&
        createPortal(
          <Modal closePopup={() => setShowExportModal(false)} classNamePopup="popup" showContent={showExportModal}>
            <SetTimeAndDate
              removeMask={() => setShowExportModal(false)}
              saveDateAndTime={handleExport}
              backToNormalPicker={() => setShowExportModal(false)}
              startDay={now.getTime() - 60_000}
              fromUnix={sixMonthsAgo.getTime()}
              endUnix={now.getTime()}
              title={`${t(LanguageKey.from)} ${t(LanguageKey.advertisestatistics_date)}`}
              saveLabel={t(LanguageKey.exportXlxs)}
              saveDisabled={!session || isExporting}
            />
          </Modal>,
          document.body,
        )}
    </div>
  );
}

export default memo(PhoneNumbers);
