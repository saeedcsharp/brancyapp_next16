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
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import CommentPermissionState from "brancy/components/notOk/commentPermissionState";

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
        <CommentPermissionState onEnablePermission={handleRedirectToInstagram} />
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
