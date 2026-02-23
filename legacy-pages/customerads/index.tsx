import { MouseEvent, useEffect, useState } from "react";
import Content from "brancy/components/customerAds/content";
import Navbar from "brancy/components/customerAds/navbar";
import SelectAdmin from "brancy/components/customerAds/selectAdmin";
import SideBar from "brancy/components/customerAds/sideBar";
import styles from "./index.module.css";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Card from "brancy/components/customerAds/card/card";
import { NotifType, ResponseType, notify } from "brancy/components/notifications/notificationBox";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import { IAdvertiseSummary, IAdvertiserInfo, ISideBar } from "brancy/models/customerAds/customerAd";

const CustomerAds = () => {
  //  return <Soon />;
  const { data: session } = useSession();
  const router = useRouter();
  const [showSelectAdmin, setShowSelectAdmin] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [selectedAds, setSelectedAds] = useState<IAdvertiseSummary[]>([]);
  const [selectedAdsId, setselectedAdsId] = useState<number[]>([]);
  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [addCardRefresh, setAddCardRefresh] = useState<boolean>(false);
  const [advertisersInfo, setAdvertisersInfo] = useState<IAdvertiserInfo>({
    advertisers: [],
    totalAdsCount: 0,
  });
  const [adIdCard, setAdIdCard] = useState<number>(0);
  function handleApplyFilter(info: ISideBar) {
    //Api to Aplly sidebar filters
    console.log("sideBarInfo", info);
    var response: IAdvertiserInfo = {
      advertisers: [
        {
          asvertiseId: 1000,
          engage: 0,
          follower: 0,
          following: 0,
          postCount: 0,
          price: 2560000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a1000",
          username: "@a1000",
          terms: "",
        },
        {
          asvertiseId: 1,
          engage: 0,
          follower: 0,
          price: 100000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a1",
          username: "@a1",
          terms: "",
          following: 0,
          postCount: 0,
        },
      ],
      totalAdsCount: 20,
    };
    setAdvertisersInfo(response);
  }
  function handleShowCard(e: MouseEvent, adId: number) {
    e.stopPropagation();
    e.preventDefault();
    setAdIdCard(adId);
    setShowCard(true);
  }
  function handleShowSelectAdmin(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setShowSelectAdmin(!showSelectAdmin);
  }
  function handleAddToCard(ad: IAdvertiseSummary) {
    let newSelectedAds = selectedAds;
    let newSelectedAdIds = selectedAdsId;
    newSelectedAds.push(ad);
    newSelectedAdIds.push(ad.asvertiseId);
    setSelectedAds(newSelectedAds);
    setAddCardRefresh(!addCardRefresh);
  }
  function handleUpdateSelectedAds(adId: number) {
    const updatedAds = selectedAds.filter((x) => x.asvertiseId !== adId);
    const updatedIds = selectedAdsId.filter((x) => x !== adId);
    setselectedAdsId(updatedIds);
    setSelectedAds(updatedAds);
    setAddCardRefresh(!addCardRefresh);
  }
  function removeMask() {
    setShowCard(false);
    setShowSelectAdmin(false);
    setShowSignIn(false);
  }
  function handleRemoveMaskSignin() {
    setShowSignIn(false);
    notify(ResponseType.Ok, NotifType.Info);
  }
  function handleSelectAdvertisers() {
    if (session) {
      //Api to send advertise ids based on <<selectedAdsId>>
      //If response is ok
      var response = 1; // 1 is customerAdId
      router.push(`/customerads/progress?customerAdId=${response}`);
    } else setShowSignIn(true);
  }
  function handleLeftVisible(isVisible: boolean) {
    setIsLeftVisible(isVisible);
  }
  useEffect(() => {
    //Api to get advertisers
    var response: IAdvertiserInfo = {
      advertisers: [
        {
          asvertiseId: 1000,
          engage: 0,
          follower: 0,
          price: 2560000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a1000",
          username: "@a1000",
          terms: "",
          following: 0,
          postCount: 0,
        },
        {
          asvertiseId: 1,
          engage: 0,
          follower: 0,
          price: 100000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a1",
          username: "@a1",
          terms: "",
          following: 0,
          postCount: 0,
        },
        {
          asvertiseId: 2,
          engage: 0,
          follower: 0,
          price: 800000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a2",
          username: "@a2",
          terms: "",
          following: 0,
          postCount: 0,
        },
        {
          asvertiseId: 3,
          engage: 0,
          follower: 0,
          price: 5000000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a3",
          username: "@a3",
          terms: "",
          following: 0,
          postCount: 0,
        },
        {
          asvertiseId: 4,
          engage: 0,
          follower: 0,
          price: 650000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a4",
          username: "@a4",
          terms: "",
          following: 0,
          postCount: 0,
        },

        {
          asvertiseId: 5,
          engage: 0,
          follower: 0,
          price: 1500000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a5",
          username: "@a5",
          terms: "",
          following: 0,
          postCount: 0,
        },
        {
          asvertiseId: 6,
          engage: 0,
          follower: 0,
          price: 8750000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a6",
          username: "@a6",
          terms: "",
          following: 0,
          postCount: 0,
        },

        {
          asvertiseId: 7,
          engage: 0,
          follower: 0,
          price: 630000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a7",
          username: "@a7",
          terms: "",
          following: 0,
          postCount: 0,
        },
        {
          asvertiseId: 8,
          engage: 0,
          follower: 0,
          price: 7840000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a8",
          username: "@a8",
          terms: "",
          following: 0,
          postCount: 0,
        },
        {
          asvertiseId: 9,
          engage: 0,
          follower: 0,
          price: 14580000,
          profileUrl: "/no-profile.svg",
          rating: 0,
          reach: 0,
          fullName: "a9",
          username: "@a9",
          terms: "",
          following: 0,
          postCount: 0,
        },
      ],
      totalAdsCount: 100,
    };
    setAdvertisersInfo(response);
  }, []);
  return (
    <>
      <div onClick={removeMask} className={styles.pinContainer}>
        <SideBar
          handleApplyFilter={handleApplyFilter}
          handleLeftVisible={handleLeftVisible}
          isLeftVisible={isLeftVisible}
          totalCount={advertisersInfo.totalAdsCount}
        />
        <div className={styles.maincard}>
          <Navbar
            handleShowSelectAdmins={handleShowSelectAdmin}
            handleLeftVisible={handleLeftVisible}
            selectedIds={selectedAdsId}
            refresh={addCardRefresh}
          />
          <Content
            showCard={handleShowCard}
            handleAddToCard={handleAddToCard}
            selectedAdsId={selectedAdsId}
            advertisers={advertisersInfo.advertisers}
          />
        </div>
      </div>
      {showSelectAdmin && (
        <SelectAdmin
          selectedAds={selectedAds}
          handleUpdateSelectedAds={handleUpdateSelectedAds}
          handleSelectAdvertisers={handleSelectAdvertisers}
        />
      )}
      {showCard && (
        <Card
          selectedAdsId={selectedAdsId}
          advertiserId={adIdCard}
          removeMask={removeMask}
          handleAddToCard={handleAddToCard}
        />
      )}
      {showSignIn && (
        <SignIn
          redirectType={RedirectType.None}
          signInType={SignInType.Phonenumber}
          removeMask={removeMask}
          removeMaskWithNotif={handleRemoveMaskSignin}
          preUserToken={""}
        />
      )}
    </>
  );
};

export default CustomerAds;
