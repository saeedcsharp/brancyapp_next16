import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Confirmation from "saeed/components/customerAds/progress/confirmation";
import Content from "saeed/components/customerAds/progress/content";
import Payment from "saeed/components/customerAds/progress/payment";
import CancelProgress from "saeed/components/customerAds/progress/popups/cancelProgress";
import SummaryTerms from "saeed/components/customerAds/progress/popups/summaryTerms";
import Publish from "saeed/components/customerAds/progress/publish";
import Specifications from "saeed/components/customerAds/progress/specifications";
import Summary from "saeed/components/customerAds/progress/summary";
import TermsAndCondition from "saeed/components/customerAds/progress/terms";
import { AdsTimeType, AdsType } from "saeed/models/advertise/AdEnums";
import {
  AdvertiserStatus,
  CheckStatus,
  ICreateCustomerAdPost,
  ICustomer,
  IPaymentInfo,
  IShowMedia,
  Steps,
} from "saeed/models/customerAds/customerAd";
import { MediaType } from "saeed/models/page/post/preposts";
import styles from "./stepprogress.module.css";

export interface ISpecification {
  date: number;
  adType: AdsType | null;
  adDuration: AdsTimeType | null;
}
const MarketAdsProgress = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { query } = router;
  const [customerAdId, setCustomerAdId] = useState<number>(0);
  const [activeNextStep, setActiveNextStep] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.Terms);
  const [termsCheckBox, setTermsCheckBox] = useState(false);
  const [specification, setSpecification] = useState<ISpecification>({
    adDuration: null,
    adType: null,
    date: Date.now() + 86400000,
  });
  const [showMedia, setshowMedia] = useState<IShowMedia[]>([]);
  const [captionTextArea, setCaptionTextArea] = useState("");
  const [mediaUploaded, setMediaUploaded] = useState<boolean>(false);
  const [customerAd, setCustomerAd] = useState<ICustomer>({
    adTimeType: AdsTimeType.FullDay,
    adType: AdsType.PostAd,
    advertisers: [],
    customerAdId: 1,
    adTime: 0,
    confirmedTime: 0,
    checkStatus: CheckStatus.Checking,
    isCampaign: false,
  });
  const [showCancel, setShowCancel] = useState<boolean>(false);
  const [paymentInfo, setPaymentInfo] = useState<IPaymentInfo>({
    orderCode: "",
    success: false,
    transactionNumber: "",
  });
  const [showSummaryTerms, setShowSummaryTerms] = useState<boolean>(false);
  const [summaryTerms, setSummaryTerms] = useState<string>("");
  function handleNextStep() {
    if (!activeNextStep) return;
    switch (currentStep) {
      case Steps.Terms:
        setCurrentStep(Steps.Specification);
        checkActivateButton(Steps.Specification);
        break;
      case Steps.Specification:
        setCurrentStep(Steps.Content);
        checkActivateButton(Steps.Content);
        break;
      case Steps.Content:
        if (!showMedia[0]) return;
        if (!mediaUploaded) handleUploadMedia();
        if (mediaUploaded) {
          handleGetCustomer();
        }
        break;
      case Steps.Summary:
        handleSendConfirmation();

        break;
      case Steps.Confirmation:
        setCurrentStep(Steps.Payment);
        checkActivateButton(Steps.Payment);
        break;
      case Steps.Payment:
        handlePayment();
        checkActivateButton(Steps.Publishing);
        setCurrentStep(Steps.Publishing);
        checkActivateButton(Steps.Publishing);
        break;
      case Steps.Publishing:
        if (paymentInfo.success) setCurrentStep(Steps.Final);
        else router.push("/userPanel");
        break;
    }
  }
  function handleUploadMedia() {
    if (showMedia.length === 0) return;
    let upload: ICreateCustomerAdPost = {
      caption: captionTextArea,
      carousel: [],
      image: {
        data: "",
        tags: null,
      },
      mediaType: MediaType.Image,
      video: {
        data: "",
        tags: null,
      },
    };
    //Api to save media based on <<Upload>> and <<customerAdId>>
    //If response is ok then  setMediaUploaded(true)
    setMediaUploaded(true);
    handleNextText();
  }
  function handlePrevStep() {
    if (currentStep === Steps.Terms) {
      router.push("/customerads");
    } else if (
      (currentStep === Steps.Confirmation && customerAd.checkStatus !== CheckStatus.Rejected) ||
      (currentStep === Steps.Payment && customerAd.checkStatus !== CheckStatus.Rejected)
    ) {
      setShowCancel(true);
      return;
    } else if (
      (currentStep === Steps.Confirmation && customerAd.checkStatus === CheckStatus.Rejected) ||
      (currentStep === Steps.Payment && customerAd.checkStatus === CheckStatus.Rejected)
    ) {
      router.push("/userPanel");
    }
    setCurrentStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
    setActiveNextStep(true);
  }
  function handleUpadteTerms(checkBox: boolean) {
    setTermsCheckBox(checkBox);
    checkActivateButton(currentStep);
  }
  function handleUpdateSpecifiction(spec: ISpecification) {
    setSpecification(spec);
    checkActivateButton(currentStep);
  }
  function handleUpdateContent(content: IShowMedia[], caption: string) {
    console.log("handleUpdateContent");
    setMediaUploaded(false);
    if (content.length > 0) {
      setActiveNextStep(true);
      setshowMedia(content);
      setCaptionTextArea(caption);
    } else if (content.length === 0) {
      setMediaUploaded(false);
      setActiveNextStep(false);
    }
  }
  function handleUpdateConfirmation(customerAd: ICustomer) {
    setCustomerAd(customerAd);
    if (customerAd.checkStatus === CheckStatus.Verified) setActiveNextStep(true);
    else if (customerAd.checkStatus === CheckStatus.Rejected) {
      setActiveNextStep(false);
      handlePreviousText();
    }
  }
  function checkActivateButton(currentStep: number) {
    if (currentStep === Steps.Terms) {
      setActiveNextStep(!termsCheckBox);
    } else if (
      currentStep === Steps.Specification &&
      specification.adType !== null &&
      specification.adDuration !== null
    ) {
      setActiveNextStep(true);
    } else if (currentStep === Steps.Content) {
      if (!showMedia[0]) setActiveNextStep(false);
      handleNextText();
    } else if (currentStep === Steps.Summary) {
      handleNextText();
    } else if (currentStep === Steps.Confirmation) {
      setActiveNextStep(false);
      handleNextText();
    } else if (currentStep === Steps.Payment) {
      handleNextText();
    } else if (currentStep === Steps.Publishing) {
      handleNextText();
    } else {
      setActiveNextStep(false);
    }
  }
  function handleNextText(): string {
    let stepText = "Accept and continue";
    switch (currentStep) {
      case Steps.Specification:
        stepText = "Next";
        break;
      case Steps.Content:
        if (mediaUploaded) stepText = "Next";
        else stepText = "Upload Media";
        break;
      case Steps.Summary:
        stepText = "Next";
        break;
      case Steps.Confirmation:
        stepText = "Submit";
        break;
      case Steps.Payment:
        stepText = "Pay Now";
        break;
      case Steps.Publishing:
        if (paymentInfo.success) stepText = "Next";
        else stepText = "Go to panel";
        break;
    }
    return stepText;
  }
  function handlePreviousText(): string {
    if (
      (currentStep === Steps.Confirmation && customerAd.checkStatus !== CheckStatus.Rejected) ||
      (currentStep === Steps.Payment && customerAd.checkStatus !== CheckStatus.Rejected)
    )
      return "Cancel";
    else if (
      (currentStep === Steps.Confirmation && customerAd.checkStatus === CheckStatus.Rejected) ||
      (currentStep === Steps.Payment && customerAd.checkStatus === CheckStatus.Rejected)
    ) {
      return "Go to panel";
    } else return "Back";
  }
  async function handleGetCustomer() {
    //Api to get customerad based on <<customerAdId>>
    var rersponse: ICustomer = {
      adTimeType: AdsTimeType.SemiDay,
      adType: AdsType.CampaignAd,
      advertisers: [
        {
          asvertiseId: 0,
          fullName: "akbar moghbeli",
          price: 5564564,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@akbar_moghbeli",
          terms:
            " Ad0 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
        },
        {
          asvertiseId: 1,
          fullName: "asghar mozafari",
          price: 4545645,
          profileUrl: "",
          satus: AdvertiserStatus.Rejected,
          username: "@asghar.mozafari",
          terms:
            "Ad1 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
        },
        {
          asvertiseId: 2,
          fullName: "mitra__kamelia_esmaeel",
          terms:
            "Ad2 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
          price: 744546556,
          profileUrl: "",
          satus: AdvertiserStatus.Pending,
          username: "@mitra__kamelia_esmaeel",
        },
      ],
      customerAdId: 1,
      adTime: Date.now(),
      confirmedTime: null,
      checkStatus: CheckStatus.Checking,
      isCampaign: true,
    };
    setCustomerAd(rersponse);
    setCurrentStep(Steps.Summary);
    checkActivateButton(Steps.Summary);
  }
  async function handleSendConfirmation() {
    //Api to send confirmation customerad based on <<customerAdId>>
    //Get confirmedtime
    var rersponse: ICustomer = {
      adTimeType: AdsTimeType.SemiDay,
      adType: AdsType.CampaignAd,
      advertisers: [
        {
          asvertiseId: 0,
          fullName: "saeed akhondi",
          price: 0,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@akhondi.saeed",
          terms: "",
        },
        {
          asvertiseId: 1,
          fullName: "saeed maracy",
          price: 0,
          profileUrl: "",
          satus: AdvertiserStatus.Rejected,
          username: "@saeed.maracy",
          terms: "",
        },
        {
          asvertiseId: 2,
          fullName: "sepehr maracy",
          price: 0,
          profileUrl: "",
          satus: AdvertiserStatus.Pending,
          username: "@aspr.mrc",
          terms: "",
        },
      ],
      customerAdId: 1,
      adTime: Date.now(),
      confirmedTime: Date.now(),
      checkStatus: CheckStatus.Checking,
      isCampaign: true,
    };
    setCustomerAd(rersponse);
    setCurrentStep(Steps.Confirmation);
    checkActivateButton(Steps.Confirmation);
  }
  function renderStepContainer(stepNumber: number) {
    if (stepNumber === currentStep) {
      switch (stepNumber) {
        case Steps.Terms:
          return <TermsAndCondition checkBox={termsCheckBox} changeCheckBox={handleUpadteTerms} />;
        case Steps.Specification:
          return <Specifications specification={specification} handleUpdateSpecification={handleUpdateSpecifiction} />;
        case Steps.Content:
          return <Content data={showMedia} caption={captionTextArea} handleUpdateContent={handleUpdateContent} />;
        case Steps.Summary:
          return <Summary handleShowSummaryTerms={handleShowSummaryTerms} customer={customerAd} />;
        case Steps.Confirmation:
          return <Confirmation customerAd={customerAd} handleUpdateConfirmation={handleUpdateConfirmation} />;
        case Steps.Payment:
          return <Payment customerAd={customerAd} />;
        case Steps.Publishing:
          return <Publish paymentInfo={paymentInfo} />;
        case Steps.Final:
          return (
            <>
              {/* head for SEO */}
              <Head>
                {" "}
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
                <title>Bran.cy ▸ ✨ Order Will Publish</title>
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
              <div className={styles.stepcontainer7}>
                <div className={styles.publishtimer}>
                  <div className={styles.publishpart}>
                    <div className={styles.publishtime} style={{ color: "#FF4E85" }}>
                      2<div className={styles.publishtimetitle}>Days</div>
                    </div>

                    <div className={styles.publishdot} style={{ color: "#FD479E" }}>
                      :
                    </div>

                    <div className={styles.publishtime} style={{ color: "#F347A7" }}>
                      23<div className={styles.publishtimetitle}>hours</div>
                    </div>
                  </div>
                  <div className={styles.publishdot1} style={{ color: "#9445F6" }}>
                    :
                  </div>
                  <div className={styles.publishpart}>
                    <div className={styles.publishtime} style={{ color: "#9D6DFF" }}>
                      59<div className={styles.publishtimetitle}>minutes</div>
                    </div>

                    <div className={styles.publishdot} style={{ color: "#7C6CFF" }}>
                      :
                    </div>

                    <div className={styles.publishtime} style={{ color: "var(--color-dark-blue)" }}>
                      59<div className={styles.publishtimetitle}>second</div>
                    </div>
                  </div>
                </div>
                <div className={styles.publishtitle}>
                  TO PUBLISH
                  <div className={styles.discription}>
                    Order Code: <div className={styles.adsno}> RSH345457</div>
                  </div>
                </div>
              </div>
            </>
          );
        case 8:
          return (
            <div className={styles.stepcontainer8}>
              <div className={styles.publishedtitle}>
                PUBLISHED
                <svg className={styles.svgchom} style={{ right: "80%" }} id="1" height="30%" viewBox="0 0 61 91">
                  <path opacity=".4" d="M54 90.3.5 77 40.9 2 60.5.3z" fill="var(--background-root)" />
                </svg>
                <svg
                  className={styles.svgchom}
                  style={{ right: "10%", top: "-30%" }}
                  id="2"
                  height="80%"
                  viewBox="0 0 61 91">
                  <path opacity=".4" d="M54 90.3.5 77 40.9 2 60.5.3z" fill="var(--background-root)" />
                </svg>
                <svg
                  className={styles.svgchom}
                  style={{ right: "60%", top: "-10%" }}
                  id="3"
                  height="90%"
                  viewBox="0 0 61 91">
                  <path opacity=".4" d="M54 90.3.5 77 40.9 2 60.5.3z" fill="var(--background-root)" />
                </svg>
                <svg className={styles.svgchom1} style={{ right: "50%" }} id="4" height="30%" viewBox="0 0 61 91">
                  <path opacity=".4" d="M54 90.3.5 77 40.9 2 60.5.3z" fill="var(--background-root)" />
                </svg>
                <svg
                  className={styles.svgchom1}
                  style={{ left: "150px", top: "-50px" }}
                  id="5"
                  height="35%"
                  viewBox="0 0 61 91">
                  <path opacity=".4" d="M54 90.3.5 77 40.9 2 60.5.3z" fill="var(--background-root)" />
                </svg>
              </div>
              <div className={styles.adsno}>You can see details of your ads result in profile</div>
              <div className={styles.discription}>
                Order Code: <div className={styles.adsno}> RSH345457</div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  }
  async function fetchData(customerAdId: number, step: string) {
    if (step === "confirmation") {
      const rersponse2: ICustomer = {
        adTimeType: AdsTimeType.SemiDay,
        adType: AdsType.CampaignAd,
        advertisers: [
          {
            asvertiseId: 0,
            fullName: "ad 0",
            price: 5564564,
            profileUrl: "",
            satus: AdvertiserStatus.Verified,
            username: "@Ad 0",
            terms:
              " Ad0 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
          },
          {
            asvertiseId: 1,
            fullName: "ad 1",
            price: 4545645,
            profileUrl: "",
            satus: AdvertiserStatus.Rejected,
            username: "@Ad 1",
            terms:
              "Ad1 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
          },
          {
            asvertiseId: 2,
            fullName: "ad 2",
            terms:
              "Ad2 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
            price: 744546556,
            profileUrl: "",
            satus: AdvertiserStatus.Pending,
            username: "@Ad 2",
          },
        ],
        customerAdId: 1,
        adTime: Date.now(),
        confirmedTime: Date.now() + 35 * 60 * 1000,
        checkStatus: CheckStatus.Verified,
        isCampaign: true,
      };
      //Api to get ICustomer based on <<customerAdId>>
      const rersponse: ICustomer = {
        adTimeType: AdsTimeType.SemiDay,
        adType: AdsType.CampaignAd,
        advertisers: [
          {
            asvertiseId: 0,
            fullName: "ad 0",
            price: 5564564,
            profileUrl: "",
            satus: AdvertiserStatus.Verified,
            username: "@Ad 0",
            terms:
              " Ad0 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
          },
          {
            asvertiseId: 1,
            fullName: "ad 1",
            price: 4545645,
            profileUrl: "",
            satus: AdvertiserStatus.Rejected,
            username: "@Ad 1",
            terms:
              "Ad1 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
          },
          {
            asvertiseId: 2,
            fullName: "ad 2",
            terms:
              "Ad2 Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
            price: 744546556,
            profileUrl: "",
            satus: AdvertiserStatus.Pending,
            username: "@Ad 2",
          },
        ],
        customerAdId: 1,
        adTime: Date.now(),
        confirmedTime: null,
        checkStatus: CheckStatus.Checking,
        isCampaign: true,
      };
      setCustomerAd(rersponse2);
      setCurrentStep(Steps.Confirmation);
    } else if (step === "publish") {
      //Api to get IPaymentInfo <<customerAdId>>
      const response: IPaymentInfo = {
        orderCode: "ecewhverhvh",
        success: false,
        transactionNumber: "15Adews5554",
      };
      setActiveNextStep(true);
      setPaymentInfo(response);
      setCurrentStep(Steps.Publishing);
    }
  }
  function removeMask() {
    setShowCancel(false);
    setShowSummaryTerms(false);
  }
  async function handlePayment() {
    //redirect to page to oay
    const response: IPaymentInfo = {
      orderCode: "ecewhverhvh",
      success: true,
      transactionNumber: "15Adews5554",
    };
    setPaymentInfo(response);
  }
  function handleShowSummaryTerms(terms: string) {
    setSummaryTerms(terms);
    setShowSummaryTerms(true);
  }
  useEffect(() => {
    if (router.isReady) {
      if (query.customerAdId === undefined) router.push("/customerads");
      var id = parseInt(query.customerAdId as string);
      setCustomerAdId(id);

      if (query.step !== undefined) {
        const step = query.step as string;
        fetchData(id, step);
      }
    }
  }, [router.isReady]);
  return (
    <>
      {
        <div className={styles.all}>
          <div className={styles.header}>
            <Link style={{ position: "relative", left: "10%" }} href={"/"}>
              <svg viewBox="0 0 175 46" className={styles.logo}>
                <path d="M31.5 10a8 8 0 0 1-2.2 4.2A12 12 0 0 1 25 17q6 2.1 5 8a11 11 0 0 1-5.5 8.3Q20 36 12.2 36a55 55 0 0 1-7.4-.7l-2.4-.7a3.4 3.4 0 0 1-2.3-4.1L4.6 4.2a3 3 0 0 1 1-1.9 6 6 0 0 1 2-1 23 23 0 0 1 4.8-1l6-.3q7.1 0 10.5 2.4t2.6 7.5Zm-19.1 4.3h4a6 6 0 0 0 3.7-.9 4 4 0 0 0 1.5-2.6 2.4 2.4 0 0 0-.8-2.5 6 6 0 0 0-3.6-.9h-2l-1.7.3ZM20 24.6q.6-3.4-4-3.4h-5L10 28l2 .3h2.3a8 8 0 0 0 3.8-.9 4 4 0 0 0 2-2.9M41.4 35l-1.8.4-2.5.2q-2.8 0-3.9-1t-.6-3.6l3-16.7a6 6 0 0 1 1.2-2.8 10 10 0 0 1 2.7-2.1 19 19 0 0 1 4.9-1.8 25 25 0 0 1 5.5-.7q6.1 0 5.3 4.4l-.6 1.9-.9 1.5-3-.3-3 .4a11 11 0 0 0-3 1zM70 6.9a21 21 0 0 1 5.5.6 10 10 0 0 1 3.9 1.9 7 7 0 0 1 2.1 3.2 10 10 0 0 1 .2 4.6l-2.2 12.6a4 4 0 0 1-1.2 2.4L76 33.8Q72 36 65.5 36a22 22 0 0 1-5.3-.6 10 10 0 0 1-3.7-1.6 6 6 0 0 1-2.2-3 8 8 0 0 1-.2-4 9 9 0 0 1 3.3-6 15 15 0 0 1 7.6-2.5l7.4-.8V17a2 2 0 0 0-1-2.4 9 9 0 0 0-4-.7 20 20 0 0 0-4 .5l-4 1.1a3 3 0 0 1-.9-1.5 5 5 0 0 1-.1-2.2 4 4 0 0 1 1-2.4A7 7 0 0 1 62 8.1a19 19 0 0 1 4-1zM66.8 29l2.1-.2 1.8-.5.8-4.5-4 .3a7 7 0 0 0-2.8.7 2 2 0 0 0-1.3 1.7 2 2 0 0 0 .6 1.8 4 4 0 0 0 2.8.7m44.2 6-1.7.4-2.6.2q-2.7 0-3.8-1t-.6-3.6l2.3-13.3a3 3 0 0 0-.6-2.5 4 4 0 0 0-2.6-.8l-2.1.2-2 .8L93.9 35l-1.8.4-2.5.2q-2.8 0-3.9-1t-.6-3.6l3-17a5 5 0 0 1 1-2.4l2-1.7a19 19 0 0 1 5.2-2.2 25 25 0 0 1 6.5-.8q6.3 0 9.3 2.8t2 7.8zm24.8-20.6a9 9 0 0 0-2.7.5 8 8 0 0 0-2.4 1.3 9 9 0 0 0-2 2.2 9 9 0 0 0-1 3.1q-.6 3.5 1 5.2a6 6 0 0 0 4.6 1.7 10 10 0 0 0 3-.4l2.4-1a5 5 0 0 1 1.3 1.8 4 4 0 0 1 .2 2.2 5 5 0 0 1-2.8 3.6 14 14 0 0 1-6.6 1.3 19 19 0 0 1-6.1-.9 10 10 0 0 1-4.4-2.7 10 10 0 0 1-2.2-4.6 16 16 0 0 1 0-6.2 19 19 0 0 1 2.3-6.5 16 16 0 0 1 4-4.5 17 17 0 0 1 5.3-2.7 20 20 0 0 1 5.9-1q4 0 6 1.5a4 4 0 0 1 1.5 3.8 5 5 0 0 1-.9 2l-1.4 1.6-2.2-.9a9 9 0 0 0-2.8-.4m13.9 13.7a94 94 0 0 1-2.8-19 9 9 0 0 1 2.4-1.4 8 8 0 0 1 3-.5 5 5 0 0 1 3 .8 4 4 0 0 1 1.4 3l.9 7.8q.5 3.8.8 7.7h.3l2-4.1 2-4.7 2-4.8 1.8-4.7 2-.8 2.2-.2a6 6 0 0 1 3.3.8q1.3.8 1 3a28 28 0 0 1-1.7 5.3q-1.2 3.1-3 6.5t-3.6 6.6T163 35a51 51 0 0 1-7.2 8.1q-3.1 2.7-5.8 2.7a5 5 0 0 1-3.5-1.5 5 5 0 0 1-1.2-3.6q2-1.5 4.2-3.5l3.8-3.8a4 4 0 0 1-1.8-1.4 11 11 0 0 1-1.7-3.9Z" />
              </svg>
            </Link>
          </div>
          <div
            className={styles.stepprogress}
            style={{
              display: currentStep === 0 || currentStep === 8 ? "none" : "",
            }}>
            {[0, 1, 2, 3, 4, 5, 6].map((step, number) => (
              <div
                key={number}
                className={
                  currentStep === step
                    ? styles[`step${step}Active`]
                    : currentStep > step
                    ? styles[`step${step}Done`]
                    : styles[`step${step}`]
                }>
                <div
                  className={
                    currentStep > step
                      ? styles[`status${step}Done`]
                      : currentStep === step
                      ? styles[`status${step}Active`]
                      : styles.status
                  }>
                  {currentStep > step ? "✔" : step}
                </div>
                {step === Steps.Terms && "Terms"}
                {step === Steps.Specification && "Specifications"}
                {step === Steps.Content && "Content"}
                {step === Steps.Summary && "Summary"}
                {step === Steps.Confirmation && "Confirmation"}
                {step === Steps.Payment && "Payment"}
                {step === Steps.Publishing && "Publishing"}
              </div>
            ))}
          </div>
          <div className={styles.stepcontainer}>
            {renderStepContainer(Steps.Terms)}
            {renderStepContainer(Steps.Specification)}
            {renderStepContainer(Steps.Content)}
            {renderStepContainer(Steps.Summary)}
            {renderStepContainer(Steps.Confirmation)}
            {renderStepContainer(Steps.Payment)}
            {renderStepContainer(Steps.Publishing)}
            {renderStepContainer(Steps.Final)}
          </div>
          <div className={currentStep === 7 || currentStep === 8 ? styles.finalfooter : styles.footer}>
            {currentStep === 7 || currentStep === 8 ? (
              <div className={styles.finalfooter} style={{ padding: "0px" }}>
                <div className={styles.circle}>
                  <svg fill="none" viewBox="0 0 1440 103" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="a" x1="0" y1="91.5" x2="1440" y2="91.5" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FF6C17">
                          <animate
                            attributeName="stop-color"
                            values="#FF6C17; #FFA023; #FF479D; #8945FF; #3485FF; #6CF; #FF6C17"
                            dur="5s"
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop offset="20%" stop-color="#FFA023">
                          <animate
                            attributeName="stop-color"
                            values="#FFA023; #FF479D; #8945FF; #3485FF; #6CF; #FF6C17; #FFA023"
                            dur="5s"
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop offset="40%" stop-color="#FF479D">
                          <animate
                            attributeName="stop-color"
                            values="#FF479D; #8945FF; #3485FF; #6CF; #FF6C17; #FFA023; #FF479D"
                            dur="5s"
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop offset="60%" stop-color="#8945FF">
                          <animate
                            attributeName="stop-color"
                            values="#8945FF; #3485FF; #6CF; #FF6C17; #FFA023; #FF479D; #8945FF"
                            dur="5s"
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop offset="80%" stop-color="#3485FF">
                          <animate
                            attributeName="stop-color"
                            values="#3485FF; #6CF; #FF6C17; #FFA023; #FF479D; #8945FF; #3485FF"
                            dur="5s"
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop offset="100%" stop-color="#6CF">
                          <animate
                            attributeName="stop-color"
                            values="#6CF; #FF6C17; #FFA023; #FF479D; #8945FF; #3485FF; #6CF"
                            dur="5s"
                            repeatCount="indefinite"
                          />
                        </stop>
                      </linearGradient>
                    </defs>
                    <path d="M1.5 98C540-26 900-26 1440 98" stroke="url(#a)" strokeWidth="3" />
                  </svg>
                </div>

                <div className="cancelButton" style={{ maxWidth: "210px" }} onClick={handlePrevStep}>
                  این دکمه حذف
                </div>
                <div
                  className="saveButton"
                  style={{ maxWidth: "210px", padding: "var(--padding-10)" }}
                  onClick={handleNextStep}>
                  Go to My Panel
                </div>
              </div>
            ) : (
              <div className={styles.footer} style={{ padding: "0px" }}>
                <div className="cancelButton" style={{ maxWidth: "140px" }} onClick={handlePrevStep}>
                  {handlePreviousText()}
                </div>
                <div
                  className={`${activeNextStep ? "saveButton" : "disableButton"}`}
                  style={{ maxWidth: "210px", padding: "var(--padding-10)" }}
                  onClick={handleNextStep}>
                  {handleNextText()}
                </div>
              </div>
            )}
          </div>
        </div>
      }
      {showCancel && <CancelProgress customerAdId={customerAdId} removeMask={removeMask} />}
      {showSummaryTerms && <SummaryTerms terms={summaryTerms} removeMask={removeMask} />}
    </>
  );
};
export default MarketAdsProgress;
