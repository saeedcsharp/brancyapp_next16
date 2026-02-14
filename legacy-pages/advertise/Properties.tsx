import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdsOption from "saeed/components/advertise/properties/adsOption";
import AdvertisingTerms from "saeed/components/advertise/properties/advertisingTerms";
import BusinessHours from "saeed/components/advertise/properties/businessHours";
import Notifications from "saeed/components/advertise/properties/notifications";
import EditBusinessHours from "saeed/components/advertise/properties/popups/editBusinessHours";
import EditTariff from "saeed/components/advertise/properties/popups/editTariff";
import Tariff from "saeed/components/advertise/properties/tariff";
import UserReport from "saeed/components/advertise/properties/userReport";
import Modal from "saeed/components/design/modal";
import NotAdvertiser from "saeed/components/notOk/notAdvertiser";
import { changePositionToFixed, changePositionToRelative } from "saeed/helper/changeMarketAdsStyle";
import { LanguageKey } from "saeed/i18n";
import {
  BusinessDay,
  IAdsOption,
  IAdvertisingTerms,
  IBusinessHour,
  INotifications,
  ITariff,
} from "saeed/models/advertise/peoperties";
const Properties = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [ShowTariffPopup, setShowTariffPopup] = useState(false);
  const [ShowBusinessHoursPopup, setShowBusinessHoursPopup] = useState(false);
  const [advertiseTerms, setAdvertiseTerms] = useState<IAdvertisingTerms>({
    term1: "string",
    activeTerm1: false,
    term2: "string",
    activeTerm2: false,
    term3: "string",
    activeTerm3: false,
    term4: "string",
    activeTerm4: false,
  });
  const [tariif, setTariif] = useState<ITariff>({
    basicTariif: {
      post: { fullDayPrice: 0, semiDayPrice: 0 },
      story: { fullDayPrice: 0, semiDayPrice: 0 },
    },
    campaign: {
      post: { fullDayPrice: 0 },
      story: { fullDayPrice: 0 },
    },
    todayTariff: {
      post: { fullDayPrice: 0, semiDayPrice: 0 },
      story: { fullDayPrice: 0, semiDayPrice: 0 },
    },
  });
  const [businessHours, setBusinessHours] = useState<IBusinessHour[]>([]);
  const [notification, setNotification] = useState<INotifications>({
    email: false,
    instagramDirect: false,
    sms: false,
    systemMessage: false,
    systemNotification: false,
  });
  const removeMask = () => {
    changePositionToRelative();
    setShowBusinessHoursPopup(false);
    setShowTariffPopup(false);
  };
  const handleShowTarrif = () => {
    changePositionToFixed();
    setShowTariffPopup(true);
  };
  const handleShowBusinessHour = () => {
    changePositionToFixed();
    setShowBusinessHoursPopup(true);
  };
  const saveTariif = (tariif: ITariff) => {
    //Api to save tarrif data
    //If Api is successful
    setTariif({
      basicTariif: {
        post: {
          fullDayPrice: tariif.basicTariif.post.fullDayPrice,
          semiDayPrice: tariif.basicTariif.post.semiDayPrice,
        },
        story: {
          fullDayPrice: tariif.basicTariif.story.fullDayPrice,
          semiDayPrice: tariif.basicTariif.story.semiDayPrice,
        },
      },
      campaign: {
        post: {
          fullDayPrice: tariif.campaign.post.fullDayPrice,
        },
        story: {
          fullDayPrice: tariif.campaign.story.fullDayPrice,
        },
      },
      todayTariff: {
        post: {
          fullDayPrice: tariif.todayTariff.post.fullDayPrice,
          semiDayPrice: tariif.todayTariff.post.semiDayPrice,
        },
        story: {
          fullDayPrice: tariif.todayTariff.story.fullDayPrice,
          semiDayPrice: tariif.todayTariff.story.semiDayPrice,
        },
      },
    });
    removeMask();
  };
  const saveBusinessHour = (info: IBusinessHour[]) => {
    //Api to save BusinessHour data
    //If Api is successful
    setBusinessHours(info);
    removeMask();
  };
  const [adsOption, setAdsOption] = useState<IAdsOption>({
    AdsPageNumber: 0,
    concurrentAds: 0,
    capmpaign: false,
  });
  const fetchData = async () => {
    //Api to get properties data
    setAdvertiseTerms({
      term1: "string",
      activeTerm1: false,
      term2: "string",
      activeTerm2: false,
      term3: "string",
      activeTerm3: false,
      term4: "string",
      activeTerm4: false,
    });
    setTariif({
      basicTariif: {
        post: { fullDayPrice: 1200, semiDayPrice: 1200 },
        story: { fullDayPrice: 1300, semiDayPrice: 1300 },
      },
      campaign: {
        post: { fullDayPrice: 1600 },
        story: { fullDayPrice: 1600 },
      },
      todayTariff: {
        post: { fullDayPrice: 1400, semiDayPrice: 1400 },
        story: { fullDayPrice: 1500, semiDayPrice: 1500 },
      },
    });
    setBusinessHours([
      {
        dayName: BusinessDay.Monday,
        timerInfo: { endTime: 68400, startTime: 27000 },
      },
      {
        dayName: BusinessDay.Tuesday,
        timerInfo: null,
      },
      {
        dayName: BusinessDay.Wednesday,
        timerInfo: { endTime: 72000, startTime: 30600 },
      },
      {
        dayName: BusinessDay.Thursday,
        timerInfo: { endTime: 77400, startTime: 32400 },
      },
      {
        dayName: BusinessDay.Friday,
        timerInfo: { endTime: 79225, startTime: 0 },
      },
      {
        dayName: BusinessDay.Saturday,
        timerInfo: { endTime: 82800, startTime: 39600 },
      },
      {
        dayName: BusinessDay.Sunday,
        timerInfo: { endTime: 66600, startTime: 23400 },
      },
    ]);
    setNotification({
      email: true,
      instagramDirect: true,
      sms: true,
      systemMessage: true,
      systemNotification: true,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    <>
      {session && session!.user.currentIndex !== -1 && (
        <>
          {/* head for SEO */}
          <Head>
            {" "}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <title>Bran.cy ▸ {t(LanguageKey.navbar_Properties)}</title>
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
              <main className="pinContainer">
                <AdvertisingTerms advertisinfTerms={advertiseTerms} />
                <Tariff tariif={tariif} setShowTariffPopup={handleShowTarrif} />
                <BusinessHours businessInfo={businessHours} setShowBusinessHoursPopup={handleShowBusinessHour} />
                <UserReport />
                <AdsOption adsOption={adsOption} />
                <Notifications data={notification} />
              </main>
            </>
          )}
        </>
      )}
      <Modal classNamePopup="popup" closePopup={removeMask} showContent={ShowTariffPopup}>
        <EditTariff tariif={tariif} saveTariift={saveTariif} removeMask={removeMask} />
      </Modal>
      <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={ShowBusinessHoursPopup}>
        <EditBusinessHours businessInfo={businessHours} removeMask={removeMask} saveBusinessHour={saveBusinessHour} />
      </Modal>
    </>
  );
};

export default Properties;
