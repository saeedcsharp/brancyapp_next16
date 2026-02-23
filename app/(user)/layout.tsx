"use client";

import { MouseEvent, useState } from "react";
import { useRouter } from "next/router";
import LeftUserHamMenue from "brancy/components/hambergurMenu/leftUserHamMenu";
import UserPanelNavbar from "brancy/components/navbar/userPanelNavbar/userPanelNavbar";
import UserSidebar from "brancy/components/sidebar/userSidebar/userSidebar";
import SignOut from "brancy/components/signout/signOut";
import SwitchAccount from "brancy/components/switchAccount/switchAccount";

export default function UserGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const newRoute = (router.asPath || "").split("?")[0].replaceAll("/", "");
  const [showLeftUserHamMenu, setShowLeftUserHamMenu] = useState(false);
  const [showNotifBar, setShowNotifBar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);

  const handleShowNotifBar = (event: MouseEvent) => {
    event.stopPropagation();
    setShowNotifBar((prev) => !prev);
  };

  const handleShowProfile = (event: MouseEvent) => {
    event.stopPropagation();
    setShowProfile((prev) => !prev);
  };

  const handleShowHamMenu = (ham: string) => {
    if (ham === "left") setShowLeftUserHamMenu((prev) => !prev);
  };

  const handleShowSignOut = (event: MouseEvent) => {
    event.stopPropagation();
    setShowSignOut(true);
    setShowLeftUserHamMenu(false);
  };

  const handleShowSwitch = (event: MouseEvent) => {
    event.stopPropagation();
    setShowSwitch(true);
    setShowLeftUserHamMenu(false);
  };

  const handleShowUpgrade = (event: MouseEvent) => {
    event.stopPropagation();
    setShowLeftUserHamMenu(false);
    router.push("/upgrade");
  };

  const removeMask = () => {
    setShowLeftUserHamMenu(false);
    setShowNotifBar(false);
    setShowProfile(false);
    setShowSignOut(false);
    setShowSwitch(false);
  };

  return (
    <main className="marketAdsCart">
      <UserSidebar newRouth={newRoute} router={router} />
      <div className="frameGroup">
        <UserPanelNavbar
          handleShowHamMenu={handleShowHamMenu}
          handleShowNotifBar={handleShowNotifBar}
          handleShowProfile={handleShowProfile}
          handleShowSignOut={handleShowSignOut}
          handleShowSwitch={handleShowSwitch}
          showNotifBar={showNotifBar}
          showProfile={showProfile}
        />
        {children}
      </div>
      {showLeftUserHamMenu && (
        <LeftUserHamMenue
          removeMask={() => setShowLeftUserHamMenu(false)}
          handleShowSignOut={handleShowSignOut}
          handleShowUpgrade={handleShowUpgrade}
          handleShowSwitch={handleShowSwitch}
        />
      )}
      {showSignOut && <SignOut removeMask={removeMask} />}
      {showSwitch && <SwitchAccount removeMask={removeMask} />}
    </main>
  );
}
