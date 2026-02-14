import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdReport from "saeed/components/advertise/adList/popups/adreport";
import { StatusType } from "saeed/components/confirmationStatus/confirmationStatus";
import Modal from "saeed/components/design/modal";
import NotShopper from "saeed/components/notOk/notShopper";
import SaleDetail from "saeed/components/store/statistics/SaleDetail";
import TotalSalesReport from "saeed/components/store/statistics/totalSalesReport";
import TotalSales from "saeed/components/store/statistics/totalSalesStatistics";
import TwoMonth from "saeed/components/store/statistics/twoMonth";
import { packageStatus } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { AdsType } from "saeed/models/advertise/AdEnums";
import { ISaleMonth, ISaleShortMonth, IStatisticsInfo, ITotalSalesReport } from "../../models/store/statistics";
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
  const [saleId, setSaleId] = useState(0);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const router = useRouter();
  const [twoMonth, setTwoMonth] = useState<ISaleMonth[]>([]);
  const [totalSalesStatistics, setTotalSalesStatistics] = useState<ISaleShortMonth[]>([]);
  const [totalSalesReport, setTotalSalesReport] = useState<ITotalSalesReport[] | null>(null);
  function removeMask() {
    setShowReport(false);
  }
  function showAdReport(advertiseId: number) {
    setAdvertiseId(advertiseId);
    setShowReport(true);
  }
  function showSaleReport(saleId: number) {
    setSaleId(saleId);
    setShowSaleDetail(true);
  }
  function removeSaleDetailMask() {
    setShowSaleDetail(false);
  }
  async function handleLoadMore(pagination: number) {
    //Api to get more total sales report based on <<< pagination >>>
    const res: ITotalSalesReport[] = [
      {
        saleId: 600,
        seller: {
          fullname: "user6",
          profileUrl: "/no-profile.svg",
          username: "@user6",
        },
        saleType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
      {
        saleId: 700,
        seller: {
          fullname: "user7",
          profileUrl: "/no-profile.svg",
          username: "@user7",
        },
        saleType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
      {
        saleId: 800,
        seller: {
          fullname: "user8",
          profileUrl: "/no-profile.svg",
          username: "@user8",
        },
        saleType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
      {
        saleId: 900,
        seller: {
          fullname: "user9",
          profileUrl: "/no-profile.svg",
          username: "@user9",
        },
        saleType: AdsType.PostAd,
        date: Date.now(),
        fee: 888999777,
        statusType: StatusType.Active,
      },
    ];
    console.log("loadmore");
    setTimeout(() => {
      setTotalSalesReport((prev) => (prev ? [...prev, ...res] : []));
      setHasTotalMore(false);
    }, 2000);
  }
  useEffect(() => {
    //Api to get last two month and total sales statistics
    var response: IStatisticsInfo = {
      totalSalesStatistics: [
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
      totalSalesReport: [
        {
          saleId: 100,
          seller: {
            fullname: "user1",
            profileUrl: "/no-profile.svg",
            username: "@user1",
          },
          saleType: AdsType.CampaignAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Active,
        },
        {
          saleId: 200,
          seller: {
            fullname: "user2",
            profileUrl: "/no-profile.svg",
            username: "@user2",
          },
          saleType: AdsType.PostAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Active,
        },
        {
          saleId: 300,
          seller: {
            fullname: "user3",
            profileUrl: "/no-profile.svg",
            username: "@user3",
          },
          saleType: AdsType.PostAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Fisnished,
        },
        {
          saleId: 400,
          seller: {
            fullname: "user4",
            profileUrl: "/no-profile.svg",
            username: "@user4",
          },
          saleType: AdsType.StoryAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Canceled,
        },
        {
          saleId: 500,
          seller: {
            fullname: "user5",
            profileUrl: "/no-profile.svg",
            username: "@user5",
          },
          saleType: AdsType.CampaignAd,
          date: Date.now(),
          fee: 888999777,
          statusType: StatusType.Active,
        },
      ],
    };
    setTwoMonth(response.twoMonth);
    setTotalSalesStatistics(response.totalSalesStatistics);
    setTimeout(() => {
      setTotalSalesReport(response.totalSalesReport);
      setHasTotalMore(true);
    }, 2000);
  }, []);
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  if (!session?.user.isShopper) return <NotShopper />;
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
        {/* head for SEO */}
        {/* <Soon /> */}
        <main>
          {/* ___twomonth___*/}

          <div className={styles.pinContainer}>
            {twoMonth.length > 0 && <TwoMonth data={twoMonth} />}
            {/* ___statistics___*/}

            <TotalSales data={totalSalesStatistics} />
          </div>
          {/* ___salesreport___*/}

          <div className={styles.pinContainer1}>
            <TotalSalesReport
              salesReports={totalSalesReport}
              showSaleReport={showSaleReport}
              handleLoadMore={handleLoadMore}
              hasTotalMore={hasTotalMore}
            />
          </div>
        </main>
        {showReport && <AdReport removeMask={removeMask} advertiseId={advertiseId} />}
        <Modal closePopup={removeSaleDetailMask} classNamePopup={"popup"} showContent={showSaleDetail}>
          <SaleDetail saleId={saleId} onClose={removeSaleDetailMask} />
        </Modal>
      </>
    )
  );
};

export default Statistics;
