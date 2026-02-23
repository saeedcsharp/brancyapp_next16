import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdvertisingTermsPopup from "../../components/advertise/popups/advertisingTermsPopup";
import BusinessHourPopup from "../../components/advertise/popups/businessHourPopup";
import TarrifPopup from "../../components/advertise/popups/tariffPopup";
import Modal from "../../components/design/modal";
import Aboutus from "../../components/market/myLink/abouts";
import Announcement from "../../components/market/myLink/announcement";
import Banner from "../../components/market/myLink/banner";
import ContactAndMap from "../../components/market/myLink/contactAndMap";
import DynamicFeatures from "../../components/market/myLink/dynamicFeatures";
import Faq from "../../components/market/myLink/faq";
import FeatureBox from "../../components/market/myLink/featureBox";
import LastVideo from "../../components/market/myLink/lastVideo";
import Link from "../../components/market/myLink/link";
import Menubar from "../../components/market/myLink/menubar";
import OnlineStreaming from "../../components/market/myLink/onlinestreaming";
import Reviews from "../../components/market/myLink/reviews";
import Loading from "../../components/notOk/loading";
import {
  NotifType,
  notify,
  ResponseType,
} from "../../components/notifications/notificationBox";
import { LoginStatus, packageStatus } from "../../helper/loadingStatus";
import { LanguageKey } from "../../i18n";
import { MethodType } from "../../helper/api";
import { FeatureType } from "../../models/market/enums";
import {
  IBusinessHour,
  IChannel,
  IFeatureBox,
  IFeatureInfo,
  ILiveChannel,
  IMyLink,
  ISmartLink,
  IVideoChannel,
  IWorkHourItem,
} from "../../models/market/myLink";
import styles from "./myLink.module.css";
import { clientFetchApi } from "../../helper/clientFetchApi";
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
  if (
    mediaLink.onlineStreaming.onlineStream &&
    mediaLink.onlineStreaming.isActive
  ) {
    featureArray.push({
      orderId: mediaLink.onlineStreaming.orderId,
      title: mediaLink.onlineStreaming.title,
      featureType: FeatureType.OnlineStream,
      isActive: mediaLink.onlineStreaming.isActive,
    });
  }
  // if (mediaLink.products) {
  //   featureArray.push({
  //     orderId: mediaLink.products.orderId,
  //     title: mediaLink.products.title,
  //     featureType: FeatureType.Products,
  //   });
  // }
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
function workHourCast(params: IWorkHourItem[] | null): IBusinessHour[] | null {
  if (!params) return null;
  let workOurs: IBusinessHour[] = [];
  const array = [0, 1, 2, 3, 4, 5, 6];
  for (let index = 0; index < array.length; index++) {
    const element = params.find((x) => x.weekDay == index);
    workOurs.push({
      dayName: index,
      timerInfo: element
        ? {
            endTime: element.endTime,
            startTime: element.beginTime,
          }
        : null,
    });
  }
  {
  }
  return workOurs;
}
function lastVideCast(params: IChannel | null) {
  if (!params) return null;
  if (
    !params.aparatChannel?.video &&
    !params.twitchChannel?.video &&
    !params.youtubeChannel?.video
  )
    return null;
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
function onlineStreamCast(params: IChannel | null) {
  if (!params) return null;
  if (
    !params.aparatChannel?.live &&
    !params.twitchChannel?.live &&
    !params.youtubeChannel?.live
  )
    return null;
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
  const [showTerms, setShowTerms] = useState(false);
  const [showTerrif, setShowTerrif] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [myLink, setMyLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (status === "unauthenticated" || !LoginStatus(session)) {
      router.push("/");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (session && !packageStatus(session)) router.push("/upgrade");
    const fetchData = async () => {
      // Don't fetch if already loaded or if session is not available
      if (myLink || !session || status !== "authenticated") return;

      setLoading(true);
      setError(null);
      try {
        const info = await clientFetchApi<string, ISmartLink>("/api/bio/GetMyLink", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
        if (info.succeeded) {
          let data: IMyLink = {
            announcement: info.value.announcement
              ? {
                  profileUrl: info.value.instagramer.profileUrl,
                  text: info.value.announcement.str,
                  featureType: FeatureType.Announcements,
                  orderId: info.value.featureOrders.orderItems.find(
                    (x) => x.featureType === FeatureType.Announcements
                  )!.orderId,
                  title: "announcement",
                  name: info.value.instagramer.username,
                  isActive: info.value.featureOrders.orderItems.find(
                    (x) => x.featureType === FeatureType.Announcements
                  )!.isActive,
                }
              : null,
            reviews: {
              featureType: FeatureType.Reviews,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.Reviews
              )!.orderId,
              title: "reviews",
              reviews: info.value.reviews,
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.Reviews
              )!.isActive,
            },
            onlineStreaming: {
              onlineStream: onlineStreamCast(info.value.channel),
              featureType: FeatureType.OnlineStream,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.OnlineStream
              )!.orderId,
              title: "onlineStreaming",
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.OnlineStream
              )!.isActive,
            },
            lastVideo: {
              lastVideo: lastVideCast(info.value.channel),
              featureType: FeatureType.LastVideo,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.LastVideo
              )!.orderId,
              title: "lastVideo",
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.LastVideo
              )!.isActive,
            },
            products: {
              featureType: FeatureType.Products,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.Products
              )!.orderId,
              title: "products",
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.Products
              )!.isActive,
            },
            timeline: {
              featureType: FeatureType.AdsTimeline,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.AdsTimeline
              )!.orderId,
              title: "timeline",
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.AdsTimeline
              )!.isActive,
            },
            faq: {
              featureType: FeatureType.QandABox,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.QandABox
              )!.orderId,
              title: "faq",
              faqs: info.value.faqs,
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.QandABox
              )!.isActive,
            },
            link: {
              featureType: FeatureType.LinkShortcut,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.LinkShortcut
              )!.orderId,
              title: "link",
              links: info.value.links,
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.LinkShortcut
              )!.isActive,
            },
            contactAndMap: {
              contact: info.value.contact,
              featureType: FeatureType.ContactAndMap,
              orderId: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.ContactAndMap
              )!.orderId,
              title: "contactAndMap",
              isActive: info.value.featureOrders.orderItems.find(
                (x) => x.featureType === FeatureType.ContactAndMap
              )!.isActive,
            },
            orderItems: info.value.featureOrders,
          };
          let featureBox: IFeatureBox = {
            adsView: 0,
            enemad: "enemad link",
            followers: info.value.instagramer.followerCount,
            isInfluencer: info.value.instagramer.isInfluencer,
            isShopper: info.value.instagramer.isShopper,
            rate: 0,
            salesSuccess: 0,
            teriif: info.value.influencerTeriffe,
            terms: info.value.terms,
            workHours: workHourCast(info.value.workHourItems),
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
        } else notify(info.info.responseType, NotifType.Warning);
      } catch (err: any) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status, myLink]);

  // Move all useMemo hooks before early returns
  const arrayDiv = useMemo(() => {
    if (!myLink) return [];
    return [
      {
        reactNode: (
          <Announcement data={myLink.data.announcement} key={"announcement"} />
        ),
        featureType: FeatureType.Announcements,
      },
      {
        reactNode: <Reviews data={myLink.data.reviews} key={"reviews"} />,
        featureType: FeatureType.Reviews,
      },
      {
        reactNode: (
          <OnlineStreaming
            data={myLink.data.onlineStreaming}
            key={"OnlineStreaming"}
          />
        ),
        featureType: FeatureType.OnlineStream,
      },
      {
        reactNode: <LastVideo data={myLink.data.lastVideo} key={"LastVideo"} />,
        featureType: FeatureType.LastVideo,
      },
      {
        reactNode: <Faq data={myLink.data.faq} key={"Faq"} />,
        featureType: FeatureType.QandABox,
      },
      {
        reactNode: <Link data={myLink.data.link} key={"link"} />,
        featureType: FeatureType.LinkShortcut,
      },
      {
        reactNode: (
          <ContactAndMap
            data={myLink.data.contactAndMap}
            key={"ContactAndMap"}
          />
        ),
        featureType: FeatureType.ContactAndMap,
      },
    ];
  }, [myLink]);

  const featurInfos = useMemo(() => {
    return myLink ? handleFeatureInfo(myLink.data) : [];
  }, [myLink]);

  const initialzeFeatureDiv = useMemo(() => {
    const tempArrayDiv: ReactNode[] = [];
    for (let index = 0; index < featurInfos.length; index++) {
      const element = featurInfos[index];
      const element1 = arrayDiv.find(
        (x) => x.featureType === element.featureType
      );
      if (element1) {
        tempArrayDiv.push(element1.reactNode);
      }
    }
    return tempArrayDiv;
  }, [featurInfos, arrayDiv]);

  function handleShowTerms() {
    setShowTerms(true);
  }
  function handleShowHours() {
    setShowHours(true);
  }
  function handleShowTerif() {
    setShowTerrif(true);
  }
  function removeMask() {
    setShowTerms(false);
    setShowHours(false);
    setShowTerrif(false);
  }

  if (status === "loading" || loading) return <Loading />;

  if (error) return <h1 style={{ color: "red" }}>{error}</h1>;
  if (!myLink)
    return <h1 className="title">{t(LanguageKey.pageStatistics_EmptyList)}</h1>;
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_MyLink)}</title>
          <meta
            name="description"
            content="Advanced Instagram post management tool"
          />
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
          {initialzeFeatureDiv.length > 0 && (
            <Menubar
              data={featurInfos}
              featureType={featurInfos[0].featureType}
            />
          )}
          <Banner data={myLink.bannerInfo} />
          {myLink.data.orderItems.isActiveFeatureBox && (
            <FeatureBox
              data={myLink.featureBox}
              key={"featureBox"}
              handleShowTerms={handleShowTerms}
              handleShowHours={handleShowHours}
              handleShowTerif={handleShowTerif}
            />
          )}
          {initialzeFeatureDiv.length > 0 && (
            <DynamicFeatures reactNodes={initialzeFeatureDiv} />
          )}
          <Aboutus data={myLink.bannerInfo} />
        </main>
        <Modal
          closePopup={removeMask}
          classNamePopup={"popup"}
          showContent={showTerms}>
          <AdvertisingTermsPopup
            removeMask={removeMask}
            data={(myLink.featureBox && myLink.featureBox.terms) || []}
          />
        </Modal>
        <Modal
          closePopup={removeMask}
          classNamePopup={"popup"}
          showContent={showTerrif}>
          <TarrifPopup
            teriif={myLink.featureBox && myLink.featureBox.teriif}
            removeMask={removeMask}
          />
        </Modal>
        <Modal
          closePopup={removeMask}
          classNamePopup={"popup"}
          showContent={showHours}>
          <BusinessHourPopup
            businessInfo={
              (myLink.featureBox && myLink.featureBox.workHours) || []
            }
            removeMask={removeMask}
          />
        </Modal>
      </>
    )
  );
};

export default MyLink;
