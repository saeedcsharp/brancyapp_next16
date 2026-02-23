import styles from "../customerAds.module.css";
import { calculateSummary } from "../../../helper/numberFormater";
import { ICardAdvertiser } from "../../../models/customerAds/customerAd";
function UserProfile(prop: { data: ICardAdvertiser }) {
  return (
    <div className={styles.popupsection}>
      <div className={styles.popupprofile}>
        <div className={styles.instagramprofile}>
          <img
            loading="lazy"
            decoding="async"
            className="instagramimage"
            alt="profile image"
            src="/no-profile.svg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/no-profile.svg";
            }}
          />

          <div className="instagramprofiledetail">
            <div className="instagramusername">{prop.data.fullName}</div>
            <div className="instagramid">{prop.data.username}</div>
          </div>
        </div>
        <div className={styles.instagrambio}>{prop.data.terms}</div>
      </div>
      <div className={styles.popupdataparent}>
        <div className={styles.datapopup}>
          <div className={styles.section}>
            <div
              className={styles.number}
              style={{
                color: "var(--color-dark-blue)",
              }}>
              {calculateSummary(prop.data.follower)}
            </div>
            follower
          </div>

          <div className={styles.section}>
            <div
              className={styles.number}
              style={{
                color: "var(--color-light-blue)",
              }}>
              {calculateSummary(prop.data.following)}
            </div>
            Following
          </div>
        </div>

        <div className={styles.datapopup}>
          <div className={styles.section}>
            <div
              className={styles.number}
              style={{
                color: "var(--color-purple)",
              }}>
              {calculateSummary(prop.data.reach)}
            </div>
            reach
          </div>

          <div className={styles.section}>
            <div
              className={styles.number}
              style={{
                color: "var(--color-light-green)",
              }}>
              {calculateSummary(prop.data.engage)}
            </div>
            engage
          </div>
        </div>

        <div className={styles.datapopup}>
          <div className={styles.section}>
            <div
              className={styles.number}
              style={{
                color: "var(--text-h1)",
              }}>
              {prop.data.postCount}
            </div>
            post
          </div>

          <div className={styles.section}>
            <div
              className={styles.number}
              style={{
                color: "var(--color-light-yellow)",
              }}>
              {prop.data.rating} / 5
            </div>
            rating
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
