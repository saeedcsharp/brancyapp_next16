"use client";

import { MouseEvent, useState } from "react";
import { useRouter } from "next/router";
import UserPanelNavbar from "saeed/components/navbar/userPanelNavbar/userPanelNavbar";
import UserSidebar from "saeed/components/sidebar/userSidebar/userSidebar";

export default function UserGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const newRoute = (router.asPath || "").split("?")[0].replaceAll("/", "");
  const [showNotifBar, setShowNotifBar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleShowNotifBar = (event: MouseEvent) => {
    event.stopPropagation();
    setShowNotifBar((prev) => !prev);
  };

  const handleShowProfile = (event: MouseEvent) => {
    event.stopPropagation();
    setShowProfile((prev) => !prev);
  };

  const handleShowHamMenu = () => {};
  const handleShowSignOut = () => {};
  const handleShowSwitch = () => {};

  return (
    <>
      <UserPanelNavbar
        handleShowHamMenu={handleShowHamMenu}
        handleShowNotifBar={handleShowNotifBar}
        handleShowProfile={handleShowProfile}
        handleShowSignOut={handleShowSignOut}
        handleShowSwitch={handleShowSwitch}
        showNotifBar={showNotifBar}
        showProfile={showProfile}
      />
      <UserSidebar newRouth={newRoute} router={router} />
      <div className="frameGroup">{children}</div>
    </>
  );
}
