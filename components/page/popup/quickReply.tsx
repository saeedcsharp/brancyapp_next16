import Head from "next/head";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import EditAutoReplyForMedia from "../../messages/popups/editAutoReplyForMedia";
import { LanguageKey } from "../../../i18n";
import { MediaProductType } from "../../../models/messages/enum";
import { IAutomaticReply, IMediaUpdateAutoReply } from "../../../models/page/post/posts";

interface QuickReplyPopupProps {
  setShowQuickReplyPopup: (show: boolean) => void;
  handleSaveAutoReply: (sendReply: IMediaUpdateAutoReply) => void;
  handleActiveAutoReply: (e: ChangeEvent<HTMLInputElement>) => void;
  autoReply: IAutomaticReply;
}

const QuickReplyPopup: React.FC<QuickReplyPopupProps> = ({
  setShowQuickReplyPopup,
  handleSaveAutoReply,
  autoReply,
  handleActiveAutoReply,
}) => {
  const { t } = useTranslation();

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
      <EditAutoReplyForMedia
        setShowQuickReplyPopup={setShowQuickReplyPopup}
        handleSaveAutoReply={handleSaveAutoReply}
        handleActiveAutoReply={handleActiveAutoReply}
        autoReply={autoReply}
        productType={autoReply.productType ?? MediaProductType.Feed}
        showActiveAutoreply={false}
      />
    </>
  );
};

export default QuickReplyPopup;
