import { EntryType } from "brancy/models/enums";
import { t } from "i18next";
import { LanguageKey } from "brancy/i18n";
export default function entryTypeToStr(entryType: EntryType) {
  switch (entryType) {
    case EntryType.Direct:
      return t(LanguageKey.navbar_Direct);
    case EntryType.Comment:
      return t(LanguageKey.navbar_Comments);
    case EntryType.Ticket:
      return t(LanguageKey.navbar_Ticket);
    default:
      return t(LanguageKey.Unknown);
  }
}
