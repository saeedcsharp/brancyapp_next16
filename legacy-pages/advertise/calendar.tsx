import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdDetails from "brancy/components/advertise/adList/popups/adDetails";
import CalendarComponent from "brancy/components/advertise/calendar/calendarComponent";
import Timeline from "brancy/components/advertise/calendar/timeLine";
import Modal from "brancy/components/design/modal";
import NotAdvertiser from "brancy/components/notOk/notAdvertiser";
import { LanguageKey } from "brancy/i18n";
import { AdsTimeType, AdsType } from "brancy/models/advertise/AdEnums";
import { DetailType, IRejectTerms } from "brancy/models/advertise/adList";
import { ICaledarAds } from "brancy/models/advertise/calendar";
import styles from "./calendar.module.css";
const AdCalendar = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [totalAds, setTotalAds] = useState<ICaledarAds[]>([]);
  const [adId, setAdId] = useState(0);
  const [showReject, setShowReject] = useState(false);
  function handleShowReject(adId: number) {
    setAdId(adId);
    setShowReject(true);
  }
  function handleRemoveMask() {
    setShowReject(false);
  }
  function habdleRejectItem(rejectTerms: IRejectTerms) {
    //Api to reject advertise based on <<<rejectTerms>>>
    setTotalAds((prev) => prev.filter((x) => x.adsId !== rejectTerms.advertiseId));
    handleRemoveMask();
  }
  useEffect(() => {
    //Api to fetch calendar info
    var response: ICaledarAds[] = [
      {
        date: Date.now(),
        adsType: AdsType.PostAd,
        fullName: "Ahoora Niazi",
        profileUrl: "/no-profile.svg",
        username: "@Ahoora",
        adsId: 1,
        adsTimeType: AdsTimeType.FullDay,
        noPost: false,
        adType: AdsType.PostAd,
      },
      {
        date: Date.now() + 86400000,
        adsType: AdsType.PostAd,
        fullName: "Ahoora Niazi",
        profileUrl: "/no-profile.svg",
        username: "@Ahoora",
        adsId: 2,
        adsTimeType: AdsTimeType.FullDay,
        noPost: false,
        adType: AdsType.PostAd,
      },
      {
        date: Date.now() + 86400000,
        adsType: AdsType.StoryAd,
        fullName: "Ahoora Niazi",
        profileUrl: "/no-profile.svg",
        username: "@Ahoora",
        adsId: 3,
        adsTimeType: AdsTimeType.FullDay,
        noPost: false,
        adType: AdsType.StoryAd,
      },

      {
        adsType: AdsType.PostAd,
        fullName: "Ahoora Niazi",
        profileUrl: "/no-profile.svg",
        username: "@Ahoora",
        adsId: 4,
        adsTimeType: AdsTimeType.FullDay,
        noPost: false,
        adType: AdsType.PostAd,
        date: Date.now() + 172800000,
      },
      {
        adsType: AdsType.StoryAd,
        fullName: "Ahoora Niazi",
        profileUrl: "/no-profile.svg",
        username: "@Ahoora",
        adsId: 5,
        adsTimeType: AdsTimeType.FullDay,
        noPost: false,
        adType: AdsType.StoryAd,
        date: Date.now() + 172800000,
      },
      {
        adsType: AdsType.StoryAd,
        fullName: "Ahoora Niazi",
        profileUrl: "/no-profile.svg",
        username: "@Ahoora",
        adsId: 6,
        adsTimeType: AdsTimeType.FullDay,
        noPost: false,
        adType: AdsType.CampaignAd,
        date: Date.now() + 172890000,
      },
      {
        adsType: AdsType.StoryAd,
        fullName: "Ahoora Niazi",
        profileUrl: "/no-profile.svg",
        username: "@Ahoora",
        adsId: 7,
        adsTimeType: AdsTimeType.FullDay,
        noPost: false,
        adType: AdsType.StoryAd,
        date: Date.now() + 172800000,
      },
    ];
    setTotalAds(response);
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
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Calendar)}</title>
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
              {/* ___calendar ___*/}
              <div className={styles.pinContainer}>
                <CalendarComponent totalAds={totalAds} showReject={handleShowReject} />
                {/* ___timeline ___*/}
                <Timeline />
              </div>
            </main>
          </>
        )}

        <Modal showContent={showReject} closePopup={handleRemoveMask} classNamePopup={"popup"}>
          <AdDetails
            removeMask={handleRemoveMask}
            acceptAdvertise={() => {}}
            rejectAdvertise={habdleRejectItem}
            advertiseId={adId}
            detailType={DetailType.UpcomingList}
          />
        </Modal>
      </>
    )
  );
};

export default AdCalendar;
