import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import ShopPage from "brancy/components/userPanel/shop/shop";
import findSystemLanguage from "brancy/helper/findSystemLanguage";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { SelectedMarketType } from "brancy/models/market/enums";
import { IFullShop } from "brancy/models/userPanel/shop";
import styles from "./shop.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const StorePage = () => {
  //  return <Soon />;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [storeMarkets, setStoreMarkets] = useState<IFullShop[]>([]);
  const [marketType, setMarketType] = useState<SelectedMarketType>(SelectedMarketType.All);
  function fetchStorewData(pagination: string) {
    //push data to storeMarkets
    console.log("updateStoreMarket");
  }
  async function fetchData() {
    try {
      const res = await clientFetchApi<boolean, IFullShop[]>("/api/shop/searchshop", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "query", value: undefined },
        { key: "languageId", value: findSystemLanguage().toString() },
      ], onUploadProgress: undefined });
      console.log("shop", res.value);
      if (res.succeeded) {
        setStoreMarkets(res.value);
        setLoading(false);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (session === undefined) return;
    fetchData();
  }, [session]);
  if (session && session.user.currentIndex > -1) router.push("/");
  return (
    session &&
    session.user.currentIndex === -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.sidebar_Stores)}</title>
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
        <main className={styles.pincontainer}>
          <div className={styles.header}>
            <div className="title">{t(LanguageKey.userpanel_Startexplore)}</div>
            <div className="title">{t(LanguageKey.userpanel_Startexploreexplain)}</div>
          </div>
          {loading && <Loading />}
          {!loading && (
            <div className={`${styles.all} ` + (showFilter ? styles.hideAll : styles.showAll)}>
              <ShopPage fetchStorewData={fetchStorewData} data={storeMarkets} />
            </div>
          )}
        </main>
      </>
    )
  );
};

export default StorePage;
