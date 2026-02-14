import { MouseEvent } from "react";
import styles from "./notificationBar.module.css";
const MobileNotificationBar = (props: { data: string; removeMask: () => void }) => {
  return (
    <>
      <div onClick={props.removeMask} className="dialogBg"></div>
      <div id="notifBar5" className={styles.notification} onClick={(e: MouseEvent) => e.stopPropagation()}>
        {/* this is important !!! */}
        {/* {props.data} */}
        <div className={styles.notificationchild}>
          <div className={styles.iconok} style={{ backgroundColor: "var(--color-dark-green30)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
              <path
                fill="var(--color-dark-green)"
                d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M5.2 7.8a1 1 0 0 0-.7 1.7L6 11a1 1 0 0 0 1.4 0l4.1-4a1 1 0 1 0-1.4-1.5L6.7 9 6 8z"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>order</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>order successfully accepted</div>
          </div>
        </div>
        <div className={styles.notificationchild}>
          <div className={styles.iconok} style={{ backgroundColor: "var(--color-dark-green30)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
              <path
                fill="var(--color-dark-green)"
                d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M5.2 7.8a1 1 0 0 0-.7 1.7L6 11a1 1 0 0 0 1.4 0l4.1-4a1 1 0 1 0-1.4-1.5L6.7 9 6 8z"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>payment</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>Transition successful</div>
          </div>
        </div>
        <div className={styles.notificationchild}>
          <div className={styles.iconok} style={{ backgroundColor: "var(--color-firoze30)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16">
              <path
                fill="var(--color-firoze)"
                d="M8.3 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16m-1.6-4.9-.3.1v.4l.3.4H10a.5.5 0 0 0 0-.9l-.6-.1V7H6.6a.5.5 0 0 0 0 .9l.6.1v3zM7.3 4v2h2V4z"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>new message</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>check your message</div>
          </div>
        </div>
        <div className={styles.notificationchild}>
          <div className={styles.iconok} style={{ backgroundColor: "var(--color-light-yellow30)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16">
              <path
                fill="var(--color-light-yellow)"
                d="M8.3 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16m-1.6-4.9-.3.1v.4l.3.4H10a.5.5 0 0 0 0-.9l-.6-.1V7H6.6a.5.5 0 0 0 0 .9l.6.1v3zM7.3 4v2h2V4z"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>New order</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>check your order panel</div>
          </div>
        </div>
        <div className={styles.notificationchild}>
          <div className={styles.iconok} style={{ backgroundColor: "var(--color-dark-red30)" }}>
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path
                d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M6 5a1 1 0 0 0-.7 1.7L6.6 8 5.3 9.3a1 1 0 1 0 1.4 1.4L8 9.4l1.3 1.3a1 1 0 1 0 1.4-1.4L9.4 8l1.3-1.3a1 1 0 1 0-1.4-1.4L8 6.6 6.7 5.3z"
                fill="var(--color-dark-red)"
              />
            </svg>
          </div>
          <div className={styles.notifbody}>
            <div className={styles.header}>
              <div className={styles.title}>payment</div>
              <div className={styles.time}>10min ago</div>
            </div>
            <div className={styles.message}>Transition failed</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNotificationBar;
