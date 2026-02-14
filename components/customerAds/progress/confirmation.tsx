import Head from "next/head";
import { useEffect, useState } from "react";
import { DateObject } from "react-multi-date-picker";
import AdsTypeComp from "saeed/components/advertise/adsType";
import TimeTypeComp from "saeed/components/advertise/timeType";
import CounterDownNotRing, { CounterDownColor } from "saeed/components/design/counterDown/counterDownNotRing";
import initialzedTime from "saeed/helper/manageTimer";
import { AdsTimeType, AdsType } from "saeed/models/advertise/AdEnums";
import { AdvertiserStatus, CheckStatus, ICustomer } from "saeed/models/customerAds/customerAd";
import styles from "./progress.module.css";

function Confirmation(props: { customerAd: ICustomer; handleUpdateConfirmation: (customerAd: ICustomer) => void }) {
  const [customerAd, setCustomerAd] = useState<ICustomer>(props.customerAd);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    let title = "";
    if (customerAd.checkStatus === CheckStatus.Checking) {
      title = "Bran.cy ▸ ⌚ Wait For Accept";
    } else if (customerAd.checkStatus === CheckStatus.Verified) {
      title = "Bran.cy ▸ ✅ Accepted Order";
    } else if (customerAd.checkStatus === CheckStatus.Rejected) {
      title = "Bran.cy ▸ ❎ Progress Failed ❗";
    }
    document.title = title;
  }, [customerAd.checkStatus]);

  function handleVerifiedToNextStep(ads: ICustomer) {
    let counter = 0;
    for (let ad of ads.advertisers) {
      if (ad.satus === AdvertiserStatus.Verified) counter++;
    }
    if ((counter >= 3 && ads.isCampaign) || (counter === 1 && !ads.isCampaign)) {
      props.handleUpdateConfirmation(customerAd);
    }
    setCustomerAd(ads);
    setRefresh(!refresh);
  }

  async function handleUpdateAdvertisers(customerAdId: number, advertiserId: number, status: AdvertiserStatus) {
    // Update <<customerAd>> state based on socket
    const unverified = customerAd.advertisers.find((x) => x.satus !== AdvertiserStatus.Verified);
    if (unverified === undefined) {
      // Api to get customer ads
      var response: ICustomer = {
        adTimeType: AdsTimeType.SemiDay,
        adType: AdsType.CampaignAd,
        advertisers: [
          {
            asvertiseId: 0,
            fullName: "ad 0",
            price: 0,
            profileUrl: "",
            satus: AdvertiserStatus.Verified,
            username: "@Ad 0",
            terms: "",
          },
          {
            asvertiseId: 1,
            fullName: "ad 1",
            price: 0,
            profileUrl: "",
            satus: AdvertiserStatus.Rejected,
            username: "@Ad 1",
            terms: "",
          },
          {
            asvertiseId: 2,
            fullName: "ad 2",
            price: 0,
            profileUrl: "",
            satus: AdvertiserStatus.Pending,
            username: "@Ad 2",
            terms: "",
          },
        ],
        customerAdId: 1,
        adTime: Date.now(),
        confirmedTime: Date.now(),
        checkStatus: CheckStatus.Verified,
        isCampaign: true,
      };
      handleVerifiedToNextStep(response);
    }
  }

  async function handleEndTimeCheck() {
    // Api when time checking is over and get customer ads
    var response: ICustomer = {
      adTimeType: AdsTimeType.SemiDay,
      adType: AdsType.CampaignAd,
      advertisers: [
        {
          asvertiseId: 0,
          fullName: "ad 0",
          price: 1257810,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@Ad 0",
          terms: "",
        },
        {
          asvertiseId: 1,
          fullName: "ad 1",
          price: 5558619,
          profileUrl: "",
          satus: AdvertiserStatus.Rejected,
          username: "@Ad 1",
          terms: "",
        },
        {
          asvertiseId: 2,
          fullName: "ad 2",
          price: 5985111,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@Ad 2",
          terms: "",
        },
        {
          asvertiseId: 3,
          fullName: "ad 3",
          price: 95058410,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@Ad 3",
          terms: "",
        },
      ],
      customerAdId: 1,
      adTime: Date.now(),
      confirmedTime: Date.now(),
      checkStatus: CheckStatus.Verified,
      isCampaign: true,
    };
    handleVerifiedToNextStep(response);
    props.handleUpdateConfirmation(response);
  }

  async function handleEndPayTime() {
    // Api when time pay is over and get customer ads
    var response: ICustomer = {
      adTimeType: AdsTimeType.SemiDay,
      adType: AdsType.CampaignAd,
      advertisers: [
        {
          asvertiseId: 0,
          fullName: "ad 0",
          price: 0,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@Ad 0",
          terms: "",
        },
        {
          asvertiseId: 1,
          fullName: "ad 1",
          price: 0,
          profileUrl: "",
          satus: AdvertiserStatus.Rejected,
          username: "@Ad 1",
          terms: "",
        },
        {
          asvertiseId: 2,
          fullName: "ad 2",
          price: 0,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@Ad 2",
          terms: "",
        },
        {
          asvertiseId: 3,
          fullName: "ad 3",
          price: 0,
          profileUrl: "",
          satus: AdvertiserStatus.Verified,
          username: "@Ad 3",
          terms: "",
        },
      ],
      customerAdId: 1,
      adTime: Date.now(),
      confirmedTime: Date.now(),
      checkStatus: CheckStatus.Rejected,
      isCampaign: true,
    };
    setCustomerAd(response);
    props.handleUpdateConfirmation(response);
  }

  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>confirmation</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy, post create, story create, lottery, insight, graph, like, share, comment, view, tag, hashtag"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className={styles.stepcontainer4} style={{ justifyContent: "center" }}>
        {customerAd.checkStatus === CheckStatus.Checking && (
          <div className={styles.adstatus}>
            <svg className={styles.svgstatus} width="200" height="100" viewBox="0 0 40 55">
              <g className={styles.docicon}>
                <path
                  fill="var(--color-gray60)"
                  d="M33.7 54.1 6.2 54A6 6 0 0 1 0 47.8V6.2C0 2.8 2.8 0 6.2 0h27.5c3.4 0 6.2 2.8 6.2 6.2v41.7c0 3.4-2.8 6.2-6.2 6.2"
                />
                <path
                  fill="var(--color-gray)"
                  d="M26.8 31.8H11.9c-1.1 0-1.9-.9-1.9-1.9a2 2 0 0 1 1.9-1.9h14.9q1.8.2 1.9 1.9a2 2 0 0 1-1.9 1.9"
                />
                <path
                  fill="var(--color-dark-blue)"
                  d="M29.4 25H10.6c-1 0-1.6-1-1.6-2s.8-2 1.6-2h18.8c1 0 1.6 1 1.6 2s-.8 2-1.6 2"
                />

                <path
                  fill="var(--color-dark-blue)"
                  d="M29.4 25H10.6c-1 0-1.6-1-1.6-2s.8-2 1.6-2h18.8c1 0 1.6 1 1.6 2s-.8 2-1.6 2m1.9-6.4H8.9q-1.8-.2-1.9-1.9a2 2 0 0 1 1.9-1.9h22.4c1.1 0 1.9.9 1.9 1.9a2 2 0 0 1-1.9 1.9"
                />
              </g>
              <g className={styles.searchiconsvg}>
                <path
                  fill="var(--text-h1)"
                  d="m34.8 38.9-7.4-7.4q-.7-.9 0-1.8l1.3-1.3q.9-.7 1.8 0l7.4 7.4c.9.9.9 2.3 0 3.2q-1.6 1.3-3.1-.1M22.7 13a9.6 9.6 0 0 0-9.7 9.7c0 5.4 4.3 9.7 9.7 9.7s9.7-4.3 9.7-9.7-4.3-9.7-9.7-9.7m0 17.3a7.6 7.6 0 1 1 0-15.2 7.6 7.6 0 0 1 0 15.2"
                />
                <path
                  fill="var(--color-ffffff)"
                  d="M17.1 24.5q-.8-.1-.8-1c0-3.4 2.8-6.1 6.1-6.1q.9 0 .9.9t-.9.9c-2.4 0-4.4 2-4.4 4.4q0 .8-.9.9"
                />
              </g>
            </svg>
            <div className={styles.adstatustitle}>
              please wait until
              <CounterDownNotRing
                unixTime={customerAd.confirmedTime ? customerAd.confirmedTime + 10000 : Date.now()}
                timerColor={CounterDownColor.Blue}
                isDead={handleEndTimeCheck}
              />
              request is under review.
            </div>
          </div>
        )}
        {customerAd.checkStatus === CheckStatus.Verified && (
          <div className={styles.adstatus}>
            <svg className={styles.svgstatus} width="200" height="100" viewBox="0 0 40 55">
              <g>
                <path
                  fill="var(--color-gray60)"
                  d="M33.7 54.1 6.2 54A6 6 0 0 1 0 47.8V6.2C0 2.8 2.8 0 6.2 0h27.5c3.4 0 6.2 2.8 6.2 6.2v41.7c0 3.4-2.8 6.2-6.2 6.2"
                />
                <path
                  fill="var(--color-dark-blue)"
                  d="M26.8 31.8H11.9c-1.1 0-1.9-.9-1.9-1.9a2 2 0 0 1 1.9-1.9h14.9q1.8.2 1.9 1.9a2 2 0 0 1-1.9 1.9m2.6-6.8H10.6c-1 0-1.6-1-1.6-2s.8-2 1.6-2h18.8c1 0 1.6 1 1.6 2s-.8 2-1.6 2m1.9-6.4H8.9q-1.8-.2-1.9-1.9a2 2 0 0 1 1.9-1.9h22.4c1.1 0 1.9.9 1.9 1.9a2 2 0 0 1-1.9 1.9"
                />
              </g>
              <g fill="none" viewBox="0 0 40 40" className={styles.doneiconsvg}>
                <circle r="13" stroke="var(--color-light-green)" strokeWidth="3" transform="translate(35 , 35)" />
                <path
                  d="M13.7 1.3q.6.7 0 1.5L7.1 9.5q-1.3 1-2.5 0L1.3 6a1 1 0 0 1 0-1.5 1 1 0 0 1 1.5 0l3 3.2 6.4-6.5a1 1 0 0 1 1.5 0Z"
                  fill="var(--color-dark-green)"
                  stroke="var(--color-dark-green)"
                  strokeWidth="1"
                  transform="translate(28 , 30)"
                />
              </g>
            </svg>
            <div className={styles.adstatustitle}>
              You have only
              <CounterDownNotRing
                unixTime={customerAd.confirmedTime ? customerAd.confirmedTime + 10000 : Date.now()}
                timerColor={CounterDownColor.Red}
                isDead={handleEndPayTime}
              />
              to pay the order.
            </div>
          </div>
        )}
        {customerAd.checkStatus === CheckStatus.Rejected && (
          <div className={styles.paymentfailed}>
            <div className={styles.paymentbox0}>
              <div className={styles.paymentbox1} style={{ backgroundColor: " var(--color-light-red10)" }}>
                <div className={styles.paymentbox2} style={{ backgroundColor: "var(--color-light-red30)" }}>
                  <div className={styles.paymentbox3} style={{ backgroundColor: "var(--color-light-red60)" }}>
                    <div className={styles.paymentbox4} style={{ backgroundColor: "var(--color-light-red)" }}>
                      <svg height="25" width="25" viewBox="0 0 35 35">
                        <path
                          stroke="var(--color-ffffff)"
                          strokeLinecap="round"
                          strokeWidth="8"
                          d="m4.7 4.7 25.6 25.6M30.3 4.7 4.7 30.3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br></br>
            <div className={styles.paymentfailedtitle} style={{ color: "var(--color-light-red)" }}>
              Ops !
            </div>
            <div className={styles.adsno} style={{ fontSize: "var(--font-18)" }}>
              Progress Failed!
            </div>
            <br></br>
            <div className={styles.adstatustitle}>
              Your time to submit is over, or the number of advertisers accepted is less than 3.
            </div>
          </div>
        )}
        <div className={styles.top}>
          <div className={styles.chartcolumnheader}>
            <div className={styles.adcharttitle}>type</div>
            <div className={styles.adcharttitle}>date & time</div>
            <div className={styles.adcharttitle}>Ad No.</div>
          </div>
          <div className={styles.chartcolumn}>
            <div className={styles.addetailcontentheader}>
              <span className={styles.day}>
                <AdsTypeComp adType={customerAd.adType} />
              </span>

              <span className={styles.day}>
                <TimeTypeComp timeType={customerAd.adTimeType} />
              </span>
            </div>
            <div className={styles.addetailcontentheader}>
              <div className={styles.date}>
                <span className={styles.day}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("YYYY")}
                </span>
                /
                <span className={styles.day}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("MM")}
                </span>
                /
                <span className={styles.day}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("DD")}
                </span>
                <br></br>
                <span className={styles.hour}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("hh")}
                </span>
                :
                <span className={styles.hour}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("mm A")}
                </span>
              </div>
            </div>
            <div className={styles.addetailcontentheader}>
              <div className={styles.span}>
                ( <span className={styles.day}>{customerAd.customerAdId}</span> )
              </div>
            </div>
          </div>
        </div>
        <div className={styles.down}>
          <div className={styles.chartcolumnheader}>
            <div className={styles.adcharttitle} style={{ maxWidth: "20%" }}>
              #
            </div>
            <div className={styles.adcharttitle} style={{ maxWidth: "60%" }}>
              target page
            </div>

            <div className={styles.adcharttitle} style={{ maxWidth: "20%" }}>
              status
            </div>
          </div>
          <div className={styles.chartcolumnscroll}>
            {customerAd.advertisers.map((v) => (
              <div key={v.asvertiseId} className={styles.chartcolumn}>
                <div className={styles.addetailcontent} style={{ maxWidth: "20%" }}>
                  {customerAd.advertisers.indexOf(v) + 1}
                </div>

                <div title={`ℹ️ @${v.username}`} className={styles.addetailcontent} style={{ maxWidth: "60%" }}>
                  {v.username}
                </div>

                {v.satus === AdvertiserStatus.Verified && (
                  <div
                    className={styles.accepted}
                    style={{
                      maxWidth: "20%",
                    }}>
                    ✅
                  </div>
                )}
                {v.satus === AdvertiserStatus.Rejected && <div className={styles.rejected}>❌</div>}
                {v.satus === AdvertiserStatus.Pending && (
                  <div
                    className={styles.pending}
                    style={{
                      maxWidth: "20%",
                    }}>
                    🕑
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Confirmation;
