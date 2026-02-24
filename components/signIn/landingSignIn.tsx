import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getCountryCodeFromTimezone } from "brancy/helper/detectLocaleFromTimezone";
import { LanguageKey } from "brancy/i18n";
import { SendCodeResult } from "brancy/models/ApiModels/User/SendCodeResult";
import { MethodType } from "brancy/helper/api";
import RingLoader from "brancy/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import styles from "./landingSignIn.module.css";
import { clientFetchApiWithAccessToken } from "brancy/helper/clientFetchApi";

const LandingSignIn = (prop: { handleShowVerification: (preUserToken: string) => void }) => {
  const { t } = useTranslation();
  const [defaultCountry, setDefaultCountry] = useState("gb");
  const [preferredCountries, setPreferredCountries] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    // Use centralized timezone detection
    const detectedCountry = getCountryCodeFromTimezone();
    setDefaultCountry(detectedCountry);
  }, []);

  const [countryCode, setCountryCode] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef<any>(null);
  const handlePhoneChange = (value: string, country: { dialCode: string; countryCode: string }) => {
    // Normalize Persian (۰-۹) and Arabic-Indic (٠-٩) digits to English (0-9)
    const normalizedValue = value
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48));

    setCountryCode(country.countryCode);
    setNationalNumber(normalizedValue);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    try {
      var res = await clientFetchApiWithAccessToken<boolean, SendCodeResult>("/api/user/signIn", {
        methodType: MethodType.get,
        accessToken: "",
        data: null,
        queries: [
          {
            key: "phoneNumber",
            value: nationalNumber,
          },
          {
            key: "countryCode",
            value: countryCode,
          },
          {
            key: "timezoneOffset",
            value: (new Date().getTimezoneOffset() * 60 * -1).toString(),
          },
          {
            key: "sessionId",
            value: sessionId ?? undefined,
          },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        prop.handleShowVerification(res.value.token);
      } else {
        setError(res.info.message);
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (err) {
      notify(ResponseType.Unexpected, NotifType.Warning);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
    console.log(error);
  };
  useEffect(() => {
    let session = window.localStorage.getItem("sessionId");
    setSessionId(session);
    // Add custom styles for highlight
    const style = document.createElement("style");
    style.textContent = `
      .react-tel-input .country-list .country.highlight {
        background-color: var(--color-dark-blue30) !important;

        color: var(--text-h1) !important;
      }
      .react-tel-input .country-list .country.highlight:hover {
        background-color: var(--color-dark-blue60) !important;
        color: var(--color-ffffff) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <form className={`${styles.inputcodesection} translate`} onSubmit={handleSubmit}>
      <PhoneInput
        key={preferredCountries ? preferredCountries.join(",") : "default"}
        inputClass={styles.inputtelsection}
        dropdownClass={styles.dropdown}
        buttonClass={styles.country}
        inputProps={{
          name: "phone",
          required: true,
          autoFocus: false,
          ref: phoneInputRef,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            const input = event.currentTarget;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            // Normalize Persian (۰-۹) and Arabic-Indic (٠-٩) digits to English (0-9)
            const normalized = input.value
              .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
              .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48));
            if (input.value !== normalized) {
              input.value = normalized;
              input.setSelectionRange(start, end);
            }
          },
          onKeyDown: (event: { key: string; preventDefault: () => void }) => {
            if (event.key === "Enter") {
              event.preventDefault();
              document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
            }
          },
        }}
        country={defaultCountry}
        placeholder={t(LanguageKey.EnterYourphonenumber)}
        preferredCountries={preferredCountries || []}
        autoFormat={true}
        enableSearch={true}
        searchNotFound={t(LanguageKey.noresult)}
        searchPlaceholder={`🔍 ${t(LanguageKey.search)}`}
        onChange={handlePhoneChange}
        isValid={(value: string) => {
          const normalizedValue = value
            .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660))
            .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0));
          return /^\d+$/.test(normalizedValue);
        }}
      />
      <button
        disabled={loading || nationalNumber.length === 0}
        className={`${styles.button} ${nationalNumber.length === 0 && "fadeDiv"}`}
        style={{ cursor: nationalNumber.length === 0 ? "no-drop" : "pointer" }}
        type="submit">
        <span>{!loading ? t(LanguageKey.start) : <RingLoader />}</span>
        {!loading && (
          <svg xmlns="http://www.w3.org/2000/svg" width="30" fill="none" viewBox="0 0 31 32">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m25.9 10.7-5 4.1L16 9.5a1 1 0 0 0-1.2 0l-4.7 5.3-5-4a.8.8 0 0 0-1.3.7L6 22.6l-.7 2.5c-.3 1 .4 2 1.5 2H24c1 0 1.8-1 1.5-2l-.7-2.4L27 11.5a.8.8 0 0 0-1.2-.8m-8.4-3.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-6 15.3H25"
            />
          </svg>
        )}
      </button>
    </form>
  );
};

export default LandingSignIn;
