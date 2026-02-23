import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import { ConnectionStatus, subscribeToConnectionStatus } from "../../helper/pushNotif";
import RingLoader from "../design/loader/ringLoder";
import styles from "./ConnectionStatusIndicator.module.css";

export default function ConnectionStatusIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>(null);
  const [showConnected, setShowConnected] = useState(false);
  const [isSlideOut, setIsSlideOut] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus((newStatus) => {
      setStatus(newStatus);

      if (newStatus === "disconnected") {
        setWasDisconnected(true);
      }

      if (newStatus === "connected" && wasDisconnected) {
        setShowConnected(true);
        setWasDisconnected(false);
        // Hide after 3 seconds
        setTimeout(() => {
          setShowConnected(false);
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [wasDisconnected]);

  // Don't show anything if status is null or connecting
  if (!status || status === "connecting") {
    return null;
  }

  // Show disconnected message
  if (status === "disconnected") {
    const handleClick = () => {
      setIsSlideOut(true);
      setTimeout(() => {
        setIsSlideOut(false);
      }, 3000);
    };

    return (
      <div
        className={`${styles.container} ${isSlideOut ? styles.slideOut : ""}`}
        data-status="disconnected"
        onClick={handleClick}
        style={{ cursor: "pointer" }}>
        <RingLoader color="white" width="18" height="18" />

        {t(LanguageKey.Connecting)}
      </div>
    );
  }

  // Show connected message only for 3 seconds
  if (status === "connected" && showConnected) {
    return (
      <div className={styles.container} data-status="connected">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 30 30">
          <circle opacity=".3" cx="15" cy="15" r="15" fill="#ffffff" />
          <path
            d="M22.6 11.4a1.5 1.5 0 0 0-2.2-2l-7.2 7.8-2.6-2.6a1.5 1.5 0 0 0-2.2 2l3.8 3.9a1.5 1.5 0 0 0 2.2 0z"
            fill="#fff"
          />
        </svg>
        {/* {t(LanguageKey.Connected)} */}
        Connected
      </div>
    );
  }

  return null;
}
