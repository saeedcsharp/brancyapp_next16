import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { MouseEvent, use, useEffect, useRef, useState } from "react";
import { InstaInfoContext } from "../../../context/instaInfoContext";
import { LoginStatus, packageStatus } from "../../../helper/loadingStatus";
import { handleDecompress } from "../../../helper/pako";
import { getHubConnection } from "../../../helper/pushNotif";
import { PushNotif, PushResponseType } from "../../../models/push/pushNotif";
import NavbarMobile from "./navbar_mobile";
import styles from "./navbarheader.module.css";
import NotificationBar from "./notificationBar";
import Profile from "./profile";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const NavbarHeader = (props: {
  handleShowHamMenu: (ham: string) => void;
  handleShowSearchBar: (e: MouseEvent) => void;
  handleShowNotifBar: (e: MouseEvent) => void;
  handleShowProfile: (e: MouseEvent) => void;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowUpgrade: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
  removeMask: () => void;
  showSearchBar: boolean;
  showNotifBar: boolean;
  showProfile: boolean;
  profile: string;
  toggleNotif: boolean;
}) => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [gooli, setGooli] = useState(false);
  const fullscreenButtonRef = useRef(null);
  const { data: session } = useSession();
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  // const [navbarNotifs, setNavbarNotifs] = useState<PushNotif[]>([]);
  const { value, setValue } = use(InstaInfoContext) ?? {};
  async function handleGetNotif(notif: string) {
    const decombNotif = handleDecompress(notif);
    const notifObj = JSON.parse(decombNotif!) as PushNotif;
    if (notifObj.IsNavbar && notifObj.InstagramerId) {
      console.log("decombNotif in navbar header", notifObj);
      // setNavbarNotifs((prev) => [notifObj, ...prev]);
      if (setValue && session!.user.currentIndex > -1) setValue((prev) => [notifObj, ...prev]);
      if (!props.showNotifBar) setGooli(true);
    } else if (!notifObj.IsNavbar && notifObj.ResponseType === PushResponseType.DeauthorizedInstaAccount) {
      console.log("not isNvabar AND DeauthorizedInstaAccount");
      await signOut({ redirect: false });
      router.replace("/");
      props.removeMask();
    }
  }
  function handleDeleteNotif(index: number) {
    if (setValue) setValue((prev) => prev.filter((_, i) => i !== index));
  }
  useEffect(() => {
    console.log("Setting up SignalR connection for notifications");
    const intervalId = setInterval(() => {
      if (!isFirstLoad || !LoginStatus(session) || !packageStatus(session)) return;
      const hubConnection = getHubConnection();
      if (hubConnection) {
        hubConnection.off("Instagramer socket on", handleGetNotif);
        hubConnection.on("Instagramer", handleGetNotif);
        clearInterval(intervalId);
        setIsFirstLoad(false);
      }
    }, 500);
  }, []);
  useEffect(() => {
    setGooli(false);
  }, [props.toggleNotif]);
  return (
    <>
      <nav className={styles.pageheadersmobile}>
        <NavbarMobile handleShowHamMenu={props.handleShowHamMenu} gooli={gooli} />
      </nav>
      <div id="navbarheader" className={styles.pageheaders}>
        <div className={styles.pageHeaderIcons}>
          <div
            className={styles.fullscreen}
            onClick={toggleFullscreen}
            ref={fullscreenButtonRef}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            role="button"
            title={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}>
            {isFullscreen ? (
              <svg
                className={styles.icon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                role="img">
                <path
                  d="M8 3V6C8 6.53043 7.78929 7.03914 7.41421 7.41421C7.03914 7.78929 6.53043 8 6 8H3M21 8H18C17.4696 8 16.9609 7.78929 16.5858 7.41421C16.2107 7.03914 16 6.53043 16 6V3M16 21V18C16 17.4696 16.2107 16.9609 16.5858 16.5858C16.9609 16.2107 17.4696 16 18 16H21M3 16H6C6.53043 16 7.03914 16.2107 7.41421 16.5858C7.78929 16.9609 8 17.4696 8 18V21"
                  stroke="var(--color-light-blue)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className={styles.icon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                role="img">
                <path
                  d="M8 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V8M21 8V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H16M16 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V16M3 16V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H8"
                  stroke="var(--color-light-blue)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div
            onClick={(e) => {
              (props.handleShowNotifBar(e), setGooli(false));
            }}
            id="showNotifhBar"
            className={styles.notif}
            role="button"
            aria-label="Show notifications"
            title="View notifications">
            <svg fill="none" className={styles.icon} viewBox="0 0 21 25" aria-hidden="true" role="img">
              <path
                d="M19.4 18.2h-18a1.5 1.5 0 0 1-.8-2.7l.3-.3.1-.2.7-1Q3 11 2.9 7.7v-.3a7.5 7.5 0 0 1 15 .3q0 3.3 1.2 6.3l.8 1.2h.1l.1.2h.1l.2.2a1.5 1.5 0 0 1-1 2.6m-9-15a4.5 4.5 0 0 0-4.5 4.5q0 3.8-1.4 7.3l-.1.2h12V15a17 17 0 0 1-1.5-7v-.4a4.5 4.5 0 0 0-4.5-4.5m1.9 17.5a1.5 1.5 0 0 1 2.2 2q-.9.9-1.9 1.2a7 7 0 0 1-4.4 0q-1-.4-1.9-1.1a1.5 1.5 0 1 1 2-2.3h.2l.6.5a4 4 0 0 0 2.6 0z"
                fill="var(--color-light-blue)"
              />
            </svg>

            {gooli && session!.user.currentIndex > -1 && <div className={styles.gooli} />}
          </div>
          <img
            onClick={props.handleShowProfile}
            className={styles.ProfileIcon}
            alt="Your Instagram profile picture"
            src={session?.user.profileUrl ? baseMediaUrl + session.user.profileUrl : "/no-profile.svg"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== window.location.origin + "/no-profile.svg") {
                target.src = "/no-profile.svg";
              }
            }}
            loading="lazy"
            decoding="async"
            title="View profile menu"
            aria-label="Open profile menu"
            role="button"
          />
        </div>
        {/* {props.showSearchBar && <SearchBar removeMask={props.handleShowSearchBar} />} */}
        {props.showNotifBar && (
          <NotificationBar
            notifs={value && session!.user.currentIndex > -1 ? value : []}
            handleDeleteNotif={handleDeleteNotif}
          />
        )}
        {props.showProfile && (
          <Profile
            data="Profile"
            handleShowSignOut={props.handleShowSignOut}
            handleShowUpgrade={props.handleShowUpgrade}
            handleShowSwitch={props.handleShowSwitch}
          />
        )}
      </div>
    </>
  );
};

export default NavbarHeader;
