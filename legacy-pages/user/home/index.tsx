import Head from "next/head";
import router, { useRouter } from "next/router"; // Add this import
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import { useSession } from "next-auth/react";
import Link from "next/link";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import { MethodType } from "saeed/helper/api";
import { IUserInfo } from "saeed/models/userPanel/login";
import { IShortShop } from "saeed/models/userPanel/orders";
import { IFavoriteProduct } from "saeed/models/userPanel/shop";
import "swiper/css";
import "swiper/css/free-mode";
import styles from "./index.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const orderSteps = [
  {
    icon: (
      <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 41">
        <path d="M26.52 13.33c0 1.77-.68 3.47-1.9 4.72a6.45 6.45 0 0 1-9.23 0 6.7 6.7 0 0 1-1.91-4.72m-7.12-1-1.15 14c-.24 3.01-.36 4.52.13 5.68A5 5 0 0 0 7.5 34.4c1.09.6 2.56.6 5.51.6H27c2.95 0 4.43 0 5.51-.6a5 5 0 0 0 2.16-2.4c.5-1.15.37-2.66.13-5.66l-1.15-14c-.2-2.6-.31-3.89-.87-4.87a5 5 0 0 0-2.11-1.98C29.66 5 28.38 5 25.84 5H14.16c-2.54 0-3.82 0-4.82.49a5 5 0 0 0-2.1 1.98c-.57.98-.67 2.28-.88 4.87" />
      </svg>
    ),
    label: LanguageKey.Storeproduct_incart,
    title: "ℹ️ In Cart",
    count: 0,
    onClick: () => router.push("/user/orders/cart"),
  },
  {
    icon: (
      <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
        <path d="M18 34.5h-4.5A6.3 6.3 0 0 1 7 28.3V13.7c0-3.4 2.9-6.2 6.5-6.2m11.5 0c3.9 0 7 2.9 7 6.4v7.6M31 35a6 6 0 0 1-10-4.5m2-4.5a6 6 0 0 1 10 4.5m-10-20h-7c-1 0-2-1.1-2-2.5V7c0-1.4 1-2.5 2-2.5h7c1 0 2 1.1 2 2.5v1c0 1.4-1 2.5-2 2.5" />
      </svg>
    ),
    label: LanguageKey.Storeproduct_inQueue,
    title: "ℹ️ in Queue",
    count: 0,
    onClick: () => router.push("/user/orders/inQueue"),
  },
  {
    icon: (
      <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
        <path d="M21.67 16h8m-8 10h8M10 25.5l1.59 1.5L15 24m-5-8.5 1.59 1.5L15 14m.2 23h9.6c8 0 11.2-3.3 11.2-11.55v-9.9C36 7.3 32.8 4 24.8 4h-9.6C7.2 4 4 7.3 4 15.55v9.9C4 33.7 7.2 37 15.2 37" />
      </svg>
    ),
    label: LanguageKey.Storeproduct_inprogress,
    title: "ℹ️ In Progress",
    count: 0,
    onClick: () => router.push("/user/orders/inProgress"),
  },
  {
    icon: (
      <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
        <path d="M10.441 28.107h5M5 13h29M22.5 5l1.5 8.309V22l-4.51-1.607L15 22v-8.691L16.5 5M6.257 7.925 4.8 11.458a10.3 10.3 0 0 0-.777 3.897L4 28.203c-.01 3.96 1.845 6.761 5.936 6.77L29.068 35c4.089.01 5.9-2.78 5.91-6.74L35 15.388a10.2 10.2 0 0 0-.788-3.959l-1.46-3.516C32.02 6.154 30.256 5 28.298 5H10.713C8.751 5 6.985 6.158 6.257 7.925" />
      </svg>
    ),
    label: LanguageKey.Storeproduct_pickingup,
    title: "ℹ️ Picking Up",
    count: 0,
    onClick: () => router.push("/user/orders/pickingup"),
  },
  {
    icon: (
      <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
        <path d="M20 23h1.6c1.9 0 3.4-1.5 3.4-3.3V3H9.9C7.3 3 4 4 3 7m0 21c0 2.8 2.5 5.3 5.3 5.3h1.6c0-1.8 1.8-3.3 3.6-3.3s3.5 1.5 3.5 3.3h6c0-1.8 1.6-3.3 3.4-3.3 1.9 0 3.6 1.5 3.6 3.3h1.4c2.7 0 4.6-2.2 4.6-5v-5h-4.6q-1.6-.1-1.7-1.6v-5Q30 15 31.4 15h2.1m0 0-2.8-5.3Q29.7 8 27.8 8H25m8.5 7h-2q-1.4.1-1.5 1.6v4.8q.1 1.5 1.5 1.6H36v-3.2zM3 13h9m-9 5h6m-6 5h3m11 10.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m13 0a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
      </svg>
    ),
    label: LanguageKey.Storeproduct_sent,
    title: "ℹ️ Sent",
    count: 0,
    onClick: () => router.push("/user/orders/sent"),
  },
  {
    icon: (
      <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
        <path d="M5 33.49c1.98 0 3.79.02 5.75.4 5.07 1 9.7 1.94 14.71 0 3.6-1.38 5.95-3.84 8.61-6.5a3.14 3.14 0 0 0 0-4.45 3.2 3.2 0 0 0-4.13-.29c-2.46 1.84-5.26 4.27-8.5 4.35-1.39.03-2.58 0-4 0h2.62c1.87 0 3.39-1.29 3.39-3.08 0-1.49-1.06-2.68-2.56-3.04-2.16-.52-4.3-.93-6.56-.88-3.56.09-6.06 2-8.88 3.8M32.2 22l-.02-10.85c0-3.96-1.92-6.16-5.84-6.15l-12.4.03c-3.91 0-5.74 2.22-5.74 6.18v9.77M23.43 5l.02 8.98-3.49-1.09-3.5 1.11-.01-8.97" />
      </svg>
    ),
    label: LanguageKey.Storeproduct_delivered,
    title: "ℹ️ Delivered",
    count: 0,
    onClick: () => router.push("/user/orders/delivered"),
  },
  {
    icon: (
      <svg className={styles.menuicon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 41">
        <path d="m22.3 29.4-4.6-4.6m4.6.1-4.6 4.6m-3-25.7-6 6m16.6-6 6 6m-28 3.8c0-3.1 1.7-3.3 3.7-3.3h26c2 0 3.7.2 3.7 3.3 0 3.6-1.7 3.3-3.7 3.3H7c-2 0-3.7.3-3.7-3.3Zm4.9 18c.5 3.2 1.8 5.6 6.6 5.6h10c5.2 0 6-2.3 6.6-5.4l2.8-14.6m-28.4 0 1.2 7" />
      </svg>
    ),
    label: LanguageKey.Storeproduct_failed,
    title: "ℹ️ Failed",
    count: 0,
    onClick: () => router.push("/user/orders/failed"),
  },
];

