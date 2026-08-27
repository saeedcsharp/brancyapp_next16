import Head from "next/head";
import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import EditAutoReplyForMedia from "brancy/components/messages/popups/editAutoReplyForMedia";
import { LanguageKey } from "brancy/i18n";
import { MediaProductType, ShopMediaProductType } from "brancy/models/enums";
import { IMediaUpdateAutoReply, IAutomaticReply } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import InvalidIpModalContent from "brancy/components/switchAccount/invalidIpModalContent";
import Modal from "brancy/components/design/modal";
import { redirectHostUrl } from "brancy/helper/apiBaseUrl";
import styles from "./quickReply.module.css";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

interface QuickReplyPopupProps {
  setShowQuickReplyPopup: (show: boolean) => void;
  handleSaveAutoReply: (sendReply: IMediaUpdateAutoReply) => void;
  handleActiveAutoReply: (e: ChangeEvent<HTMLInputElement>) => void;
  autoReply: IAutomaticReply;
  shopMediaProductType?: ShopMediaProductType;
}

const QuickReplyPopup: React.FC<QuickReplyPopupProps> = ({
  setShowQuickReplyPopup,
  handleSaveAutoReply,
  autoReply,
  shopMediaProductType,
  handleActiveAutoReply,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [showInvalidIp, setShowInvalidIp] = useState(false);
  const [invalidIpExpireTime, setInvalidIpExpireTime] = useState(0);

  async function redirectToInstagram() {
    const response = await clientFetchApi<boolean, string>("/api/preinstagramer/GetInstagramRedirect", {
      methodType: MethodType.get,
      session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
    });

    if (response.succeeded) {
      const currentHost = window.location.host;
      if (currentHost.includes(redirectHostUrl())) {
        window.location.assign(response.value);
      } else {
        window.location.assign(
          `https://${redirectHostUrl()}/redirectInterface?redirectUrl=${encodeURIComponent(response.value)}`,
        );
      }
    }
  }

  async function handleRedirectToInstagram() {
    try {
      const response = await fetch("/api/user/ip");
      const data = await response.json();
      if (data.countryCode === "ir" || !data.countryCode) {
        setInvalidIpExpireTime(Date.now() + 10000);
        setShowInvalidIp(true);
        return;
      }
    } catch {
      // Proceed to redirect when the IP lookup is unavailable.
    }
    await redirectToInstagram();
  }

  const handleInvalidIpContinue = () => {
    setShowInvalidIp(false);
    void redirectToInstagram();
  };

  return (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.autocommentReply)}</title>
        <meta
          name="description"
          content="Professional Instagram post creator and scheduler with advanced media management tools"
        />
        <meta
          name="keywords"
          content="instagram post creator, post scheduler, social media management, Brancy, hashtag manager, instagram tools"
        />
        <meta property="og:title" content="Bran.cy - Quick Reply" />
        <meta property="og:description" content="Professional Instagram post creator and scheduler" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.brancy.app/page/posts" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bran.cy Quick Reply" />
        <meta name="twitter:description" content="Create and schedule Instagram posts professionally" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.brancy.app/page/posts" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {session?.user.commentPermission === false ? (
        <div className={styles.permissionState} role="status">
          <svg className={styles.permissionIcon} viewBox="0 0 96 96" aria-hidden="true">
            <rect x="20" y="40" width="56" height="42" rx="8" fill="none" stroke="currentColor" strokeWidth="6" />
            <path
              d="M32 40V29a16 16 0 0 1 32 0v11"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="48" cy="60" r="5" fill="currentColor" />
            <path d="M48 65v8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path
              d="m68 22 5 5 10-11"
              fill="none"
              stroke="var(--color-green, #2eaa70)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2>{t(LanguageKey.AccessAndManageComments)}</h2>
          <p>{t(LanguageKey.AccessAndManageCommentsExplain)}</p>
          <button type="button" className="saveButton" onClick={handleRedirectToInstagram}>
            {t(LanguageKey.EnablePermission)}
          </button>
        </div>
      ) : session?.user.commentPermission ? (
        <EditAutoReplyForMedia
          setShowQuickReplyPopup={setShowQuickReplyPopup}
          handleSaveAutoReply={handleSaveAutoReply}
          handleActiveAutoReply={handleActiveAutoReply}
          autoReply={autoReply}
          productType={autoReply.productType ?? MediaProductType.Feed}
          showActiveAutoreply={false}
          shopMediaProductType={shopMediaProductType}
        />
      ) : null}
      <Modal
        closePopup={() => setShowInvalidIp(false)}
        classNamePopup="popupMini"
        showContent={showInvalidIp}
        style={{
          aspectRatio: "auto",
          gap: "16px",
          justifyContent: "flex-start",
          maxHeight: "none",
          padding: "28px",
        }}>
        <InvalidIpModalContent
          expireTime={invalidIpExpireTime}
          onContinue={handleInvalidIpContinue}
          onClose={() => setShowInvalidIp(false)}
        />
      </Modal>
    </>
  );
};

export default QuickReplyPopup;
