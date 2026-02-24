import Head from "next/head";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import ConfirmationStatus from "brancy/components/confirmationStatus/confirmationStatus";
import TextArea from "brancy/components/design/textArea/textArea";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import Loading from "brancy/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { numberToFormattedString } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import { AdsTimeType, AdsType } from "brancy/models/advertise/AdEnums";
import { IAdContent, IAdReport } from "brancy/models/advertise/adList";
import { MediaType } from "brancy/models/ApiModels/Instagramer/Page/FirstPostPage";
import AdsTypeComp from "brancy/components/advertise/adsType";
import TimeTypeComp from "brancy/components/advertise/timeType";
import styles from "./adDetails.module.css";
import styles2 from "./components/advertise/adList/popups/detailContent.module.css";

const AdReport = (props: { removeMask: () => void; advertiseId: number }) => {
  const { t } = useTranslation();
  const [showMediaIndex, setShowMediaIndex] = useState(0);
  const [toggle, setToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [loading, setLoading] = useState(true);
  const [adContent, setAdContent] = useState<IAdContent>();
  const [adreport, setAdreport] = useState<IAdReport>();
  const divArray = Array.from({ length: 9 - (adContent?.medias ? adContent.medias.length : 0) }, (_, index) => (
    <div key={index} className={styles.posts1}></div>
  ));
  useEffect(() => {
    //Api to get repor info and content based on <<< props.advertiseId >>>
    var res: IAdReport = {
      adType: AdsType.PostAd,
      duration: AdsTimeType.FullDay,
      endAdDate: Date.now(),
      startAdDate: Date.now(),
      fee: 1515654468,
      fullName: "Ahoora Niazi",
      orderDate: Date.now(),
      profileUrl: "/no-profile.svg",
      status: Date.now() + 15 * 60 * 1000,
      username: "@Ahoora.niazi",
      terms: {
        activeTerm1: true,
        activeTerm2: true,
        activeTerm3: true,
        activeTerm4: true,
        term1: "term1",
        term2: "term2",
        term3: "term3",
        term4: "term4",
      },
      comments: 45456,
      engage: 55467,
      impertion: 908754,
      likes: 76437,
      share: 6564,
      view: 6345,
      advertiseId: "ADRE43535457",
      statusType: 0,
    };
    var res2: IAdContent = {
      caption: "hi",
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
    setAdreport(res);
    setAdContent(res2);
    setLoading(false);
  }, []);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Ad Report</title>
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
      {!loading && adreport && adContent && (
        <>
          <div className="headerparent">
            <div className={styles.adheader}>
              <img style={{ cursor: "pointer" }} onClick={props.removeMask} src="/close-box.svg" alt="Close" />
              <h1 className={styles.admodel}>{t(LanguageKey.advertise_ADDetail)}</h1>
              <h2 className={styles.adnumber}>({adreport?.advertiseId})</h2>
            </div>
            <div className="twoDotIconContainer">
              <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5">
                <path
                  fill="var(--color-gray)"
                  d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                />
              </svg>
            </div>
          </div>
          <FlexibleToggleButton
            options={[
              { label: t(LanguageKey.pageStatistics_summary), id: 0 },
              { label: t(LanguageKey.content), id: 1 },
            ]}
            onChange={setToggle}
            selectedValue={toggle}
          />

          {/* ___toggle one___*/}
          {toggle === ToggleOrder.FirstToggle && (
            <div className={styles.addetail} style={{ justifyContent: "flex-start", gap: "var(--gap-10)" }}>
              {/* ___section1___*/}

              <div className={styles.section}>
                <div className={styles.title}>{t(LanguageKey.advertise_orderdate)}</div>
                <div className={styles.dateandtime}>
                  <div className={styles.date}>
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.orderDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY")}
                    </span>
                    /
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.orderDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("MM")}
                    </span>
                    /
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.orderDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("DD")}
                    </span>
                     - 
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adreport?.orderDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh")}
                    </span>
                    :
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adreport?.orderDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("mm A")}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.title}>
                  {t(LanguageKey.Storeorder_OrderDATE)} ( {t(LanguageKey.start)} )
                </div>
                <div className={styles.dateandtime}>
                  <div className={styles.date}>
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.startAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY")}
                    </span>
                    /
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.startAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("MM")}
                    </span>
                    /
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.startAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("DD")}
                    </span>
                     - 
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adreport?.startAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh")}
                    </span>
                    :
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adreport?.startAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("mm A")}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.title}>
                  {t(LanguageKey.Storeorder_OrderDATE)} ( {t(LanguageKey.finish)} )
                </div>
                <div className={styles.dateandtime}>
                  <div className={styles.date}>
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.endAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY")}
                    </span>
                    /
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.endAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("MM")}
                    </span>
                    /
                    <span className={styles.day}>
                      {new DateObject({
                        date: adreport?.endAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("DD")}
                    </span>
                     - 
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adreport?.endAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh")}
                    </span>
                    :
                    <span className={styles.hour}>
                      {new DateObject({
                        date: adreport?.endAdDate,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("mm A")}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.linev}></div>

              {/* ___section2___*/}
              <div className={styles.section}>
                <div className="headerandinput" style={{ width: "100%" }}>
                  <div className={styles.title}>{t(LanguageKey.advertisestatistics_advertiser)}</div>
                  <div className="instagramprofile">
                    <img
                      title="◰ resize the picture"
                      className="instagramimage"
                      alt="profile image"
                      src={adreport.profileUrl}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className="instagramprofiledetail" style={{ maxWidth: "150px" }}>
                      <div className="instagramusername">{adreport.fullName}</div>
                      <div className="instagramid">{adreport.username}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.linev}></div>
              {/* ___section3___*/}
              <div className={styles.section} style={{ gap: "var(--gap-10)" }}>
                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.advertisestatistics_type)}</div>
                  <div className={styles.result}>
                    <AdsTypeComp adType={adreport.adType} />
                  </div>
                </div>

                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.advertise_duration)}</div>
                  <div className={styles.result}>
                    <TimeTypeComp timeType={adreport.duration} />
                  </div>
                </div>
              </div>
              <div className={styles.section} style={{ gap: "var(--gap-10)" }}>
                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.filter_price)}</div>
                  <div className={styles.result}>
                    <PriceFormater
                      className={PriceFormaterClassName.PostPrice}
                      fee={adreport.fee}
                      pricetype={PriceType.Dollar}
                    />
                  </div>
                </div>

                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.Storeorder_STATUS)}</div>
                  <ConfirmationStatus statusType={adreport.statusType} />
                </div>
              </div>
              <div className={styles.linev}></div>
              {/* ___section4___*/}

              <div className={styles.section} style={{ gap: "var(--gap-10)" }}>
                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.pageStatistics_Views)}</div>
                  <div className={styles.result}>{numberToFormattedString(adreport.view)}</div>
                </div>

                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.comments)}</div>
                  <div className={styles.result}>{numberToFormattedString(adreport.comments)}</div>
                </div>
              </div>
              <div className={styles.section} style={{ gap: "var(--gap-10)" }}>
                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.pageStatistics_likes)}</div>
                  <div className={styles.result}>{numberToFormattedString(adreport.likes)}</div>
                </div>

                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.pageStatistics_Shares)}</div>
                  <div className={styles.result}>{numberToFormattedString(adreport.share)}</div>
                </div>
              </div>
              <div className={styles.section} style={{ gap: "var(--gap-10)" }}>
                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.pageStatistics_Engagements)}</div>
                  <div className={styles.result}>{numberToFormattedString(adreport.engage)}</div>
                </div>

                <div className={styles.sectionhalf}>
                  <div className={styles.title}>{t(LanguageKey.pageStatistics_Impression)}</div>
                  <div className={styles.result}>{numberToFormattedString(adreport.impertion)}</div>
                </div>
              </div>
              <div className={styles.graph} style={{ border: "1px solid red", height: "100%" }}></div>
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
                      alt=" post"
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
                role={" textbox"}
                title={" Post Caption"}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AdReport;
