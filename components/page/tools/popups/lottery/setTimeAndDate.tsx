import { useEffect, useState } from "react";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import indian from "react-date-object/calendars/indian";
import persian from "react-date-object/calendars/persian";
import arabic_ar from "react-date-object/locales/arabic_ar";
import english from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import { useTranslation } from "react-i18next";
import { Calendar, DateObject, Value } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { LanguageKey } from "brancy/i18n";
import styles from "./setTimeAndDate.module.css";

var dayes: number[] = [];
var mounths: number[] = [];
var years: number[] = [];
const SetTimeAndDate = (props: {
  removeMask: () => void;
  saveDateAndTime: (date: string | undefined) => void;
  backToNormalPicker: () => void;
  selectedDates?: number[];
  startDay?: number;
  fromUnix?: number;
  endUnix?: number;
}) => {
  const { t } = useTranslation();
  let startDate = props.startDay && props.startDay !== 0 ? props.startDay : Date.now() + 3600000;
  dayes = [];
  mounths = [];
  years = [];
  props.selectedDates?.forEach((e) => {
    dayes.push(new DateObject(e).day);
    mounths.push(new DateObject(e).month.index);
    years.push(new DateObject(e).year);
  });
  console.log("endunixxxxxx", props.endUnix);
  console.log("fromunixxxxxx", props.fromUnix);
  const [value, setValue] = useState<Value>(startDate);
  const [calendar, setCalendar] = useState(gregorian);
  const [locale, setLocale] = useState(english);
  // const checkDate = (date: string) => {
  //   var unixDate = parseInt(date);
  //   const newDate = new Date(unixDate);
  //   const seconds = newDate.getUTCSeconds();
  //   if (
  //     !(
  //       dayes.includes(new DateObject(unixDate).day) &&
  //       mounths.includes(new DateObject(unixDate).month.index) &&
  //       years.includes(new DateObject(unixDate).year)
  //     ) &&
  //     unixDate >= startDate - seconds * 1000
  //   ) {
  //     return true;
  //   }
  // };

  const handleSave = (date: string | undefined) => {
    if (date !== undefined) {
      props.saveDateAndTime(date);
    }
  };

  useEffect(() => {
    const lng = window.localStorage.getItem("language");
    const calendar = window.localStorage.getItem("calendar");
    switch (lng) {
      case "en":
        setLocale(english);
        break;
      case "fa":
        setLocale(persian_fa);
        break;
      case "ar":
        setLocale(arabic_ar);
        break;
      default:
        setLocale(english);
        break;
    }
    switch (calendar) {
      case "Gregorian":
        setCalendar(gregorian);
        break;
      case "shamsi":
        setCalendar(persian);
        break;
      case "Hijri":
        setCalendar(arabic);
        break;
      case "Hindi":
        setCalendar(indian);
        break;
    }
    // const calendar = window.localStorage.getItem("calendar");
    // if (calendar) {
    //   switch (calendar) {
    //     case "Gregorian":
    //       setCalendar(gregorian);
    //       setLocale(english);
    //       break;
    //     case "shamsi":
    //       setCalendar(persian);
    //       setLocale(persian_fa);
    //       break;
    //     case "Hindi":
    //       setCalendar(indian);
    //       setLocale(indian_hi);
    //       break;
    //     case "Hijri":
    //       setCalendar(arabic);
    //       setLocale(arabic_ar);
    //       break;
    //   }
    // }
  }, []);

  return (
    <>
      <div onClick={props.removeMask} className="dialogBg"></div>
      <div className="popup">
        <div className="title">{t(LanguageKey.pageLottery_SetDateTime)}</div>

        <div className={styles.calendarmodule}>
          <Calendar
            calendar={calendar}
            locale={locale}
            mapDays={({ date }) => {
              if (dayes.includes(date.day) && mounths.includes(date.month.index) && years.includes(date.year)) {
                return {
                  disabled: true,
                  style: { backgroundColor: "#ccc" },
                  title: "Selected",
                };
              }
            }}
            shadow={false}
            value={value}
            onChange={setValue}
            minDate={props.fromUnix ? new Date(props.fromUnix) : Date.now()}
            maxDate={props.endUnix ? new Date(props.endUnix) : Date.now() + 2592000000}
            format=" YYYY/MMMM/DD hh:mm a"
            plugins={[<TimePicker position="bottom" hStep={1} mStep={1} hideSeconds={true} />]}
          />
        </div>
        <div className="ButtonContainer">
          <button onClick={props.backToNormalPicker} className="cancelButton">
            {t(LanguageKey.cancel)}
          </button>
          <button onClick={() => handleSave(value?.valueOf().toString())} className={"saveButton"}>
            {t(LanguageKey.save)}
          </button>
        </div>
      </div>
    </>
  );
};

export default SetTimeAndDate;