function Markets() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const router = useRouter(); // Add this line
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [greetingMessage, setGreetingMessage] = useState("");
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [instagramUsername, setInstagramUsername] = useState<string>("");
  const [saved, setSaved] = useState<IFavoriteProduct>({
    favoriteProducts: [],
    nextMaxId: null,
  });
  const [explore, setExplore] = useState<IShortShop[]>([]);
  // پیام‌های خوشامدگویی بر اساس ساعت
  const greetings = [
    {
      condition: (hour: number) => hour >= 4 && hour < 8,
      message: () =>
        `${t(LanguageKey.greeting1)} ${userInfo && userInfo.fullName ? userInfo.fullName + "!" : ""} ${t(
          LanguageKey.greetingtext1
        )}`,
    },
    {
      condition: (hour: number) => hour >= 8 && hour < 10,
      message: () =>
        `${t(LanguageKey.greeting2)} ${userInfo && userInfo.fullName ? userInfo.fullName + "!" : ""} ${t(
          LanguageKey.greetingtext2
        )}`,
    },
    {
      condition: (hour: number) => hour >= 10 && hour < 12,
      message: () =>
        `${t(LanguageKey.greeting3)} ${userInfo && userInfo.fullName ? userInfo.fullName + "!" : ""} ${t(
          LanguageKey.greetingtext3
        )}`,
    },
    {
      condition: (hour: number) => hour >= 12 && hour < 15,
      message: () =>
        `${t(LanguageKey.greeting4)} ${userInfo && userInfo.fullName ? userInfo.fullName + "!" : ""} ${t(
          LanguageKey.greetingtext4
        )}`,
    },
    {
      condition: (hour: number) => hour >= 15 && hour < 19,
      message: () =>
        `${t(LanguageKey.greeting5)} ${userInfo && userInfo.fullName ? userInfo.fullName + "!" : ""} ${t(
          LanguageKey.greetingtext5
        )}`,
    },
    {
      condition: (hour: number) => hour >= 19 && hour < 23,
      message: () =>
        `${t(LanguageKey.greeting6)} ${userInfo && userInfo.fullName ? userInfo.fullName + "!" : ""} ${t(
          LanguageKey.greetingtext6
        )}`,
    },
    {
      condition: (hour: number) => hour >= 23 || hour < 4,
      message: () =>
        `${t(LanguageKey.greeting7)} ${userInfo && userInfo.fullName ? userInfo.fullName + "!" : ""} ${t(
          LanguageKey.greetingtext7
        )}`,
    },
  ];
  const fakeServerResponse = async (): Promise<{ isNewUser: boolean }> => {
    return new Promise((resolve) => setTimeout(() => resolve({ isNewUser: false }), 500));
  };
  async function fetchData() {
    try {
      const [res, saveRes, explorRes] = await Promise.all([
        clientFetchApi<boolean, IUserInfo>("/api/account/GetTitleInfo", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
        clientFetchApi<boolean, IFavoriteProduct>("/api/shop/GetFavoriteProducts", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
        clientFetchApi<boolean, IShortShop[]>("/api/shop/GetExplorer", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
      ]);
      if (res.succeeded) {
        setUserInfo(res.value);
        setLoading(false);
        setInstagramUsername(res.value.username);
      } else notify(res.info.responseType, NotifType.Warning);
      if (saveRes.succeeded) {
        console.log("Saved Products:", saveRes.value);
        setSaved(saveRes.value);
      }
      if (explorRes.succeeded) setExplore(explorRes.value);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (!session) return;
    fetchData();
    (async () => setIsNewUser((await fakeServerResponse()).isNewUser))();
  }, [session]);
  useEffect(() => {
    if (isNewUser === null) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const getGreeting = () => {
      const hour = new Date().getHours();
      const matchedGreeting = greetings.find(({ condition }) => condition(hour));
      return matchedGreeting ? matchedGreeting.message() : "";
    };
    const updateMessage = () => {
      setGreetingMessage(getGreeting());
      const timeToNextMinute = (60 - new Date().getSeconds()) * 1000;
      timeoutId = setTimeout(updateMessage, timeToNextMinute);
    };
    updateMessage();
    return () => clearTimeout(timeoutId);
  }, [isNewUser]);
  if (session && session.user.currentIndex > -1) router.push("/");
  return (
    session?.user.currentIndex === -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.Dashboard)}</title>
          <meta name="description" content="Advanced Instagram post management tool" />
          <meta name="theme-color"></meta>
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app" />
          {/* Add other meta tags as needed */}
        </Head>
        {/* head for SEO */}
        <main id="mainContent">
          <header className={styles.header} role="banner">
            <span>{t(LanguageKey.welcomeToBrancy)}</span>
            {greetingMessage && <span>{greetingMessage}</span>}
          </header>
          <main className={styles.pinContainer}>
            {loading && <Loading />}
            {!loading && (
              <>
                {" "}
                <div className={styles.dashboard}>
                  <div className={styles.content}>
                    <div className={styles.status}>
                      <div className={styles.profile}>
                        <div className="instagramprofile" role="contentinfo">
                          <img
                            loading="lazy"
                            decoding="async"
                            className="instagramimage"
                            alt="Instagram profile"
                            src={baseMediaUrl + userInfo!.profileUrl}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/no-profile.svg";
                            }}
                          />
                          <div className={styles.instagramprofile}>
                            {userInfo?.fullName && <div className={styles.instagramname}>{userInfo?.fullName}</div>}
                            <div className="instagramid">
                              {userInfo !== undefined && userInfo?.username ? `@${userInfo?.username}` : ""}{" "}
                              <span className="IDgray">
                                ID:{" "}
                                {Array.isArray(session?.user.instagramerIds)
                                  ? session?.user.instagramerIds.join(", ")
                                  : session?.user.instagramerIds ?? "N/A"}
                              </span>
                            </div>
                            <div className={`${styles.explain} translate`}>+{userInfo?.phoneNumber}</div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.quickmenu}>
                        <div className={styles.path}></div>
                        <div className="explain">{t(LanguageKey.userpanel_yourorders)}</div>
                        <Swiper className={styles.swiper} slidesPerView="auto" spaceBetween={30} freeMode>
                          {orderSteps.map((step, index) => (
                            <SwiperSlide key={index} className={styles.orderstep} onClick={step.onClick}>
                              {step.icon}
                              <div className="headerandinput">
                                <span className={styles.step}>{t(step.label)}</span>
                                <div className="title">{step.count}</div>
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                    <div className={styles.savedItems}>
                      <div className="explain">{t(LanguageKey.userpanel_SavedProducts)}</div>
                      {saved.favoriteProducts.length > 0 ? (
                        <Swiper className={styles.swiper} slidesPerView="auto" spaceBetween={15} freeMode>
                          {saved.favoriteProducts.map((saved, index) => (
                            <SwiperSlide
                              onClick={() => {
                                router.push(
                                  `/user/shop/${saved.shortProduct.instagramerId}/product/${saved.favoriteCardCount.productId}`
                                );
                              }}
                              key={index}
                              className={styles.saved}>
                              <img
                                loading="lazy"
                                decoding="async"
                                title={`ℹ️ ${saved.shortProduct.title}`}
                                src={baseMediaUrl + saved.shortProduct.thumbnailMediaUrl}
                                alt={saved.shortProduct.title}
                              />
                              <div className={styles.productdetail}>
                                <div className="headerandinput">
                                  <div className="title" style={{ fontSize: "var(--font-14)" }}>
                                    {saved.shortProduct.title}
                                  </div>

                                  <span className={styles.step}>
                                    <PriceFormater
                                      pricetype={saved.shortProduct.priceType}
                                      fee={saved.shortProduct.minDiscountPrice}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </span>
                                </div>
                                <div className={styles.store}>
                                  <img
                                    loading="lazy"
                                    decoding="async"
                                    className={styles.storepicture}
                                    title={""}
                                    src={baseMediaUrl + saved.shopInfo.profileUrl}
                                    alt={"Store"}
                                  />
                                  <div className="explain">{saved.shopInfo.username}</div>
                                  {/* {saved.shopInfo.fullName && (
                                    <div className="explain">
                                      {saved.shopInfo.fullName}
                                    </div>
                                  )} */}
                                </div>
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <div className={styles.emptySwiper}>{t(LanguageKey.userpanel_NoSavedProducts)}</div>
                      )}
                    </div>
                  </div>

                  <div className={styles.explore}>
                    <div className={styles.exploreheaderparent}>
                      <div className={styles.exploreHeader}>
                        <div className="title">{t(LanguageKey.userpanel_Startexplore)}</div>
                        <div className={styles.gradientText}>{t(LanguageKey.userpanel_Startexploreexplain)}</div>
                      </div>
                      <div
                        onClick={() => {
                          router.push("/user/shop");
                        }}
                        className={styles.uiverse}>
                        <div className={styles.wrapper}>
                          {[...Array(5)].map((_, index) => (
                            <div key={index} className={styles[`circle${index + 1}`]} />
                          ))}
                          <svg
                            width="24"
                            height="20"
                            viewBox="0 0 24 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M23 10H2m12-9s9 5 9 9-9 8-9 8"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <Swiper className={styles.swiper} slidesPerView="auto" spaceBetween={10} freeMode>
                      {explore.map((explore, index) => (
                        <SwiperSlide
                          onClick={() => router.push(`/user/shop/${explore.instagramerId}`)}
                          key={index}
                          className={styles.exploreitem}>
                          <img
                            loading="lazy"
                            decoding="async"
                            style={{
                              aspectRatio: "1/1",
                              height: "150px",
                              width: "150px",
                              borderRadius: "var(--br15)",
                              objectFit: "cover",
                            }}
                            title={`ℹ️ ${explore.username}`}
                            src={baseMediaUrl + explore.bannerUrl}
                            alt={explore.username}
                          />
                          <div className={styles.productdetail}>
                            <div className={styles.store}>
                              <img
                                loading="lazy"
                                decoding="async"
                                className={styles.storepicture}
                                title={""}
                                src={baseMediaUrl + explore.profileUrl}
                                alt={"Store"}
                              />
                              {explore.fullName && <div className="title">{explore.fullName}</div>}
                            </div>
                            <div className="explain">{explore.productCount}</div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
                <aside className={styles.upgradeBox} aria-label="Upgrade Options">
                  <div className={styles.upgradeBoxsvg} />

                  <span className={styles.upgradespan}>{t(LanguageKey.userpanel_UseInstagram)}</span>
                  <div className={styles.upgradeflex}>
                    <Link href={"/user/instagramerLogin"} className={`${styles.upgradebtn} translate`}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`${styles.hover} ${styles[`bt${i + 1}`]}`}></div>
                      ))}
                      <button
                        className={`${styles.button} ${styles.addaddress}`}
                        style={{ color: "var(--color-firoze)" }}>
                        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                          <path
                            d="M47 29a22 22 0 0 1-16-16l-1-3-1 3a22 22 0 0 1-16 16l-3 1 3 1a22 22 0 0 1 16 16l1 3 1-3a22 22 0 0 1 16-16l3-1z"
                            fill="var(--color-firoze)"
                          />
                        </svg>
                        {t(LanguageKey.userpanel_FreeProPanel)}
                      </button>
                    </Link>

                    {/* <div className={`${styles.upgradebtn} translate`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.hover} ${
                        styles[`bt${i + 1}`]
                      }`}></div>
                  ))}
                  <button
                    className={styles.button}
                    style={{ color: "var(--color-light-yellow)" }}>
                    <svg
                      height="80"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 64 60">
                      <path
                         d="M45 20q0-4 5-5-4-1-5-5-1 4-4 5 4 1 4 5m0 30q0-4 5-5-4 0-5-4-1 4-4 4 4 1 4 5m2-21a23 23 0 0 1-16-16l-1-4-1 4a23 23 0 0 1-16 16l-4 1 3 1a23 23 0 0 1 17 17l1 3 1-3a23 23 0 0 1 16-17l4-1zm9 4q1-7 8-8-7-1-8-9-1 8-9 9 8 1 9 8"
                        fill="var(--color-light-yellow)"
                      />
                    </svg>

                    {t(LanguageKey.userpanel_Premiumaccount)}
                  </button>
                </div> */}
                  </div>
                  <div className={styles.freeexplain}>
                    <span>{t(LanguageKey.userpanel_daysFreePremium)} </span>
                    <span>{t(LanguageKey.userpanel_LimitedOffer)}</span>
                  </div>

                  <div className={`${styles.space} translate`}>
                    {[...Array(7)].map((_, i) => (
                      <span key={i} className={styles[`star${i + 1}`]}></span>
                    ))}
                  </div>
                </aside>
              </>
            )}
          </main>
        </main>
      </>
    )
  );
}

export default Markets;
