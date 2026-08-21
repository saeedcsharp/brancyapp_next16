import BusinessHourPopup from "brancy/components/market/myLink/popups/businessHourPopup";
import BusinessTermsPopup from "brancy/components/market/myLink/popups/businessTermsPopup";
import TarrifPopup from "brancy/components/advertise/popups/tariffPopup";
import Modal from "brancy/components/design/modal";
import Aboutus from "brancy/components/market/myLink/abouts";
import Announcement from "brancy/components/market/myLink/announcement";
import Banner from "brancy/components/market/myLink/banner";
import ContactAndMap from "brancy/components/market/myLink/contactAndMap";
import DynamicFeatures from "brancy/components/market/myLink/dynamicFeatures";
import Faq from "brancy/components/market/myLink/faq";
import FeatureBox from "brancy/components/market/myLink/featureBox";
import LastVideo from "brancy/components/market/myLink/lastVideo";
import Link from "brancy/components/market/myLink/link";
import LotteryPopup from "brancy/components/market/myLink/lotteryPopup";
import Menubar from "brancy/components/market/myLink/menubar";
import OnlineStreaming from "brancy/components/market/myLink/onlinestreaming";
import Product from "brancy/components/market/myLink/product";
import Reviews from "brancy/components/market/myLink/reviews";
import Loading from "brancy/components/notOk/loading";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LoginStatus, packageStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { FeatureType, LotteryStatus, PartnerRole } from "brancy/models/enums";
import {
  IFeatureBox,
  IFeatureInfo,
  ILiveChannel,
  IMyLink,
  IMyLinkChannel,
  ISmartLink,
  IVideoChannel,
} from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./myLink.module.css";
function handleFeatureInfo(mediaLink: IMyLink) {
  var featureArray: IFeatureInfo[] = [];
  if (mediaLink.announcement && mediaLink.announcement.isActive) {
    featureArray.push({
      orderId: mediaLink.announcement.orderId,
      title: mediaLink.announcement.title,
      featureType: FeatureType.Announcements,
      isActive: mediaLink.announcement.isActive,
    });
  }
  if (mediaLink.contactAndMap && mediaLink.contactAndMap.isActive) {
    featureArray.push({
      orderId: mediaLink.contactAndMap.orderId,
      title: mediaLink.contactAndMap.title,
      featureType: FeatureType.ContactAndMap,
      isActive: mediaLink.contactAndMap.isActive,
    });
  }
  if (mediaLink.lastVideo.lastVideo && mediaLink.lastVideo.isActive) {
    featureArray.push({
      orderId: mediaLink.lastVideo.orderId,
      title: mediaLink.lastVideo.title,
      featureType: FeatureType.LastVideo,
      isActive: mediaLink.lastVideo.isActive,
    });
  }
  if (mediaLink.faq && mediaLink.faq.isActive) {
    featureArray.push({
      orderId: mediaLink.faq.orderId,
      title: mediaLink.faq.title,
      featureType: FeatureType.QandABox,
      isActive: mediaLink.faq.isActive,
    });
  }
  if (mediaLink.link && mediaLink.link.isActive) {
    featureArray.push({
      orderId: mediaLink.link.orderId,
      title: mediaLink.link.title,
      featureType: FeatureType.LinkShortcut,
      isActive: mediaLink.link.isActive,
    });
  }
  if (mediaLink.onlineStreaming.onlineStream && mediaLink.onlineStreaming.isActive) {
    featureArray.push({
      orderId: mediaLink.onlineStreaming.orderId,
      title: mediaLink.onlineStreaming.title,
      featureType: FeatureType.OnlineStream,
      isActive: mediaLink.onlineStreaming.isActive,
    });
  }
  if (mediaLink.products) {
    featureArray.push({
      orderId: mediaLink.products.orderId,
      title: mediaLink.products.title,
      featureType: FeatureType.Products,
      isActive: mediaLink.products.isActive,
    });
  }
  if (mediaLink.reviews && mediaLink.reviews.isActive) {
    featureArray.push({
      orderId: mediaLink.reviews.orderId,
      title: mediaLink.reviews.title,
      featureType: FeatureType.Reviews,
      isActive: mediaLink.reviews.isActive,
    });
  }
  // if (mediaLink.timeline) {
  //   featureArray.push({
  //     orderId: mediaLink.timeline.orderId,
  //     title: mediaLink.timeline.title,
  //     featureType: FeatureType.AdsTimeline,
  //   });
  // }
  featureArray.sort((a, b) => a.orderId - b.orderId);
  return featureArray;
}
// function workHourCast(params: IWorkHourItem[] | null): IBusinessHour[] | null {
//   if (!params) return null;
//   return Array.from({ length: 7 }, (_, dayName) => {
//     const workHour = params.find((item) => item.weekDay === dayName);
//     return {
//       beginTime: workHour?.beginTime ?? null,
//       endTime: workHour?.endTime ?? null,
//       weekDay: dayName,
//       instagramerId: workHour?.instagramerId ?? null,
//     };
//   });
// }
function lastVideCast(params: IMyLinkChannel | null) {
  if (!params) return null;
  if (!params.aparatChannel?.video && !params.twitchChannel?.video && !params.youtubeChannel?.video) return null;
  const lastVideo: IVideoChannel = {
    aparatChannel: params.aparatChannel
      ? {
          embedVideo: params.aparatChannel.embedVideo,
          video: params.aparatChannel.video,
        }
      : null,
    twitchChannel: params.twitchChannel
      ? {
          embedVideo: params.twitchChannel.embedVideo,
          video: params.twitchChannel.video,
        }
      : null,
    youtubeChannel: params.youtubeChannel
      ? {
          embedVideo: params.youtubeChannel.embedVideo,
          video: params.youtubeChannel.video,
        }
      : null,
  };
  return lastVideo;
}
function onlineStreamCast(params: IMyLinkChannel | null) {
  if (!params) return null;
  if (!params.aparatChannel?.live && !params.twitchChannel?.live && !params.youtubeChannel?.live) return null;
  const onlineStream: ILiveChannel = {
    aparatChannel: params.aparatChannel
      ? {
          embedVideo: params.aparatChannel.embedVideo,
          live: params.aparatChannel.live,
        }
      : null,
    twitchChannel: params.twitchChannel
      ? {
          embedVideo: params.twitchChannel.embedVideo,
          live: params.twitchChannel.live,
        }
      : null,
    youtubeChannel: params.youtubeChannel
      ? {
          embedVideo: params.youtubeChannel.embedVideo,
          live: params.youtubeChannel.live,
        }
      : null,
  };
  return onlineStream;
}
const MyLink = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<"terms" | "tariff" | "hours" | "lotteryList" | null>(null);
  const [myLink, setMyLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Handle authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (status === "unauthenticated" || !session || !LoginStatus(session)) {
      router.replace("/");
      return;
    }
    if (session.user.currentIndex === -1) {
      router.replace("/user");
      return;
    }
    if (!packageStatus(session)) router.replace("/upgrade");
  }, [router, session, status]);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      // Don't fetch if already loaded or if session is not available
      if (
        !session ||
        status !== "authenticated" ||
        !LoginStatus(session) ||
        !packageStatus(session) ||
        session.user.currentIndex === -1
      ) {
        return;
      }
      if (!RoleAccess(session, PartnerRole.Bio)) {
        if (isActive) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const info = await clientFetchApi<string, ISmartLink>("/api/bio/GetMyLink", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        });
        if (!isActive) return;
        if (info.succeeded) {
          let data: IMyLink = {
            announcement: info.value.announcement
              ? {
                  profileUrl: info.value.instagramer.profileUrl,
                  text: info.value.announcement.str,
                  featureType: FeatureType.Announcements,
                  orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.Announcements)!
                    .orderId,
                  title: "announcement",
                  name: info.value.instagramer.username,
                  isActive: info.value.featureOrders.orderItems.find(
                    (x) => x.featureType === FeatureType.Announcements,
                  )!.isActive,
                }
              : null,
            reviews: {
              featureType: FeatureType.Reviews,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.Reviews)!.orderId,
              title: "reviews",
              reviews: info.value.reviews,
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.Reviews)!
                .isActive,
            },
            onlineStreaming: {
              onlineStream: onlineStreamCast(info.value.channel),
              featureType: FeatureType.OnlineStream,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.OnlineStream)!
                .orderId,
              title: "onlineStreaming",
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.OnlineStream)!
                .isActive,
            },
            lastVideo: {
              lastVideo: lastVideCast(info.value.channel),
              featureType: FeatureType.LastVideo,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.LastVideo)!
                .orderId,
              title: "lastVideo",
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.LastVideo)!
                .isActive,
            },
            products: {
              featureType: FeatureType.Products,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.Products)!.orderId,
              title: "products",
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.Products)!
                .isActive,
              productCards: info.value.shopperInfo.products,
              productCoupons: info.value.shopperInfo.productCoupons,
            },
            timeline: {
              featureType: FeatureType.AdsTimeline,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.AdsTimeline)!
                .orderId,
              title: "timeline",
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.AdsTimeline)!
                .isActive,
            },
            faq: {
              featureType: FeatureType.QandABox,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.QandABox)!.orderId,
              title: "faq",
              faqs: info.value.faqs,
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.QandABox)!
                .isActive,
            },
            link: {
              featureType: FeatureType.LinkShortcut,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.LinkShortcut)!
                .orderId,
              title: "link",
              links: info.value.links,
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.LinkShortcut)!
                .isActive,
            },
            contactAndMap: {
              contact: info.value.contact,
              featureType: FeatureType.ContactAndMap,
              orderId: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.ContactAndMap)!
                .orderId,
              title: "contactAndMap",
              isActive: info.value.featureOrders.orderItems.find((x) => x.featureType === FeatureType.ContactAndMap)!
                .isActive,
            },
            orderItems: info.value.featureOrders,
          };
          let featureBox: IFeatureBox = {
            adsView: null,
            enemad: "",
            followers: info.value.instagramer.followerCount,
            isInfluencer: info.value.instagramer.isInfluencer,
            isShopper: info.value.instagramer.isShopper,
            rate: null,
            salesSuccess: null,
            lotteries: info.value.lotteries.filter((lottery) => lottery.status === LotteryStatus.Ended).slice(0, 5),
            teriif: null,
            terms: info.value.terms,
            workHours: info.value.workHourItems,
          };
          let bannerInfo = {
            banners: info.value.banners,
            profile: {
              fullName: info.value.instagramer.fullname,
              profileUrl: info.value.instagramer.profileUrl,
              username: info.value.instagramer.username,
            },
            caption: info.value.caption,
          };
          setMyLink({ data, bannerInfo, featureBox });
          setLoading(false);
        } else {
          notify(info.info.responseType, NotifType.Warning);
        }
      } catch {
        if (!isActive) return;
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, [session, status]);

  // Move all useMemo hooks before early returns
  const initialzeFeatureDiv = useMemo(() => {
    if (!myLink) return [];
    const featureComponents = new Map<FeatureType, ReactNode>([
      [FeatureType.Announcements, <Announcement data={myLink.data.announcement} key="announcement" />],
      [FeatureType.Reviews, <Reviews data={myLink.data.reviews} key="reviews" />],
      [FeatureType.OnlineStream, <OnlineStreaming data={myLink.data.onlineStreaming} key="onlineStreaming" />],
      [FeatureType.LastVideo, <LastVideo data={myLink.data.lastVideo} key="lastVideo" />],
      [FeatureType.QandABox, <Faq data={myLink.data.faq} key="faq" />],
      [FeatureType.LinkShortcut, <Link data={myLink.data.link} key="link" />],
      [FeatureType.ContactAndMap, <ContactAndMap data={myLink.data.contactAndMap} key="contactAndMap" />],
      [
        FeatureType.Products,
        <Product data={myLink.data.products} username={myLink.bannerInfo.profile.username} key="products" />,
      ],
    ]);
    return handleFeatureInfo(myLink.data).flatMap((feature) => {
      const component = featureComponents.get(feature.featureType);
      return component ? [component] : [];
    });
  }, [myLink]);

  const featurInfos = useMemo(() => {
    if (!myLink) return [];
    return [
      {
        orderId: -1,
        title: "home",
        featureType: FeatureType.FeaturesBox,
        isActive: true,
      },
      ...handleFeatureInfo(myLink.data),
    ];
  }, [myLink]);

  const handleShowTerms = useCallback(() => setActiveModal("terms"), []);
  const handleShowHours = useCallback(() => setActiveModal("hours"), []);
  const handleShowTerif = useCallback(() => setActiveModal("tariff"), []);
  const handleShowLottery = useCallback(() => setActiveModal("lotteryList"), []);
  const removeMask = useCallback(() => setActiveModal(null), []);
  if (status === "loading" || loading) return <Loading />;
  if (!RoleAccess(session, PartnerRole.Bio)) return <NotAllowed />;
  if (!myLink) return <h1 className="title">{t(LanguageKey.pageStatistics_EmptyList)}</h1>;
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Biolink)}</title>
          <meta name="description" content="Manage your Brancy bio-link content and business profile." />
          <meta name="theme-color" content="#ffffff" />
          <meta name="robots" content="noindex, nofollow" />
          {/* Add other meta tags as needed */}
        </Head>
        {/* head for SEO */}
        <main className={styles.pincontainer}>
          <Banner data={myLink.bannerInfo} />
          {myLink && <Menubar data={featurInfos} featureType={FeatureType.FeaturesBox} />}
          {myLink.data.orderItems.isActiveFeatureBox && (
            <FeatureBox
              data={myLink.featureBox}
              key={"featureBox"}
              handleShowTerms={handleShowTerms}
              handleShowHours={handleShowHours}
              handleShowTerif={handleShowTerif}
              handleShowLottery={handleShowLottery}
            />
          )}
          {initialzeFeatureDiv.length > 0 && <DynamicFeatures reactNodes={initialzeFeatureDiv} />}
          <Aboutus data={myLink.bannerInfo} />
        </main>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={activeModal === "terms"}>
          <BusinessTermsPopup removeMask={removeMask} terms={(myLink.featureBox && myLink.featureBox.terms) || ""} />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={activeModal === "tariff"}>
          <TarrifPopup teriif={myLink.featureBox && myLink.featureBox.teriif} removeMask={removeMask} />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={activeModal === "hours"}>
          <BusinessHourPopup
            businessInfo={(myLink.featureBox && myLink.featureBox.workHours) || []}
            removeMask={removeMask}
          />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={activeModal === "lotteryList"}>
          <LotteryPopup lotteries={myLink.featureBox.lotteries} removeMask={removeMask} />
        </Modal>
      </>
    )
  );
};

export default MyLink;
