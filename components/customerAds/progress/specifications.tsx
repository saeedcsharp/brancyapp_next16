import Head from "next/head";
import { useState } from "react";
import { DateObject } from "react-multi-date-picker";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import initialzedTime from "brancy/helper/manageTimer";
import { AdsTimeType, AdsType } from "brancy/models/advertise/AdEnums";
import { ISpecification } from "../../../legacy-pages/customerads/progress";
import styles from "brancy/components/customerAds/progress/progress.module.css";
function Specifications(props: {
  specification: ISpecification;
  handleUpdateSpecification: (spec: ISpecification) => void;
}) {
  const [refresh, setRefresh] = useState(false);
  const [showSetDateAndTime, setShowSetDateAndTime] = useState<boolean>(false);
  const [specification, setSpecification] = useState<ISpecification>(props.specification);
  // const [dateAndTime, setDateAndTime] = useState<number>(props.specification.date);
  function removeMask() {
    setShowSetDateAndTime(false);
  }
  function handleSaveDateAndTime(date: string | undefined) {
    let newSpecification = specification;
    if (date !== undefined) {
      let dateInt = parseInt(date);
      newSpecification.date = dateInt;
      setSpecification(newSpecification);
      props.handleUpdateSpecification(newSpecification);
      removeMask();
    }
  }
  function handleSelectAdType(adType: AdsType) {
    let newSpecification = specification;
    newSpecification.adType = adType;
    setSpecification(newSpecification);
    setRefresh(!refresh);
    props.handleUpdateSpecification(newSpecification);
  }
  function handleSelectDuration(duration: AdsTimeType) {
    let newSpecification = specification;
    newSpecification.adDuration = duration;
    setSpecification(newSpecification);
    props.handleUpdateSpecification(newSpecification);
    setRefresh(!refresh);
  }
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ 📅 Specification</title>
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
      <div className={styles.stepcontainer1}>
        <div className={styles.left}>
          <div className="headerandinput">
            <div className="headertext">select time</div>
            <div className={styles.dateTime}>
              <div className={styles.input} style={{ width: "35%" }}>
                <span>
                  {new DateObject({
                    date: specification.date,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("YYYY/MM/DD")}
                </span>
              </div>
              <div className={styles.input} style={{ width: "20%" }}>
                <span>
                  {new DateObject({
                    date: specification.date,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("hh:mm")}
                </span>
              </div>
              <div className={styles.input} style={{ width: "20%" }}>
                <div className={styles.instagramer}>
                  {new DateObject({
                    date: specification.date,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("A")}
                </div>
              </div>
              <div
                onClick={() => setShowSetDateAndTime(true)}
                className="saveButton"
                style={{
                  position: "relative",
                  height: "40px",
                  width: "40px",
                  maxWidth: "40px",
                  minWidth: "40px",
                  maxHeight: "40px",
                  minHeight: "40px",
                }}>
                <img
                  className={styles.Calendaricon}
                  style={{ width: "23px" }}
                  alt="calendar"
                  src="/selectDate-item.svg"
                />
              </div>
            </div>
          </div>

          <div className="headerandinput">
            <div className="headertext">Ad type</div>

            <div className={styles.typebtn}>
              <div
                onClick={() => handleSelectAdType(AdsType.PostAd)}
                className={`${styles.selectbtn} ${specification.adType === AdsType.PostAd && styles.selectbtnActive}`}>
                <svg viewBox="0 0 30 30">
                  <path d="M6 20.6a2 2 0 0 0 .3-1.8L6 17.3V8H4.8a5 5 0 0 0-3.6 1.7 5 5 0 0 0 .2 6.8l.6 3.2a2 2 0 0 0 .9 1.5 2 2 0 0 0 1.2.5 2 2 0 0 0 1.8-1m7.2-.7a1 1 0 0 0 1.2-.6 12 12 0 0 0 0-14 1.4 1.4 0 0 0-1.9-.4l-5 2.8h-.1V17l5.1 2.8zM25.5 4.2A5 5 0 0 0 20.9 0h-14a5 5 0 0 0-4.6 5v.7a.8.8 0 1 0 1.6.1V5a3 3 0 0 1 3-3.2h14a3 3 0 0 1 3 3.2v14.9a3 3 0 0 1-3 3.2h-14l-1-.2-.5-.3a1 1 0 0 0-1 .2 1 1 0 0 0 .2 1.4l1.2.5v.2a5 5 0 0 0 4.8 5.1h14.5a5 5 0 0 0 4.8-5.1V9.3a5 5 0 0 0-4.4-5m2.8 20.6a3.3 3.3 0 0 1-3.2 3.4H10.6a3.3 3.3 0 0 1-3.1-3.4h13.4a5 5 0 0 0 4.6-5V6a3.3 3.3 0 0 1 2.8 3.3Z" />
                </svg>
                Post Ad
              </div>
              <div
                onClick={() => handleSelectAdType(AdsType.StoryAd)}
                className={`${styles.selectbtn} ${specification.adType === AdsType.StoryAd && styles.selectbtnActive}`}>
                <svg viewBox="0 0 30 30">
                  <path d="M26.2 4a4 4 0 0 0-4-4H13a4 4 0 0 0-3.8 4 .9.9 0 1 0 1.7 0A2 2 0 0 1 13 1.8h9.4a2 2 0 0 1 2 2.2v18a2 2 0 0 1-2.1 2.2h-9.4a2 2 0 0 1-2.1-2.2v-.2a1 1 0 0 0-1-.8 1 1 0 0 0-.8 1 4 4 0 0 0 4 4 4 4 0 0 0 3.8 3.9h9.4a4 4 0 0 0 3.9-4V8a4 4 0 0 0-4-4m2.1 22a2 2 0 0 1-2.1 2.2h-9.4a2 2 0 0 1-2.1-2.1h7.6a4 4 0 0 0 3.8-4V5.7a2 2 0 0 1 2.2 2.2ZM5.5 18.1V9.4H4.3A5 5 0 0 0 .9 11a4.4 4.4 0 0 0 .2 6.3l.5 3a2 2 0 0 0 .9 1.4 2 2 0 0 0 1.2.4H4a2 2 0 0 0 1.4-1 2 2 0 0 0 .3-1.6Zm7.1 2.3a1 1 0 0 0 1-.6 10.6 10.6 0 0 0 0-13 1.4 1.4 0 0 0-1.7-.3L7.1 9.1v8.5l4.8 2.6z" />
                </svg>
                Story Ad
              </div>
            </div>
          </div>

          <div className="headerandinput">
            <div className="headertext">Ad Duration</div>
            <div className={styles.typebtn}>
              <div
                onClick={() => handleSelectDuration(AdsTimeType.SemiDay)}
                className={`${styles.selectbtn} ${
                  specification.adDuration === AdsTimeType.SemiDay && styles.selectbtnActive
                }`}>
                <svg className={styles.halfday} width="30" height="30" viewBox="0 0 127 126">
                  <text font-size="var(--font-50)" transform="translate(39 82)">
                    12
                  </text>
                  <path d="M7.8 36.5a60 60 0 0 1 28-29L33 4.2a15 15 0 0 0-20.2 1.4l-8 9.2A15 15 0 0 0 6.2 35ZM91.1 7.2a60 60 0 0 1 28.6 28.5L123 33a15 15 0 0 0-1-20.2l-9-8.2a15 15 0 0 0-20.3 1Zm9.5 11.8a57 57 0 0 0-36-13 57.9 57.9 0 0 0-45 94l-10 17a8 8 0 0 0 2 7 6 6 0 0 0 6 2l19-12a56 56 0 0 0 56 0l19 12c2.4 1 5-.2 7-2s1.8-4.5 1-7l-10-18a56.7 56.7 0 0 0-9-80m-36 94a50 50 0 0 1-46-31 49 49 0 0 1 11-54 49 49 0 0 1 54-10 49 49 0 0 1 30 46c0 13.2-4.7 25.7-14 35a49 49 0 0 1-35 14" />
                </svg>
                12 Hours
              </div>
              <div
                onClick={() => handleSelectDuration(AdsTimeType.FullDay)}
                className={`${styles.selectbtn} ${
                  specification.adDuration === AdsTimeType.FullDay && styles.selectbtnActive
                }`}>
                <svg width="30" height="30" viewBox="0 0 127 126">
                  <text font-size="var(--font-50)" transform="translate(35 82)">
                    24
                  </text>
                  <path d="M7.8 36.5a60 60 0 0 1 28-29L33 4.2a15 15 0 0 0-20.2 1.4l-8 9.2A15 15 0 0 0 6.2 35ZM91.1 7.2a60 60 0 0 1 28.6 28.5L123 33a15 15 0 0 0-1-20.2l-9-8.2a15 15 0 0 0-20.3 1Zm9.5 11.8a57 57 0 0 0-36-13 57.9 57.9 0 0 0-45 94l-10 17a8 8 0 0 0 2 7 6 6 0 0 0 6 2l19-12a56 56 0 0 0 56 0l19 12c2.4 1 5-.2 7-2s1.8-4.5 1-7l-10-18a56.7 56.7 0 0 0-9-80m-36 94a50 50 0 0 1-46-31 49 49 0 0 1 11-54 49 49 0 0 1 54-10 49 49 0 0 1 30 46c0 13.2-4.7 25.7-14 35a49 49 0 0 1-35 14" />
                </svg>
                24 Hours
              </div>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.timeline}>Timeline Component</div>
        </div>
      </div>
      {showSetDateAndTime && (
        <SetTimeAndDate
          removeMask={removeMask}
          saveDateAndTime={handleSaveDateAndTime}
          backToNormalPicker={removeMask}
          selectedDates={[]}
        />
      )}
    </>
  );
}

export default Specifications;
