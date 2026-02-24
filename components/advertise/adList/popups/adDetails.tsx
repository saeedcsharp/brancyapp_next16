import Head from "next/head";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import CounterDownNotRing, { CounterDownColor } from "brancy/components/design/counterDown/counterDownNotRing";
import TextArea from "brancy/components/design/textArea/textArea";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import Loading from "brancy/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { AdsTimeType, AdsType } from "brancy/models/advertise/AdEnums";
import { DetailType, IAdContent, IAdDetail, IRejectTerms } from "brancy/models/advertise/adList";
import { MediaType } from "brancy/models/ApiModels/Instagramer/Page/FirstPostPage";
import AdsTypeComp from "brancy/components/advertise/adsType";
import TimeTypeComp from "brancy/components/advertise/timeType";
import styles from "./adDetails.module.css";
import AdReject from "brancy/components/advertise/adList/popups/adreject";
import styles2 from "./components/advertise/adList/popups/detailContent.module.css";
const AdDetails = (props: {
  removeMask: () => void;
  acceptAdvertise: () => void;
  rejectAdvertise: (rejectTerm: IRejectTerms) => void;
  advertiseId: number;
  detailType: DetailType;
}) => {
  const { t } = useTranslation();
  const [toggle, setToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [loading, setLoading] = useState(true);
  const [adDetails, setAdDetails] = useState<IAdDetail>();
  const [adContent, setAdContent] = useState<IAdContent>();
  const [showMediaIndex, setShowMediaIndex] = useState(0);
  const [showReject, setShowReject] = useState(false);
  const divArray = Array.from({ length: 9 - (adContent?.medias ? adContent.medias.length : 0) }, (_, index) => (
    <div key={index} className={styles.posts1}></div>
  ));
  function handleShowReject() {
    setShowReject(true);
  }
  useEffect(() => {
    console.log("ad detail mount phase");
    //Api to get details and content based on <<< props.advertiseId >>>
    var res: IAdDetail = {
      adType: AdsType.PostAd,
      duration: AdsTimeType.FullDay,
      endAdDate: Date.now(),
      startAdDate: Date.now(),
      advertiseId: "ADER234356",
      fee: 1515654468,
      fullName: "Ahoora niazi",
      orderDate: Date.now(),
      profileUrl: "/no-profile.svg",
      status: Date.now() + 15 * 60 * 1000,
      username: "@Ahoora.niazi",
      terms: {
        activeTerm1: true,
        activeTerm2: true,
        activeTerm3: true,
        activeTerm4: true,
        term1: t(LanguageKey.advertiseProperties_rejectreason1),
        term2: t(LanguageKey.advertiseProperties_rejectreason2),
        term3: t(LanguageKey.advertiseProperties_rejectreason3),
        term4: t(LanguageKey.advertiseProperties_rejectreason4),
      },
    };
    var res2: IAdContent = {
      caption: "this is caption",
      medias: [
        {
          cover: "",
          height: 0,
          media: "/post.png",
          mediaType: MediaType.Image,
          width: 0,
        },
        {
          cover: "",
          height: 0,
          media: "/post.png",
          mediaType: MediaType.Image,
          width: 0,
        },
      ],
    };
    setAdDetails(res);
    setAdContent(res2);
    setLoading(false);
    initialzedTime();
  }, []);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Ad Detail</title>
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
      {loading && <Loading />}
      {!loading && !showReject && adDetails && adContent && (
        <>
          <div className={styles.header}>
            <div className={styles.adheader}>
              <img style={{ cursor: "pointer" }} onClick={props.removeMask} src="/close-box.svg" alt="Close" />

              <h1 className={styles.admodel}>{t(LanguageKey.advertise_ADDetail)}</h1>
              <h2 className={styles.adnumber}>({adDetails?.advertiseId})</h2>
            </div>
          </div>
          <FlexibleToggleButton
            options={[
              { label: t(LanguageKey.details), id: 0 },
              { label: t(LanguageKey.content), id: 1 },
            ]}
            onChange={setToggle}
            selectedValue={toggle}
          />

          {/* ___toggle one___*/}
          {toggle === ToggleOrder.FirstToggle && (
            <div className={styles.addetail}>
              {/* ___section1___*/}
              <div className={styles.section}>
                <div className={styles.title}> {t(LanguageKey.advertise_orderdate)}</div>
                <div className={styles.dateandtime}>
                  <div className="date">
                    <span className="day">
                      {new DateObject({
                        date: adDetails?.orderDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY/MM/DD")}
                    </span>
                     - 
                    <span className="hour">
                      {new DateObject({
                        date: adDetails?.orderDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh:mm a")}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.linev} />

              {/* ___section2___*/}
              <div className={styles.section}>
                <div className="headerandinput" style={{ width: "100%" }}>
                  <div className={styles.title}>{t(LanguageKey.advertisestatistics_advertiser)}</div>
                  <div className="instagramprofile">
                    <img
                      title="◰ resize the picture"
                      className="instagramimage"
                      alt="profile image"
                      src={adDetails?.profileUrl}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className="instagramprofiledetail" style={{ maxWidth: "150px" }}>
                      <div className="instagramusername">{adDetails?.fullName}</div>
                      <div className="instagramid">{adDetails?.username}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.linev}></div>
              {/* ___section3___*/}

              <div className={styles.section}>
                <div className={styles.detail}>
                  <div className={styles.title}>{t(LanguageKey.advertisestatistics_type)}</div>
                  <div className={styles.result}>
                    <AdsTypeComp adType={adDetails.adType} />
                  </div>
                </div>
                <div className={styles.lineh}></div>
                <div className={styles.detail}>
                  <div className={styles.title}>{t(LanguageKey.advertise_duration)}</div>
                  <div className={styles.result}>
                    <TimeTypeComp timeType={adDetails.duration} />
                  </div>
                </div>
              </div>
              <div className={styles.linev}></div>

              {/* ___section4___*/}

              <div className={styles.section}>
                <div className={styles.detail}>
                  <div className={styles.title}>
                    {t(LanguageKey.advertisestatistics_date)} {t(LanguageKey.start)}
                  </div>

                  <div className={styles.date}>
                    <span className={styles.day}>
                      {new DateObject({
                        date: adDetails?.startAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY/MM/DD")}
                    </span>
                    <br></br>
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adDetails?.startAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh:mm A")}
                    </span>
                  </div>
                </div>
                <div className={styles.lineh}></div>
                <div className={styles.detail}>
                  <div className={styles.title}>
                    {t(LanguageKey.advertisestatistics_date)} {t(LanguageKey.finish)}
                  </div>

                  <div className={styles.date}>
                    <span className={styles.day}>
                      {new DateObject({
                        date: adDetails?.endAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY/MM/DD")}
                    </span>
                    <br></br>
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adDetails?.endAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh:mm A")}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.linev}></div>
              {/* ___section5___*/}
              <div className={styles.section}>
                <div className={styles.detail}>
                  <div className={styles.title}>{t(LanguageKey.filter_price)}</div>
                  <div className={styles.result}>
                    <PriceFormater
                      className={PriceFormaterClassName.PostPrice}
                      fee={adDetails.fee}
                      pricetype={PriceType.Dollar}
                    />
                  </div>
                </div>
                <div className={styles.lineh}></div>
                <div className={styles.detail}>
                  <div className={styles.title}>{t(LanguageKey.Storeorder_STATUS)}</div>
                  <div className={styles.result}>
                    <CounterDownNotRing
                      unixTime={adDetails.status}
                      timerColor={CounterDownColor.Red}
                      isDead={() => {}}
                      messageAfterTimer={t(LanguageKey.remainingTime)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ___toggle two___*/}
          {toggle === ToggleOrder.SecondToggle && (
            <div className={styles.addetail}>
              {adContent.medias.length === 0 ? (
                <>
                  <div className={styles2.picturenopost}></div>
                </>
              ) : (
                <>
                  {adContent.medias[showMediaIndex].mediaType == MediaType.Image ||
                  adContent.medias[showMediaIndex].coverUri ||
                  adContent.medias[showMediaIndex].cover.length != 0 ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      className={styles2.pictureMaskIcon}
                      alt="post picture"
                      src={
                        adContent.medias[showMediaIndex].mediaType == MediaType.Image
                          ? (adContent.medias[showMediaIndex].mediaUri ?? adContent.medias[showMediaIndex].media)
                          : (adContent.medias[showMediaIndex].coverUri ?? adContent.medias[showMediaIndex].cover)
                      }
                    />
                  ) : (
                    <video className={styles2.pictureMaskIcon} src={adContent.medias[showMediaIndex].media} />
                  )}
                </>
              )}

              <div className={styles2.postpreview}>
                <>
                  {adContent.medias.map((v, i) => (
                    <img
                      loading="lazy"
                      decoding="async"
                      onClick={() => {
                        setShowMediaIndex(i);
                      }}
                      key={i}
                      className={styles2.postpicture}
                      alt="post picture"
                      src={v.cover.length > 0 ? v.cover : v.media}
                    />
                  ))}
                </>
                {divArray}
              </div>
              <TextArea
                style={{ minHeight: "150px" }}
                className={"captiontextarea"}
                value={adContent.caption}
                name="ad-caption"
                role="textbox"
                title="Advertisement caption"
                aria-label="Advertisement caption text"
              />
            </div>
          )}
          <div className="ButtonContainer">
            <button onClick={handleShowReject} className="stopButton">
              {t(LanguageKey.reject)}
            </button>
            {props.detailType === DetailType.WatingList && (
              <div onClick={props.acceptAdvertise} className="saveButton">
                {t(LanguageKey.accept)}
              </div>
            )}
          </div>
        </>
      )}
      {!loading && showReject && adDetails && (
        <AdReject
          detailType={props.detailType}
          removeMask={props.removeMask}
          backToAdDetail={() => setShowReject(false)}
          handleRejectAdvertise={props.rejectAdvertise}
          advertiseId={props.advertiseId}
          data={adDetails?.terms}
        />
      )}
    </>
  );
};

export default AdDetails;
