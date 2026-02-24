import { useState } from "react";
import FiveStar from "brancy/components/fiveStar";
import { IReviews } from "brancy/models/market/myLink";
import styles from "./mylink.module.css";
const Reviews = ({ data }: { data: IReviews | null }) => {
  const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const [isContentVisible, setIsContentVisible] = useState(true);
  const toggleContentVisibility = () => {
    setIsContentVisible((prev) => !prev);
  };
  return (
    <>
      {data && data.reviews.length > 0 && (
        <div key={"reviews"} id="reviews" className={styles.all}>
          <div className={styles.header} onClick={toggleContentVisibility}>
            <div className={`${styles.squre} ${!isContentVisible ? styles.closed : ""}`}></div>
            <div className={styles.headertext}>
              Reviews
              <div className={styles.headertextblue}></div>
            </div>
            <div className={styles.line}></div>
          </div>

          <div className={`${styles.content} ${isContentVisible ? styles.show : ""}`}>
            <div className={styles.reviewslist}>
              {data.reviews.map((v, i) => (
                <div key={i} className={styles.reviewscontent}>
                  <div className={styles.reviewscontenttop}>
                    <div className={styles.reviewerprofile}>
                      <img
                        className={styles.reviewsprofileimage}
                        alt="🤒Profile Image"
                        src={baseMediaUrl + v.profileUrl}
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
          </div>
        </div>
      )}
    </>
  );
};

export default Reviews;
