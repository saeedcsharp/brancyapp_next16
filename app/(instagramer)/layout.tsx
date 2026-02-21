"use client";

import { useSession } from "next-auth/react";
import { MouseEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LeftHamMenue from "saeed/components/hambergurMenu/leftHamMenu";
import NavbarHeader from "saeed/components/navbar/instagramerNavbar/navbarHeader";
import NavbarTabs from "saeed/components/navbar/instagramerNavbar/navbarTabs";
import InstagramerSidebar from "saeed/components/sidebar/instagramerSidbar/instagramerSidbar";
import NotLogin from "saeed/components/notOk/notLogin";
import SignOut from "saeed/components/signout/signOut";
import SwitchAccount from "saeed/components/switchAccount/switchAccount";

export default function InstagramerGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const newRoute = (pathname || "").split("?")[0].replaceAll("/", "");
  const { data: session } = useSession();

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showNotifBar, setShowNotifBar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeftHamMenu, setShowLeftHamMenu] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [toggleNotif, setToggleNotif] = useState(false);

  const handleShowSearchBar = (event: MouseEvent) => {
    event.stopPropagation();
    setShowSearchBar((prev) => !prev);
  };

  const handleShowNotifBar = (event: MouseEvent) => {
    event.stopPropagation();
    setShowNotifBar((prev) => !prev);
  };

  const handleShowProfile = (event: MouseEvent) => {
    event.stopPropagation();
    setShowProfile((prev) => !prev);
  };

  const handleShowHamMenu = (ham: string) => {
    if (ham === "left") setShowLeftHamMenu((prev) => !prev);
  };

  const handleShowSignOut = (event: MouseEvent) => {
    event.stopPropagation();
    setShowSignOut(true);
    setShowLeftHamMenu(false);
  };

  const handleShowUpgrade = (event: MouseEvent) => {
    event.stopPropagation();
    setShowLeftHamMenu(false);
    router.push("/upgrade");
  };

  const handleShowSwitch = (event: MouseEvent) => {
    event.stopPropagation();
    setShowSwitch(true);
    setShowLeftHamMenu(false);
  };

  const removeMask = () => {
    setShowSearchBar(false);
    setShowNotifBar(false);
    setShowProfile(false);
    setShowLeftHamMenu(false);
    setShowSignOut(false);
    setShowSwitch(false);
  };

  return (
    <main className="marketAdsCart">
      <InstagramerSidebar newRoute={newRoute} router={router} />
      <div className="frameGroup">
        <header className="headerTab">
          <NavbarTabs />
          <NavbarHeader
            handleShowHamMenu={handleShowHamMenu}
            handleShowSearchBar={handleShowSearchBar}
            handleShowNotifBar={handleShowNotifBar}
            handleShowProfile={handleShowProfile}
            handleShowSignOut={handleShowSignOut}
            handleShowUpgrade={handleShowUpgrade}
            handleShowSwitch={handleShowSwitch}
            removeMask={removeMask}
            showSearchBar={showSearchBar}
            showNotifBar={showNotifBar}
            showProfile={showProfile}
            profile={session?.user?.profileUrl ?? ""}
            toggleNotif={toggleNotif}
          />
        </header>
        {children}
      </div>
      {showLeftHamMenu && (
        <LeftHamMenue
          removeMask={() => setShowLeftHamMenu(false)}
          handleShowSignOut={handleShowSignOut}
          handleShowUpgrade={handleShowUpgrade}
          handleShowSwitch={handleShowSwitch}
          handleRemoveNotifLogo={() => setToggleNotif((prev) => !prev)}
        />
      )}
      {session?.user?.loginByInsta === false && <NotLogin removeMask={removeMask} />}
      {showSignOut && <SignOut removeMask={removeMask} />}
      {showSwitch && <SwitchAccount removeMask={removeMask} />}
    </main>
  );
}
