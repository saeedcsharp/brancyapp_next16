import { ReactNode, useEffect, useState } from "react";
import gregorian from "react-date-object/calendars/gregorian";
import english from "react-date-object/locales/gregorian_en";
import { useTranslation } from "react-i18next";
import { Calendar, DateObject, Value } from "react-multi-date-picker";
import initialzedTime from "brancy/helper/manageTimer";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { AdsType } from "brancy/models/advertise/AdEnums";
import { ICaledarAds } from "brancy/models/advertise/calendar";
import AdsTypeComp from "brancy/components/advertise/adsType";
import styles from "brancy/components/advertise/calendar/calendarComponent.module.css";
const CalendarComponent = (props: { totalAds: ICaledarAds[]; showReject: (adId: number) => void }) => {
  const { t } = useTranslation();
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 82);
  const [customerAds, setCustomerAds] = useState<ICaledarAds[]>([]);
  const [value, setValue] = useState<Value>(Date.now());
  const [loading, setLoading] = useState(true);
  const [calendar, setCalendar] = useState(gregorian);
  const [locale, setLocale] = useState(english);
  const handleMapDate = (date: DateObject) => {
    var counter: number = 0;
    var children: ReactNode = (
      <div
        style={{
          position: "relative",
          top: "0px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignContent: "center",
          fontSize: "var(--font-14)",
          fontWeight: "var(--weight-600)",
        }}>
        <div style={{ textAlign: "start" }}>{date.format("D")}</div>
      </div>
    );
    props.totalAds.forEach((element) => {
      if (
        new DateObject({
          date: element.date,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).year === date.year &&
        new DateObject({
          date: element.date,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).month.index === date.month.index &&
        new DateObject({
          date: element.date,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).day === date.day
      ) {
        counter = counter + 1;
      }
    });

    if (counter === 1) {
      children = (
        <div
          style={{
            position: "relative",
            top: "3px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            alignContent: "center",
            fontSize: "var(--font-14)",
            fontWeight: "var(--weight-600)",
          }}>
          <div style={{ textAlign: "start" }}>{date.format("D")}</div>
          <div className={styles.multigooli}>
            <div className={styles.gooli} />
          </div>
        </div>
      );
    } else if (counter === 2) {
      children = (
        <div
          style={{
            position: "relative",
            top: "3px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            alignContent: "center",
            fontSize: "var(--font-14)",
            fontWeight: "var(--weight-600)",
          }}>
          <div style={{ textAlign: "start" }}>{date.format("D")}</div>
          <div className={styles.multigooli}>
            <div className={styles.gooli} />
            <div className={styles.gooli} />
          </div>
        </div>
      );
    } else if (counter >= 3) {
      children = (
        <div
          style={{
            position: "relative",
            top: "3px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            alignContent: "center",
            fontSize: "var(--font-14)",
            fontWeight: "var(--weight-600)",
          }}>
          <div style={{ textAlign: "start" }}>{date.format("D")}</div>
          <div className={styles.multigooli}>
            <div className={styles.gooli} />
            <div className={styles.gooli} style={{ opacity: "0.5" }} />
            <div className={styles.gooli} style={{ opacity: "0.3" }} />
          </div>
        </div>
      );
    }
    return {
      children,
    };
  };
  const organizeCustomerAds = (adsCalendar: ICaledarAds[]) => {
    var tempCustomerAds: ICaledarAds[] = [];
    setCustomerAds([]);
    var date = value?.valueOf().toString();
    adsCalendar.forEach((element) => {
      if (
        date &&
        new DateObject({
          date: element.date,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).year ===
          new DateObject({
            date: parseInt(date),
            locale: locale,
            calendar: calendar,
          }).year &&
        new DateObject({
          date: element.date,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).month.index ===
          new DateObject({
            date: parseInt(date),
            locale: locale,
            calendar: calendar,
          }).month.index &&
        new DateObject({
          date: element.date,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).day ===
          new DateObject({
            date: parseInt(date),
            locale: locale,
            calendar: calendar,
          }).day
      ) {
        tempCustomerAds.push(element);
      }
    });

    if (tempCustomerAds.length > 0) setCustomerAds(tempCustomerAds);
  };
  useEffect(() => {
    //Api to fetch calendar info
    // var response: ICaledarAds[] = [
    //   {
    //     date: Date.now(),
    //     adsType: AdsType.PostAd,
    //     fullName: "Ahoora Niazi",
    //     profileUrl: "/no-profile.svg",
    //     username: "@Ahoora",
    //     adsId: 1,
    //     adsTimeType: AdsTimeType.FullDay,
    //     noPost: false,
    //   },
    //   {
    //     date: Date.now() + 86400000,
    //     adsType: AdsType.PostAd,
    //     fullName: "Ahoora Niazi",
    //     profileUrl: "/no-profile.svg",
    //     username: "@Ahoora",
    //     adsId: 2,
    //     adsTimeType: AdsTimeType.FullDay,
    //     noPost: false,
    //   },
    //   {
    //     date: Date.now() + 86400000,
    //     adsType: AdsType.StoryAd,
    //     fullName: "Ahoora Niazi",
    //     profileUrl: "/no-profile.svg",
    //     username: "@Ahoora",
    //     adsId: 3,
    //     adsTimeType: AdsTimeType.FullDay,
    //     noPost: false,
    //   },

    //   {
    //     adsType: AdsType.PostAd,
    //     fullName: "Ahoora Niazi",
    //     profileUrl: "/no-profile.svg",
    //     username: "@Ahoora",
    //     adsId: 4,
    //     adsTimeType: AdsTimeType.FullDay,
    //     noPost: false,
    //     date: Date.now() + 172800000,
    //   },
    //   {
    //     adsType: AdsType.StoryAd,
    //     fullName: "Ahoora Niazi",
    //     profileUrl: "/no-profile.svg",
    //     username: "@Ahoora",
    //     adsId: 5,
    //     adsTimeType: AdsTimeType.FullDay,
    //     noPost: false,
    //     date: Date.now() + 172800000,
    //   },
    //   {
    //     adsType: AdsType.StoryAd,
    //     fullName: "Ahoora Niazi",
    //     profileUrl: "/no-profile.svg",
    //     username: "@Ahoora",
    //     adsId: 6,
    //     adsTimeType: AdsTimeType.FullDay,
    //     noPost: false,
    //     date: Date.now() + 172890000,
    //   },
    //   {
    //     adsType: AdsType.PostAd,
    //     fullName: "Ahoora Niazi",
    //     profileUrl: "/no-profile.svg",
    //     username: "@Ahoora",
    //     adsId: 7,
    //     adsTimeType: AdsTimeType.FullDay,
    //     noPost: false,
    //     date: Date.now() + 172800000,
    //   },
    // ];
    if (props.totalAds.length > 0) {
      organizeCustomerAds(props.totalAds);
      setLoading(false);
    }
  }, [props.totalAds]);
  useEffect(() => {
    if (props.totalAds.length > 0) {
      organizeCustomerAds(props.totalAds);
      initialzedTime();
    }
  }, [value]);
  return (
    <div className={styles.calendar} style={gridSpan}>
      <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.advertisecalendar_calendar)}</div>
      </div>
      {loading && hidePage && <h1>...Loading</h1>}
      {!loading && hidePage && (
        <>
          <div className={styles.Section}>
            <div className={styles.calendarmodule}>
              <Calendar
                calendar={calendar}
                locale={locale}
                minDate={new Date()}
                mapDays={({ date }) => {
                  return handleMapDate(date);
                }}
                value={value}
                onChange={setValue}
              />
            </div>
          </div>
          <div className={styles.Section}>
            <div className={styles.headerparent}>
              <div className="title">{t(LanguageKey.advertisecalendar_nextday)}</div>
            </div>
            <div className={styles.adslist}>
              {customerAds.map((v) => (
                <div onClick={() => props.showReject(v.adsId)} key={v.adsId} className={styles.nextads}>
                  <div className="instagramprofile">
                    <img
                      className="instagramimage"
                      alt="profile image"
                      src="/no-profile.svg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />

                    <div className="instagramprofiledetail">
                      <div className="instagramusername">{v.fullName}</div>
                      <div className="instagramid">{v.username}</div>
                    </div>
                  </div>
                  <div className={styles.adsection}>
                    {v.adsType === AdsType.PostAd && (
                      <div className={styles.postadtime}>
                        {new DateObject({
                          date: v.date,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("hh:mm A")}
                      </div>
                    )}

                    {v.adsType === AdsType.StoryAd && (
                      <div className={styles.storyadtime}>
                        {new DateObject({
                          date: v.date,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("hh:mm A")}
                      </div>
                    )}
                    {v.adsType === AdsType.PostAd && (
                      <AdsTypeComp adType={v.adType} />
                      // <div className={styles.postad}>POST AD</div>
                    )}

                    {v.adsType === AdsType.StoryAd && <AdsTypeComp adType={v.adType} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarComponent;
