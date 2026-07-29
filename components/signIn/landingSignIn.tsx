import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "brancy/components/design/phoneInput";
import type { PhoneValue } from "brancy/components/design/phoneInput";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import RingLoader from "brancy/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import styles from "./landingSignIn.module.css";
import { clientFetchApiWithAccessToken } from "brancy/helper/clientFetchApi";
import { SendCodeResult } from "brancy/models/interfaces";

const LandingSignIn = (prop: { handleShowVerification: (preUserToken: string) => void }) => {
  const { t } = useTranslation();
  const [defaultCountry] = useState("gb");

  const [countryCode, setCountryCode] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [e164PhoneNumber, setE164PhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
            value: e164PhoneNumber,
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
  }, []);
  return (
    <form className={`${styles.inputcodesection} translate`} onSubmit={handleSubmit}>
      <PhoneInput
        numberInputName="phone"
        defaultCountry={defaultCountry}
        enableFormatting={true}
        enableSearch={true}
        onChange={(phone: PhoneValue) => {
          setCountryCode(phone.countryCode);
          setNationalNumber(phone.nationalNumber);
          setE164PhoneNumber(phone.e164);
        }}
        validate={(phone: PhoneValue) => phone.nationalNumber.length > 0 && phone.isValid}
        autoFocus={false}
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
