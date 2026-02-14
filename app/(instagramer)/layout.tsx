"use client";

import { useSession } from "next-auth/react";
import { MouseEvent, useState } from "react";
import { useRouter } from "next/router";
import NavbarHeader from "saeed/components/navbar/instagramerNavbar/navbarHeader";
import NavbarTabs from "saeed/components/navbar/instagramerNavbar/navbarTabs";
import InstagramerSidebar from "saeed/components/sidebar/instagramerSidbar/instagramerSidbar";

export default function InstagramerGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const newRoute = (router.asPath || "").split("?")[0].replaceAll("/", "");
  const { data: session } = useSession();

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showNotifBar, setShowNotifBar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toggleNotif] = useState(false);

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

  const handleShowHamMenu = () => {};
  const handleShowSignOut = () => {};
  const handleShowUpgrade = () => {};
  const handleShowSwitch = () => {};
  const removeMask = () => {
    setShowSearchBar(false);
    setShowNotifBar(false);
    setShowProfile(false);
  };

  return (
    <>
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
      <InstagramerSidebar newRoute={newRoute} router={router} />
      <div className="frameGroup">{children}</div>
    </>
  );
}
