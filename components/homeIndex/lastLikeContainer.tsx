import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import { ILastLike } from "../../models/homeIndex/home";
import Loading from "../notOk/loading";
import styles from "./lastLikeContainer.module.css";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const LastLikeContainer = (props: { data: ILastLike[] | null }) => {
  const { t } = useTranslation();
  const [loadingStatus, setLoadingStaus] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");
  const [popupUsername, setPopupUsername] = useState(""); // New state for storing username
  const [isHidden, setIsHidden] = useState(false); // New state to hide the frameContainer and change gridRowEnd
  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle the isHidden state
  };
  function handleImageClick(imageUrl: string, username: string) {
    setPopupImage(imageUrl);
    setPopupUsername(username); // Store the username
    setShowPopup(true);
  }

  function handleClosePopup() {
    setShowPopup(false);
    setPopupImage("");
    setPopupUsername(""); // Clear the username
  }
  useEffect(() => {
    if (props.data) setLoadingStaus(false);
  }, [props.data]);
  return (
    <section className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 62" }}>
      <div className={styles.contactBox}>
        <div className="frameParent" title="↕ Resize the Card">
          <div className="headerChild" onClick={handleCircleClick}>
            <div className="circle"></div>
            <h2 className="Title">{t(LanguageKey.lastLike)}</h2>
          </div>
        </div>
        {loadingStatus && <Loading />}
        {!loadingStatus && props.data && (
          <div className={`${styles.frameContainer} ${isHidden ? "" : styles.show}`}>
            {props.data.map((v, i) => (
              <div key={i} className={styles.groupWrapper}>
                <Link href={`/page/posts/postinfo/${v.postId}`} title="see your posts detail">
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.imageContent}
                    alt="instagram post picture"
                    src={basePictureUrl + v.postUrl}
                  />
                </Link>
                <img
                  title="◰ resize the picture"
                  className={styles.imageProfile}
                  loading="lazy"
                  decoding="async"
                  alt="instagram profile picture"
                  src={basePictureUrl + v.profileUrl}
                  onClick={() => handleImageClick(basePictureUrl + v.profileUrl, v.username)} // Pass username
                />
                <div className={styles.profileid} title={v.username}>
                  {v.username}
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
              <div className={styles.username}>@ {popupUsername}</div> {/* Use the stored username */}
              <div className={styles.closebtn} onClick={handleClosePopup}>
                <img style={{ transform: "rotate(45deg)" }} src="/plus.svg" alt="Popup profile" title="close" />
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

export default LastLikeContainer;

function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}
