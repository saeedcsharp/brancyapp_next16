import { format, formatDistanceToNow, fromUnixTime, Locale } from "date-fns";
import { ar, az, el, enUS, faIR, fr, ru, tr } from "date-fns/locale";
import i18n from "../i18n";
const localeMap: { [key: string]: Locale } = {
  en: enUS,
  ar: ar,
  az: az,
  fa: faIR,
  fr: fr,
  gr: el,
  ru: ru,
  tr: tr,
};
const formatTimeAgo = (timestamp: number, locale?: string): string => {
  const currentLocale = locale || i18n.language || "en";
  const dateFnsLocale = localeMap[currentLocale] || enUS;
  return formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: dateFnsLocale,
  });
};
export const GetTimeZoneOffset = (): number => {
  let time = new Date();
  let secondsOffset = -time.getTimezoneOffset() * 60;
  return secondsOffset;
};
export function unixToFormattedDate(unixTimestamp: number) {
  const date = fromUnixTime(unixTimestamp);
  return format(date, "yyyy/MM/dd");
}
export default formatTimeAgo;
