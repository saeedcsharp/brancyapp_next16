import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MouseEvent, use, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstaInfoContext } from "brancy/context/instaInfoContext";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import { getEnumValue } from "brancy/helper/handleItemTypeEnum";
import { LanguageKey } from "brancy/i18n";
import { PushNotif, PushResponseExplanation, PushResponseTitle, PushResponseType } from "brancy/models/push/pushNotif";
import { OrderStep } from "brancy/models/store/enum";
import { IOrderPushNotifExtended } from "brancy/models/store/orders";
import { ITicketPushNotif } from "brancy/models/userPanel/message";
import styles from "brancy/components/hambergurMenu/hammenu.module.css";

const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const menuItems = [
  {
    href: "/user/home",
    iconPath: (color: string) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={color}
        width="32"
        height="32"
        viewBox="0 0 30 30"
        fillRule="evenodd">
        <path
          opacity=".4"
          d="m27.8 8.3-9-7a6 6 0 0 0-7.6 0l-9 7A6 6 0 0 0 0 12.7v11C0 27.3 3 30 6.5 30h17c3.6 0 6.5-2.8 6.5-6.2V12.7q0-2.6-2.2-4.4"
        />
        <path d="M20 23.7q-.1 1.2-1.3 1.3h-7.4q-1.2-.1-1.3-1.3V19c0-2.7 2.2-4.9 5-4.9s5 2.2 5 4.9z" />
      </svg>
    ),
    textKey: LanguageKey.sidebar_Home,
    activeRoutes: ["userhome"],
  },
  {
    href: "/user/orders",
    iconPath: (color: string) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} width="30" height="30" viewBox="0 0 30 31">
        <path
          opacity=".4"
          d="M28.3 27.7Q26 30 21.5 30h-13q-5 0-7-2.2-2-2.4-1.3-6.8l1.2-8.8C2.1 8.5 5 7 7 7h16c2.1 0 4.8 1.3 5.6 5l1.3 9q.6 4.2-1.6 6.6"
        />
        <path d="M23 7h-2.5A5.4 5.4 0 0 0 15 2.4c-3 0-5.3 2-5.5 4.7H7c.3-4 3.7-7 8-7s7.7 3 8 7 M19.9 24h.1q1-.1 1-1.3l-.8-7.5Q20 14 19 14c-1 0-1 .7-1 1.4l.8 7.5q.1 1 1 1m-9.7 0q1 0 1.1-1l.8-7.6q0-1-1-1.3-1 0-1.2 1L9 22.8q0 1.1 1 1.4z" />
      </svg>
    ),
    textKey: LanguageKey.navbar_Orders,
    activeRoutes: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
  },
  {
    href: "/user/shop",
    iconPath: (color: string) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 30 30"
        fillRule="evenodd"
        width="30px"
        height="30px"
        fill={color}>
        <path
          opacity=".4"
          d="M19.7 15h-.5a7 7 0 0 1-4.4 1.5q-2.4 0-4.3-1.4H10a7 7 0 0 1-7.3.7q-.6 0-.7.5V22c0 4.5 3 7.7 7.2 7.9q.5 0 .5-.5v-3c0-2.8 2.3-5.2 5.1-5.2a5 5 0 0 1 5.2 5.2v3q0 .5.4.5c4.4-.2 7.6-3.2 7.6-7.9v-6q-.1-.5-.7-.4a7 7 0 0 1-7.6-.6"></path>
        <path d="M15 24c-1.6 0-3 1.2-3 2.7v2.9q0 .3.5.4h5q.5 0 .5-.4v-2.9c0-1.5-1.3-2.7-3-2.7M30 8.4a33 33 0 0 0-1.5-5.2A5 5 0 0 0 24.1 0H5.9a5 5 0 0 0-4.5 3.2A35 35 0 0 0 0 8.4 4 4 0 0 0 1.2 12a6 6 0 0 0 4.4 2q2.6-.1 4.2-2a.6.6 0 0 1 1 0 5.5 5.5 0 0 0 8.5 0 1 1 0 0 1 .9 0 6 6 0 0 0 4.3 2 6 6 0 0 0 4.3-2A4 4 0 0 0 30 8.4"></path>
      </svg>
    ),
    textKey: LanguageKey.sidebar_Stores,
    activeRoutes: ["usershop"],
  },

  {
    href: "/user/wallet",
    iconPath: (color: string) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill={color} width="32" height="32" viewBox="0 0 30 31">
        <path
          opacity=".4"
          d="M27.7 11.2q0 .4-.5.5H2.8q-.5-.1-.5-.5V8.5c0-3.3 2.5-6 5.5-6h14.4c3 0 5.5 2.7 5.5 6zM22.2 0H7.8C3.5.1 0 3.9 0 8.5v13.2c0 4.6 3.5 8.4 7.8 8.4h14.4a8 8 0 0 0 6.5-3.8h.1V26a9 9 0 0 0 1.2-4.4V8.5C30 3.9 26.5.1 22.2.1"
        />
        <path d="m13.6 5.9-8.4 4.5q-.4.4.2.6h19q.8-.1.5-.7L23 7.7C21 5 16.8 4.2 13.6 6 M19 19.6a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0" />
      </svg>
    ),
    textKey: LanguageKey.sidebar_Wallet,
    activeRoutes: ["userwallet"],
  },
  {
    href: "/user/message",
    iconPath: (color: string) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={color} viewBox="0 0 32 33">
        <path
          d="M26.7 14.6v-1.1a11 11 0 1 0-22 0v1.1l2 .3q1.5.7 2 2.4l1.5 6.4a4 4 0 0 1-.7 3 4 4 0 0 1-2.7 1.4l-1.2-.2a7 7 0 0 1-3.3-12v-2.4a13.5 13.5 0 0 1 27 0V16a7 7 0 0 1 1.9 7 7 7 0 0 1-5.3 5H25c-2.3 4-4.9 4.5-7.6 4.5H15a1.3 1.3 0 1 1 0-2.5h1.4c2.8 0 4.4 0 6.2-2.6l-.6-.6q-1.1-1.5-.7-3.1l1.5-6.4a4 4 0 0 1 2-2.4q.9-.5 1.9-.3"
          opacity=".4"
        />
        <path d="M15.6 17.9a1.3 1.3 0 0 1-1.3-1.2c0-1.7 1.4-2.5 2.2-3q1-.8 1-1.3a1.6 1.6 0 0 0-3.2 0 1.3 1.3 0 0 1-2.5 0 4.1 4.1 0 0 1 8.2 0q0 2.3-2.1 3.4l-.2.1q-.9.5-.9.7a1.3 1.3 0 0 1-1.2 1.3m0 3.4a1.3 1.3 0 0 1-1.3-1.3 1.3 1.3 0 0 1 1.3-1.2 1.2 1.2 0 0 1 1.2 1.2 1.3 1.3 0 0 1-1.2 1.3" />
      </svg>
    ),
    textKey: LanguageKey.navbar_Ticket,
    activeRoutes: ["usermessage"],
  },
  // {
  //   href: "/orders",
  //   iconPath: (color: string) => (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       fill={color}
  //       width="30"
  //       height="30"
  //       viewBox="0 0 30 30"
  //       fillRule="evenodd">
  //       <path
  //         opacity=".4"
  //         d="M19.7 15h-.5a7 7 0 0 1-4.4 1.5q-2.4 0-4.3-1.4H10a7 7 0 0 1-7.3.7q-.6 0-.7.5V22c0 4.5 3 7.7 7.2 7.9q.5 0 .5-.5v-3c0-2.8 2.3-5.2 5.1-5.2a5 5 0 0 1 5.2 5.2v3q0 .5.4.5c4.4-.2 7.6-3.2 7.6-7.9v-6q-.1-.5-.7-.4a7 7 0 0 1-7.6-.6"
  //       />
  //       <path d="M15 24c-1.6 0-3 1.2-3 2.7v2.9q0 .3.5.4h5q.5 0 .5-.4v-2.9c0-1.5-1.3-2.7-3-2.7M30 8.4a33 33 0 0 0-1.5-5.2A5 5 0 0 0 24.1 0H5.9a5 5 0 0 0-4.5 3.2A35 35 0 0 0 0 8.4 4 4 0 0 0 1.2 12a6 6 0 0 0 4.4 2q2.6-.1 4.2-2a.6.6 0 0 1 1 0 5.5 5.5 0 0 0 8.5 0 1 1 0 0 1 .9 0 6 6 0 0 0 4.3 2 6 6 0 0 0 4.3-2A4 4 0 0 0 30 8.4" />
  //     </svg>
  //   ),
  //   textKey: LanguageKey.sidebar_Market,
  //   activeRoutes: [
  //     "markethome",
  //     "marketmylink",
  //     "marketstatistics",
  //     "marketproperties",
  //   ],
  // },
  {
    href: "/user/setting",
    iconPath: (color: string) => (
      <svg fill={color} xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 28 30">
        <path
          opacity=".4"
          d="m23.3 4.7 2.3 1.4q1 .6 1.7 1.5.5 1 .6 2l.1 2.8v8q0 1.2-.6 2.2-.6.8-1.6 1.5l-2.3 1.4-4.8 2.7-2.4 1.3q-1 .5-2.1.5t-2.2-.6l-2.5-1.2-4.8-2.8L2.4 24q-1-.5-1.8-1.3a5 5 0 0 1-.6-2V9.5q0-1.2.6-2.2.7-.8 1.6-1.5l2.3-1.4 4.8-2.7L11.7.5q1-.5 2.1-.5t2.2.6l2.5 1.2z"
        />
        <path d="M18.3 17.5a5 5 0 1 1-8.6-5 5 5 0 0 1 8.6 5" />
      </svg>
    ),
    textKey: LanguageKey.sidebar_Setting,
    activeRoutes: ["usersetting"],
  },
];
const LeftUserHamMenue = (props: {
  removeMask: () => void;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowUpgrade: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const newRoute = useMemo(() => router.route.replaceAll("/", ""), [router.route]);
  const { value, setValue } = use(InstaInfoContext) ?? {};
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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
    while (decoded !== previous) {
      previous = decoded;
      try {
        decoded = decodeURIComponent(decoded);
      } catch (e) {
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
      return baseMediaUrl + message.ProfileUrl;
    } else if (notif.ResponseType === PushResponseType.ChangeOrderStatus && notif.Message) {
      const message = JSON.parse(notif.Message) as IOrderPushNotifExtended;
      return message.ShortOrder?.ShortShop ? baseMediaUrl + message.ShortOrder?.ShortShop?.ProfileUrl : "";
    } else {
      baseMediaUrl + fullyDecodeURIComponent(notif.ProfileUrl);
    }
  }
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const clickOnLeft = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleRemoveMask = useCallback(() => {
    props.removeMask();
  }, [props.removeMask]);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const toggleNotification = useCallback(() => {
    setIsNotificationOpen((prev) => !prev);
  }, []);
  const getRemainingTime = useCallback((unixTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    let remaining = unixTime - now;

    if (remaining <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(remaining / (24 * 3600));
    remaining %= 24 * 3600;
    const hours = Math.floor(remaining / 3600);
    remaining %= 3600;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return { days, hours, minutes, seconds };
  }, []);

  const remainingDays = useMemo(() => {
    return session?.user.packageExpireTime ? getRemainingTime(session.user.packageExpireTime).days : 0;
  }, [session?.user.packageExpireTime, getRemainingTime]);

  const timeClass = useMemo(() => {
    return remainingDays < 3 ? styles.blinkRed : remainingDays < 10 ? styles.blinkYellow : "";
  }, [remainingDays]);

  const formatNumber = useCallback((num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  return (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Menu</title>
        <meta name="theme-color" content="transparent"></meta>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
      </Head>
      <div className={styles.all}>
        <div onClick={handleRemoveMask} className="dialogBg" />
        <div onClick={clickOnLeft} className={styles.menucontainer}>
          {/* ----------menu----------  */}
          <div className={styles.menuparentleft}>
            {menuItems.map((item) => {
              const isActive = item.activeRoutes.includes(newRoute);
              const color = isActive ? "var(--color-dark-blue)" : "var(--text-h2)";
              return (
                <Link key={item.href} href={item.href} onClick={handleRemoveMask} className={styles.usermenuleft}>
                  {item.iconPath(color)}
                  <div className={styles.menutextleft} style={{ color: color }}>
                    {t(item.textKey)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ----------notification----------  */}
        <div className={styles.notification}>
          <div className="headerparent" onClick={toggleNotification} style={{ cursor: "pointer" }}>
            <div className="instagramprofile">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40px"
                height="40"
                style={{ padding: "5px" }}
                fill="var(--text-h1)"
                viewBox="0 0 36 36">
                <path
                  d="M6.6 17.2a11.4 11.4 0 0 1 22.8.7q0 1.2.2 2.2a3 3 0 0 0 1.2 2 5 5 0 0 1 1.8 3.6c0 2.1-1.6 4-3.8 4H7.2a4 4 0 0 1-3.8-4q0-2.2 1.8-3.6a3 3 0 0 0 1.2-2l.2-2.2z"
                  opacity=".4"
                />
                <path d="M12.1 29.6a6 6 0 0 0 11.8 0h-3.1a3 3 0 0 1-5.6 0zM18 1.5a4 4 0 0 0-2.2.6q-1.1.6-1.2 2.2 0 1.3.8 2.4 2.6-.6 5.2 0 .8-1.1.8-2.4 0-1.5-1.2-2.2a4 4 0 0 0-2.2-.6" />
              </svg>

              <div className="instagramprofiledetail">
                <div className="instagramusername" style={{ textAlign: "start" }}>
                  {t(LanguageKey.advertiseProperties_notifications)}
                </div>
                {value && (
                  <div className={styles.notificationcounter} style={{ textAlign: "start" }}>
                    {session!.user.currentIndex === -1 ? value.length : "0"}
                  </div>
                )}
              </div>
            </div>
            <img
              style={{
                cursor: "pointer",
                width: "25px",
                height: "30px",
                padding: "5px",
                transform: isNotificationOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
              title="ℹ️ down arrow"
              src="/down-arrow.svg"
              alt="Toggle notification menu"
            />
          </div>
          <div className={`${styles.notificationcontainer} ${isNotificationOpen ? styles.notificationOpen : ""}`}>
            {value &&
              session?.user.currentIndex === -1 &&
              value.map((notif, index) => (
                <Link
                  key={index}
                  href={"/" + fullyDecodeURIComponent(notif.RedirectUrl)}
                  className={styles.notificationchild}
                  role="article">
                  <div
                    className={styles.iconok}
                    style={{ backgroundColor: "var(--color-dark-green30)" }}
                    aria-hidden="true">
                    {getNotifLogo(notif.ResponseType)}
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
                      if (!setValue) return;
                      setValue((prev) => prev.filter((_, i) => i !== index));
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
          </div>
        </div>

        {/* ----------user----------  */}
        <div className={styles.usermenu}>
          <div className="headerparent" onClick={toggleUserMenu} style={{ cursor: "pointer" }}>
            <div className="instagramprofile">
              <img
                className="instagramimage"
                alt="profile"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/no-profile.svg";
                }}
                src={baseMediaUrl + session?.user.profileUrl!}></img>

              <div className="instagramprofiledetail">
                <div className="instagramusername" style={{ textAlign: "start" }}>
                  {session?.user.fullName}
                </div>
                <div className="instagramid" style={{ textAlign: "start" }}>
                  {session?.user.username}
                </div>
              </div>
            </div>
            <img
              style={{
                cursor: "pointer",
                width: "25px",
                height: "30px",
                padding: "5px",
                transform: isUserMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
              title="ℹ️ down arrow"
              src="/down-arrow.svg"
              alt="Toggle user menu"
            />
          </div>

          <div className={`${styles.usermenucontainer} ${isUserMenuOpen ? styles.usermenuOpen : ""}`}>
            <div className={styles.gap} />
            <div onClick={props.handleShowUpgrade} className={styles.menuchild} role="menuitem">
              <svg
                className={styles.icon}
                xmlns="http://www.w3.org/2000/svg"
                fill="var(--color-light-yellow)"
                viewBox="0 0 17 11"
                aria-hidden="true">
                <path d="M16.8 1.5a1.3 1.3 0 1 0-1.9 1l-.3.6a3 3 0 0 1-2.4 1.7A3 3 0 0 1 9.8 3l-.2-.6a1.3 1.3 0 1 0-1.3 0L8 3a3 3 0 0 1-2.4 1.7A3 3 0 0 1 3.2 3q0-.4-.3-.6a1.3 1.3 0 1 0-1.1.2V3l1.7 6.4a2 2 0 0 0 1.7 1.3h7.4a2 2 0 0 0 1.7-1.3L15.8 3v-.4a1.3 1.3 0 0 0 1-1.2" />
              </svg>
              <div className="headerandinput" style={{ gap: "3px" }}>
                <div className="title2" style={{ fontSize: "14px" }}>
                  {t(LanguageKey.upgrade)}
                </div>
                <div className={`${styles.remainingTime} ${timeClass}`}>
                  {t(LanguageKey.remainingTime)}:{" "}
                  <strong>
                    {formatNumber(remainingDays)} {t(LanguageKey.pageTools_Day)}
                  </strong>{" "}
                </div>
              </div>
            </div>
            <div onClick={props.handleShowSwitch} className={styles.menuchild} role="menuitem">
              <svg
                className={styles.icon}
                fill="var(--color-gray)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 18 17"
                aria-hidden="true">
                <path d="M3 3.8a1 1 0 0 1 0-1 1 1 0 0 1 1 0l.4.5V1.5a.7.7 0 0 1 1.4 0v1.8l.5-.5a1 1 0 0 1 1 0 1 1 0 0 1 0 1L5.6 5.4a1 1 0 0 1-1 0zm14 4.7a2 2 0 0 1-.6 1.6q-.7.6-1.6.6h-5q-.8 0-1.3-.4v.2l.6.4.7.8.3 1 .1.8v.8a2 2 0 0 1-.6 1.6q-.7.6-1.5.6H3q-1 0-1.7-.6a2 2 0 0 1-.6-1.6l.2-1.7.3-.9.7-.8.6-.4a3 3 0 0 1 1.7-4 3 3 0 0 1 3.4.7L8 5.9q.2-.5.6-.8l.7-.4a3 3 0 0 1 3-4.2 3 3 0 0 1 2.9 4.2l.7.4.6.8.3 1 .2.7zm-3-4.9a1.8 1.8 0 0 0-3-1.3 2 2 0 0 0 .1 2.7 2 2 0 0 0 2.3 0l.2-.1a2 2 0 0 0 .5-1.3m1.7 4.2-.4-1.3q0-.3-.3-.4l-.4-.2h-.2l-.3.2a3 3 0 0 1-3.8 0V6h-.1l-.2-.1-.5.2-.3.4L9 7l-.2 1.4.3.7.6.2h5.1q.4 0 .7-.2l.2-.7zM7.4 9.4a1.8 1.8 0 1 0-3 1.4 2 2 0 0 0 2.3 0h.1a2 2 0 0 0 .6-1.4m-3.8 2.4h-.4l-.4.1-.3.4-.2.6-.2 1.4.2.7.7.2h5q.5 0 .8-.2l.2-.7-.2-1.4-.2-.6-.3-.4-.4-.2h-.3l-.2.2a3 3 0 0 1-3.8 0m10.4-.1a1 1 0 0 0-1 0l-1.6 1.7a1 1 0 0 0 0 1 1 1 0 0 0 1 0l.5-.6v1.8a.7.7 0 0 0 1.3 0v-1.8l.5.5a1 1 0 0 0 1 0 1 1 0 0 0 0-1z" />
              </svg>
              <div className="headerandinput" style={{ gap: "3px" }}>
                <div className="title2" style={{ fontSize: "14px" }}>
                  {t(LanguageKey.switchaccount)}
                </div>
                <div className="explain"></div>
              </div>{" "}
            </div>
            <div className={styles.menuchild} onClick={props.handleShowSignOut} role="menuitem">
              <svg
                className={styles.icon}
                fill="var(--color-dark-red)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 17 19"
                aria-hidden="true">
                <path d="m16.6 10.2-3.1 3a.7.7 0 0 1-1-1l1.8-1.8H9.8a.7.7 0 1 1 0-1.5h4.5l-1.8-1.8a.7.7 0 1 1 1-1l3.1 3a1 1 0 0 1 0 1m-3.5 4.3a1 1 0 0 0-.8.8c0 1.6-1.4 2.2-2.6 2.2H5a2.7 2.7 0 0 1-2.7-2.7V4.6A2.7 2.7 0 0 1 5 1.9h4.7c1.2 0 2.6.6 2.6 2.2a.8.8 0 0 0 1.6 0C13.9 2 12 .3 9.7.3H5A4 4 0 0 0 .8 4.6v10.2A4 4 0 0 0 5 19h4.7c2.4 0 4.2-1.5 4.2-3.7a1 1 0 0 0-.8-.8" />
              </svg>
              <div className="headerandinput" style={{ gap: "3px" }}>
                <div className="title2" style={{ fontSize: "14px" }}>
                  {t(LanguageKey.signout)}
                </div>
                <div className="explain"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftUserHamMenue;
