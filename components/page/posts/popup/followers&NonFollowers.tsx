import { useState } from "react";
import { useTranslation } from "react-i18next";
import Slider, { SliderSlide } from "../../../design/slider/slider";
import IconToggleButton from "../../../design/toggleButton/iconToggleButton";
import { ToggleOrder } from "../../../design/toggleButton/types";
import { LanguageKey } from "../../../../i18n";
import { IFullPageInfo } from "../../../../models/page/post/preposts";
import styles from "./followers&NonFollowers.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const FollowersNonFollowers = (props: { removeMask: () => void }) => {
  const [toggleValue, setToggleValue] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [followers, setFollowers] = useState<IFullPageInfo[]>([]);
  const [unFollowers, setUnFollowers] = useState<IFullPageInfo[]>([]);

  const fetchFollowrs = () => {
    // Api to get rest messages
    // need commentId and pagination
    var res: IFullPageInfo[] = [];
    setFollowers((prev) => [...prev, ...res]);
  };

  const fetchNonFollower = () => {
    // Api to get rest messages
    var res: IFullPageInfo[] = [];
    setUnFollowers((prev) => [...prev, ...res]);
  };
  const { t } = useTranslation();
  return (
    <>
      <IconToggleButton
        data={{
          firstToggle: t(LanguageKey.Followers),
          secondToggle: t(LanguageKey.NonFollowers),
        }}
        values={{
          firstToggle: t(LanguageKey.Followers),
          secondToggle: t(LanguageKey.NonFollowers),
        }}
        dataIcon={{
          firstIcon: {
            active: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 28">
                <path
                  fill="var(--color-white)"
                  d="m23.55 21.56-5.06 5.06a4.7 4.7 0 0 1-6.63 0l-2.45-2.45c-.6-.6-.6-1.6 0-2.21a1.6 1.6 0 0 1 2.22 0l2.44 2.45c.62.6 1.6.6 2.22 0l5.05-5.07a1.6 1.6 0 0 1 2.22 0c.6.61.6 1.61 0 2.22m-12.47-2.93c.56.01 1.01.05 1.5.07l.42.03q.63-.1 1.03-.59c.29-.4.4-.9.28-1.39a1.7 1.7 0 0 0-1.59-1.2q-.9-.14-1.84-.14s-.4 0-.79.03a11 11 0 0 0-6.94 2.7A10.3 10.3 0 0 0 0 25.33c0 .87.71 1.57 1.59 1.57a1.6 1.6 0 0 0 1.58-1.58 7.8 7.8 0 0 1 3.03-5.49 8 8 0 0 1 3.81-1.21l1.06.01M3.87 6.94a6.94 6.94 0 1 1 13.88 0 6.94 6.94 0 0 1-13.88 0m3.18 0a3.75 3.75 0 1 0 7.5.01 3.75 3.75 0 0 0-7.5 0"
                />
              </svg>
            ),
            diactive: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 28">
                <path
                  fill="var(--text-h2)"
                  d="m23.55 21.56-5.06 5.06a4.7 4.7 0 0 1-6.63 0l-2.45-2.45c-.6-.6-.6-1.6 0-2.21a1.6 1.6 0 0 1 2.22 0l2.44 2.45c.62.6 1.6.6 2.22 0l5.05-5.07a1.6 1.6 0 0 1 2.22 0c.6.61.6 1.61 0 2.22m-12.47-2.93c.56.01 1.01.05 1.5.07l.42.03q.63-.1 1.03-.59c.29-.4.4-.9.28-1.39a1.7 1.7 0 0 0-1.59-1.2q-.9-.14-1.84-.14s-.4 0-.79.03a11 11 0 0 0-6.94 2.7A10.3 10.3 0 0 0 0 25.33c0 .87.71 1.57 1.59 1.57a1.6 1.6 0 0 0 1.58-1.58 7.8 7.8 0 0 1 3.03-5.49 8 8 0 0 1 3.81-1.21l1.06.01M3.87 6.94a6.94 6.94 0 1 1 13.88 0 6.94 6.94 0 0 1-13.88 0m3.18 0a3.75 3.75 0 1 0 7.5.01 3.75 3.75 0 0 0-7.5 0"
                />
              </svg>
            ),
          },
          secondIcon: {
            active: (
              <svg width="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 28">
                <path
                  fill="var(--color-white)"
                  d="M24.36 25.165c.584.607.584 1.61 0 2.217a1.475 1.475 0 0 1-2.13 0l-2.356-2.45a1.475 1.475 0 0 0-2.13 0l-2.513 2.613a1.475 1.475 0 0 1-2.131 0 1.623 1.623 0 0 1 0-2.217l2.512-2.613a4.6 4.6 0 0 1 1.257-.898 4.5 4.5 0 0 1-1.212-.875l-2.355-2.45a1.623 1.623 0 0 1 0-2.217 1.475 1.475 0 0 1 2.13 0l2.356 2.45a1.475 1.475 0 0 0 2.131 0l2.513-2.613a1.475 1.475 0 0 1 2.13 0 1.62 1.62 0 0 1 0 2.216l-2.5 2.614c-.37.373-.797.676-1.257.898q.674.332 1.212.875zM3.747 6.942C3.746 3.103 6.73 0 10.408 0s6.674 3.103 6.674 6.942-2.984 6.941-6.674 6.941c-3.679 0-6.662-3.103-6.673-6.941m3.062 0c0 2.076 1.615 3.756 3.611 3.756s3.612-1.68 3.612-3.756c0-2.077-1.615-3.757-3.612-3.757-1.996 0-3.611 1.68-3.611 3.757m2.232 8.563c-2.232.152-4.34 1.085-6 2.648C1.143 20.043.055 22.622 0 25.34c0 .875.695 1.587 1.537 1.587.84 0 1.525-.724 1.525-1.599a7.92 7.92 0 0 1 2.916-5.483 7.3 7.3 0 0 1 3.006-1.155c.505-.023.987-.28 1.3-.688.259-.327.382-.747.326-1.167-.168-.782-.83-1.33-1.604-1.33"
                />
              </svg>
            ),
            diactive: (
              <svg width="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 28">
                <path
                  fill="var(--text-h2)"
                  d="M24.36 25.165c.584.607.584 1.61 0 2.217a1.475 1.475 0 0 1-2.13 0l-2.356-2.45a1.475 1.475 0 0 0-2.13 0l-2.513 2.613a1.475 1.475 0 0 1-2.131 0 1.623 1.623 0 0 1 0-2.217l2.512-2.613a4.6 4.6 0 0 1 1.257-.898 4.5 4.5 0 0 1-1.212-.875l-2.355-2.45a1.623 1.623 0 0 1 0-2.217 1.475 1.475 0 0 1 2.13 0l2.356 2.45a1.475 1.475 0 0 0 2.131 0l2.513-2.613a1.475 1.475 0 0 1 2.13 0 1.62 1.62 0 0 1 0 2.216l-2.5 2.614c-.37.373-.797.676-1.257.898q.674.332 1.212.875zM3.747 6.942C3.746 3.103 6.73 0 10.408 0s6.674 3.103 6.674 6.942-2.984 6.941-6.674 6.941c-3.679 0-6.662-3.103-6.673-6.941m3.062 0c0 2.076 1.615 3.756 3.611 3.756s3.612-1.68 3.612-3.756c0-2.077-1.615-3.757-3.612-3.757-1.996 0-3.611 1.68-3.611 3.757m2.232 8.563c-2.232.152-4.34 1.085-6 2.648C1.143 20.043.055 22.622 0 25.34c0 .875.695 1.587 1.537 1.587.84 0 1.525-.724 1.525-1.599a7.92 7.92 0 0 1 2.916-5.483 7.3 7.3 0 0 1 3.006-1.155c.505-.023.987-.28 1.3-.688.259-.327.382-.747.326-1.167-.168-.782-.83-1.33-1.604-1.33"
                />
              </svg>
            ),
          },
        }}
        setChangeToggle={setToggleValue}
        toggleValue={toggleValue}
      />
      <div className={styles.followerAndNonFollowersContainer}>
        {toggleValue === ToggleOrder.FirstToggle && (
          <Slider
            className={styles.swiperContent}
            slidesPerView={1}
            spaceBetween={1}
            itemsPerSlide={6}
            navigation={followers.length > 6}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              renderBullet: (index, className) => `<span class="${className}">${index + 1}</span>`,
            }}
            onReachEnd={fetchFollowrs}>
            {followers.map((u, i) => (
              <SliderSlide key={i}>
                <div className={styles.comment}>
                  <img className={styles.profilepicture} alt="profile picture" src={basePictureUrl + u.profileUrl} />
                  <div className={styles.commentdetail}>
                    <div className={styles.username}>{u.fullName}</div>
                    <div className={styles.commenttext}>{u.username}</div>
                  </div>
                  <img
                    className={styles.likeicon}
                    style={{ width: "20px" }}
                    alt="like"
                    src={u.isLiked ? "/icon-isLiked.svg" : "/icon-like.svg"}
                  />
                </div>
              </SliderSlide>
            ))}
          </Slider>
        )}
        {toggleValue === ToggleOrder.SecondToggle && (
          <Slider
            className={styles.swiperContent}
            itemsPerSlide={6}
            navigation={unFollowers.length > 6}
            onReachEnd={fetchNonFollower}>
            {unFollowers.map((u, i) => (
              <SliderSlide key={i}>
                <div className={styles.comment}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.profilepicture}
                    alt="profile picture"
                    src={basePictureUrl + u.profileUrl}
                  />
                  <div className={styles.commentdetail}>
                    <div className={styles.username}>{u.fullName}</div>
                    <div className={styles.commenttext}>{u.username}</div>
                  </div>
                  <img
                    className={styles.likeicon}
                    style={{ width: "20px" }}
                    alt="like"
                    src={u.isLiked ? "/icon-isLiked.svg" : "/icon-like.svg"}
                  />
                </div>
              </SliderSlide>
            ))}
          </Slider>
        )}
      </div>
    </>
  );
};

export default FollowersNonFollowers;
