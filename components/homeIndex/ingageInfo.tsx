import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoginStatus } from "saeed/helper/loadingStatus";
import { numberToFormattedString } from "saeed/helper/numberFormater";
import { LanguageKey } from "saeed/i18n";
import { TopTileType } from "saeed/models/homeIndex/enum";
import { IInstagramerHomeTiles } from "saeed/models/homeIndex/home";
import { IStoryContent } from "saeed/models/page/story/stories";
import Loading from "../notOk/loading";
import styles from "./ingageInfo.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const IngageInfo = (props: {
  data: IInstagramerHomeTiles | null;
  collaboratePostNumber: number;
  activeStories: IStoryContent[] | [];
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session));
  useEffect(() => {
    if (props.data && LoginStatus(session)) setLoadingStaus(false);
  }, [props.data]);
  return (
    <>
      {loadingStatus && <Loading />}
      {!loadingStatus && props.data && (
        <>
          <section className={styles.personalinfosection}>
            <div className="instagramprofile ">
              <img
                style={{ width: "50px", height: "50px" }}
                loading="lazy"
                decoding="async"
                className="instagramimage"
                alt="profile image"
                src={session?.user?.profileUrl ? basePictureUrl + session?.user?.profileUrl : "/no-profile.svg"}
              />
              <div className="instagramprofiledetail">
                <div className="instagramusername">{session?.user?.fullName ?? ""}</div>
                <div className="instagramid translate">@{session?.user?.username ?? ""}</div>
                {/* <div className="instagramprofiledetail">
                  <div className="instagramusername">
                    {session?.user?.biography ?? ""}
                  </div>
                </div> */}
              </div>
            </div>
            <div className="headerparent">
              <div className="headerandinput">
                {session?.user?.isShopper ? (
                  <>
                    <div className="instagramusername">{t(LanguageKey.shoppertitle)}</div>
                    <div className="instagramid">{t(LanguageKey.shopperdescription)}</div>
                  </>
                ) : session?.user?.isInfluencer ? (
                  <>
                    <div className="instagramusername">{t(LanguageKey.advertisertitle)}</div>
                    <div className="instagramid">{t(LanguageKey.advertiserdescription)}</div>
                  </>
                ) : (
                  <>
                    <div className="instagramusername">{t(LanguageKey.upgradeyouraccount)}</div>
                    <div className="instagramid">{t(LanguageKey.likeaprouser)}</div>
                  </>
                )}
              </div>
              {session?.user?.isShopper ? (
                <Link className={styles.upgradeicon} href="/store">
                  <svg
                    style={{ width: "40px", height: "40px" }}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 42 42">
                    <path
                      d="M3.5 38c3 3.3 10.1 3.4 17.3 3.5 7-.1 14.2-.2 17.2-3.5 3.3-3 3.4-10.1 3.5-17.2-.1-7.2-.2-14.3-3.5-17.3C35 .2 28 .1 20.8 0 13.6.1 6.5.2 3.5 3.5.2 6.5.1 13.6 0 20.8.1 27.8.2 35 3.5 38"
                      fill="var(--color-light-green60)"
                    />
                    <path
                      d="M25.2 9.3a6 6 0 0 1 6 5.4l1.1 10.5v.3a6.4 6.4 0 0 1-6.4 6.7H15.6a6.4 6.4 0 0 1-6.4-7l1.1-10.5a6 6 0 0 1 6-5.4zM16.3 12c-1.6 0-3 1.2-3.2 2.9L12 25.5c-.2 2.1 1.4 4 3.6 4h10.3c2.1 0 3.7-1.8 3.6-3.8v-.2l-1-10.5a3 3 0 0 0-3.3-3z M15.9 15.9a1.4 1.4 0 1 1 2.8 0 2.1 2.1 0 1 0 4.2 0 1.4 1.4 0 0 1 2.8 0 4.9 4.9 0 0 1-9.8 0"
                      fill="var(--color-light-green)"
                    />
                  </svg>
                </Link>
              ) : session?.user?.isInfluencer ? (
                <Link className={styles.upgradeicon} href="/advertise">
                  <svg
                    style={{ width: "40px", height: "40px" }}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 42 42">
                    <path
                      d="M14.3.5h12.9q2.1 0 3.7 1.5l9 9.1q1.5 1.6 1.6 3.7v12.9q0 2.1-1.5 3.7l-9.1 9Q29.3 42 27.2 42H14.3q-2.2 0-3.7-1.5l-9-9.1Q0 29.8 0 27.7V14.8q0-2.1 1.5-3.7l9.1-9Q12.1.5 14.3.4"
                      fill="var(--color-purple60)"
                    />
                    <path
                      d="m32.7 25-3.1-1.5c-.8-.4-1.8 0-2.1.7s-.1 1.7.6 2l3.2 1.6c.7.4 1.7 0 2-.7q.6-1.4-.6-2m-9.3-11.9q-1-.4-2 .1s-2 1.5-4.3 1.5h-3.7a5.4 5.4 0 0 0-1.8 10.5v2.1a1.8 1.8 0 0 0 3.6 0v-1.8h1.9c2.2 0 4.4 1.5 4.4 1.5q1 .6 1.9.1 1-.5 1-1.6V14.8q0-1-1-1.6m-2 10q-1.9-.9-4.2-1H13a2 2 0 0 1-2-2q.2-1.8 2-2h4.2q2.3 0 4.2-.9zm7.4-1.4H32q1.3-.1 1.5-1.6-.2-1.4-1.5-1.5h-3.2q-1.4.1-1.5 1.5.1 1.5 1.5 1.6m.7-4.8 3.2-1.6q1.1-.8.7-2-.8-1.3-2.2-.8l-3 1.6q-1.3.8-.8 2c.4.8 1.4 1.1 2.1.7"
                      fill="var(--color-purple)"
                    />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link className={styles.upgradeicon} href="/advertise">
                    <svg
                      style={{ width: "40px", height: "40px" }}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 42 42">
                      <path
                        d="M14.3.5h12.9q2.1 0 3.7 1.5l9 9.1q1.5 1.6 1.6 3.7v12.9q0 2.1-1.5 3.7l-9.1 9Q29.3 42 27.2 42H14.3q-2.2 0-3.7-1.5l-9-9.1Q0 29.8 0 27.7V14.8q0-2.1 1.5-3.7l9.1-9Q12.1.5 14.3.4"
                        fill="var(--color-purple60)"
                      />
                      <path
                        d="m32.7 25-3.1-1.5c-.8-.4-1.8 0-2.1.7s-.1 1.7.6 2l3.2 1.6c.7.4 1.7 0 2-.7q.6-1.4-.6-2m-9.3-11.9q-1-.4-2 .1s-2 1.5-4.3 1.5h-3.7a5.4 5.4 0 0 0-1.8 10.5v2.1a1.8 1.8 0 0 0 3.6 0v-1.8h1.9c2.2 0 4.4 1.5 4.4 1.5q1 .6 1.9.1 1-.5 1-1.6V14.8q0-1-1-1.6m-2 10q-1.9-.9-4.2-1H13a2 2 0 0 1-2-2q.2-1.8 2-2h4.2q2.3 0 4.2-.9zm7.4-1.4H32q1.3-.1 1.5-1.6-.2-1.4-1.5-1.5h-3.2q-1.4.1-1.5 1.5.1 1.5 1.5 1.6m.7-4.8 3.2-1.6q1.1-.8.7-2-.8-1.3-2.2-.8l-3 1.6q-1.3.8-.8 2c.4.8 1.4 1.1 2.1.7"
                        fill="var(--color-purple)"
                      />
                    </svg>
                  </Link>
                  <Link className={styles.upgradeicon} href="/store">
                    <svg
                      style={{ width: "40px", height: "40px" }}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 42 42">
                      <path
                        d="M3.5 38c3 3.3 10.1 3.4 17.3 3.5 7-.1 14.2-.2 17.2-3.5 3.3-3 3.4-10.1 3.5-17.2-.1-7.2-.2-14.3-3.5-17.3C35 .2 28 .1 20.8 0 13.6.1 6.5.2 3.5 3.5.2 6.5.1 13.6 0 20.8.1 27.8.2 35 3.5 38"
                        fill="var(--color-light-green60)"
                      />
                      <path
                        d="M25.2 9.3a6 6 0 0 1 6 5.4l1.1 10.5v.3a6.4 6.4 0 0 1-6.4 6.7H15.6a6.4 6.4 0 0 1-6.4-7l1.1-10.5a6 6 0 0 1 6-5.4zM16.3 12c-1.6 0-3 1.2-3.2 2.9L12 25.5c-.2 2.1 1.4 4 3.6 4h10.3c2.1 0 3.7-1.8 3.6-3.8v-.2l-1-10.5a3 3 0 0 0-3.3-3z M15.9 15.9a1.4 1.4 0 1 1 2.8 0 2.1 2.1 0 1 0 4.2 0 1.4 1.4 0 0 1 2.8 0 4.9 4.9 0 0 1-9.8 0"
                        fill="var(--color-light-green)"
                      />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </section>
          <section className={styles.totaltile}>
            <svg
              className={styles.totaltilesvg}
              fill="var(--color-gray)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 22 22">
              <path d="m11 .8 5.3.1q2.1.2 3.3 1.5 1.3 1.4 1.5 3.3.2 2 .1 5.2v.2l-.1 5.2q-.2 1.9-1.5 3.3t-3.3 1.5q-2 .2-5.2.1h-.2l-5.2-.1q-1.9-.2-3.3-1.5T.9 16.3t-.2-5.2v-.2q0-3.2.2-5.2.1-1.9 1.5-3.3T5.7.9 11 .7m0 5.7a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9m5.5-2a1 1 0 1 0 1 1.1v-.1a1 1 0 0 0-1-1" />
            </svg>
            <div className="headerandinput">
              <div className="instagramid">{t(LanguageKey.pageStatistics_stories)}</div>
              <div className="headerparent" style={{ justifyContent: "flex-start" }}>
                {props.activeStories.length > 0 ? (
                  props.activeStories.map((story) => (
                    <Link
                      href={`/page/stories/storyinfo?storyid=${story.storyId}`}
                      key={story.storyId}
                      style={{ position: "relative" }}>
                      <img
                        style={{
                          aspectRatio: "9/16",
                          borderRadius: "5px",
                          backgroundColor: "var(--color-gray)",
                          maxHeight: "40px",
                          minHeight: "40px",
                        }}
                        src={basePictureUrl + story.thumbnailMediaUrl}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="instagramusername">{t(LanguageKey.notfound)}</div>
                )}
              </div>
            </div>
          </section>
          {/* <section className={styles.totaltile}>
            <svg
              className={styles.totaltilesvg}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="var(--color-gray)"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M10.5 3.25a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 1 0 0-8.5zM16 7.5c0 1.697-.769 3.215-1.977 4.224.157.018.316.027.477.027a4.25 4.25 0 1 0 0-8.5c-.161 0-.32.009-.477.026A5.49 5.49 0 0 1 16 7.5zm2.75 5.25a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1zm-3.129 1.562a3.4 3.4 0 0 1 .355.188h-.227a2.25 2.25 0 1 0 0 4.5h.75v.75c0 .3.059.585.165.847a2.26 2.26 0 0 1-.468.11c-.323.043-.72.043-1.152.043h0-9.089 0c-.433 0-.83 0-1.152-.043-.355-.048-.731-.16-1.04-.469s-.421-.685-.469-1.04c-.043-.323-.043-.794-.043-1.227 0-1.436.65-2.984 2.129-3.658S8.621 13.25 10.5 13.25s3.639.386 5.121 1.062z"></path>
            </svg>

            <div className="headerandinput">
              <div className=" instagramid">
                {t(LanguageKey.collaboratorpost)}
              </div>
              <div className="instagramusername">
                {props.collaboratePostNumber}
              </div>
            </div>
          </section> */}
          <section className={styles.totaltile}>
            <svg
              className={styles.totaltilesvg}
              fill="var(--color-gray)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 15 15">
              <path d="M4.87.77q.66.03 1.3.24h.03q.04 0 .07.04.23.07.44.18l.27.12.3.2.22.14a4.4 4.4 0 0 1 4.04-.71c2.62.85 3.56 3.72 2.77 6.22a9 9 0 0 1-2.13 3.41 27 27 0 0 1-4.48 3.51l-.18.11-.18-.11Q4.9 12.6 2.83 10.6A9 9 0 0 1 .69 7.2C-.1 4.7.83 1.83 3.48.96q.3-.1.63-.15h.08q.3-.04.6-.04zm6.3 2.24a.57.57 0 0 0-.7.35c-.1.3.05.63.35.73.45.17.75.62.75 1.12v.02a.6.6 0 0 0 .14.44q.16.18.4.2c.3 0 .54-.24.56-.54v-.08c.02-1-.58-1.9-1.5-2.24" />
            </svg>

            <div className="headerandinput">
              <div className=" instagramid">{t(LanguageKey.lastLike)}</div>
              <div className="instagramusername">
                {numberToFormattedString(
                  props.data.items.find((x) => x.topTileType === TopTileType.LikeCount)?.value ?? 0
                )}
              </div>
            </div>
          </section>
          <section className={styles.totaltile}>
            <svg className={styles.totaltilesvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 34">
              <path
                d="M22.6 22.3c-7 0-13 1.2-13 5.7s6 5.7 13 5.7 13-1.2 13-5.7-6-5.7-13-5.7m0-4.3c4.7 0 8.6-4 8.6-8.8 0-5-3.9-8.9-8.6-8.9-4.8 0-8.6 4-8.6 8.9 0 4.8 3.8 8.8 8.6 8.8m18.6-6.8c1.3-5-2.4-9.4-7-9.4q-.8 0-1.4.2h-.2v.3a12 12 0 0 1 .2 13.8q-.1.3.2.5h1a7 7 0 0 0 7.2-5.4m3.5 11.7q-.9-2.1-4.3-2.7a31 31 0 0 0-6.6-.5c1.2.6 6 3.4 5.4 9.1q0 .5.4.5c1.2-.2 4.2-.9 5.1-3a4 4 0 0 0 0-3.4M12.5 2l-1.4-.2a7.4 7.4 0 0 0-7 9.4 7 7 0 0 0 8.2 5.4q.3-.1.2-.5-2-3-2-6.8 0-4 2.2-7V2zM5 20.2q-3.5.6-4.4 2.7a4 4 0 0 0 0 3.4c1 2.1 4 2.8 5.1 3q.5 0 .5-.5c-.6-5.7 4.1-8.5 5.4-9v-.2a31 31 0 0 0-6.7.6"
                fill="var(--color-gray)"
              />
            </svg>

            <div className="headerandinput">
              <div className=" instagramid">{t(LanguageKey.pageStatistics_Reach)}</div>
              <div className="instagramusername">
                {props.data.items.find((x) => x.topTileType === TopTileType.Reach)?.value
                  ? numberToFormattedString(
                      props.data.items.find((x) => x.topTileType === TopTileType.Reach)?.value ?? 0
                    )
                  : t(LanguageKey.notfound)}
              </div>
            </div>
          </section>
          <section className={styles.totaltile}>
            <svg
              className={styles.totaltilesvg}
              fill="var(--color-gray)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 17">
              <path d="M10 9a1 1 0 0 1-1-.8q.1-.8 1-.9a.9.9 0 0 1 0 1.8M6 9a.9.9 0 0 1 0-1.7q.9 0 1 1-.1.7-1 .8m9.4-1.7A7.6 7.6 0 0 0 8.9.6Q5.8.2 3.3 2.3A8 8 0 0 0 .6 8c-.2 4.4 3.4 7.8 7 8.9l.8-.2q.3-.2.3-.7v-1.3c4.3-.5 7-3.6 6.7-7.4" />
            </svg>
            <div className="headerandinput">
              <div className="instagramid">{t(LanguageKey.unreadcomment)}</div>
              <div className="instagramusername">
                {numberToFormattedString(
                  props.data.items.find((x) => x.topTileType === TopTileType.NewCommentCount)?.value ?? 0
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default IngageInfo;
