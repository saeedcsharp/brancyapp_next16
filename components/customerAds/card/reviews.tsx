import FiveStar from "../../fiveStar";
import { IReview } from "../../../models/market/myLink";
import styles from "./reviews.module.css";
function Reviews({ reviews }: { reviews: IReview[] }) {
  const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

  return (
    <>
      <div className="headerandinput">
        <div className="title">Reviws</div>
      </div>
      <div className={styles.reviewslist}>
        {reviews.map((v, i) => (
          <div key={i} className={styles.reviewscontent}>
            <div className={styles.reviewscontenttop}>
              <div className={styles.reviewerprofile}>
                {/* <img
                  className={styles.reviewsprofileimage}
                  alt="🤒Profile Image"
                  src={baseMediaUrl + v.profileUrl}
                  width={50}
                  height={50}
                /> */}
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.reviewsprofileimage}
                  alt="🤒Profile Image"
                  src={v.profileUrl}
                  width={50}
                  height={50}
                />
                <div className={styles.reviewer}>
                  {v.username}
                  <div className={styles.reviewdate}>11/05/2021</div>
                </div>
              </div>
              <FiveStar rating={4.5} />
            </div>

            <div className={styles.reviewscontenttext}>{v.str}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Reviews;
