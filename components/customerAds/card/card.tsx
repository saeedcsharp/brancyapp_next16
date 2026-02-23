import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "brancy/components/customerAds/customerAds.module.css";
import HeaderTitle from "brancy/components/headerTitle/headerTitle";
import { BusinessDay } from "brancy/models/advertise/peoperties";
import { IAdvertiseSummary, IFullAdvertiser, SelectedCardContent } from "brancy/models/customerAds/customerAd";
import BusinessHour from "brancy/components/customerAds/card/business";
import Reviews from "brancy/components/customerAds/card/reviews";
import Terms from "brancy/components/customerAds/card/terms";
import UserProfile from "brancy/components/customerAds/card/userProfile";

function card(props: {
  selectedAdsId: number[];
  advertiserId: number;
  removeMask: () => void;
  handleAddToCard: (ad: IAdvertiseSummary) => void;
}) {
  const [selectedTabIndex, setSelectedTabIndex] = useState<SelectedCardContent>(SelectedCardContent.UserProfile);
  const [advertiser, setAdvertiser] = useState<IFullAdvertiser>({
    userProfile: {
      asvertiseId: 0,
      engage: 0,
      follower: 0,
      following: 0,
      postCount: 0,
      fullName: "",
      price: 0,
      profileUrl: "",
      rating: 0,
      reach: 0,
      terms: "",
      username: "",
    },
    businessHour: [],
    posts: [],
    reviews: [],
    terms: [],
  });
  const [activeAddCard, setActiveAddCard] = useState(props.selectedAdsId.find((x) => x === props.advertiserId));
  function handleAddToCard() {
    if (activeAddCard) return;
    var adSummary: IAdvertiseSummary = advertiser.userProfile;
    props.handleAddToCard(adSummary);
    props.removeMask();
  }
  useEffect(() => {
    //Api to get full advertiser
    var response: IFullAdvertiser = {
      userProfile: {
        asvertiseId: props.advertiserId,
        engage: 2872872,
        follower: 827828,
        following: 5454547,
        postCount: 125,
        fullName: `a${props.advertiserId}`,
        price: 8287287287,
        profileUrl: "/no-profile.svg",
        rating: 4.5,
        reach: 525252,
        terms:
          " Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
        username: `@a${props.advertiserId}`,
      },
      businessHour: [
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
      ],
      posts: [],
      reviews: [
        { profileUrl: "brancy/components/customerAds/card/no-profile.svg", str: "hey", username: "@A" },
        { profileUrl: "brancy/components/customerAds/card/no-profile.svg", str: "hey", username: "@B" },
        { profileUrl: "brancy/components/customerAds/card/no-profile.svg", str: "hey", username: "@C" },
        { profileUrl: "brancy/components/customerAds/card/no-profile.svg", str: "hey", username: "@D" },
      ],
      terms: [
        "متأسفانه، محتوای ارائه شده ممکن است برای مخاطبان ما ناسالم یا گمراه‌ کننده یا حاوی اطلاعات پیچیده ای باشد. و نیاز به تغییرات گسترده ای دارد، بنابراین نمیتوانیم این تبلیغ را بپذیریم.Unfortunately, the provided content may be unhealthy, misleading, or contain complex information for our audience. It requires significant changes, so we cannot accept this advertisement.",
        "متأسفانه، محتوای ارائه شده ممکن است برای مخاطبان ما ناسالم یا گمراه‌ کننده یا حاوی اطلاعات پیچیده ای باشد. و نیاز به تغییرات گسترده ای دارد، بنابراین نمیتوانیم این تبلیغ را بپذیریمUnfortunately, the provided content may be unhealthy, misleading, or contain complex information for our audience. It requires significant changes, so we cannot accept this advertisement.",
        "متأسفانه، محتوای ارائه شده ممکن است برای مخاطبان ما ناسالم یا گمراه‌ کننده یا حاوی اطلاعات پیچیده ای باشد. و نیاز به تغییرات گسترده ای دارد، بنابراین نمیتوانیم این تبلیغ را بپذیریم.Unfortunately, the provided content may be unhealthy, misleading, or contain complex information for our audience. It requires significant changes, so we cannot accept this advertisement.",
        "متأسفانه، محتوای ارائه شده ممکن است برای مخاطبان ما ناسالم یا گمراه‌ کننده یا حاوی اطلاعات پیچیده ای باشد. و نیاز به تغییرات گسترده ای دارد، بنابراین نمیتوانیم این تبلیغ را بپذیریم.Unfortunately, the provided content may be unhealthy, misleading, or contain complex information for our audience. It requires significant changes, so we cannot accept this advertisement.",
      ],
    };
    setAdvertiser(response);
  }, []);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Advertiser Detail</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className={styles.popupandbg}>
        <div onClick={props.removeMask} className="dialogBg"></div>
        <div className={styles.popup}>
          <HeaderTitle
            titles={["profile", "Terms", "active hours", "reviews"]}
            handleSelectIndexItem={(marketType: SelectedCardContent) => {
              setSelectedTabIndex(marketType);
            }}
            indexItem={selectedTabIndex}
          />

          <div className={styles.popupcontent}>
            {selectedTabIndex === SelectedCardContent.UserProfile && <UserProfile data={advertiser.userProfile} />}
            {selectedTabIndex === SelectedCardContent.Terms && <Terms terms={advertiser.terms} />}
            {selectedTabIndex === SelectedCardContent.BusinessHours && (
              <BusinessHour businessHour={advertiser.businessHour} />
            )}
            {selectedTabIndex === SelectedCardContent.Reviews && <Reviews reviews={advertiser.reviews} />}
          </div>
          <div className="ButtonContainer">
            <div className="cancelButton" onClick={props.removeMask}>
              Close
            </div>
            <div onClick={handleAddToCard} className={!activeAddCard ? `saveButton` : "disableButton"}>
              Add to Cart
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default card;
