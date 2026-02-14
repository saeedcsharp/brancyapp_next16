import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdReport from "saeed/components/advertise/adList/popups/adreport";
import TotalAdsReport from "saeed/components/advertise/statistics/totalAdsReport";
import TotalAds from "saeed/components/advertise/statistics/totalAdsStatistics";
import TwoMonth from "saeed/components/advertise/statistics/twoMonth";
import { StatusType } from "saeed/components/confirmationStatus/confirmationStatus";
import Modal from "saeed/components/design/modal";
import NotAdvertiser from "saeed/components/notOk/notAdvertiser";
import { LanguageKey } from "saeed/i18n";
import { AdsType } from "saeed/models/advertise/AdEnums";
import { IAdMonth, IAdShortMonth, IStatisticsInfo, ITotalAdsReport } from "saeed/models/advertise/statistics";
import styles from "./statistics.module.css";

const Statistics = () => {
  //  return <Soon />;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
  const [onReachEnd, setOnReachEnd] = useState(true);
  const [onReachBegin, setOnReachBegin] = useState(true);
  const [hasTotalMore, setHasTotalMore] = useState(false);
  const [advertiseId, setAdvertiseId] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const router = useRouter();
  const [twoMonth, setTwoMonth] = useState<IAdMonth[]>([]);
  const [totalAdsStatistics, setTotalAdsStatistics] = useState<IAdShortMonth[]>([]);
  const [totalAdsReport, setTotalAdsReport] = useState<ITotalAdsReport[] | null>(null);
  function removeMask() {
    setShowReport(false);
  }
  function showAdReport(advertiseId: number) {
    setAdvertiseId(advertiseId);
    setShowReport(true);
  }
  async function handleLoadMore(pagination: number) {
    //Api to get more total ads report based on <<< pagination >>>
    const res: ITotalAdsReport[] = [
      {
        advertiseId: 600,
        advertiser: {
          fullname: "user6",
          profileUrl: "/no-profile.svg",
          username: "@user6",
        },
        advertiseType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
      {
        advertiseId: 700,
        advertiser: {
          fullname: "user7",
          profileUrl: "/no-profile.svg",
          username: "@user7",
        },
        advertiseType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
      {
        advertiseId: 800,
        advertiser: {
          fullname: "user8",
          profileUrl: "/no-profile.svg",
          username: "@user8",
        },
        advertiseType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
      {
        advertiseId: 900,
        advertiser: {
          fullname: "user9",
          profileUrl: "/no-profile.svg",
          username: "@user9",
        },
        advertiseType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
    ];
    console.log("loadmore");
    setTimeout(() => {
      setTotalAdsReport((prev) => (prev ? [...prev, ...res] : []));
      setHasTotalMore(false);
    }, 2000);
  }
  useEffect(() => {
    //Api to get last two month and total ads statistics
    var response: IStatisticsInfo = {
      totalAdsStatistics: [
        {
          month: 0,
          plusCount: 0,
          totalCount: 50,
          year: 2024,
          totalIncome: 120,
        },
        {
          month: 1,
          plusCount: 0,
          totalCount: 150,
          year: 2024,
          totalIncome: 120,
        },
        {
          month: 2,
          plusCount: 0,
          totalCount: 250,
          year: 2024,
          totalIncome: 120,
        },
        {
          month: 3,
          plusCount: 0,
          totalCount: 70,
          year: 2024,
          totalIncome: 120,
        },
        {
          month: 4,
          plusCount: 0,
          totalCount: 122,
          year: 2024,
          totalIncome: 120,
        },
      ],
      twoMonth: [
        {
          dayList: [],
          month: 0,
          plusCount: 0,
          totalCount: 3800,
          users: [],
          year: 2024,
          totalIncom: 18500,
          previousPlusCount: undefined,
          lastUpdate: (lastUpdate) => <div></div>,
        },
        {
          dayList: [],
          month: 1,
          plusCount: 0,
          totalCount: 3699,
          users: [],
          year: 2024,
          totalIncom: 25000,
          previousPlusCount: undefined,
          lastUpdate: (lastUpdate) => <div></div>,
        },
      ],
      totalAdsReport: [
        {
          advertiseId: 100,
          advertiser: {
            fullname: "user1",
            profileUrl: "/no-profile.svg",
            username: "@user1",
          },
          advertiseType: AdsType.CampaignAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Active,
        },
        {
          advertiseId: 200,
          advertiser: {
            fullname: "user2",
            profileUrl: "/no-profile.svg",
            username: "@user2",
          },
          advertiseType: AdsType.PostAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Active,
        },
        {
          advertiseId: 300,
          advertiser: {
            fullname: "user3",
            profileUrl: "/no-profile.svg",
            username: "@user3",
          },
          advertiseType: AdsType.PostAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Fisnished,
        },
        {
          advertiseId: 400,
          advertiser: {
            fullname: "user4",
            profileUrl: "/no-profile.svg",
            username: "@user4",
          },
          advertiseType: AdsType.StoryAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Canceled,
        },
        {
          advertiseId: 500,
          advertiser: {
            fullname: "user5",
            profileUrl: "/no-profile.svg",
            username: "@user5",
          },
          advertiseType: AdsType.CampaignAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Active,
        },
      ],
    };
    setTwoMonth(response.twoMonth);
    setTotalAdsStatistics(response.totalAdsStatistics);
    setTimeout(() => {
      setTotalAdsReport(response.totalAdsReport);
      setHasTotalMore(true);
    }, 2000);
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
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Statistics)}</title>
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
            {/* head for SEO */}
            {/* <Soon /> */}
            <main>
              {/* ___twomonth___*/}

              <div className={styles.pinContainer}>
                {twoMonth.length > 0 && <TwoMonth data={twoMonth} />}
                {/* ___statistics___*/}

                <TotalAds data={totalAdsStatistics} />
              </div>
              {/* ___adsreport___*/}

              <div className={styles.pinContainer1}>
                <TotalAdsReport
                  adsReports={totalAdsReport}
                  showAdReport={showAdReport}
                  handleLoadMore={handleLoadMore}
                  hasTotalMore={hasTotalMore}
                />
              </div>
            </main>
          </>
        )}
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showReport}>
          <AdReport removeMask={removeMask} advertiseId={advertiseId} />
        </Modal>
      </>
    )
  );
};

export default Statistics;
