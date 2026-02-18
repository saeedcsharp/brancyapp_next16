import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { detectLocaleFromTimezone } from "saeed/helper/detectLocaleFromTimezone";
import { LanguageKey } from "saeed/i18n";
import { SendCodeResult } from "saeed/models/ApiModels/User/SendCodeResult";
import { MethodType } from "saeed/helper/api";
import GoogleLoginButton from "./googleLoginPopup";
import ReactPhoneInput from "./reactPhoneInput";
import styles from "./signIn.module.css";
import VerificationForm from "./verificationForm";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
export enum SignInType {
  Phonenumber = 0,
  VerificaionCode = 1,
}
export enum RedirectType {
  Instagramer = 0,
  User = 1,
  None = 2,
}

export default function SignIn(props: {
  preUserToken: string;
  signInType: SignInType;
  redirectType: RedirectType;
  removeMask: () => void;
  removeMaskWithNotif: () => void;
}) {
  const { t } = useTranslation();
  // const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [signInType, setSignInType] = useState<SignInType>(props.signInType);
  const [preUserToken, setPreUserToken] = useState(props.preUserToken);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isIranTimezone, setIsIranTimezone] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendPhonenumber();
  }
  async function sendPhonenumber() {
    setLoading(true);
    try {
      console.log("hello", nationalNumber);
      var res = await clientFetchApi<boolean, SendCodeResult>("/api/user/signIn", { methodType: MethodType.get, session: null, data: null, queries: [
        {
          key: "phoneNumber",
          value: nationalNumber,
        },
        {
          key: "timezoneOffset",
          value: (new Date().getTimezoneOffset() * 60 * -1).toString(),
        },
        {
          key: "countryCOde",
          value: countryCode,
        },
        {
          key: "sessionId",
          value: sessionId ?? undefined,
        },
      ], onUploadProgress: undefined });
      if (res.succeeded) {
        setPreUserToken(res.value.token);
        setSignInType(SignInType.VerificaionCode);
      } else {
        setError(res.info.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
    console.log(error);
  }
  const handleBackClickToPhonenumber = (nationalNumber: string, countryCode: string) => {
    setCountryCode(countryCode);
    setNationalNumber(nationalNumber);
    setSignInType(SignInType.Phonenumber);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };
  const handlePhoneChange = (value: string, country: { dialCode: string; countryCode: string }) => {
    // setPhone(value);
    console.log("countryCode", dialCode);
    setDialCode(`${country.dialCode}`);
    setCountryCode(country.countryCode);
    setNationalNumber(value);
  };
  useEffect(() => {
    console.log("signinnnnnnnnnnnnnnnnnnnnnnnnnn");
    let session = window.localStorage.getItem("sessionId");
    setSessionId(session);

    // Check if user is in Iran timezone
    const localeSettings = detectLocaleFromTimezone();
    setIsIranTimezone(localeSettings.countryCode === "ir");
  }, []);
  return (
    <>
      <div
        className={`dialogBg translate`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
        {signInType === SignInType.Phonenumber && (
          <div className={styles.popupsignup}>
            <img
              onClick={props.removeMask}
              style={{
                cursor: "pointer",
                width: "35px",
                height: "35px",
                alignSelf: "end",
              }}
              title="ℹ️ close"
              src="/close-box.svg"
            />
            <div
              className="headerandinput"
              style={{
                alignItems: "center",
                textAlign: "center",
                gap: "var(--gap-20)",
              }}>
              <div className={styles.welcometext1}>{t(LanguageKey.welcomeToBrancy)}</div>

              <div className="explain" style={{ alignItems: "center", textAlign: "center" }}>
                {t(LanguageKey.welcomeToBrancyExplainPhone)}
              </div>
            </div>

            {/* نمایش بر اساس timezone */}
            {isIranTimezone ? (
              <form onSubmit={handleSubmit}>
                <ReactPhoneInput
                  loading={loading}
                  natinalNumber={nationalNumber}
                  handlePhoneChange={handlePhoneChange}
                />
              </form>
            ) : (
              <>
                <GoogleLoginButton
                  googleAuthUrl={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${
                    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
                  }&redirect_uri=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}googleoauth`
                  )}&response_type=code&scope=${encodeURIComponent(
                    "openid email profile"
                  )}&access_type=offline&prompt=consent`}
                  onSuccess={() => {
                    console.log("Google login successful");
                    props.removeMaskWithNotif();
                  }}
                  onError={(error) => {
                    console.error("Google login error:", error);
                    setError(error);
                  }}
                  className={styles.googleButton}>
                  <img src="/google.png" alt="Google" style={{ width: "20px", height: "20px" }} />
                  <span>{t(LanguageKey.loginWithGoogle)}</span>
                </GoogleLoginButton>
                <form onSubmit={handleSubmit}>
                  <ReactPhoneInput
                    loading={loading}
                    natinalNumber={nationalNumber}
                    handlePhoneChange={handlePhoneChange}
                  />
                </form>
              </>
            )}
          </div>
        )}
        {signInType === SignInType.VerificaionCode && (
          <VerificationForm
            nationalNumber={nationalNumber}
            countryCode={countryCode}
            preuserToken={preUserToken}
            verificationCode={""}
            backToPhone={handleBackClickToPhonenumber}
            removeMask={props.removeMask}
            sendPhonenumber={sendPhonenumber}
          />
        )}
      </div>
    </>
  );
}
