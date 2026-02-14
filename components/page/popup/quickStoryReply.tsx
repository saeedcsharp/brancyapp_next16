import Head from "next/head";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import EditAutoReplyForMedia from "saeed/components/messages/popups/editAutoReplyForMedia";
import { LanguageKey } from "saeed/i18n";
import { MediaProductType } from "saeed/models/messages/enum";
import { IAutomaticReply, IMediaUpdateAutoReply } from "saeed/models/page/post/posts";

interface QuickReplyPopupProps {
  setShowQuickReplyPopup: (show: boolean) => void;
  handleSaveAutoReply: (sendReply: IMediaUpdateAutoReply) => void;
  handleActiveAutoReply: (e: ChangeEvent<HTMLInputElement>) => void;
  autoReply: IAutomaticReply;
}

const QuickStoryReplyPopup: React.FC<QuickReplyPopupProps> = ({
  setShowQuickReplyPopup,
  handleSaveAutoReply,
  handleActiveAutoReply,
  autoReply,
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
      {/* <div className="dialogBg" onClick={() => setShowQuickReplyPopup(false)} role="presentation" aria-hidden="true" /> */}

      <EditAutoReplyForMedia
        setShowQuickReplyPopup={setShowQuickReplyPopup}
        handleSaveAutoReply={handleSaveAutoReply}
        handleActiveAutoReply={handleActiveAutoReply}
        autoReply={autoReply}
        productType={MediaProductType.Live}
        showActiveAutoreply={false}
      />
    </>
  );
};

export default QuickStoryReplyPopup;
