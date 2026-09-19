import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MouseEvent, use, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { InstaInfoContext } from "brancy/context/instaInfoContext";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import { getEnumValue } from "brancy/helper/handleItemTypeEnum";
import { LanguageKey } from "brancy/i18n";
import FeatureSearch from "brancy/components/search/featureSearch";

import styles from "./hammenu.module.css";
import { PushResponseType, OrderStep, PushResponseExplanation, PushResponseTitle } from "brancy/models/enums";
import { PushNotif, ITicketPushNotif, IOrderPushNotifExtended, IGetMedia } from "brancy/models/interfaces";

const baseMediaUrl = getClientMediaBaseUrl();

const fullyDecodeURIComponent = (encoded: string): string => {
  let decoded = encoded;
  let previous = "";

  while (decoded !== previous) {
    previous = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }

  return decoded;
};

const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getRemainingTime = (unixTime: number) => {
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
};

// Define menu items configuration
const menuItems = [
  {
    href: "/home",
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
    activeRoutes: ["home"],
  },
  {
    href: "/page/posts",
    iconPath: (color: string) => (
      <svg
        width="32"
        height="32"
        fillRule="evenodd"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 33 33">
        <path
          opacity=".3"
          d="M-.18 13.82c0-5.91 0-8.87 1.55-10.92q.67-.88 1.55-1.54C5-.18 7.98-.18 13.94-.18h4.78c5.97 0 8.95 0 11.02 1.54q.88.66 1.55 1.54c1.55 2.05 1.55 5 1.55 10.92v4.74c0 5.91 0 8.87-1.55 10.93q-.66.88-1.55 1.53c-2.07 1.54-5.05 1.54-11.02 1.54h-4.78c-5.96 0-8.95 0-11.02-1.54a8 8 0 0 1-1.55-1.53C-.18 27.43-.18 24.47-.18 18.56z"
        />
        <path d="M22.48 16.45a6.2 6.2 0 0 0-6.23-6.17 6.2 6.2 0 0 0-6.22 6.17 6.2 6.2 0 0 0 6.22 6.17v2.48a8.7 8.7 0 0 1-8.72-8.65c0-4.78 3.9-8.65 8.72-8.65a8.7 8.7 0 0 1 8.73 8.65c0 4.78-3.9 8.65-8.73 8.65v-2.48a6.2 6.2 0 0 0 6.23-6.17m1.75-10.49c0-1.02.84-1.84 1.87-1.84s1.87.82 1.87 1.84-.84 1.84-1.87 1.84a1.86 1.86 0 0 1-1.87-1.84" />
      </svg>
    ),
    textKey: LanguageKey.sidebar_Page,
    activeRoutes: ["pageposts", "pagestories", "pagestatistics", "pagetools"],
  },
  {
    href: "/Ai/creator",
    iconPath: (color: string) => (
      <svg fill={color} width="32" height="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 37">
        <path d="M21 5.93c-1.08-3.08-2.43-4.8-3.54-4.8-1.74 0-4.08 4.23-4.99 11.31-.08.6-.55 1.08-1.16 1.16C4.23 14.5 0 16.85 0 18.6c0 .5.38 1.08 1.08 1.65a21 21 0 0 0 12.6-4.06A21 21 0 0 0 21 5.93m-3.54 30.12c1.73 0 4.05-4.18 4.97-11.18a33 33 0 0 1-8.77 5.56c1.1 3.6 2.6 5.62 3.8 5.62m7.03-17.71a26 26 0 0 0 2.37-4.18q-1.5-.33-3.25-.56a1.35 1.35 0 0 1-1.16-1.16q-.14-1.04-.3-2a23 23 0 0 1-6.77 8.02 23 23 0 0 1-9.2 4.09q2.23.64 5.13 1.02c.6.07 1.09.55 1.17 1.16q.2 1.55.48 2.92a28 28 0 0 0 11.53-9.32m10.43.27c0-1.18-1.9-2.61-5.29-3.7a29 29 0 0 1-5.81 8.65c6.95-.92 11.1-3.23 11.1-4.96m-6.8-12.05a.4.4 0 0 1 .34.34c.26 2.06.94 3.3 1.45 3.3.5 0 1.2-1.24 1.45-3.3a.4.4 0 0 1 .34-.34c2.07-.26 3.3-.94 3.3-1.45s-1.23-1.2-3.3-1.45a.4.4 0 0 1-.34-.34C31.1 1.23 30.42 0 29.91 0c-.5 0-1.19 1.23-1.45 3.3a.4.4 0 0 1-.34.34c-2.06.26-3.3.94-3.3 1.45 0 .5 1.24 1.19 3.3 1.45" />
      </svg>
    ),
    textKey: LanguageKey.navbar_AI,
    activeRoutes: ["Aicreator", "AiFlowandAgent"],
  },
  {
    href: "/message",
    iconPath: (color: string) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={color}
        width="32"
        height="32"
        viewBox="0 0 31 30"
        fillRule="evenodd">
        <path
          opacity=".4"
          d="M15.6 18.4q-1.5-.2-1.7-1.8.2-1.7 1.7-1.8 1.7.1 1.8 1.8c0 1.7-.8 1.8-1.8 1.8m-7.7 0q-1.7-.2-1.8-1.8.2-1.7 1.8-1.8 1.5.1 1.7 1.8c.2 1.7-.8 1.8-1.7 1.8M18.5 6h-13A5.6 5.6 0 0 0 0 11.7V21a5.6 5.6 0 0 0 5.5 5.7h1.4q1 0 1.6.7l1.9 1.9a2.3 2.3 0 0 0 3.3 0l1.8-2a2 2 0 0 1 1.6-.6h1.4A5.6 5.6 0 0 0 24 21v-9.3A5.6 5.6 0 0 0 18.5 6"
        />
        <path d="M25.5 0H12.3A5.5 5.5 0 0 0 7 4q0 .2.3.3h10.2c6-.4 8.7 2.7 8.7 8.2v7.2q0 .3.4.3a5.6 5.6 0 0 0 4.4-5.4v-9A5.6 5.6 0 0 0 25.5 0" />
      </svg>
    ),
    textKey: LanguageKey.sidebar_Message,
    activeRoutes: [
      "messagedirect",
      "messagecomments",
      "messageticket",
      "messageAIAndFlow",
      "messageAIAndFlowflowGraph",
      "messageProperties",
    ], // Removed commented routes
  },
  {
    href: "/wallet/payment",
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
    activeRoutes: ["walletpayment"],
  },
  {
    href: "/market",
    iconPath: (color: string) => (
      // <svg
      //   xmlns="http://www.w3.org/2000/svg"
      //   fill={color}
      //   width="30"
      //   height="30"
      //   viewBox="0 0 30 30"
      //   fillRule="evenodd">
      //   <path
      //     opacity=".4"
      //     d="M19.7 15h-.5a7 7 0 0 1-4.4 1.5q-2.4 0-4.3-1.4H10a7 7 0 0 1-7.3.7q-.6 0-.7.5V22c0 4.5 3 7.7 7.2 7.9q.5 0 .5-.5v-3c0-2.8 2.3-5.2 5.1-5.2a5 5 0 0 1 5.2 5.2v3q0 .5.4.5c4.4-.2 7.6-3.2 7.6-7.9v-6q-.1-.5-.7-.4a7 7 0 0 1-7.6-.6"
      //   />
      //   <path d="M15 24c-1.6 0-3 1.2-3 2.7v2.9q0 .3.5.4h5q.5 0 .5-.4v-2.9c0-1.5-1.3-2.7-3-2.7M30 8.4a33 33 0 0 0-1.5-5.2A5 5 0 0 0 24.1 0H5.9a5 5 0 0 0-4.5 3.2A35 35 0 0 0 0 8.4 4 4 0 0 0 1.2 12a6 6 0 0 0 4.4 2q2.6-.1 4.2-2a.6.6 0 0 1 1 0 5.5 5.5 0 0 0 8.5 0 1 1 0 0 1 .9 0 6 6 0 0 0 4.3 2 6 6 0 0 0 4.3-2A4 4 0 0 0 30 8.4" />
      // </svg>
      <svg fill={color} width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29">
        <path d="M11.01 22.07a3.34 3.34 0 0 1-4.7-4.71l1.21-1.22c.89-.89.89-2.33 0-3.22l-.55-.55a2.27 2.27 0 0 0-3.22 0L2.53 13.6a8.67 8.67 0 0 0 12.25 12.25L16 24.62c.89-.89.89-2.33 0-3.22l-.55-.55a2.27 2.27 0 0 0-3.22 0zM17.18 6.3a3.34 3.34 0 0 1 4.7 4.71l-1.21 1.22a2.27 2.27 0 0 0 0 3.22l.55.55c.89.89 2.33.89 3.22 0l1.22-1.22A8.67 8.67 0 0 0 13.4 2.53l-1.22 1.22a2.27 2.27 0 0 0 0 3.22l.55.55c.89.89 2.33.89 3.22 0z" />
        <path
          d="m20 17.63-1.29-1.18-.14-.14a1.67 1.67 0 0 0-2.38.17l-.14.15c-.57.64-.55 1.6.02 2.24l.15.14 1.28 1.18.15.14c.64.56 1.6.55 2.23-.03l.15-.14.14-.15c.56-.64.55-1.6-.03-2.24zm-7.91-8.11-1.26-1.2-.15-.13a1.67 1.67 0 0 0-2.23.02l-.15.15-.14.14a1.67 1.67 0 0 0 .17 2.38l1.26 1.2.15.14a1.67 1.67 0 0 0 2.38-.17l.14-.15c.56-.64.55-1.6-.03-2.24z"
          opacity=".4"
        />
      </svg>
    ),
    textKey: LanguageKey.sidebar_biolink,
    activeRoutes: ["market", "marketmylink", "marketstatistics", "marketproperties"],
  },
  {
    href: "/advertise",
    iconPath: (color: string) => (
      <svg fill={color} width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 32">
        <path
          d="M20 1.7a2 2 0 0 0-2.4.1l-7.3 6.6 3.8 13.9 9.7 2a2 2 0 0 0 2.1-1c3.5-7.7 1-16.7-5.8-21.6"
          fillOpacity=".6"
        />
        <path d="M14.2 25.9a3 3 0 0 1-1.6 4.2c-1.6.7-3.5 0-4.2-1.6l-2.4-5A7 7 0 0 1 2 19c-1.2-3.9 1.3-8.4 5.7-9.6L9.2 9 13 23.5z" />
      </svg>
    ),
    textKey: LanguageKey.sidebar_Advertise,
    activeRoutes: ["advertisecalendar", "advertisestatistics", "advertiseadlist", "advertiseProperties"],
  },
  {
    href: "/store",
    iconPath: (color: string) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={color}
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fillRule="evenodd">
        <path
          opacity=".4"
          d="M19.7 15h-.5a7 7 0 0 1-4.4 1.5q-2.4 0-4.3-1.4H10a7 7 0 0 1-7.3.7q-.6 0-.7.5V22c0 4.5 3 7.7 7.2 7.9q.5 0 .5-.5v-3c0-2.8 2.3-5.2 5.1-5.2a5 5 0 0 1 5.2 5.2v3q0 .5.4.5c4.4-.2 7.6-3.2 7.6-7.9v-6q-.1-.5-.7-.4a7 7 0 0 1-7.6-.6"
        />
        <path d="M15 24c-1.6 0-3 1.2-3 2.7v2.9q0 .3.5.4h5q.5 0 .5-.4v-2.9c0-1.5-1.3-2.7-3-2.7M30 8.4a33 33 0 0 0-1.5-5.2A5 5 0 0 0 24.1 0H5.9a5 5 0 0 0-4.5 3.2A35 35 0 0 0 0 8.4 4 4 0 0 0 1.2 12a6 6 0 0 0 4.4 2q2.6-.1 4.2-2a.6.6 0 0 1 1 0 5.5 5.5 0 0 0 8.5 0 1 1 0 0 1 .9 0 6 6 0 0 0 4.3 2 6 6 0 0 0 4.3-2A4 4 0 0 0 30 8.4" />
      </svg>
    ),
    textKey: LanguageKey.sidebar_Store,
    activeRoutes: ["storeproducts", "storeorders", "storestatistics", "storetitle"],
  },
  {
    href: "/setting",
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
    activeRoutes: ["setting", "settinggeneral", "settingsubAdmin"],
  },
];

