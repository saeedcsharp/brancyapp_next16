import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HeaderTitle from "brancy/components/headerTitle/headerTitle";
import Advertise from "brancy/components/market/home/Advertise";
import AllMarket from "brancy/components/market/home/allMarket";
import Filter from "brancy/components/market/home/filter";
import Store from "brancy/components/market/home/Store";
import { packageStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { MarketType, SelectedMarketType } from "brancy/models/market/enums";
import { IMarketInfo } from "brancy/models/market/home";
import styles from "./home.module.css";

const MarketHome = () => {
  //  return <Soon />;
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [showFilter, setShowFilter] = useState(false);
  const [allMarkets, setAllMarkets] = useState<IMarketInfo[]>();
  const [advertiseMarkets, setAdvertiseMarkets] = useState<IMarketInfo[]>();
  const [storeMarkets, setStoreMarkets] = useState<IMarketInfo[]>();
  const [marketType, setMarketType] = useState<SelectedMarketType>(SelectedMarketType.All);
  function fetchAllData(pagination: string) {
    //push data to allMarkets
    console.log("updateAllMarket");
  }
  function fetchAdvertiseData(pagination: string) {
    //push data to advertiseMarkets
    console.log("updateAdvertiseMarket");
  }
  function fetchStorewData(pagination: string) {
    //push data to storeMarkets
    console.log("updateStoreMarket");
  }
  async function fetchData() {
    setAllMarkets([
      {
        marketId: 0,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 5760,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Advertise,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 1,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 2,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },

      {
        marketId: 3,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Advertise,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 4,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Advertise,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 5,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 6,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 7,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Advertise,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 8,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },

      {
        marketId: 9,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
    ]);
    setAdvertiseMarkets([
      {
        marketId: 0,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 5760,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Advertise,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 1,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Advertise,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
    ]);
    setStoreMarkets([
      {
        marketId: 0,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 5760,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
      {
        marketId: 1,
        bannerUrl: "/post.png",
        categorySection: [0, 1, 2],
        followers: 57600,
        fullname: "ahoora niazi",
        linkAddress: "",
        marketType: MarketType.Store,
        post: 80,
        profileUrl: "/no-profile.svg",
        rating: 4.9,
        username: "@ahoora.niazi",
      },
    ]);
  }
  useEffect(() => {
    if (session && !packageStatus(session)) router.push("/upgrade");
    fetchData();
  }, [session]);
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Home)}</title>
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
        <main className={styles.pincontainer}>
          {showFilter && (
            <Filter
              handleApplyFilter={() => {}}
              handleLeftVisible={() => {}}
              handleUnshowFilter={() => setShowFilter(false)}
              isLeftVisible={false}
              totalCount={0}
            />
          )}
          <div className={styles.all}>
            {!showFilter && (
              <img
                className={styles.backicon}
                src="/iconbox-filter.svg"
                title="ℹ️ Filter"
                alt="Filter"
                onClick={() => setShowFilter(true)}
              />
            )}
            <HeaderTitle
              titles={[
                t(LanguageKey.markethomeAllMarkets),
                t(LanguageKey.markethomeAdvertise),
                t(LanguageKey.markethomeStore),
              ]}
              handleSelectIndexItem={(marketType: SelectedMarketType) => {
                setMarketType(marketType);
              }}
              indexItem={marketType}
            />
            {marketType === SelectedMarketType.All && <AllMarket data={allMarkets} fetchAllData={fetchAllData} />}
            {marketType === SelectedMarketType.Advertise && (
              <Advertise fetchAdvertiseData={fetchAdvertiseData} data={advertiseMarkets} />
            )}
            {marketType === SelectedMarketType.Store && <Store fetchStorewData={fetchStorewData} data={storeMarkets} />}
          </div>
        </main>
      </>
    )
  );
};

export default MarketHome;
