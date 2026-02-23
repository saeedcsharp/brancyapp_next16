import { Language } from "../models/messages/enum";

export default function findSystemLanguage(): Language {
  const language = window.localStorage.getItem("language");
  if (!language) return Language.English; // Default to English if no language is set
  if (language === "fa") {
    return Language.Persian;
  } else if (language === "en") {
    return Language.English;
  } else if (language === "tr") {
    return Language.Turkey;
  } else if (language === "ar") {
    return Language.Arabic;
  } else if (language === "fr") {
    return Language.French;
  } else if (language === "de") {
    return Language.German;
  } else if (language === "ru") {
    return Language.Russian;
  }
  return Language.English; // Default fallback
}
