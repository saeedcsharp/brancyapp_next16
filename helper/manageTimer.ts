import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import indian from "react-date-object/calendars/indian";
import persian from "react-date-object/calendars/persian";
import arabic_ar from "react-date-object/locales/arabic_ar";
import english from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
export default function initialzedTime() {
  const lng = window.localStorage.getItem("language");
  const calendar = window.localStorage.getItem("calendar");
  let locale = english;
  let calendarRes = gregorian;
  switch (lng) {
    case "en":
      locale = english;
      break;
    case "fa":
      locale = persian_fa;
      break;
    case "ar":
      locale = arabic_ar;
      break;
    default:
      locale = english;
      break;
  }
  switch (calendar) {
    case "Gregorian":
      calendarRes = gregorian;
      break;
    case "shamsi":
      calendarRes = persian;
      break;
    case "Hijri":
      calendarRes = arabic;
      break;
    case "Hindi":
      calendarRes = indian;
      break;
  }
  return {
    locale,
    calendar: calendarRes,
  };
}
export function convertToMilliseconds(timestamp: number): number {
  // If the timestamp is less than 1 trillion, it's likely in seconds
  // (covers up to year ~33658 in seconds; current ms timestamps are ~1.7 trillion)
  // Convert seconds to milliseconds by multiplying by 1000
  if (timestamp < 1000000000000) {
    return timestamp * 1000;
  }
  // If it's already in milliseconds, return as is
  return timestamp;
}
export function convertToSeconds(timestamp: number): number {
  // If the timestamp is less than 1 trillion, it's likely in seconds
  if (timestamp < 1000000000000) {
    return Math.round(timestamp);
  }
  // If it's in milliseconds, convert to seconds by dividing by 1000
  return Math.round(timestamp / 1000);
}

export function convertMillisecondsToDays(unixTimeInSeconds: number): number {
  return Math.round(unixTimeInSeconds / (24 * 60 * 60 * 1000));
}
