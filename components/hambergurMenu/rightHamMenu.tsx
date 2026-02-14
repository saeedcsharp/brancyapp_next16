import { useSession } from "next-auth/react";
import Head from "next/head";
import { MouseEvent } from "react";
import styles from "./hammenu.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const RightHamMenue = (props: {
  removeMask: () => void;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowUpgrade: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
  handleShowNotifMobile: (e: MouseEvent) => void;
}) => {
  const { data: session } = useSession();
  const clickOnRight = (e: MouseEvent) => {
    e.stopPropagation();
    console.log("Right Click");
  };
  return (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Menu</title>
        <meta name="theme-color" content="transparent"></meta>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {session && session.user.currentIndex > -1 && (
        <div className={styles.all}>
          <div onClick={() => props.removeMask()} className={styles.background}>
            <div onClick={clickOnRight} className={styles.right}>
              <div className={styles.menuparent}>
                <div className={styles.account}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.profileimage}
                    alt="profile"
                    src={baseMediaUrl + session?.user.profileUrl!}></img>

                  <div className={styles.accountinfo}>
                    <div className={styles.name}>{session.user.fullName}</div>
                    <div className={styles.username}>{session?.user.username}</div>
                  </div>
                </div>

                <div className={styles.menu}>
                  <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20">
                    <path d="M3 4.4a.8.8 0 1 1 1-1.2l.7.7V1.6a.8.8 0 1 1 1.6 0V4l.7-.7a.8.8 0 0 1 1.2 1.2l-2 2a1 1 0 0 1-1.2 0Zm17.3 6a3 3 0 0 1-.8 2 3 3 0 0 1-2 .6h-6.2a3 3 0 0 1-1.5-.4l-.1.3.8.5.8 1 .4 1 .2 1.1v1.1a3 3 0 0 1-.7 2 3 3 0 0 1-2 .7H3a3 3 0 0 1-2-.7 3 3 0 0 1-.7-2v-1l.2-1.1.4-1.1.8-1 .8-.5-.2-1.4a4 4 0 0 1 1-2.7 4 4 0 0 1 5.4-.1l.1-.5.4-1.1.8-1 .8-.5-.2-1.4a4 4 0 0 1 1.1-2.7 4 4 0 0 1 5.4 0 4 4 0 0 1 1.2 2.7L18 5.6l.9.5.7 1 .4 1.1.2 1v1.1m-3.6-6.2a2 2 0 0 0-.7-1.6 2 2 0 0 0-3.1 0 2.3 2.3 0 0 0 0 3.2l.1.1 1.4.5.8-.1.6-.3.2-.2a2 2 0 0 0 .7-1.6m2 5.3-.2-.9-.3-.8-.4-.5-.5-.2H17l-.3.2a4 4 0 0 1-4.7 0v-.1h-.1l-.3-.1-.5.2-.4.5-.3.8-.2.9v.9l.3.7.8.3h6.3l.8-.3.3-.7zm-10.4 2a2 2 0 0 0-.6-1.6 2.2 2.2 0 0 0-3.2 0 2.3 2.3 0 0 0 0 3.2l.2.1a2 2 0 0 0 1.4.5 2 2 0 0 0 1.4-.4l.2-.2a2 2 0 0 0 .6-1.6m-4.6 3h-.2l-.2-.2h-.1l-.5.3-.4.5-.2.8-.2.9v.8l.2.8.9.3h6.2l.9-.3.2-.8v-.8l-.1-1-.3-.7-.4-.5-.5-.3h-.1l-.2.1-.3.2a4 4 0 0 1-4.7-.1m12.9-.2a1 1 0 0 0-1.2 0l-2 2.1a.8.8 0 1 0 1.1 1.2l.6-.6v2.2a.8.8 0 1 0 1.7 0V17l.7.6a.8.8 0 0 0 1.1-1.2Z" />
                  </svg>

                  <div onClick={props.handleShowSwitch} className={styles.menutext}>
                    Switch account
                  </div>
                </div>
                <div className={styles.line} style={{ marginTop: "5px" }}></div>

                <div className={styles.menu}>
                  <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 25">
                    <path d="M18.6 17H1.4a1.4 1.4 0 0 1-1.3-1 1.4 1.4 0 0 1 .5-1.6l.3-.2v-.1l.7-1a13 13 0 0 0 1.3-6v-.3a7 7 0 0 1 2-4.7 7 7 0 0 1 10.2 0 7 7 0 0 1 2 5 13 13 0 0 0 1.2 6l.8 1v.1l.2.1.2.2a1.4 1.4 0 0 1-1 2.5M10 2.8a4.3 4.3 0 0 0-4.3 4.3 16 16 0 0 1-1.3 6.8l-.1.3h11.4V14a16 16 0 0 1-1.4-6.5v-.4A4 4 0 0 0 13 4a4 4 0 0 0-3-1.3m1.4 17.8a1.5 1.5 0 0 1 2.2 2 5 5 0 0 1-1.9 1.2l-2.2.3-2.2-.3a5 5 0 0 1-1.9-1.1 1.5 1.5 0 0 1 2-2.3l.2.1.6.4 1.3.2 1.3-.2z" />
                  </svg>

                  <div onClick={props.handleShowNotifMobile} className={styles.menutext}>
                    notification
                  </div>
                </div>

                {/* <div className={styles.menu}>
                  <svg
                    className={styles.icon}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 19.7a9 9 0 0 1-3.5-2l-.2-.2-1.8-1.7v2.1A1.3 1.3 0 0 1 0 18v-5.5l.1-.1.2-.2V12l.2-.2h.1l.2-.1h.1l.1-.1h5.3a1.3 1.3 0 0 1 0 2.5H4.4L6 15.7a6.3 6.3 0 0 0 10.3-2.4 1.3 1.3 0 1 1 2.4.9A8.7 8.7 0 0 1 8 19.7m5.8-11.4a1.3 1.3 0 0 1-.2-2.5h2L14 4.3A6.3 6.3 0 0 0 3.7 6.7a1.3 1.3 0 0 1-2.4-.9 8.8 8.8 0 0 1 14.2-3.5l.2.2 1.8 1.7V2A1.3 1.3 0 0 1 20 2v5.5l-.1.1-.2.2V8l-.1.1-.1.1h-.1l-.2.1-.2.1h-.2Z" />{" "}
                  </svg>
                  <div className={styles.menutext}>refresh</div>
                </div> */}

                <div className={styles.line}></div>

                <div className={styles.menu}>
                  <svg className={styles.icon} width="20" height="15" viewBox="0 0 20 15">
                    <path d="M19.7 1.6a1.6 1.6 0 1 0-2.4 1.3l-.4.7s-1 2.1-3 2.1-3-2.1-3-2.1l-.3-.7A1.6 1.6 0 1 0 9 3l-.3.7s-1 2.1-3 2.1-3-2.1-3-2.1l-.5-.8a1.6 1.6 0 1 0-1.3.3v.6l2.1 8a2 2 0 0 0 2.1 1.6h9.3a2 2 0 0 0 2.1-1.6l1.9-8V3a2 2 0 0 0 1.3-1.5" />
                  </svg>

                  <div onClick={props.handleShowUpgrade} className={styles.menutext}>
                    upgrade
                  </div>
                </div>

                {/* <div className={styles.menu}>
                  <svg
                    className={styles.icon}
                    width="20"
                    height="20"
                    viewBox="0 0 20 21"
                  >
                    <path d="M19.5 10.5V9l-.2-1A10 10 0 0 0 11.6.4l-1-.1H8.7a9 9 0 0 0-3 .7 10 10 0 0 0-6 7.3v1l-.1.5v5.6A2 2 0 0 0 .4 17a2 2 0 0 0 2 .3 2 2 0 0 0 1.4-2v-5a2 2 0 0 0-1-1.8 2 2 0 0 0-1.3-.3v-.5a8 8 0 0 1 2.8-4 8 8 0 0 1 4.4-1.9 8 8 0 0 1 3.8.5 8 8 0 0 1 3.9 3 8 8 0 0 1 1.3 2.9 2 2 0 0 0-1.6.4 2 2 0 0 0-.8 1.6v5.2a2 2 0 0 0 1.6 2h.8a2 2 0 0 1-1.4 1h-2.1l-.1-.1a2 2 0 0 0-2.4-1.1 2 2 0 0 0-1.6 2 2 2 0 0 0 1.7 2h.4a2 2 0 0 0 2-1.2h2a3.4 3.4 0 0 0 3.3-3.3z" />
                    <path d="m6.1 11-.3.8.3.8.8.3.7-.3.3-.8-.3-.7a1 1 0 0 0-1.5 0m4.2-.1a1 1 0 0 0-1.5 0l-.3.8.3.8.7.3.8-.3a1 1 0 0 0 0-1.5m2.9 1.5.3-.8-.3-.7a1 1 0 0 0-1.5 0l-.4.7a1 1 0 0 0 .4.8l.7.3z" />{" "}
                  </svg>

                  <div className={styles.menutext}>support</div>
                </div> */}

                <div className={styles.menu}>
                  <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20">
                    <path d="M15.5 19.2v.4a1 1 0 0 1-2 0v-.4a1 1 0 1 1 2 0M9.1 18a1 1 0 0 0-1 1v.5a1 1 0 0 0 2 0v-.4A1 1 0 0 0 9 18m11-9.6-1 5.9a3 3 0 0 1-.5 1.7 3 3 0 0 1-2.5 1.3H7.4A3 3 0 0 1 5 16a3 3 0 0 1-.6-1.7L3.6 9l-.1-.6-.1-.5a2 2 0 0 0-1-1.3l-.8-.3H.7a1 1 0 0 1-.7-.8L.4 5l.7-.2H2a3 3 0 0 1 2.4 1.3l.1-.2a3 3 0 0 1 2.5-1h.7v-.3a4.2 4.2 0 1 1 8.3 0v.2h.6a3 3 0 0 1 2.5 1 4 4 0 0 1 1 2.7m-2.4 5.2.8-5.3a2 2 0 0 0-2-2h-.9a4 4 0 0 1-7.5 0H7a2 2 0 0 0-2 2l.8 4.7v.6l.2.4a2 2 0 0 0 .9 1.4l.8.2h8.1l.9-.2a2 2 0 0 0 .9-1.4zm-3.3-9.1a2.5 2.5 0 1 0-5 0v.2L9.7 6a2.5 2.5 0 0 0 4.1 0l.5-1.3z" />
                  </svg>

                  <div className={styles.menutext}>account store</div>
                </div>
              </div>
              <div className={styles.menuparent}>
                <div className={styles.line}></div>
                <div className={styles.menu}>
                  <svg className={styles.icon} width="20" height="22" viewBox="0 0 20 22">
                    <path d="m20 11.7-3.9 3.7a1 1 0 0 1-1.2 0 1 1 0 0 1 0-1.2l2.3-2.2h-5.7a.9.9 0 1 1 0-1.7h5.7L14.9 8a1 1 0 0 1 0-1.2 1 1 0 0 1 1.2 0l4 3.6a1 1 0 0 1 0 1.2M15.7 17a1 1 0 0 0-1 .9c0 1.8-1.8 2.5-3.3 2.5H5.5a3.3 3.3 0 0 1-3.3-3.1V5a3.3 3.3 0 0 1 3.3-3.2h5.9c1.5 0 3.3.7 3.3 2.7a1 1 0 0 0 1.9 0c0-2.7-2.2-4.5-5.2-4.5H5.5A5 5 0 0 0 .3 5v12a5 5 0 0 0 5.2 5h5.9c3 0 5.2-1.8 5.2-4.3a1 1 0 0 0-1-1" />
                  </svg>

                  <div onClick={props.handleShowSignOut} className={styles.menutext}>
                    sign out
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RightHamMenue;
