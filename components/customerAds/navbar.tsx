import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import InputText from "../design/inputText";
import styles from "./customerAds.module.css";
function Navbar(props: {
  handleShowSelectAdmins: (e: MouseEvent) => void;
  selectedIds: number[];
  refresh: boolean;
  handleLeftVisible: (visible: boolean) => void;
}) {
  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    throw new Error("Function not implemented.");
  }

  const [showRedNotif, setShowRedNotif] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    if (props.selectedIds.length > 0) {
      setShowRedNotif(true);
      setShake(true);
      setTimeout(() => setShake(false), 500); // Remove shake class after animation
    } else if (props.selectedIds.length === 0) {
      setShowRedNotif(false);
    }
  }, [props.refresh, props.selectedIds]);

  return (
    <div className={styles.header}>
      <div className={styles.headerTab}>
        <svg className={styles.logomobile} fill="none" height="25" viewBox="0 0 175 46">
          <path d="M31.5 10a8 8 0 0 1-2.2 4.2A12 12 0 0 1 25 17q6 2.1 5 8-.9 5.7-5.5 8.3T12.2 36a56 56 0 0 1-7.4-.7l-2.4-.7Q-.5 33.4.1 30.5L4.6 4.2a3 3 0 0 1 1-1.9q.7-.6 2-1 2-.7 4.8-1l6-.3q7 0 10.5 2.4t2.6 7.5m-19.1 4.3h4q2.5 0 3.7-.9a4 4 0 0 0 1.5-2.6q.3-1.5-.8-2.5t-3.6-.9l-3.7.3zM20 24.6q.6-3.4-4-3.4h-5L10 28l2 .3h2.3q2.2 0 3.8-.9a4 4 0 0 0 2-2.9M41.4 35a18 18 0 0 1-4.3.6q-2.9 0-3.9-1t-.6-3.6l3-16.7q.1-1.6 1.2-2.8t2.7-2.1q2-1.2 4.9-1.8 2.7-.7 5.5-.7 6 0 5.3 4.4l-.6 1.9-.9 1.5a15 15 0 0 0-9 1zM70 6.9q3 0 5.5.6 2.2.6 3.9 1.9 1.5 1.2 2.1 3.2t.2 4.6l-2.2 12.6q-.3 1.5-1.2 2.4L76 33.8A22 22 0 0 1 65.5 36q-3 0-5.3-.6t-3.7-1.7a6 6 0 0 1-2.2-2.8 8 8 0 0 1-.2-4 9 9 0 0 1 3.3-6q2.7-2.2 7.6-2.7l7.4-.7V17q.5-1.7-1-2.4-1.2-.7-4-.7a25 25 0 0 0-8 1.6 3 3 0 0 1-1-1.6q-.2-1 0-2.1.2-1.5 1-2.4.9-.7 2.5-1.5 1.7-.6 4-.9zM66.8 29l2.1-.2q1.2-.2 1.8-.5l.8-4.5-4.1.3q-1.6 0-2.7.7-1 .6-1.3 1.7a2 2 0 0 0 .6 1.8q.7.7 2.8.7m44.2 6a18 18 0 0 1-4.3.6q-2.7 0-3.8-1t-.6-3.6l2.3-13.3q.3-1.7-.6-2.5-1-.9-2.6-.8l-2.1.2-2 .8L93.9 35a18 18 0 0 1-4.3.6q-2.9 0-3.9-1-1.1-.9-.6-3.6l3-17q.2-1.5 1-2.4.8-1 2-1.7 2.2-1.5 5.2-2.2t6.5-.8q6.3 0 9.3 2.8t2 7.8zm24.8-20.6q-1.4 0-2.7.5t-2.4 1.3a9 9 0 0 0-3 5.3q-.5 3.4 1 5.2a6 6 0 0 0 4.6 1.7q1.7 0 3-.4 1.5-.4 2.4-1 1 .9 1.3 1.8t.2 2.2q-.4 2.2-2.8 3.6-2.5 1.3-6.6 1.3-3.5 0-6.1-.9-2.7-.9-4.4-2.8a10 10 0 0 1-2.2-4.5q-.6-2.6 0-6.2t2.3-6.5a16 16 0 0 1 9.3-7.2q3-1 5.9-1 4 0 6 1.5 1.8 1.5 1.5 3.8-.2 1-.9 2l-1.4 1.6-2.2-.9a9 9 0 0 0-2.8-.4m13.9 13.7a85 85 0 0 1-2.8-19 9 9 0 0 1 5.3-2q2 0 3.1.9 1.2.7 1.4 3l.9 7.8.8 7.7h.3a92 92 0 0 0 4-8.8l3.8-9.5 2-.8q1.2-.3 2.2-.2 2 0 3.3.8t1 3a28 28 0 0 1-1.7 5.3A78 78 0 0 1 162.9 35a51 51 0 0 1-7.2 8.1q-3 2.7-5.8 2.7-2.3 0-3.5-1.5-1.3-1.3-1.2-3.6a56 56 0 0 0 8-7.3q-.9-.3-1.8-1.4t-1.7-3.9"></path>
        </svg>

        <div className={styles.sublogomobile}>Ads Campaign</div>

        <div className={styles.pageheaders}>
          <div className={styles.iconboxsearch}>
            <svg className={styles.icon} viewBox="0 0 20 20">
              <path d="M8.9 3.4A6 6 0 0 0 4 6.5a6 6 0 0 0-.5 3.7 1 1 0 0 0 1 .8 1 1 0 0 0 .8-1.1 4 4 0 0 1 .4-2.6 5 5 0 0 1 3.3-2 1 1 0 0 0 .5-1.7zm10.8 14.9L16 14.5l-.9-.3a8.6 8.6 0 1 0-.8.8l.2 1 3.8 3.7.7.3.7-.3.1-.1a1 1 0 0 0 0-1.3M8.6 15.2a6.6 6.6 0 1 1 6.6-6.6 6.7 6.7 0 0 1-6.6 6.6" />
            </svg>
          </div>

          <div className={styles.iconboxnotice}>
            <svg className={styles.icon} viewBox="0 0 20 20">
              <path d="M19.1 14.2a4 4 0 0 1-1.3-2.8V8A7.8 7.8 0 1 0 2.2 8v3.4a4 4 0 0 1-1.4 2.8v.1a2 2 0 0 0-.7 2.3 2 2 0 0 0 2 1.6h5.4a2.7 2.7 0 0 0 5.1 0h5.3a2 2 0 0 0 2-1.5 2 2 0 0 0-.8-2.5m-1.3 1.9H2.1v-.2a6 6 0 0 0 2.2-4.5V8a5.7 5.7 0 1 1 11.4 0v3.4a6 6 0 0 0 2.2 4.5Z" />
            </svg>

            <div className={styles.reddot}></div>
          </div>
          <div className={`${styles.iconboxcart} ${shake ? styles.shake : ""}`} onClick={props.handleShowSelectAdmins}>
            <svg className={styles.icon} viewBox="0 0 20 20">
              <path d="M19 7.4 18.7 6v-.2c-.2-.5-1-4-4.2-5.4A7 7 0 0 0 12 0H7.2L5.3.5l-.7.4A8 8 0 0 0 1.3 6v.2L1 7.4l-1 8.3v.1A4.3 4.3 0 0 0 4.4 20h11.2a4.3 4.3 0 0 0 4.4-4.2Zm-4.5-4.1H5l.9-.7L7.3 2H12l1.6.4 1.2.9zm1 14.7h-11a2 2 0 0 1-2.3-2.1l1-8.3v-.1l.2-.9a2 2 0 0 1 2-1.3h9.1a2 2 0 0 1 1.9 1l.3.4.1.8 1 8.4a2 2 0 0 1-2.2 2M15 7.8v.8a5 5 0 0 1-5 4.9A5 5 0 0 1 6.3 12a5 5 0 0 1-1.5-3.5v-1a1 1 0 0 1 1-1 1 1 0 0 1 .9.4l.3.7v1a3 3 0 0 0 .8 2 3 3 0 0 0 2.1.7 3 3 0 0 0 3-2.8v-.8a1 1 0 0 1 2.1 0" />
            </svg>

            {showRedNotif && <div className={styles.reddot} />}
          </div>
          <img
            loading="lazy"
            decoding="async"
            className={styles.ProfileIcon}
            alt="instagram profile picture"
            src={"/no-profile.svg"}
          />
        </div>
      </div>
      <div className={styles.searchmobile}>
        <div className={styles.searchBar}>
          <InputText
            className={"serachMenuBar"}
            placeHolder={"Search"}
            maxLength={undefined}
            handleInputChange={handleInputChange}
            value={"Search"}
            name={"search"}
          />
          <svg className={styles.iconboxClose} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" fill="var(--color-gray)" />
            <g fill="none" stroke="var(--color-white)" strokeLinecap="round" strokeWidth="2">
              <path d="M6 0 0 6" transform="translate(7 7)" />
              <path d="m0 0 6 6" transform="translate(7 7)" />
            </g>
          </svg>
        </div>

        <div className={styles.filtermobilebtn} onClick={() => props.handleLeftVisible(true)}>
          <img alt="filter" src="/iconbox-filter.svg" style={{ width: "25px" }} />
        </div>
      </div>
      {/* <div className={styles.filtermobile}>
        <div className={styles.filtermobileactive}>
          Verified
          <svg className={styles.filtermobileiconClose} viewBox="4 4 13 12">
            <g fill="none" strokeLinecap="round" strokeWidth="2">
              <path d="M6 0 0 6" transform="translate(7 7)" />
              <path d="m0 0 6 6" transform="translate(7 7)" />
            </g>
          </svg>
        </div>
        <div className={styles.filtermobileactive}>
          follower{" "}
          <svg className={styles.filtermobileiconClose} viewBox="4 4 13 12">
            <g fill="none" strokeLinecap="round" strokeWidth="2">
              <path d="M6 0 0 6" transform="translate(7 7)" />
              <path d="m0 0 6 6" transform="translate(7 7)" />
            </g>
          </svg>
        </div>
      </div> */}
    </div>
  );
}

export default Navbar;
