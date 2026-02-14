import { LanguageKey } from "saeed/i18n";
import { BusinessDay } from "saeed/models/advertise/peoperties";

export function findDayName(id: number): LanguageKey {
  var dayName: LanguageKey = LanguageKey.SettingGeneralSystemmonday;
  switch (id) {
    case 0:
      dayName = LanguageKey.SettingGeneralSystemmonday;
      break;
    case 1:
      dayName = LanguageKey.SettingGeneralSystemtuesday;
      break;
    case 2:
      dayName = LanguageKey.SettingGeneralSystemwednesday;
      break;
    case 3:
      dayName = LanguageKey.SettingGeneralSystemthursday;
      break;
    case 4:
      dayName = LanguageKey.SettingGeneralSystemfriday;
      break;
    case 5:
      dayName = LanguageKey.SettingGeneralSystemsaturday;
      break;
    case 6:
      dayName = LanguageKey.SettingGeneralSystemsunday;
      break;

    default:
      break;
  }
  return dayName;
}

export function findDayNumber(name: string): BusinessDay {
  var dayNumber: BusinessDay = BusinessDay.Monday;
  switch (name) {
    case "monday":
      dayNumber = BusinessDay.Monday;
      break;
    case "tuesday":
      dayNumber = BusinessDay.Tuesday;
      break;
    case "wednesday":
      dayNumber = BusinessDay.Wednesday;
      break;
    case "thursday":
      dayNumber = BusinessDay.Thursday;
      break;
    case "friday":
      dayNumber = BusinessDay.Friday;
      break;
    case "saturday":
      dayNumber = BusinessDay.Saturday;
      break;
    case "sunday":
      dayNumber = BusinessDay.Sunday;
      break;

    default:
      break;
  }
  return dayNumber;
}
