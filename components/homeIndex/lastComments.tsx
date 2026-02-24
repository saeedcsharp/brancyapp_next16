import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import entryTypeToStr, { ILastMessage } from "brancy/models/homeIndex/home";
import { ItemType } from "brancy/models/messages/enum";
import Loading from "brancy/components/notOk/loading";
import styles from "./lastComments.module.css";
import Cursor from "quill/blots/cursor";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const isRTL = (text: string) => {
  const rtlChars = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/;
  return rtlChars.test(text);
};
const LastComments = (props: { data: ILastMessage[] | null }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session));
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");
  const [popupUsername, setPopupUsername] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };
  function handleImageClick(imageUrl: string, username: string) {
    setPopupImage(imageUrl);
    setPopupUsername(username);
    setShowPopup(true);
  }

  function handleClosePopup() {
    setShowPopup(false);
    setPopupImage("");
    setPopupUsername("");
  }
  useEffect(() => {
    if (props.data && LoginStatus(session)) {
      console.log("LoginStatus(session)");
      setLoadingStaus(false);
    }
  }, [props.data]);
  const getItemTypeEmoji = (itemType: ItemType): string => {
    switch (itemType) {
      case ItemType.Text:
        return " ";
      case ItemType.PlaceHolder:
        return "📝" + t(LanguageKey.PlaceHolder);
      case ItemType.MediaShare:
        return "📺" + t(LanguageKey.media);
      case ItemType.ReplyStory:
        return "↩️" + t(LanguageKey.ReplyStory);
      case ItemType.Media:
        return "📷" + t(LanguageKey.photo);
      case ItemType.AudioShare:
        return "🎵" + t(LanguageKey.voice);
      case ItemType.Buttons:
        return "🔘" + t(LanguageKey.button);
      case ItemType.Generic:
        return "📄" + t(LanguageKey.Generic);
      case ItemType.StoryMention:
        return "👥" + t(LanguageKey.StoryMention);
      case ItemType.FileShare:
        return "📁" + t(LanguageKey.FileShare);
      default:
        return "❓" + t(LanguageKey.Unknown);
    }
  };
  return (
    <section className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 62" }}>
      <div className={styles.contactBox}>
        <div className="frameParent" title="↕ Resize the Card">
          <div className="headerChild" onClick={handleCircleClick} style={{ cursor: "pointer" }}>
            <div className="circle"></div>
            <h2 className="Title">{"Last comment"}</h2>
          </div>
        </div>
        {loadingStatus && <Loading />}
        {!loadingStatus && props.data && (
          <div className={`${styles.frameContainer} ${isHidden ? "" : styles.show}`}>
            {props.data.map((v, i) => (
              <div key={i} className={`${styles.groupWrapper} translate`}>
                <div className={styles.profile}>
                  <img
                    title="◰ resize the picture"
                    className={styles.imageProfile}
                    loading="lazy"
                    decoding="async"
                    alt="instagram profile picture"
                    src={basePictureUrl + v.profileUrl}
                    onClick={() => handleImageClick(basePictureUrl + v.profileUrl, v.username)}
                  />
                  <Link href={v.relativeUrl}>
                    <img
                      loading="lazy"
                      decoding="async"
                      title="🔗 Reply message"
                      className={styles.replyicon}
                      alt="Reply message icon"
                      src="/icon-reply.svg"
                    />
                  </Link>
                </div>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="instagramusername" title={v.username}>
                      {v.username}
                    </div>
                    <div
                      className={
                        entryTypeToStr(v.entryType) === t(LanguageKey.navbar_Ticket)
                          ? styles.ticket
                          : entryTypeToStr(v.entryType) === t(LanguageKey.navbar_Direct)
                            ? styles.direct
                            : entryTypeToStr(v.entryType) === t(LanguageKey.navbar_Comments)
                              ? styles.comment
                              : styles.unknown
                      }
                      title="ℹ️ message type">
                      {entryTypeToStr(v.entryType)}
                    </div>
                  </div>

                  <div
                    title={v.message ?? ""}
                    className={`${styles.message} ${isRTL(v.message ?? "") ? "rtl" : "ltr"}`}>
                    {v.directItemType === ItemType.Text && v.message}
                    {v.directItemType !== ItemType.Media && (
                      <>
                        {getItemTypeEmoji(v.directItemType)}
                        {/* حذف نمایش متن */}
                      </>
                    )}
                    {v.directItemType === ItemType.Media && v.directMediaType !== null && (
                      <>
                        {getItemTypeEmoji(v.directItemType)}
                        {/* حذف نمایش متن */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPopup && (
        <>
          <div className="dialogBg" onClick={handleClosePopup}></div>
          <div className="popup">
            <div className="headerparent" style={{ padding: "var(--padding-10)" }}>
              <div>@ {popupUsername}</div>
              <div className={styles.closebtn} onClick={handleClosePopup}>
                <img
                  loading="lazy"
                  decoding="async"
                  style={{ transform: "rotate(45deg)" }}
                  src="/plus.svg"
                  alt="Popup profile"
                  title="close"
                />
              </div>
            </div>
            <img
              loading="lazy"
              decoding="async"
              className={styles.profileimagebig}
              src={popupImage}
              alt="Popup profile"
              title="profile picture"
            />
          </div>
        </>
      )}
    </section>
  );
};

export default LastComments;
