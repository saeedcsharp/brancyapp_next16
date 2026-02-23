import { useSession } from "next-auth/react";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import Slider, { SliderSlide } from "../../design/slider/slider";
import Loading from "../../notOk/loading";
import { getEnumValue } from "../../../helper/handleItemTypeEnum";
import { LoginStatus, RoleAccess } from "../../../helper/loadingStatus";
import initialzedTime from "../../../helper/manageTimer";
import { LanguageKey } from "../../../i18n";
import { ILoadingStatus, ISession } from "../../../models/_AccountInfo/InstagramerAccountInfo";
import { BrowserType, BrowserTypeStr, DeviceType, DeviceTypeStr, OsType, OsTypeStr } from "../../../models/setting/enums";
import styles from "./general.module.css";

export default function ActivityHistory({
  sessions,
  handleShowDeleteSession,
  handleGetNextSessions,
}: {
  sessions: ISession[] | null;
  handleShowDeleteSession: (sessionId: ISession) => void;
  handleGetNextSessions: (nextMaxId: number) => void;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();

  interface ActivityHistoryState {
    isHidden: boolean;
    loadingStatus: ILoadingStatus;
  }

  type ActivityHistoryAction =
    | { type: "TOGGLE_HIDDEN" }
    | { type: "SET_LOADING_STATUS"; payload: Partial<ILoadingStatus> };

  function activityHistoryReducer(state: ActivityHistoryState, action: ActivityHistoryAction): ActivityHistoryState {
    switch (action.type) {
      case "TOGGLE_HIDDEN":
        return { ...state, isHidden: !state.isHidden };
      case "SET_LOADING_STATUS":
        return { ...state, loadingStatus: { ...state.loadingStatus, ...action.payload } };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(activityHistoryReducer, {
    isHidden: false,
    loadingStatus: {
      notShopper: false,
      notBasePackage: false,
      notFeature: false,
      loading: false,
      notPassword: false,
      ok: true,
      notBusiness: false,
      notLoginByFb: false,
    },
  });

  const { isHidden } = state;
  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session));
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessions || !LoginStatus(session)) return;
    setLoading(false);
  }, [sessions, session]);

  const handleCircleClick = () => {
    dispatch({ type: "TOGGLE_HIDDEN" });
  };

  const handleSliderReachEnd = () => {
    if (!sessions || sessions.length === 0) return;
    const nextMaxId = sessions[sessions.length - 1].createdTime;
    handleGetNextSessions(nextMaxId);
  };

  const handleCopySessionId = (sessionId: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(sessionId)
        .then(() => {
          setCopiedSessionId(sessionId);
          setTimeout(() => setCopiedSessionId(null), 2000);
        })
        .catch(() => fallbackCopyTextToClipboard(sessionId));
    } else {
      fallbackCopyTextToClipboard(sessionId);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopiedSessionId(text);
        setTimeout(() => setCopiedSessionId(null), 2000);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }

    document.body.removeChild(textArea);
  };

  const getCountryFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return "";
    return countryCode
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  };

  const getCountryName = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return countryCode.toUpperCase();

    const countryNames: Record<string, string> = {
      AD: "Andorra",
      AE: "United Arab Emirates",
      AF: "Afghanistan",
      AG: "Antigua and Barbuda",
      AI: "Anguilla",
      AL: "Albania",
      AM: "Armenia",
      AO: "Angola",
      AQ: "Antarctica",
      AR: "Argentina",
      AS: "American Samoa",
      AT: "Austria",
      AU: "Australia",
      AW: "Aruba",
      AX: "Åland Islands",
      AZ: "Azerbaijan",
      BA: "Bosnia and Herzegovina",
      BB: "Barbados",
      BD: "Bangladesh",
      BE: "Belgium",
      BF: "Burkina Faso",
      BG: "Bulgaria",
      BH: "Bahrain",
      BI: "Burundi",
      BJ: "Benin",
      BL: "Saint Barthélemy",
      BM: "Bermuda",
      BN: "Brunei",
      BO: "Bolivia",
      BQ: "Caribbean Netherlands",
      BR: "Brazil",
      BS: "Bahamas",
      BT: "Bhutan",
      BV: "Bouvet Island",
      BW: "Botswana",
      BY: "Belarus",
      BZ: "Belize",
      CA: "Canada",
      CC: "Cocos Islands",
      CD: "Democratic Republic of the Congo",
      CF: "Central African Republic",
      CG: "Republic of the Congo",
      CH: "Switzerland",
      CI: "Côte d'Ivoire",
      CK: "Cook Islands",
      CL: "Chile",
      CM: "Cameroon",
      CN: "China",
      CO: "Colombia",
      CR: "Costa Rica",
      CU: "Cuba",
      CV: "Cape Verde",
      CW: "Curaçao",
      CX: "Christmas Island",
      CY: "Cyprus",
      CZ: "Czech Republic",
      DE: "Germany",
      DJ: "Djibouti",
      DK: "Denmark",
      DM: "Dominica",
      DO: "Dominican Republic",
      DZ: "Algeria",
      EC: "Ecuador",
      EE: "Estonia",
      EG: "Egypt",
      EH: "Western Sahara",
      ER: "Eritrea",
      ES: "Spain",
      ET: "Ethiopia",
      FI: "Finland",
      FJ: "Fiji",
      FK: "Falkland Islands",
      FM: "Micronesia",
      FO: "Faroe Islands",
      FR: "France",
      GA: "Gabon",
      GB: "United Kingdom",
      GD: "Grenada",
      GE: "Georgia",
      GF: "French Guiana",
      GG: "Guernsey",
      GH: "Ghana",
      GI: "Gibraltar",
      GL: "Greenland",
      GM: "Gambia",
      GN: "Guinea",
      GP: "Guadeloupe",
      GQ: "Equatorial Guinea",
      GR: "Greece",
      GS: "South Georgia and the South Sandwich Islands",
      GT: "Guatemala",
      GU: "Guam",
      GW: "Guinea-Bissau",
      GY: "Guyana",
      HK: "Hong Kong",
      HM: "Heard Island and McDonald Islands",
      HN: "Honduras",
      HR: "Croatia",
      HT: "Haiti",
      HU: "Hungary",
      ID: "Indonesia",
      IE: "Ireland",
      IL: "Israel",
      IM: "Isle of Man",
      IN: "India",
      IO: "British Indian Ocean Territory",
      IQ: "Iraq",
      IR: "Iran",
      IS: "Iceland",
      IT: "Italy",
      JE: "Jersey",
      JM: "Jamaica",
      JO: "Jordan",
      JP: "Japan",
      KE: "Kenya",
      KG: "Kyrgyzstan",
      KH: "Cambodia",
      KI: "Kiribati",
      KM: "Comoros",
      KN: "Saint Kitts and Nevis",
      KP: "North Korea",
      KR: "South Korea",
      KW: "Kuwait",
      KY: "Cayman Islands",
      KZ: "Kazakhstan",
      LA: "Laos",
      LB: "Lebanon",
      LC: "Saint Lucia",
      LI: "Liechtenstein",
      LK: "Sri Lanka",
      LR: "Liberia",
      LS: "Lesotho",
      LT: "Lithuania",
      LU: "Luxembourg",
      LV: "Latvia",
      LY: "Libya",
      MA: "Morocco",
      MC: "Monaco",
      MD: "Moldova",
      ME: "Montenegro",
      MF: "Saint Martin",
      MG: "Madagascar",
      MH: "Marshall Islands",
      MK: "North Macedonia",
      ML: "Mali",
      MM: "Myanmar",
      MN: "Mongolia",
      MO: "Macao",
      MP: "Northern Mariana Islands",
      MQ: "Martinique",
      MR: "Mauritania",
      MS: "Montserrat",
      MT: "Malta",
      MU: "Mauritius",
      MV: "Maldives",
      MW: "Malawi",
      MX: "Mexico",
      MY: "Malaysia",
      MZ: "Mozambique",
      NA: "Namibia",
      NC: "New Caledonia",
      NE: "Niger",
      NF: "Norfolk Island",
      NG: "Nigeria",
      NI: "Nicaragua",
      NL: "Netherlands",
      NO: "Norway",
      NP: "Nepal",
      NR: "Nauru",
      NU: "Niue",
      NZ: "New Zealand",
      OM: "Oman",
      PA: "Panama",
      PE: "Peru",
      PF: "French Polynesia",
      PG: "Papua New Guinea",
      PH: "Philippines",
      PK: "Pakistan",
      PL: "Poland",
      PM: "Saint Pierre and Miquelon",
      PN: "Pitcairn",
      PR: "Puerto Rico",
      PS: "Palestine",
      PT: "Portugal",
      PW: "Palau",
      PY: "Paraguay",
      QA: "Qatar",
      RE: "Réunion",
      RO: "Romania",
      RS: "Serbia",
      RU: "Russia",
      RW: "Rwanda",
      SA: "Saudi Arabia",
      SB: "Solomon Islands",
      SC: "Seychelles",
      SD: "Sudan",
      SE: "Sweden",
      SG: "Singapore",
      SH: "Saint Helena",
      SI: "Slovenia",
      SJ: "Svalbard and Jan Mayen",
      SK: "Slovakia",
      SL: "Sierra Leone",
      SM: "San Marino",
      SN: "Senegal",
      SO: "Somalia",
      SR: "Suriname",
      SS: "South Sudan",
      ST: "São Tomé and Príncipe",
      SV: "El Salvador",
      SX: "Sint Maarten",
      SY: "Syria",
      SZ: "Eswatini",
      TC: "Turks and Caicos Islands",
      TD: "Chad",
      TF: "French Southern Territories",
      TG: "Togo",
      TH: "Thailand",
      TJ: "Tajikistan",
      TK: "Tokelau",
      TL: "Timor-Leste",
      TM: "Turkmenistan",
      TN: "Tunisia",
      TO: "Tonga",
      TR: "Turkey",
      TT: "Trinidad and Tobago",
      TV: "Tuvalu",
      TW: "Taiwan",
      TZ: "Tanzania",
      UA: "Ukraine",
      UG: "Uganda",
      UM: "United States Minor Outlying Islands",
      US: "United States",
      UY: "Uruguay",
      UZ: "Uzbekistan",
      VA: "Vatican City",
      VC: "Saint Vincent and the Grenadines",
      VE: "Venezuela",
      VG: "British Virgin Islands",
      VI: "U.S. Virgin Islands",
      VN: "Vietnam",
      VU: "Vanuatu",
      WF: "Wallis and Futuna",
      WS: "Samoa",
      YE: "Yemen",
      YT: "Mayotte",
      ZA: "South Africa",
      ZM: "Zambia",
      ZW: "Zimbabwe",
    };

    return countryNames[countryCode.toUpperCase()] || countryCode.toUpperCase();
  };

  const getOsIcon = (osType: OsType) => {
    switch (osType) {
      case OsType.Windows:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 368 408">
            <path d="M0 192V80l128-28v138zM363 0v187l-214 3V47zM0 213l128 2v146L0 336zm363 6v186l-214-40V215z" />
          </svg>
        );
      case OsType.Linux:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="m14.6 8.4-2 1.1q-.5.5-1 0l-2-1.2q-.7-.5 0-.9 2.5-1 5 0 .8.4 0 1m7.2 7.2Q20.4 12.5 18 10a4 4 0 0 1-1-2l-.3-1q-.2-1.2-.7-2.5Q15 2 12.2 2t-4 2.4l-.4 1.3-.5 2.4q-.3 1-1 1.7A20 20 0 0 0 2.4 15L2 16q-.1 1.1 1 1l1.3-.3q.6-.3.7.3 1 3.3 4.2 4.5c4.2 1.6 9-.7 10-4.6q0-.3.5-.2l1.4.3q.8 0 .9-.6z" />
          </svg>
        );
      case OsType.Ios:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M14.1 4.7a5 5 0 0 1 3.8 2 4.5 4.5 0 0 0 .6 8L17.2 17c-.8 1.3-2 2.9-3.5 2.9-1.2 0-1.6-.9-3.3-.8-1.8 0-2.2.8-3.5.8-1.4 0-2.5-1.5-3.4-2.7-2.3-3.6-2.5-7.9-1.1-10Q4 4.6 6.5 4.6c1.6 0 2.6.8 3.8.8 1.3 0 2-.8 3.8-.8M13.7 0q.2 1.9-1 3.2a4 4 0 0 1-3 1.6q-.2-1.8 1-3.2c.7-.8 2-1.5 3-1.6"
            />
          </svg>
        );
      default:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.5 6A1.5 1.5 0 0 1 3 4.5h.5q.8.1 1.3.8l1.7 3V6a1.5 1.5 0 0 1 3 0v7A1.5 1.5 0 0 1 8 14.5h-.5a2 2 0 0 1-1.3-.8l-1.7-3V13a1.5 1.5 0 0 1-3 0zm13.7.7a1.5 1.5 0 0 1 .6 2l-4 8a1.5 1.5 0 1 1-2.6-1.4l4-8a1.5 1.5 0 0 1 2-.6m.9 3.8a2 2 0 0 1 1.4-1h1a2 2 0 0 1 1.4 1l2 5.5.5 1.5a1.5 1.5 0 1 1-2.8 1l-.2-.5h-2.8l-.2.5a1.5 1.5 0 1 1-2.8-1L14 16zm1.6 4.5h.6l-.3-1z"
            />
          </svg>
        );
    }
  };

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case DeviceType.Desktop:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v7A1.5 1.5 0 0 0 3.5 12H6v1H4.5a.5.5 0 0 0 0 1h7a.5.5 0 1 0 0-1H10v-1h2.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 12.5 2zM9 12v1H7v-1z" />
          </svg>
        );
      case DeviceType.Mobile:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M64 0A64 64 0 0 0 0 64v384a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zm112 432h96c8.8 0 16 7.2 16 16s-7.2 16-16 16h-96c-8.8 0-16-7.2-16-16s7.2-16 16-16" />
          </svg>
        );
      case DeviceType.Tablet:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M2 8.3A3.3 3.3 0 0 1 5.3 5h21.5A3.3 3.3 0 0 1 30 8.3v15.5a3.3 3.3 0 0 1-3.2 3.2H5.3A3.3 3.3 0 0 1 2 23.8zM13 21a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" />
          </svg>
        );
      default:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.5 6A1.5 1.5 0 0 1 3 4.5h.5q.8.1 1.3.8l1.7 3V6a1.5 1.5 0 0 1 3 0v7A1.5 1.5 0 0 1 8 14.5h-.5a2 2 0 0 1-1.3-.8l-1.7-3V13a1.5 1.5 0 0 1-3 0zm13.7.7a1.5 1.5 0 0 1 .6 2l-4 8a1.5 1.5 0 1 1-2.6-1.4l4-8a1.5 1.5 0 0 1 2-.6m.9 3.8a2 2 0 0 1 1.4-1h1a2 2 0 0 1 1.4 1l2 5.5.5 1.5a1.5 1.5 0 1 1-2.8 1l-.2-.5h-2.8l-.2.5a1.5 1.5 0 1 1-2.8-1L14 16zm1.6 4.5h.6l-.3-1z"
            />
          </svg>
        );
    }
  };

  const getBrowserIcon = (browserType: BrowserType) => {
    switch (browserType) {
      case BrowserType.Chrome:
        return (
          <svg
            fill="var(--color-gray)"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024">
            <path d="m512 1024 224-384q32-55 32-128 0-56-23-106t-64-86h305q38 93 38 192 0 139-68.5 257T769 955.5 512 1024M261 461 109 197q71-91 176.5-144T512 0q140 0 257.5 69.5T955 256H512q-92 0-162.5 58.5T261 461m251-141q80 0 136 56t56 136-56 136-136 56-136-56-56-136 56-136 136-56M288 640q34 58 94 93t130 35q42 0 82-14l-153 265q-123-18-224-88.5t-159-181T0 512q0-137 69-256z" />
          </svg>
        );
      case BrowserType.Firfox:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="m503.5 241.5-.2-4.7v-.1l-.4-4.7v-.1a250 250 0 0 0-7.3-41.2l-.1-.2-1.1-4-.2-.6-1.1-3.7-.2-.8-1.1-3.5-.4-1-1.2-3.5-.4-1.1-1.2-3.4-.4-1-1.3-3.4-.4-.8-1.4-3.5-.1-.4q-2.4-5.8-5-11.4l-.4-.7-1.3-2.6-.7-1.6-1.2-2.4-1-1.8-1.2-2.3-1.1-1.9-1.2-2.2-1.2-2-1.2-2-1.2-2-1.2-1.9-1.3-2.2-1.2-1.8-1.4-2.1-1.2-1.8-1.6-2.3-1.1-1.6-1.8-2.5-1-1.3-2.8-3.7a247 247 0 0 0-23.5-26.6q-8.5-9-18.3-16.7-6-5.2-12.5-9.8-11.6-8.7-24.6-15.1l-7.2-3.7a261 261 0 0 0-61-20.8h-.1l-2.8-.5a230 230 0 0 0-38-4h-10.6q-23 .3-45.5 5c-33.6 7.1-63.2 21.2-82.9 39l-2.4 2.2-.5.5h.2v-.1l-.1.1.2-.1a197 197 0 0 1 49.4-19.6l5.9-1.4 1.2-.2 5.2-1.1.8-.1a209 209 0 0 1 180.2 53 173 173 0 0 1 26.9 32.8c30.4 49.2 27.5 111.1 3.8 147.6-34.4 53-111.4 71.3-159 24.8a84 84 0 0 1-25.6-59 75 75 0 0 1 6.2-31c1.7-3.8 13.1-25.7 18.2-24.6-13.1-2.8-37.5 2.6-54.7 28.2-15.4 22.9-14.5 58.2-5 83.3q-9-18.7-12.1-39.2c-12.2-82.6 43.3-153 94.3-170.5-27.5-24-96.5-22.3-147.7 15.4a173 173 0 0 0-62.5 90.4c1.7-20.9 9.6-52.1 25.8-83.9-17.2 8.9-39 37-49.8 62.9A255 255 0 0 0 9.5 287.7l1.1 9.6a248.4 248.4 0 0 0 493.1-42q-.1-6.8-.5-13.5z" />
          </svg>
        );
      case BrowserType.Safari:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-gray)" width="16" height="16" viewBox="0 0 20 20">
            <path d="m10.6 10-.2.5-.5.2-.5-.2-.2-.5.2-.5.5-.2q.3 0 .5.2zm.2.6 3.9-6.5L9 9.4l-3.9 6.4 2.2-2 1.5-1.4zM18 10a8 8 0 0 1-1.2 4.1l-.5-.3h-.2l-.1.1.7.5a8 8 0 0 1-2.1 2.1 8 8 0 0 1-2.7 1.2l-.2-.7-.1-.1h-.1v.2l.1.7-1.6.2a8 8 0 0 1-4.2-1.2l.4-.6.1-.2-.1-.2-.2.2-.2.4-.2.3a8 8 0 0 1-2.1-2.1 8 8 0 0 1-1.3-2.8l.8-.1.1-.2-.2-.1-.7.2L2 10a8 8 0 0 1 1.2-4.2l.2.1.6.3.1-.1-.1-.2-.4-.2-.2-.2a8 8 0 0 1 2.1-2 8 8 0 0 1 2.7-1.3l.2.8h.2l-.1-.7L10 2q2.3 0 4.2 1.2l-.4.8.1.1.6-.7a8 8 0 0 1 2 2 8 8 0 0 1 1.3 2.8H17v.3h.7zm1 0q0-1.8-.8-3.5a9 9 0 0 0-1.9-2.8 9 9 0 0 0-2.8-2 9 9 0 0 0-3.5-.6 9 9 0 0 0-3.5.7 9 9 0 0 0-2.8 1.9 9 9 0 0 0-2 2.8 9 9 0 0 0-.6 3.5q0 1.8.7 3.5a9 9 0 0 0 1.9 2.8 9 9 0 0 0 2.8 2 9 9 0 0 0 3.5.6q1.8 0 3.5-.7a9 9 0 0 0 2.8-1.9 9 9 0 0 0 2-2.8 9 9 0 0 0 .6-3.5m1 0a10 10 0 0 1-.8 3.9 10 10 0 0 1-5.3 5.3 10 10 0 0 1-3.9.8 10 10 0 0 1-3.9-.8A10 10 0 0 1 .8 14a10 10 0 0 1-.8-4 10 10 0 0 1 .8-3.9A10 10 0 0 1 6 .8a10 10 0 0 1 4-.8 10 10 0 0 1 3.9.8A10 10 0 0 1 19.2 6a10 10 0 0 1 .8 4" />
          </svg>
        );
      case BrowserType.Edge:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-gray)" width="16" height="16" viewBox="0 0 16 16">
            <path d="M.2 7.1c.5-3.7 3-7 7.6-7.1A7 7 0 0 1 14 3.7q.9 1.8.9 3.9v1.7H5c0 4.1 6 4 8.7 2.2v3.3c-1.6 1-5 1.8-7.7.7-2.3-.8-4-3.2-3.9-5.5Q2.2 5.5 6 3.9a5 5 0 0 0-1.1 2.5h5.7s.3-3.3-3.3-3.3a9 9 0 0 0-7 4" />
          </svg>
        );
      case BrowserType.Opera:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M8 5.2a11 11 0 0 0-2.2 6.5v.6q.2 4 2.3 6.5a9 9 0 0 0 7 3.6A9 9 0 0 0 20 21a12 12 0 0 1-8.6 3A12 12 0 0 1 12 0a12 12 0 0 1 8 3A8.7 8.7 0 0 0 8 5.3M24 12a12 12 0 0 1-4 9c-3 1.4-6 .4-6.9-.3 3-.6 5.3-4.3 5.3-8.7s-2.3-8-5.3-8.7c1-.7 3.8-1.7 6.9-.2a12 12 0 0 1 4 8.9" />
          </svg>
        );
      default:
        return (
          <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.5 6A1.5 1.5 0 0 1 3 4.5h.5q.8.1 1.3.8l1.7 3V6a1.5 1.5 0 0 1 3 0v7A1.5 1.5 0 0 1 8 14.5h-.5a2 2 0 0 1-1.3-.8l-1.7-3V13a1.5 1.5 0 0 1-3 0zm13.7.7a1.5 1.5 0 0 1 .6 2l-4 8a1.5 1.5 0 1 1-2.6-1.4l4-8a1.5 1.5 0 0 1 2-.6m.9 3.8a2 2 0 0 1 1.4-1h1a2 2 0 0 1 1.4 1l2 5.5.5 1.5a1.5 1.5 0 1 1-2.8 1l-.2-.5h-2.8l-.2.5a1.5 1.5 0 1 1-2.8-1L14 16zm1.6 4.5h.6l-.3-1z"
            />
          </svg>
        );
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new DateObject({
      date: timestamp * 1000,
      calendar: initialzedTime().calendar,
      locale: initialzedTime().locale,
    });

    return date.format("YYYY/MM/DD - hh:mm A");
  };

  const renderSessionCard = (sess: ISession) => (
    <SliderSlide key={sess.sessionId}>
      <div className="headerandinput" style={{ marginBottom: "4px" }}>
        {sess.isCurrent ? (
          <div className={styles.yourdevice}>
            <div className={styles.yourdeviceparent}>
              <svg
                stroke="var(--color-light-green)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 25">
                <path d="m9 12.5 2.3 2.3 4.7-4.6 M21.5 12.5a9 9 0 1 0-18 0 9 9 0 0 0 18 0" />
              </svg>
              {t(LanguageKey.yourdevice)}
            </div>
          </div>
        ) : (
          <div className="headerparent">
            <div className={styles.otherdevice}>
              <div className={styles.yourdeviceparent}>
                <svg
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  clipRule="evenodd"
                  strokeLinejoin="round"
                  stroke="var(--color-gray)"
                  width="20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 25">
                  <path d="M10 13h4 M16.33 3.25H7.67c-3.03 0-4.92 2.14-4.92 5.17v8.16c0 3.03 1.88 5.17 4.92 5.17h8.66c3.03 0 4.92-2.14 4.92-5.17V8.42c0-3.03-1.89-5.17-4.92-5.17" />
                </svg>
                {formatDate(sess.createdTime)}
              </div>
              <svg
                className={`${styles.options} ${sess.createdTime * 1e3 < Date.now() + 86400000 ? "fadeDiv" : ""}`}
                onClick={() => handleShowDeleteSession(sess)}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 25"
                role="button">
                <title>
                  {sess.createdTime * 1e3 < Date.now() + 86400000
                    ? t(LanguageKey.SettingGeneral_cantdeletesession)
                    : "ℹ️ delete button"}
                </title>
                <path d="m16.25 9.03-8 8m8 0-8-8" stroke="var(--color-gray)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}

        <div className={styles.sessioncard}>
          <div className={styles.datarow}>
            <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M5.5 7A1.5 1.5 0 0 1 4 5.5 1.5 1.5 0 0 1 5.5 4 1.5 1.5 0 0 1 7 5.5 1.5 1.5 0 0 1 5.5 7m16 4.6-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7q0 .8.6 1.4l9 9q.6.6 1.4.6c.8 0 1-.2 1.4-.6l7-7q.6-.6.6-1.4t-.6-1.4" />
            </svg>

            <span className={styles.sessionIdContainer}>
              {copiedSessionId === sess.sessionId ? (
                <span className={styles.sessionId}>{t(LanguageKey.successfulCopy)}</span>
              ) : (
                <span className={styles.sessionId}>{sess.sessionId}</span>
              )}
              <img
                style={{ cursor: "pointer", width: "15px", height: "15px" }}
                title={copiedSessionId === sess.sessionId ? "✅ Copied!" : "ℹ️ copy"}
                src={copiedSessionId === sess.sessionId ? "/tick.svg" : "/copy.svg"}
                onClick={() => handleCopySessionId(sess.sessionId)}
                alt="Copy icon"
              />
            </span>
          </div>

          <div className={styles.datarow}>
            <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M17 9a5 5 0 0 0-8.5-3.5A5 5 0 0 0 12 14a5 5 0 0 0 3.5-1.5A5 5 0 0 0 17 9M6 19c0 1 2.3 2 6 2 3.5 0 6-1 6-2 0-2-2.4-4-6-4-3.7 0-6 2-6 4" />
            </svg>

            {sess.userId}
          </div>

          <div className={styles.datarow}>
            {getOsIcon(sess.osType)}
            <span> {getEnumValue(OsType, OsTypeStr, sess.osType)}</span>
          </div>

          <div className={styles.datarow}>
            {getDeviceIcon(sess.deviceType)}
            <span> {getEnumValue(DeviceType, DeviceTypeStr, sess.deviceType)}</span>
          </div>

          <div className={styles.datarow}>
            <svg fill="var(--color-gray)" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42">
              <path d="M33 14c0-7.1-5.4-13-12.5-13S8 6.9 8 14c0 2.3.3 4 1.4 6l10.7 20.6c.4.6.8 0 .8 0L31.6 20q1.4-2.9 1.4-6m-18.2-.5c0-3.3 2.5-6 5.7-6s5.8 2.7 5.8 6-2.6 6-5.8 6a6 6 0 0 1-5.7-6" />
            </svg>
            {getCountryFlag(sess.countryCode)} {getCountryName(sess.countryCode)}
          </div>

          <div className={styles.datarow}>
            {getBrowserIcon(sess.browserType)} {getEnumValue(BrowserType, BrowserTypeStr, sess.browserType)}
          </div>
        </div>
      </div>
    </SliderSlide>
  );

  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" title="↕ Resize the Card" onClick={handleCircleClick}>
        <div className="circle"> </div>
        <div className="Title">{t(LanguageKey.SettingGeneral_leatestentery)}</div>
      </div>

      <div className={!isHidden ? `${styles.all} ${styles.show}` : styles.all}>
        {loading && <Loading />}
        {!loading && sessions && RoleAccess(session) && (
          <Slider className={styles.swiperContent} onReachEnd={handleSliderReachEnd} itemsPerSlide={5}>
            {sessions.map((sess) => renderSessionCard(sess))}
          </Slider>
        )}
      </div>
    </div>
  );
}
