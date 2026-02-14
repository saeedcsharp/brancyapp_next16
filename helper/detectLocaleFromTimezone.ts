export interface LocaleSettings {
  language: string;
  calendar: string;
  countryCode: string;
}
export function detectLocaleFromTimezone(): LocaleSettings {
  const timezoneOffset = new Date().getTimezoneOffset();
  let timezone = "";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    // Fallback if timezone detection fails
  }
  let language = "en";
  let calendar = "Gregorian";
  let countryCode = "gb";
  if (timezone) {
    const lowerTimezone = timezone.toLowerCase();
    // Persian/Farsi regions (Iran, Afghanistan)
    if (lowerTimezone.includes("tehran") || lowerTimezone.startsWith("asia/tehran")) {
      language = "fa";
      calendar = "shamsi";
      countryCode = "ir";
    }
    // Afghanistan
    else if (lowerTimezone.includes("kabul")) {
      language = "fa";
      calendar = "shamsi";
      countryCode = "af";
    }
    // Arabic regions (Middle East, North Africa) Saudi Arabia
    else if (lowerTimezone.includes("riyadh")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "sa";
    }
    // UAE
    else if (lowerTimezone.includes("dubai")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "ae";
    }
    // Iraq
    else if (lowerTimezone.includes("baghdad")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "iq";
    }
    // Kuwait
    else if (lowerTimezone.includes("kuwait")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "kw";
    }
    // Qatar
    else if (lowerTimezone.includes("qatar")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "qa";
    }
    // Bahrain
    else if (lowerTimezone.includes("bahrain")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "bh";
    }
    // Oman
    else if (lowerTimezone.includes("muscat")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "om";
    }
    // Yemen
    else if (lowerTimezone.includes("aden")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "ye";
    }
    // Egypt
    else if (lowerTimezone.includes("cairo")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "eg";
    }
    // Jordan
    else if (lowerTimezone.includes("amman")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "jo";
    }
    // Lebanon
    else if (lowerTimezone.includes("beirut")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "lb";
    }
    // Syria
    else if (lowerTimezone.includes("damascus")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "sy";
    }
    // Palestine
    else if (lowerTimezone.includes("gaza") || lowerTimezone.includes("jerusalem")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "ps";
    }
    // Morocco
    else if (lowerTimezone.includes("casablanca")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "ma";
    }
    // Algeria
    else if (lowerTimezone.includes("algiers")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "dz";
    }
    // Tunisia
    else if (lowerTimezone.includes("tunis")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "tn";
    }
    // Libya
    else if (lowerTimezone.includes("tripoli")) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "ly";
    }
    // Turkish regions
    else if (
      lowerTimezone.includes("istanbul") ||
      lowerTimezone.includes("ankara") ||
      lowerTimezone.startsWith("europe/istanbul")
    ) {
      language = "tr";
      calendar = "Gregorian";
      countryCode = "tr";
    }
    // Azerbaijani regions
    else if (lowerTimezone.includes("baku") || lowerTimezone.startsWith("asia/baku")) {
      language = "az";
      calendar = "Gregorian";
      countryCode = "az";
    }
    // Russian regions
    else if (
      lowerTimezone.includes("moscow") ||
      lowerTimezone.includes("samara") ||
      lowerTimezone.includes("yekaterinburg") ||
      lowerTimezone.includes("novosibirsk") ||
      lowerTimezone.includes("krasnoyarsk") ||
      lowerTimezone.includes("irkutsk") ||
      lowerTimezone.includes("yakutsk") ||
      lowerTimezone.includes("vladivostok") ||
      lowerTimezone.includes("magadan") ||
      lowerTimezone.includes("kamchatka") ||
      lowerTimezone.startsWith("europe/moscow") ||
      lowerTimezone.startsWith("asia/vladivostok")
    ) {
      language = "ru";
      calendar = "Gregorian";
      countryCode = "ru";
    }
    // French regions
    else if (lowerTimezone.includes("paris") || lowerTimezone.startsWith("europe/paris")) {
      language = "fr";
      calendar = "Gregorian";
      countryCode = "fr";
    }
    // Belgium
    else if (lowerTimezone.includes("brussels")) {
      language = "fr";
      calendar = "Gregorian";
      countryCode = "be";
    }
    // Switzerland (Geneva)
    else if (lowerTimezone.includes("geneva")) {
      language = "fr";
      calendar = "Gregorian";
      countryCode = "ch";
    }
    // German regions
    else if (lowerTimezone.includes("berlin") || lowerTimezone.startsWith("europe/berlin")) {
      language = "gr";
      calendar = "Gregorian";
      countryCode = "de";
    }
    // Austria
    else if (lowerTimezone.includes("vienna")) {
      language = "gr";
      calendar = "Gregorian";
      countryCode = "at";
    }
    // Switzerland (Zurich)
    else if (lowerTimezone.includes("zurich")) {
      language = "gr";
      calendar = "Gregorian";
      countryCode = "ch";
    }
    // Hindi/Indian regions
    else if (
      lowerTimezone.includes("kolkata") ||
      lowerTimezone.includes("delhi") ||
      lowerTimezone.includes("mumbai") ||
      lowerTimezone.includes("chennai") ||
      lowerTimezone.startsWith("asia/kolkata")
    ) {
      language = "en";
      calendar = "Hindi";
      countryCode = "in";
    }
    // United States
    else if (
      lowerTimezone.includes("new_york") ||
      lowerTimezone.includes("chicago") ||
      lowerTimezone.includes("denver") ||
      lowerTimezone.includes("los_angeles") ||
      lowerTimezone.includes("phoenix") ||
      lowerTimezone.includes("detroit") ||
      lowerTimezone.startsWith("america/new_york") ||
      lowerTimezone.startsWith("america/chicago") ||
      lowerTimezone.startsWith("america/los_angeles")
    ) {
      language = "en";
      calendar = "Gregorian";
      countryCode = "us";
    }
    // United Kingdom
    else if (lowerTimezone.includes("london") || lowerTimezone.startsWith("europe/london")) {
      language = "en";
      calendar = "Gregorian";
      countryCode = "gb";
    }
    // Canada
    else if (
      lowerTimezone.includes("toronto") ||
      lowerTimezone.includes("vancouver") ||
      lowerTimezone.includes("montreal") ||
      lowerTimezone.startsWith("america/toronto")
    ) {
      language = "en";
      calendar = "Gregorian";
      countryCode = "ca";
    }
    // Australia
    else if (
      lowerTimezone.includes("sydney") ||
      lowerTimezone.includes("melbourne") ||
      lowerTimezone.includes("brisbane") ||
      lowerTimezone.startsWith("australia/")
    ) {
      language = "en";
      calendar = "Gregorian";
      countryCode = "au";
    }
  }

  // Fallback: Use timezone offset if timezone string detection didn't match
  if (language === "en" && calendar === "Gregorian" && countryCode === "gb") {
    // Convert offset to hours (negative because getTimezoneOffset returns opposite sign)
    const offsetHours = -timezoneOffset / 60;

    // Iran: UTC+3:30 or UTC+4:30
    if (offsetHours >= 3.5 && offsetHours <= 4.5) {
      language = "fa";
      calendar = "shamsi";
      countryCode = "ir";
    }
    // Middle East (Arab countries): UTC+2 to UTC+4
    else if (offsetHours >= 2 && offsetHours <= 4) {
      language = "ar";
      calendar = "Hijri";
      countryCode = "ae"; // Default to UAE for Arab region
    }
    // Turkey: UTC+3
    else if (offsetHours === 3) {
      language = "tr";
      calendar = "Gregorian";
      countryCode = "tr";
    }
    // Azerbaijan: UTC+4
    else if (offsetHours === 4) {
      language = "az";
      calendar = "Gregorian";
      countryCode = "az";
    }
    // Russia (Moscow): UTC+3 to UTC+12
    else if (offsetHours >= 2 && offsetHours <= 12) {
      language = "ru";
      calendar = "Gregorian";
      countryCode = "ru";
    }
    // Western Europe (France, Germany): UTC+1 or UTC+2
    else if (offsetHours >= 1 && offsetHours <= 2) {
      // Could be French or German, default to Germany
      language = "en";
      calendar = "Gregorian";
      countryCode = "de";
    }
    // India: UTC+5:30
    else if (offsetHours === 5.5) {
      language = "en";
      calendar = "Hindi";
      countryCode = "in";
    }
    // United States: UTC-5 to UTC-8
    else if (offsetHours >= -8 && offsetHours <= -5) {
      language = "en";
      calendar = "Gregorian";
      countryCode = "us";
    }
    // UK/GMT: UTC+0
    else if (offsetHours === 0) {
      language = "en";
      calendar = "Gregorian";
      countryCode = "gb";
    }
  }
  return { language, calendar, countryCode };
}
export function getCountryCodeFromTimezone(): string {
  const detected = detectLocaleFromTimezone();
  return detected.countryCode;
}

