import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ActiveList from "../../components/advertise/adList/activeList";
import AdDetails from "../../components/advertise/adList/popups/adDetails";
import AdReport from "../../components/advertise/adList/popups/adreport";
import RejectedList from "../../components/advertise/adList/rejectedList";
import UpcomingList from "../../components/advertise/adList/upcomingList";
import WaitingList from "../../components/advertise/adList/waitingList";
import NotAdvertiser from "../../components/notOk/notAdvertiser";
import { changePositionToFixed, changePositionToRelative } from "../../helper/changeMarketAdsStyle";
import { LanguageKey } from "../../i18n";

import Modal from "../../components/design/modal";
import { AdsTimeType, AdsType, RejectedType } from "../../models/advertise/AdEnums";
import {
  DetailType,
  IActiveAds,
  IRejectedAds,
  IRejectTerms,
  IUpcomingAds,
  IWatingAds,
} from "../../models/advertise/adList";
const AdList = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [waitingAds, setWaitingAds] = useState<IWatingAds[]>([]);
  const [upComingList, setUpComingList] = useState<IUpcomingAds[]>([]);
  const [activeList, setActiveList] = useState<IActiveAds[]>([]);
  const [rejectedList, setRejectedList] = useState<IRejectedAds[]>([]);
  const [showAdDetails, setShowAdDetails] = useState(false);
  const [detaileType, setDetaileType] = useState<DetailType>(DetailType.WatingList);
  const [showReport, setShowReport] = useState(false);
  const [advertiseId, setAdvertiseId] = useState(0);
  function handleShowDetailAdsForWaitingList(adId: number) {
    setDetaileType(DetailType.WatingList);
    setAdvertiseId(adId);
    changePositionToFixed();
    setShowAdDetails(true);
  }
  function handleShowDetailAdsForUpcomingList(adId: number) {
    setDetaileType(DetailType.UpcomingList);
    setAdvertiseId(adId);
    changePositionToFixed();
    setShowAdDetails(true);
  }
  function handleShowReport(adId: number) {
    setAdvertiseId(adId);
    changePositionToFixed();
    setShowReport(true);
  }
  function handleRemoveMask() {
    changePositionToRelative();
    setShowAdDetails(false);
    setShowReport(false);
  }
  function handleRejectAdvertise(rejectTerm: IRejectTerms) {
    console.log(rejectTerm);
    //Api to reject advertise based on <<< rejectTerm >>>
    if (rejectTerm.detailType === DetailType.WatingList) {
      setWaitingAds((prev) => prev.filter((x) => x.advertiseId !== rejectTerm.advertiseId));
    } else if (rejectTerm.detailType === DetailType.UpcomingList) {
      setUpComingList((prev) => prev.filter((x) => x.adsId !== rejectTerm.advertiseId));
    }
    handleRemoveMask();
  }
  function handleAcceptAdvertise() {
    //Api to accept advertise on <<< adcertiseId state >>>
    setWaitingAds((prev) => prev.filter((x) => x.advertiseId !== advertiseId));
    handleRemoveMask();
  }
  function handleRemoveUpingItem(itemId: string) {
    setUpComingList((prev) => prev.filter((x) => x.adsId !== parseInt(itemId)));
  }
  function handleRemoveActivetem(itemId: string) {
    setActiveList((prev) => prev.filter((x) => x.adsId !== parseInt(itemId)));
  }
  function handleRemoveWatingItem(itemId: number) {
    setWaitingAds((prev) => prev.filter((x) => x.advertiseId !== itemId));
  }
  useEffect(() => {
    //Api to get wating list
    //Api to get Upcoming list
    //Api to get Active list
    //Api to get Rejected list
    setWaitingAds([
      {
        adsType: AdsType.PostAd,
        expiredTime: Date.now() + 62 * 1000,
        advertiseId: 1,
      },
      {
        adsType: AdsType.PostAd,
        expiredTime: Date.now() + 29 * 50 * 1000,
        advertiseId: 2,
      },
      {
        adsType: AdsType.CampaignAd,
        expiredTime: Date.now() + 29 * 40 * 1000,
        advertiseId: 3,
      },
      {
        adsType: AdsType.StoryAd,
        expiredTime: Date.now() + 29 * 30 * 1000,
        advertiseId: 4,
      },
    ]);
    setUpComingList([
      {
        adsId: 0,
        adsType: AdsType.CampaignAd,
        noPost: true,
        upingTime: Date.now() + 5 * 3600 * 24 * 1e3,
        username: "username0",
        adsTimeType: AdsTimeType.SemiDay,
      },
      {
        adsId: 1,
        adsType: AdsType.PostAd,
        noPost: true,
        upingTime: Date.now() + 7 * 3600 * 24 * 1e3,
        username: "username1",
        adsTimeType: AdsTimeType.SemiDay,
      },
      {
        adsId: 2,
        adsType: AdsType.StoryAd,
        noPost: false,
        upingTime: Date.now() + 10 * 3600 * 24 * 1e3,
        username: "username2",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 3,
        adsType: AdsType.StoryAd,
        noPost: false,
        upingTime: Date.now() + 10 * 3600 * 24 * 1e3,
        username: "username3",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 4,
        adsType: AdsType.StoryAd,
        noPost: false,
        upingTime: Date.now() + 10 * 3600 * 24 * 1e3,
        username: "username4",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 5,
        adsType: AdsType.StoryAd,
        noPost: false,
        upingTime: Date.now() + 10 * 3600 * 24 * 1e3,
        username: "username5",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 6,
        adsType: AdsType.StoryAd,
        noPost: false,
        upingTime: Date.now() + 10 * 3600 * 24 * 1e3,
        username: "username2",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 7,
        adsType: AdsType.StoryAd,
        noPost: false,
        upingTime: Date.now() + 10 * 3600 * 24 * 1e3,
        username: "username7",
        adsTimeType: AdsTimeType.FullDay,
      },
    ]);
    setActiveList([
      {
        adsId: 0,
        adsType: AdsType.CampaignAd,
        noPost: true,
        expiredTime: Date.now() + 3600 * 12 * 1e3,
        username: "username0",
        adsTimeType: AdsTimeType.SemiDay,
      },
      {
        adsId: 1,
        adsType: AdsType.PostAd,
        noPost: true,
        expiredTime: Date.now() + 3600 * 8 * 1e3,
        username: "username1",
        adsTimeType: AdsTimeType.SemiDay,
      },
      {
        adsId: 2,
        adsType: AdsType.StoryAd,
        noPost: false,
        expiredTime: Date.now() + 1 * 3600 * 24 * 1e3,
        username: "username2",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 3,
        adsType: AdsType.StoryAd,
        noPost: false,
        expiredTime: Date.now() + 1 * 3600 * 24 * 1e3,
        username: "username3",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 4,
        adsType: AdsType.StoryAd,
        noPost: false,
        expiredTime: Date.now() + 1 * 3600 * 24 * 1e3,
        username: "username4",
        adsTimeType: AdsTimeType.FullDay,
      },
      {
        adsId: 5,
        adsType: AdsType.StoryAd,
        noPost: false,
        expiredTime: Date.now() + 1 * 3600 * 24 * 1e3,
        username: "username5",
        adsTimeType: AdsTimeType.FullDay,
      },
    ]);
    setRejectedList([
      {
        adsId: 0,
        adsTimeType: AdsTimeType.FullDay,
        adsType: AdsType.PostAd,
        noPost: false,
        rejectedTime: Date.now() - 5 * 24 * 3600 * 1e3,
        rejectedType: RejectedType.admin,
        username: "username0",
      },
      {
        adsId: 1,
        adsTimeType: AdsTimeType.SemiDay,
        adsType: AdsType.StoryAd,
        noPost: true,
        rejectedTime: Date.now() - 2 * 24 * 3600 * 1e3,
        rejectedType: RejectedType.user,
        username: "username1",
      },
      {
        adsId: 2,
        adsTimeType: AdsTimeType.SemiDay,
        adsType: AdsType.StoryAd,
        noPost: true,
        rejectedTime: Date.now() - 2 * 24 * 3600 * 1e3,
        rejectedType: RejectedType.user,
        username: "username2",
      },
      {
        adsId: 3,
        adsTimeType: AdsTimeType.SemiDay,
        adsType: AdsType.StoryAd,
        noPost: true,
        rejectedTime: Date.now() - 2 * 24 * 3600 * 1e3,
        rejectedType: RejectedType.user,
        username: "username3",
      },
      {
        adsId: 4,
        adsTimeType: AdsTimeType.SemiDay,
        adsType: AdsType.StoryAd,
        noPost: true,
        rejectedTime: Date.now() - 2 * 24 * 3600 * 1e3,
        rejectedType: RejectedType.user,
        username: "username4",
      },
      {
        adsId: 5,
        adsTimeType: AdsTimeType.SemiDay,
        adsType: AdsType.StoryAd,
        noPost: true,
        rejectedTime: Date.now() - 2 * 24 * 3600 * 1e3,
        rejectedType: RejectedType.user,
        username: "username5",
      },
    ]);
  }, []);
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_AdList)}</title>
          <meta name="description" content="Advanced Instagram post management tool" />
          <meta name="theme-color"></meta>
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
          {/* Add other meta tags as needed */}
        </Head>
        {!session.user.isPartner && <NotAdvertiser />}
        {session.user.isPartner && (
          <>
            {/* <Soon /> */}
            {/* head for SEO */}
            <main>
              <div className="pinContainer">
                {/* ___waiting list___*/}
                <WaitingList
                  handleShowDetailAds={handleShowDetailAdsForWaitingList}
                  data={waitingAds}
                  handleRemoveWatingItem={handleRemoveWatingItem}
                />
                {/* ___upcoming list ___*/}
                <UpcomingList
                  data={upComingList}
                  handleRemoveUpingItem={handleRemoveUpingItem}
                  handleShowDetailAds={handleShowDetailAdsForUpcomingList}
                />
                {/* ___active list ___*/}
                <ActiveList
                  data={activeList}
                  handleRemoveActivetem={handleRemoveActivetem}
                  handleShowReport={handleShowReport}
                />
                {/* ___reject list___*/}
                <RejectedList data={rejectedList} />
              </div>
            </main>
          </>
        )}

        <Modal showContent={showAdDetails} closePopup={handleRemoveMask} classNamePopup={"popup"}>
          <AdDetails
            removeMask={handleRemoveMask}
            acceptAdvertise={handleAcceptAdvertise}
            rejectAdvertise={handleRejectAdvertise}
            advertiseId={advertiseId}
            detailType={detaileType}
          />
        </Modal>

        <Modal showContent={showReport} closePopup={handleRemoveMask} classNamePopup={"popup"}>
          <AdReport removeMask={handleRemoveMask} advertiseId={advertiseId} />
        </Modal>
      </>
    )
  );
};

export default AdList;
