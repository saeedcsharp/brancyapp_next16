import Link from "next/link";
import { MouseEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import { getEnumValue } from "brancy/helper/handleItemTypeEnum";
import { LanguageKey } from "brancy/i18n";
import { PushNotif, PushResponseExplanation, PushResponseTitle, PushResponseType } from "brancy/models/push/pushNotif";
import { OrderStep } from "brancy/models/store/enum";
import { IOrderPushNotifExtended } from "brancy/models/store/orders";
import { ITicketPushNotif } from "brancy/models/userPanel/message";
import styles from "./userNotificationBar.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const UserNotificationBar = (props: { data: PushNotif[]; handleDeleteNotif: (index: number) => void }) => {
  const { t } = useTranslation();
  useEffect(() => {
    console.log("UserNotificationBar mounted with data:", props.data);
  }, []);
  function getNotifLogo(responseType: PushResponseType, orderStep?: OrderStep) {
    console.log("new status", orderStep);
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
      (responseType === PushResponseType.ChangeOrderStatus &&
        (orderStep === OrderStep.ShippingRequest ||
          orderStep === OrderStep.InShipping ||
          orderStep === OrderStep.Delivered))
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
      responseType === PushResponseType.UploadStoryFailed ||
      (responseType === PushResponseType.ChangeOrderStatus &&
        (orderStep === OrderStep.Failed ||
          orderStep === OrderStep.ShippingFailed ||
          orderStep === OrderStep.Expired ||
          orderStep === OrderStep.InstagramerCanceled ||
          orderStep === OrderStep.UserCanceled))
    )
      return (
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M6 5a1 1 0 0 0-.7 1.7L6.6 8 5.3 9.3a1 1 0 1 0 1.4 1.4L8 9.4l1.3 1.3a1 1 0 1 0 1.4-1.4L9.4 8l1.3-1.3a1 1 0 1 0-1.4-1.4L8 6.6 6.7 5.3z"
            fill="var(--color-dark-red)"
          />
        </svg>
      );
  }
  function fullyDecodeURIComponent(encoded: string): string {
    let decoded = encoded;
    let previous = "";

    // Keep decoding until no further changes occur
    while (decoded !== previous) {
      previous = decoded;
      try {
        decoded = decodeURIComponent(decoded);
      } catch (e) {
        // If an error occurs (e.g., malformed encoding), break the loop
        break;
      }
    }

    return decoded;
  }
  function handleMessage(notif: PushNotif): string {
    if (notif.ResponseType === PushResponseType.UpdateSystemTicket && notif.Message) {
      const message = JSON.parse(notif.Message) as ITicketPushNotif;
      return `You have a new message from  ${
        message.Username !== null ? message.Username : "+" + message.PhoneNumber
      } `;
    } else if (notif.ResponseType === PushResponseType.ChangeOrderStatus && notif.Message) {
      const message = JSON.parse(notif.Message) as IOrderPushNotifExtended;
      if (message.NewStatus === OrderStep.ShippingRequest) {
        return (
          `Your order with orderId ${message.ShortOrder.Id} is accepted by` +
          (message.ShortOrder.ShortShop?.FullName ||
            message.ShortOrder.ShortShop?.FullName ||
            message.ShortOrder.ShortShop?.Username)
        );
      } else if (message.NewStatus === OrderStep.InShipping) {
        return `Your order with orderId ${message.ShortOrder.Id} is sent`;
      } else if (message.NewStatus === OrderStep.Delivered) {
        return `Your order with orderId ${message.ShortOrder.Id} is Delivered`;
      } else if (message.NewStatus === OrderStep.InstagramerCanceled) {
        return (
          `Your order with orderId ${message.ShortOrder.Id} is canceled by  ` +
          (message.ShortOrder.ShortShop?.FullName ||
            message.ShortOrder.ShortShop?.FullName ||
            message.ShortOrder.ShortShop?.Username)
        );
      } else if (message.NewStatus === OrderStep.UserCanceled) {
        return (
          `Your order with orderId ${message.ShortOrder.Id} is canceled by  ` +
          (message.ShortOrder.UserInfo?.FullName ||
            message.ShortOrder.UserInfo?.Username ||
            message.ShortOrder.UserInfo?.PhoneNumber)
        );
      } else if (message.NewStatus === OrderStep.Expired) {
        return `Your order with orderId ${message.ShortOrder.Id} is canceled because it is expired`;
      } else if (message.NewStatus === OrderStep.Failed) {
        return `Your order with orderId ${message.ShortOrder.Id} is canceled because it is failed`;
      } else if (message.NewStatus === OrderStep.ShippingFailed) {
        return `Your order with orderId ${message.ShortOrder.Id} is canceled because of shipping failed`;
      } else {
        const explaination = getEnumValue(PushResponseType, PushResponseExplanation, notif.ResponseType);
        return `${explaination} `;
      }
    } else {
      const explaination = getEnumValue(PushResponseType, PushResponseExplanation, notif.ResponseType);
      return `${explaination} `;
    }
  }
  function handleProfileUrl(notif: PushNotif) {
    if (notif.ResponseType === PushResponseType.UpdateSystemTicket && notif.Message) {
      const message = JSON.parse(notif.Message) as ITicketPushNotif;
      return basePictureUrl + message.ProfileUrl;
    } else if (notif.ResponseType === PushResponseType.ChangeOrderStatus && notif.Message) {
      const message = JSON.parse(notif.Message) as IOrderPushNotifExtended;
      return message.ShortOrder?.ShortShop ? basePictureUrl + message.ShortOrder?.ShortShop?.ProfileUrl : "";
    } else {
      console.log("fffffffffffffffffffffffff", basePictureUrl + fullyDecodeURIComponent(notif.ProfileUrl));
      basePictureUrl + fullyDecodeURIComponent(notif.ProfileUrl);
    }
  }
  return (
    <>
      <div id="notifBar5" className={styles.notification} onClick={(e: MouseEvent) => e.stopPropagation()}>
        {props.data.length > 0 &&
          props.data.map((notif, index) => (
            <Link
              key={index}
              href={"/" + fullyDecodeURIComponent(notif.RedirectUrl)}
              className={styles.notificationchild}
              role="article">
              <div
                className={styles.iconok}
                style={{ backgroundColor: "var(--color-dark-green30)" }}
                aria-hidden="true">
                {getNotifLogo(notif.ResponseType, notif.Message ? JSON.parse(notif.Message).NewStatus : undefined)}
              </div>
              <img
                className={styles.iconok}
                style={{ backgroundColor: "var(--color-dark-green30)" }}
                aria-hidden="true"
                src={handleProfileUrl(notif)}
                alt="notif image"
              />
              <div className={styles.notifbody}>
                <div className={styles.header}>
                  <div className={styles.title}>
                    {getEnumValue(PushResponseType, PushResponseTitle, notif.ResponseType) || ""}
                  </div>
                  <div className={styles.time}>{formatTimeAgo(notif.CreatedTime * 1e3)}</div>
                </div>
                <div className={styles.message}>{handleMessage(notif)}</div>
              </div>
              <img
                onClick={(e) => {
                  e.preventDefault();
                  props.handleDeleteNotif(index);
                }}
                aria-label={`Remove ${""}`}
                style={{
                  cursor: "pointer",
                  width: "15px",
                  height: "15px",
                }}
                title="ℹ️ Remove keyword from list "
                src="/deleteHashtag.svg"
              />
            </Link>
          ))}
        {/* <div className={styles.notificationchild}>
          <div
            className={styles.iconok}
            style={{ backgroundColor: "var(--color-dark-green30)" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16">
              <path
                fill="var(--color-dark-green)"
                d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M5.2 7.8a1 1 0 0 0-.7 1.7L6 11a1 1 0 0 0 1.4 0l4.1-4a1 1 0 1 0-1.4-1.5L6.7 9 6 8z"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>order</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>order successfully accepted</div>
          </div>
        </div>
        <div className={styles.notificationchild}>
          <div
            className={styles.iconok}
            style={{ backgroundColor: "var(--color-dark-green30)" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16">
              <path
                fill="var(--color-dark-green)"
                d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M5.2 7.8a1 1 0 0 0-.7 1.7L6 11a1 1 0 0 0 1.4 0l4.1-4a1 1 0 1 0-1.4-1.5L6.7 9 6 8z"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>payment</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>Transition successful</div>
          </div>
        </div> */}
        {/* <div className={styles.notificationchild}>
          <div
            className={styles.iconok}
            style={{ backgroundColor: "var(--color-light-yellow30)" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 16">
              <path
                fill="var(--color-light-yellow)"
                d="M8.3 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16m-1.6-4.9-.3.1v.4l.3.4H10a.5.5 0 0 0 0-.9l-.6-.1V7H6.6a.5.5 0 0 0 0 .9l.6.1v3zM7.3 4v2h2V4z"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>New order</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>check your order panel</div>
          </div>
        </div>
        <div className={styles.notificationchild}>
          <div
            className={styles.iconok}
            style={{ backgroundColor: "var(--color-dark-red30)" }}>
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16">
              <path
                d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M6 5a1 1 0 0 0-.7 1.7L6.6 8 5.3 9.3a1 1 0 1 0 1.4 1.4L8 9.4l1.3 1.3a1 1 0 1 0 1.4-1.4L9.4 8l1.3-1.3a1 1 0 1 0-1.4-1.4L8 6.6 6.7 5.3z"
                fill="var(--color-dark-red)"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>payment</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>Transition failed</div>
          </div>
        </div> */}
        {props.data.length === 0 && <div className={styles.noNotification}>{t(LanguageKey.EmptyNotification)}</div>}
      </div>
    </>
  );
};

export default UserNotificationBar;