export function getPreferredCountriesFromTimezone(): string[] | undefined {
  const timezoneOffset = new Date().getTimezoneOffset();
  let timezone = "";
  
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return undefined;
  }

  if (!timezone) {
    return undefined;
  }

  const lowerTimezone = timezone.toLowerCase();

  // Persian/Farsi regions (Iran, Afghanistan)
  if (lowerTimezone.includes("tehran") || lowerTimezone.startsWith("asia/tehran")) {
    return ["ir", "af"];
  }
  if (lowerTimezone.includes("kabul")) {
    return ["af", "ir"];
  }

  // Arabic regions - Group by proximity
  if (lowerTimezone.includes("riyadh")) {
    return ["sa", "ae", "kw", "bh", "qa"];
  }
  if (lowerTimezone.includes("dubai")) {
    return ["ae", "sa", "om", "qa"];
  }
  if (lowerTimezone.includes("baghdad")) {
    return ["iq", "sa", "kw", "sy"];
  }
  if (lowerTimezone.includes("kuwait")) {
    return ["kw", "sa", "iq", "bh"];
  }
  if (lowerTimezone.includes("qatar")) {
    return ["qa", "sa", "ae", "bh"];
  }
  if (lowerTimezone.includes("bahrain")) {
    return ["bh", "sa", "qa", "kw"];
  }
  if (lowerTimezone.includes("muscat")) {
    return ["om", "ae", "sa", "ye"];
  }
  if (lowerTimezone.includes("aden")) {
    return ["ye", "sa", "om"];
  }
  if (lowerTimezone.includes("cairo")) {
    return ["eg", "sa", "jo", "sy"];
  }
  if (lowerTimezone.includes("amman")) {
    return ["jo", "sa", "sy", "eg"];
  }
  if (lowerTimezone.includes("beirut")) {
    return ["lb", "sy", "jo", "eg"];
  }
  if (lowerTimezone.includes("damascus")) {
    return ["sy", "lb", "jo", "iq"];
  }
  if (lowerTimezone.includes("gaza") || lowerTimezone.includes("jerusalem")) {
    return ["ps", "jo", "eg", "lb"];
  }
  if (lowerTimezone.includes("casablanca")) {
    return ["ma", "dz", "tn", "eg"];
  }
  if (lowerTimezone.includes("algiers")) {
    return ["dz", "tn", "ma", "ly"];
  }
  if (lowerTimezone.includes("tunis")) {
    return ["tn", "dz", "ly", "ma"];
  }
  if (lowerTimezone.includes("tripoli")) {
    return ["ly", "tn", "dz", "eg"];
  }

  // Turkish regions
  if (
    lowerTimezone.includes("istanbul") ||
    lowerTimezone.includes("ankara") ||
    lowerTimezone.startsWith("europe/istanbul")
  ) {
    return ["tr", "az", "gr"];
  }

  // Azerbaijani regions
  if (lowerTimezone.includes("baku") || lowerTimezone.startsWith("asia/baku")) {
    return ["az", "tr", "ru"];
  }

  // Russian regions
  if (
    lowerTimezone.includes("moscow") ||
    lowerTimezone.includes("samara") ||
    lowerTimezone.includes("yekaterinburg") ||
    lowerTimezone.includes("novosibirsk") ||
    lowerTimezone.includes("krasnoyarsk") ||
    lowerTimezone.includes("irkutsk") ||
    lowerTimezone.includes("yakutsk") ||
    lowerTimezone.includes("vladivostok") ||
    lowerTimezone.includes("magadan") ||
    lowerTimezone.includes("kamchatka") ||
    lowerTimezone.startsWith("europe/moscow") ||
    lowerTimezone.startsWith("asia/vladivostok")
  ) {
    return ["ru", "az", "by", "kz"];
  }

  // French regions
  if (lowerTimezone.includes("paris") || lowerTimezone.startsWith("europe/paris")) {
    return ["fr", "be", "ch", "lu"];
  }
  if (lowerTimezone.includes("brussels")) {
    return ["be", "fr", "nl", "lu"];
  }
  if (lowerTimezone.includes("geneva")) {
    return ["ch", "fr", "it", "de"];
  }

  // German regions
  if (lowerTimezone.includes("berlin") || lowerTimezone.startsWith("europe/berlin")) {
    return ["de", "at", "ch", "pl"];
  }
  if (lowerTimezone.includes("vienna")) {
    return ["at", "de", "ch", "cz"];
  }
  if (lowerTimezone.includes("zurich")) {
    return ["ch", "de", "fr", "it"];
  }

  // Indian regions
  if (
    lowerTimezone.includes("kolkata") ||
    lowerTimezone.includes("delhi") ||
    lowerTimezone.includes("mumbai") ||
    lowerTimezone.includes("chennai") ||
    lowerTimezone.startsWith("asia/kolkata")
  ) {
    return ["in", "pk", "bd", "lk"];
  }

  // United States
  if (
    lowerTimezone.includes("new_york") ||
    lowerTimezone.includes("chicago") ||
    lowerTimezone.includes("denver") ||
    lowerTimezone.includes("los_angeles") ||
    lowerTimezone.includes("phoenix") ||
    lowerTimezone.includes("detroit") ||
    lowerTimezone.startsWith("america/new_york") ||
    lowerTimezone.startsWith("america/chicago") ||
    lowerTimezone.startsWith("america/los_angeles")
  ) {
    return ["us", "ca", "mx"];
  }

  // United Kingdom
  if (lowerTimezone.includes("london") || lowerTimezone.startsWith("europe/london")) {
    return ["gb", "ie", "us"];
  }

  // Canada
  if (
    lowerTimezone.includes("toronto") ||
    lowerTimezone.includes("vancouver") ||
    lowerTimezone.includes("montreal") ||
    lowerTimezone.startsWith("america/toronto")
  ) {
    return ["ca", "us"];
  }

  // Australia
  if (
    lowerTimezone.includes("sydney") ||
    lowerTimezone.includes("melbourne") ||
    lowerTimezone.includes("brisbane") ||
    lowerTimezone.startsWith("australia/")
  ) {
    return ["au", "nz"];
  }

  // If timezone was detected but didn't match any specific region, return undefined
  // This allows components to use their default preferredCountries
  return undefined;
}
export function applyDetectedLocale(changeLanguageFn: (lang: string) => void): boolean {
  const existingLanguage = window.localStorage.getItem("language");
  const existingCalendar = window.localStorage.getItem("calendar");
  if (existingLanguage && existingCalendar) {
    return false;
  }
  const detected = detectLocaleFromTimezone();
  if (!existingLanguage) {
    window.localStorage.setItem("language", detected.language);
    changeLanguageFn(detected.language);
  }
  if (!existingCalendar) {
    window.localStorage.setItem("calendar", detected.calendar);
    try {
      window.dispatchEvent(new CustomEvent("brancy:calendar-changed", { detail: detected.calendar }));
    } catch {}
  }
  return true;
}
