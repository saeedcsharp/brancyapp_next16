import { LanguageKey } from "brancy/i18n";
import { BusinessDay } from "brancy/models/enums";
export function findDayName(id: BusinessDay): LanguageKey {
  var dayName: LanguageKey = LanguageKey.SettingGeneralSystemmonday;
  switch (id) {
    case BusinessDay.Monday:
      dayName = LanguageKey.SettingGeneralSystemmonday;
      break;
    case BusinessDay.Tuesday:
      dayName = LanguageKey.SettingGeneralSystemtuesday;
      break;
    case BusinessDay.Wednesday:
      dayName = LanguageKey.SettingGeneralSystemwednesday;
      break;
    case BusinessDay.Thursday:
      dayName = LanguageKey.SettingGeneralSystemthursday;
      break;
    case BusinessDay.Friday:
      dayName = LanguageKey.SettingGeneralSystemfriday;
      break;
    case BusinessDay.Saturday:
      dayName = LanguageKey.SettingGeneralSystemsaturday;
      break;
    case BusinessDay.Sunday:
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