interface LeftHamMenueProps {
  removeMask: () => void;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowUpgrade: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
  handleRemoveNotifLogo: () => void;
}

const LeftHamMenue = ({
  removeMask,
  handleShowSignOut,
  handleShowUpgrade,
  handleShowSwitch,
  handleRemoveNotifLogo,
}: LeftHamMenueProps) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const { value, setValue } = use(InstaInfoContext) ?? {};

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const newRoute = useMemo(() => router.route.replaceAll("/", ""), [router.route]);
  const getNotifLogo = useCallback((responseType: PushResponseType) => {
    if (
      responseType === PushResponseType.UploadPostSuccess ||
      responseType === PushResponseType.UploadStorySuccess ||
      responseType === PushResponseType.AIImageSuccess ||
      responseType === PushResponseType.AIVideoSuccess
    ) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="var(--color-dark-green)"
            d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M5.2 7.8a1 1 0 0 0-.7 1.7L6 11a1 1 0 0 0 1.4 0l4.1-4a1 1 0 1 0-1.4-1.5L6.7 9 6 8z"
          />
        </svg>
      );
    }

    if (responseType === PushResponseType.UpdateSystemTicket || responseType === PushResponseType.ChangeOrderStatus) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16">
          <path
            fill="var(--color-firoze)"
            d="M8.3 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16m-1.6-4.9-.3.1v.4l.3.4H10a.5.5 0 0 0 0-.9l-.6-.1V7H6.6a.5.5 0 0 0 0 .9l.6.1v3zM7.3 4v2h2V4z"
          />
        </svg>
      );
    }

    if (
      responseType === PushResponseType.UploadPostFailed ||
      responseType === PushResponseType.UploadStoryFailed ||
      responseType === PushResponseType.AIImageFailed ||
      responseType === PushResponseType.AIVideoFailed
    ) {
      return (
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M6 5a1 1 0 0 0-.7 1.7L6.6 8 5.3 9.3a1 1 0 1 0 1.4 1.4L8 9.4l1.3 1.3a1 1 0 1 0 1.4-1.4L9.4 8l1.3-1.3a1 1 0 1 0-1.4-1.4L8 6.6 6.7 5.3z"
            fill="var(--color-dark-red)"
          />
        </svg>
      );
    }

    return null;
  }, []);

  const handleMessage = useCallback((notif: PushNotif): string => {
    if (notif.ResponseType === PushResponseType.UpdateSystemTicket && notif.Message) {
      const message = JSON.parse(notif.Message) as ITicketPushNotif;
      return `You have a new message from ${message.Username !== null ? message.Username : "+" + message.PhoneNumber}`;
    } else if (notif.ResponseType === PushResponseType.ChangeOrderStatus && notif.Message) {
      const message = JSON.parse(notif.Message) as IOrderPushNotifExtended;
      if (message.NewStatus === OrderStep.Paid) {
        return (
          "You have new order from " +
          (message.UserProfile?.FullName || message.UserProfile?.Username || message.UserProfile?.PhoneNumber)
        );
      }
      return "";
    } else if (notif.ResponseType === PushResponseType.AIImageSuccess && notif.Message) {
      const message = JSON.parse(notif.Message) as IGetMedia;
      return "Your images successfully created by, " + message.version + " model.";
    } else if (notif.ResponseType === PushResponseType.AIImageFailed && notif.Message) {
      const message = JSON.parse(notif.Message) as IGetMedia;
      return `Your images failed to be created by " + message.version + " model : ${message.metadata || "Image generation failed."}`;
    } else if (notif.ResponseType === PushResponseType.AIVideoSuccess && notif.Message) {
      const message = JSON.parse(notif.Message) as IGetMedia;
      return `Your video was successfully created by ${message.version} model.`;
    } else if (notif.ResponseType === PushResponseType.AIVideoFailed && notif.Message) {
      const message = JSON.parse(notif.Message) as IGetMedia;
      return `Your video failed to be created by ${message.version} model: ${message.metadata || "Video generation failed."}`;
    }

    const explanation = getEnumValue(PushResponseType, PushResponseExplanation, notif.ResponseType);
    return `${explanation}`;
  }, []);

  const handleProfileUrl = useCallback((notif: PushNotif): string => {
    if (notif.ResponseType === PushResponseType.UpdateSystemTicket && notif.Message) {
      const message = JSON.parse(notif.Message) as ITicketPushNotif;
      return baseMediaUrl + message.ProfileUrl;
    }

    if (notif.ResponseType === PushResponseType.ChangeOrderStatus && notif.Message) {
      const message = JSON.parse(notif.Message) as IOrderPushNotifExtended;
      return baseMediaUrl + message.UserProfile!.ProfileUrl;
    }

    return baseMediaUrl + fullyDecodeURIComponent(notif.ProfileUrl);
  }, []);

  const remainingDays = useMemo(() => {
    return session?.user.packageExpireTime ? getRemainingTime(session.user.packageExpireTime).days : 0;
  }, [session?.user.packageExpireTime]);

  const timeClass = useMemo(() => {
    return remainingDays < 3 ? styles.blinkRed : remainingDays < 10 ? styles.blinkYellow : "";
  }, [remainingDays]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isNotificationOpen) {
          setIsNotificationOpen(false);
        } else if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        } else {
          removeMask();
        }
      }
    },
    [isNotificationOpen, isSearchOpen, isUserMenuOpen, removeMask],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const clickOnLeft = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
    if (isNotificationOpen) setIsNotificationOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
  }, [isNotificationOpen, isSearchOpen]);

  const toggleNotification = useCallback(() => {
    handleRemoveNotifLogo();
    setIsNotificationOpen((prev) => !prev);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
  }, [handleRemoveNotifLogo, isSearchOpen, isUserMenuOpen]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
    if (isNotificationOpen) setIsNotificationOpen(false);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  }, [isNotificationOpen, isUserMenuOpen]);

  const handleRemoveNotification = useCallback(
    (index: number) => (e: MouseEvent) => {
      e.preventDefault();
      if (!setValue) return;
      setValue((prev) => prev.filter((_, i) => i !== index));
    },
    [setValue],
  );

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Menu | Instagram Management Dashboard</title>
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Access your Bran.cy dashboard menu to manage Instagram posts, stories, messages, wallet, market, store, and settings efficiently."
        />
        <meta
          name="keywords"
          content="instagram management, brancy dashboard, instagram tools, post scheduler, story creator, instagram analytics, social media tools"
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Bran.cy Dashboard Menu" />
        <meta property="og:description" content="Navigate your Instagram management tools with Bran.cy" />
        <meta property="og:type" content="website" />
      </Head>
      <div className={styles.all}>
        <div onClick={removeMask} className="dialogBg" role="presentation" />
        <nav ref={menuContainerRef} onClick={clickOnLeft} className={styles.menucontainer} aria-label="Main navigation">
          <div id="menuparentleft" className={styles.menuparentleft} role="menu">
            {menuItems.map((item, index) => {
              const isActive = item.activeRoutes.includes(newRoute);
              const color = isActive ? "var(--color-dark-blue)" : "var(--text-h2)";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={removeMask}
                  className={styles.menuleft}
                  role="menuitem"
                  tabIndex={0}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={t(item.textKey)}>
                  {item.iconPath(color)}
                  <span className={styles.menutextleft} style={{ color }}>
                    {t(item.textKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <aside className={styles.searchMenu} aria-label={t(LanguageKey.search)}>
          <button
            className="headerparent"
            onClick={toggleSearch}
            aria-expanded={isSearchOpen}
            aria-controls={`${menuId}-search-panel`}
            type="button">
            <div className="instagramprofile">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ padding: "7px" }} aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="var(--text-h1)" strokeWidth="2" />
                <path d="m16.5 16.5 4 4" stroke="var(--text-h1)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="instagramprofiledetail">
                <span className="instagramusername" style={{ textAlign: "start" }}>
                  {t(LanguageKey.search)}
                </span>
              </div>
            </div>
            <img
              style={{
                cursor: "pointer",
                width: "25px",
                height: "30px",
                padding: "5px",
                transform: isSearchOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
              src="/down-arrow.svg"
              alt={isSearchOpen ? "Collapse search" : "Expand search"}
              aria-hidden="true"
            />
          </button>
          <div
            id={`${menuId}-search-panel`}
            className={`${styles.searchContainer} ${isSearchOpen ? styles.searchOpen : ""}`}>
            {isSearchOpen && <FeatureSearch embedded onClose={() => setIsSearchOpen(false)} onNavigate={removeMask} />}
          </div>
        </aside>

        <aside ref={notificationRef} id="notification" className={styles.notification} aria-label="Notifications">
          <button
            className="headerparent"
            onClick={toggleNotification}
            aria-expanded={isNotificationOpen}
            aria-controls={`${menuId}-notification-list`}
            type="button">
            <div className="instagramprofile">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                style={{ padding: "5px" }}
                fill="var(--text-h1)"
                viewBox="0 0 36 36"
                aria-hidden="true">
                <path
                  d="M6.6 17.2a11.4 11.4 0 0 1 22.8.7q0 1.2.2 2.2a3 3 0 0 0 1.2 2 5 5 0 0 1 1.8 3.6c0 2.1-1.6 4-3.8 4H7.2a4 4 0 0 1-3.8-4q0-2.2 1.8-3.6a3 3 0 0 0 1.2-2l.2-2.2z"
                  opacity=".4"
                />
                <path d="M12.1 29.6a6 6 0 0 0 11.8 0h-3.1a3 3 0 0 1-5.6 0zM18 1.5a4 4 0 0 0-2.2.6q-1.1.6-1.2 2.2 0 1.3.8 2.4 2.6-.6 5.2 0 .8-1.1.8-2.4 0-1.5-1.2-2.2a4 4 0 0 0-2.2-.6" />
              </svg>

              <div className="instagramprofiledetail">
                <span className="instagramusername" style={{ textAlign: "start" }}>
                  {t(LanguageKey.advertiseProperties_notifications)}
                </span>
                {value && (
                  <span className="IDred" style={{ textAlign: "start" }} aria-live="polite">
                    {session!.user.currentIndex > -1 ? value.length : "0"}
                  </span>
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
              src="/down-arrow.svg"
              alt={isNotificationOpen ? "Collapse notifications" : "Expand notifications"}
              aria-hidden="true"
            />
          </button>
          <div
            id={`${menuId}-notification-list`}
            className={`${styles.notificationcontainer} ${isNotificationOpen ? styles.notificationOpen : ""}`}
            role="list"
            aria-label="Notification list">
            {value &&
              session!.user.currentIndex > -1 &&
              value.map((notif, index) => (
                <Link
                  key={`${notif.CreatedTime}-${index}`}
                  href={"/" + fullyDecodeURIComponent(notif.RedirectUrl)}
                  className={`${styles.notificationchild} translate`}
                  role="listitem"
                  tabIndex={0}>
                  <div
                    className={styles.iconok}
                    style={{ backgroundColor: "var(--color-dark-green30)" }}
                    aria-hidden="true">
                    {getNotifLogo(notif.ResponseType)}
                  </div>
                  <div className={styles.notifbody}>
                    <div className={styles.header}>
                      <span className={styles.title}>
                        {getEnumValue(PushResponseType, PushResponseTitle, notif.ResponseType) || ""}
                      </span>
                      <time className={styles.time} dateTime={new Date(notif.CreatedTime * 1000).toISOString()}>
                        {formatTimeAgo(notif.CreatedTime * 1e3)}
                      </time>
                    </div>
                    <p className={styles.message}>{handleMessage(notif)}</p>
                  </div>
                  <button
                    onClick={handleRemoveNotification(index)}
                    aria-label={`Remove notification: ${getEnumValue(
                      PushResponseType,
                      PushResponseTitle,
                      notif.ResponseType,
                    )}`}
                    style={{
                      cursor: "pointer",
                      width: "15px",
                      height: "15px",
                      border: "none",
                      background: "transparent",
                      padding: 0,
                    }}
                    type="button">
                    <img src="/deleteHashtag.svg" alt="" aria-hidden="true" />
                  </button>
                </Link>
              ))}
          </div>
        </aside>

        <aside ref={userMenuRef} id="usermenu" className={styles.usermenu} aria-label="User menu">
          <button
            className="headerparent"
            onClick={toggleUserMenu}
            aria-expanded={isUserMenuOpen}
            aria-controls={`${menuId}-user-menu-list`}
            type="button">
            <div className="instagramprofile">
              <img
                className="instagramimage"
                alt={`${session?.user.fullName || session?.user.username} profile picture`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/no-profile.svg";
                }}
                src={baseMediaUrl + session?.user.profileUrl!}
                loading="lazy"
              />

              <div className="instagramprofiledetail">
                <span className="instagramusername" style={{ textAlign: "start" }}>
                  {session?.user.fullName}
                </span>
                <span className="instagramid" style={{ textAlign: "start" }}>
                  {session?.user.username}
                </span>
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
              src="/down-arrow.svg"
              alt={isUserMenuOpen ? "Collapse user menu" : "Expand user menu"}
              aria-hidden="true"
            />
          </button>

          <div
            id={`${menuId}-user-menu-list`}
            className={`${styles.usermenucontainer} ${isUserMenuOpen ? styles.usermenuOpen : ""}`}
            role="menu">
            <div className={styles.gap} />
            <button onClick={handleShowUpgrade} className={styles.menuchild} role="menuitem" tabIndex={0} type="button">
              <svg
                className={styles.icon}
                xmlns="http://www.w3.org/2000/svg"
                fill="var(--color-light-yellow)"
                viewBox="0 0 17 11"
                aria-hidden="true">
                <path d="M16.8 1.5a1.3 1.3 0 1 0-1.9 1l-.3.6a3 3 0 0 1-2.4 1.7A3 3 0 0 1 9.8 3l-.2-.6a1.3 1.3 0 1 0-1.3 0L8 3a3 3 0 0 1-2.4 1.7A3 3 0 0 1 3.2 3q0-.4-.3-.6a1.3 1.3 0 1 0-1.1.2V3l1.7 6.4a2 2 0 0 0 1.7 1.3h7.4a2 2 0 0 0 1.7-1.3L15.8 3v-.4a1.3 1.3 0 0 0 1-1.2" />
              </svg>
              <div className="headerandinput" style={{ gap: "3px" }}>
                <span className="title2" style={{ fontSize: "14px" }}>
                  {t(LanguageKey.Renew_Subscription)}
                </span>
                <span className={`${styles.remainingTime} ${timeClass}`} aria-live="polite">
                  {t(LanguageKey.remainingTime)}:{" "}
                  <strong>
                    {formatNumber(remainingDays)} {t(LanguageKey.pageTools_Day)}
                  </strong>
                </span>
              </div>
            </button>
            <button onClick={handleShowSwitch} className={styles.menuchild} role="menuitem" tabIndex={0} type="button">
              <svg
                className={styles.icon}
                fill="var(--color-gray)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 18 17"
                aria-hidden="true">
                <path d="M3 3.8a1 1 0 0 1 0-1 1 1 0 0 1 1 0l.4.5V1.5a.7.7 0 0 1 1.4 0v1.8l.5-.5a1 1 0 0 1 1 0 1 1 0 0 1 0 1L5.6 5.4a1 1 0 0 1-1 0zm14 4.7a2 2 0 0 1-.6 1.6q-.7.6-1.6.6h-5q-.8 0-1.3-.4v.2l.6.4.7.8.3 1 .1.8v.8a2 2 0 0 1-.6 1.6q-.7.6-1.5.6H3q-1 0-1.7-.6a2 2 0 0 1-.6-1.6l.2-1.7.3-.9.7-.8.6-.4a3 3 0 0 1 1.7-4 3 3 0 0 1 3.4.7L8 5.9q.2-.5.6-.8l.7-.4a3 3 0 0 1 3-4.2 3 3 0 0 1 2.9 4.2l.7.4.6.8.3 1 .2.7zm-3-4.9a1.8 1.8 0 0 0-3-1.3 2 2 0 0 0 .1 2.7 2 2 0 0 0 2.3 0l.2-.1a2 2 0 0 0 .5-1.3m1.7 4.2-.4-1.3q0-.3-.3-.4l-.4-.2h-.2l-.3.2a3 3 0 0 1-3.8 0V6h-.1l-.2-.1-.5.2-.3.4L9 7l-.2 1.4.3.7.6.2h5.1q.4 0 .7-.2l.2-.7zM7.4 9.4a1.8 1.8 0 1 0-3 1.4 2 2 0 0 0 2.3 0h.1a2 2 0 0 0 .6-1.4m-3.8 2.4h-.4l-.4.1-.3.4-.2.6-.2 1.4.2.7.7.2h5q.5 0 .8-.2l.2-.7-.2-1.4-.2-.6-.3-.4-.4-.2h-.3l-.2.2a3 3 0 0 1-3.8 0m10.4-.1a1 1 0 0 0-1 0l-1.6 1.7a1 1 0 0 0 0 1 1 1 0 0 0 1 0l.5-.6v1.8a.7.7 0 0 0 1.3 0v-1.8l.5.5a1 1 0 0 0 1 0 1 1 0 0 0 0-1z" />
              </svg>
              <div className="headerandinput" style={{ gap: "3px" }}>
                <span className="title2" style={{ fontSize: "14px" }}>
                  {t(LanguageKey.switchaccount)}
                </span>
              </div>
            </button>
            <button className={styles.menuchild} onClick={handleShowSignOut} role="menuitem" tabIndex={0} type="button">
              <svg
                className={styles.icon}
                fill="var(--color-dark-red)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 17 19"
                aria-hidden="true">
                <path d="m16.6 10.2-3.1 3a.7.7 0 0 1-1-1l1.8-1.8H9.8a.7.7 0 1 1 0-1.5h4.5l-1.8-1.8a.7.7 0 1 1 1-1l3.1 3a1 1 0 0 1 0 1m-3.5 4.3a1 1 0 0 0-.8.8c0 1.6-1.4 2.2-2.6 2.2H5a2.7 2.7 0 0 1-2.7-2.7V4.6A2.7 2.7 0 0 1 5 1.9h4.7c1.2 0 2.6.6 2.6 2.2a.8.8 0 0 0 1.6 0C13.9 2 12 .3 9.7.3H5A4 4 0 0 0 .8 4.6v10.2A4 4 0 0 0 5 19h4.7c2.4 0 4.2-1.5 4.2-3.7a1 1 0 0 0-.8-.8" />
              </svg>
              <div className="headerandinput" style={{ gap: "3px" }}>
                <span className="title2" style={{ fontSize: "14px" }}>
                  {t(LanguageKey.signout)}
                </span>
              </div>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default LeftHamMenue;
