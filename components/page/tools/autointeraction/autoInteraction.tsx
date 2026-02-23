import { useSession } from "next-auth/react";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { IAutoInterAction } from "brancy/models/page/tools/tools";
import styles from "brancy/components/page/tools/autointeraction/autoInteraction.module.css";
const AutoInteraction = (props: { data: IAutoInterAction; handleShowPopup: (e: MouseEvent) => void }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isHidden, setIsHidden] = useState(false); // New state to toggle visibility and grid-row-end
  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle visibility and grid-row-end state
  };
  // if (session?.user.loginStatus !== 0) return <NotPassword />;
  return (
    <>
      <div
        className="bigcard"
        style={{ gridRowEnd: isHidden ? "span 10" : "span 41" }} // Update gridRowEnd based on isHidden
      >
        <div className="headerChild" onClick={handleCircleClick}>
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.pageTools_AutoInterAction)}</div>
        </div>

        <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
          <div className={styles.followerRequest} onClick={props.handleShowPopup} id={"Follow requests"}>
            <div className={styles.title}>{t(LanguageKey.pageTools_AcceptPendingRequests)}</div>
            {/* <div className={styles.tag}>
             <div className={styles.tagNotification}>
                {props.data.followerRequest}
              </div>
            </div> */}
          </div>

          <div className={styles.likeAllComments} onClick={props.handleShowPopup} id={"Like all comments"}>
            <div className={styles.title}>{t(LanguageKey.pageTools_LikeAllNewComments)}</div>
            {/* <div className={styles.tag}>
              <div className={styles.tagNotification}>
                {props.data.likeAllComments}
              </div>
            </div> */}
          </div>

          <div className={styles.likeFollowerPosts} onClick={props.handleShowPopup} id={"Like follower posts"}>
            <div className={styles.title}>{t(LanguageKey.pageTools_LikeNewFollowersPosts)}</div>
            {/* <div className={styles.tag}>
              <div className={styles.tagNotification}>
                {props.data.likeFollowerPosts}
              </div>
            </div> */}
          </div>

          {/* <div
            className={styles.unfollowAllUnfollowers}
            onClick={props.handleShowPopup}
            id={"Unfollow all unfollowers"}>
            <div className={styles.title}>remove all followers
            {t(LanguageKey.removeallfollowers)}
            </div>
            <div className={styles.tag}>
              <div className={styles.tagNotificationred}>
                {props.data.unfollowAllUnfollowers}
              </div>
            </div>
          </div> */}

          <div className={styles.unfollowAllFollowing} onClick={props.handleShowPopup} id={"Unfollow all followings"}>
            <div className={styles.title}>{t(LanguageKey.pageTools_RemoveAllFollowings)}</div>
            {/* <div className={styles.tag}>
              <div className={styles.tagNotificationred}>
                {props.data.unfollowAllFollowing}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoInteraction;
