import { MouseEvent, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import formatTimeAgo from "brancy/helper/formatTimeAgo";
import { getEnumValue } from "brancy/helper/handleItemTypeEnum";
import { LanguageKey } from "brancy/i18n";
import { PushNotif, PushResponseExplanation, PushResponseTitle, PushResponseType } from "brancy/models/push/pushNotif";
import { OrderStep } from "brancy/models/store/enum";
import { IOrderPushNotifExtended } from "brancy/models/store/orders";
import { ITicketPushNotif } from "brancy/models/userPanel/message";

import styles from "./notificationBar.module.css";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const NotificationBar = ({
  notifs,
  handleDeleteNotif,
}: {
  notifs: PushNotif[];
  handleDeleteNotif: (index: number) => void;
}) => {
  const { t } = useTranslation();
  const getNotifLogo = useCallback((responseType: PushResponseType) => {
    if (responseType === PushResponseType.UploadPostSuccess || responseType === PushResponseType.UploadStorySuccess)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="var(--color-dark-green)"
            d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M5.2 7.8a1 1 0 0 0-.7 1.7L6 11a1 1 0 0 0 1.4 0l4.1-4a1 1 0 1 0-1.4-1.5L6.7 9 6 8z"
          />
        </svg>
      );
    else if (
      responseType === PushResponseType.UpdateSystemTicket ||
      responseType === PushResponseType.ChangeOrderStatus
    ) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16">
          <path
            fill="var(--color-firoze)"
            d="M8.3 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16m-1.6-4.9-.3.1v.4l.3.4H10a.5.5 0 0 0 0-.9l-.6-.1V7H6.6a.5.5 0 0 0 0 .9l.6.1v3zM7.3 4v2h2V4z"
          />
        </svg>
      );
    } else if (
      responseType === PushResponseType.UploadPostFailed ||
      responseType === PushResponseType.UploadStoryFailed
    )
      return (
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M6 5a1 1 0 0 0-.7 1.7L6.6 8 5.3 9.3a1 1 0 1 0 1.4 1.4L8 9.4l1.3 1.3a1 1 0 1 0 1.4-1.4L9.4 8l1.3-1.3a1 1 0 1 0-1.4-1.4L8 6.6 6.7 5.3z"
            fill="var(--color-dark-red)"
          />
        </svg>
      );
  }, []);
  const fullyDecodeURIComponent = useCallback((encoded: string): string => {
    let decoded = encoded;
    let previous = "";
    while (decoded !== previous) {
      previous = decoded;
      try {
        decoded = decodeURIComponent(decoded);
      } catch (e) {
        break;
      }
    }
    return decoded;
  }, []);
  const handleMessage = useCallback((notif: PushNotif): string => {
    if (notif.ResponseType === PushResponseType.UpdateSystemTicket && notif.Message) {
      const message = JSON.parse(notif.Message) as ITicketPushNotif;
      return `You have a new message from  ${
        message.Username !== null ? message.Username : "+" + message.PhoneNumber
      } `;
    } else if (notif.ResponseType === PushResponseType.ChangeOrderStatus && notif.Message) {
      const message = JSON.parse(notif.Message) as IOrderPushNotifExtended;
      if (message.NewStatus === OrderStep.Paid) {
        return (
          "You have new order from " +
          (message.ShortOrder.UserInfo?.FullName ||
            message.ShortOrder.UserInfo?.Username ||
            message.ShortOrder.UserInfo?.PhoneNumber)
        );
      }
      return "";
    } else {
      const explaination = getEnumValue(PushResponseType, PushResponseExplanation, notif.ResponseType);
      return `${explaination} `;
    }
  }, []);

  const handleDeleteClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      handleDeleteNotif(index);
    },
    [handleDeleteNotif],
  );
  const handleNotifClick = useCallback((e: MouseEvent<HTMLDivElement>, decodedUrl: string) => {
    const target = e.target as HTMLElement;
    if (!target.closest(`.${styles.deleteButton}`)) {
      window.location.href = "/" + decodedUrl;
    }
  }, []);

  const renderedNotifs = useMemo(() => {
    if (notifs.length === 0) {
      return <div className={styles.noNotification}>{t(LanguageKey.EmptyNotification)}</div>;
    }
    return notifs.map((notif, index) => {
      const notifKey = `${notif.ResponseType}-${notif.CreatedTime}-${index}`;
      const decodedUrl = fullyDecodeURIComponent(notif.RedirectUrl);
      const notifTitle = getEnumValue(PushResponseType, PushResponseTitle, notif.ResponseType) || "";
      const notifMessage = handleMessage(notif);
      const timeAgo = formatTimeAgo(notif.CreatedTime * 1e3);
      return (
        <div
          key={notifKey}
          className={`instagramprofile translate`}
          role="listitem"
          tabIndex={0}
          onClick={(e) => handleNotifClick(e, decodedUrl)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              window.location.href = "/" + decodedUrl;
            } else if (e.key === "Delete" || e.key === "Backspace") {
              e.preventDefault();
              handleDeleteNotif(index);
            }
          }}
          aria-label={`${notifTitle}: ${notifMessage}`}>
          <div className={styles.iconok} aria-hidden="true">
            {getNotifLogo(notif.ResponseType)}
          </div>
          <div className={styles.notifbody}>
            <div className="headerparent">
              <div className="explain">{notifTitle}</div>
              <time className={styles.time} dateTime={new Date(notif.CreatedTime * 1e3).toISOString()}>
                {timeAgo}
              </time>
            </div>
            <div className={styles.message}>{notifMessage}</div>
          </div>
          <button
            type="button"
            onClick={(e) => handleDeleteClick(e, index)}
            className={styles.deleteButton}
            aria-label={`Remove notification: ${notifTitle}`}
            title="Remove notification">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      );
    });
  }, [
    notifs,
    t,
    fullyDecodeURIComponent,
    getNotifLogo,
    handleMessage,
    handleDeleteClick,
    handleNotifClick,
    handleDeleteNotif,
  ]);
  return (
    <nav
      id="notifBar5"
      className={styles.notification}
      onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      aria-label="Notifications"
      role="list">
      {renderedNotifs}
    </nav>
  );
};
export default NotificationBar;
