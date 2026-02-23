import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, ClipboardEvent, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import RingLoader from "brancy/components/design/loader/ringLoder";
import { NotifType, notify } from "brancy/components/notifications/notificationBox";
import styles from "brancy/components/signIn/verificationForm.module.css";

export default function VerificationForm(props: {
  nationalNumber: string;
  countryCode: string;
  preuserToken: string;
  verificationCode: string;
  backToPhone: (nationalNumber: string, countryCode: string) => void;
  removeMask: () => void;
  sendPhonenumber: () => void;
}) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { t } = useTranslation();
  const [verifyCodeLoading, setVerifyLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  function handleChange(element: HTMLInputElement, index: number) {
    const value = element.value;

    const convertToEnglishDigits = (input: string) =>
      input
        .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
        .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));

    const normalizedValue = convertToEnglishDigits(value);

    if (/^[0-9]$/.test(normalizedValue)) {
      const newCode = [...code];
      newCode[index] = normalizedValue;
      setCode(newCode);

      // Focus the next input when available
      if (index < code.length - 1) {
        const nextInput = document.getElementById(`codeInput-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  }

  // Handle paste event to allow auto complete of OTP SMS code
  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Backspace") {
      const newCode = [...code];
      if (newCode[index] !== "") {
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        const prevInput = document.getElementById(`codeInput-${index - 1}`) as HTMLInputElement;
        prevInput?.focus();
        newCode[index - 1] = "";
        setCode(newCode);
      }
    }
  }

  function handleResendCode(e: MouseEvent) {
    e.preventDefault();
    props.sendPhonenumber();
    setCode(new Array(6).fill(""));
    setTimeLeft(60);
    setCanResend(false);
    console.log("Resending code...");
  }

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }

  async function handleSubmit() {
    setVerifyLoading(true);
    if (timeLeft <= 0) {
      return;
    }

    const verificationCode = code.join("");
    const res = await signIn("credentials", {
      redirect: false,
      preuserToken: props.preuserToken,
      verificationCode,
    });

    if (res && !res.error) {
      // Refresh the session so useSession() returns the new token immediately
      await updateSession();
      // Navigate to home — hard reload guarantees a fresh session everywhere
      window.location.href = "/home";
      return;
    }

    setVerifyLoading(false);
    if (res && res.error) {
      setCode(new Array(6).fill(""));
      triggerErrorAnimation();
      notify(parseInt(res.error), NotifType.Warning);
    }
  }

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]);

  useEffect(() => {
    if ("OTPCredential" in window) {
      navigator.credentials
        .get({ otp: { transport: ["sms"] } } as any)
        .then((otp) => {
          if (otp) {
            const otpCode = (otp as any).code.split("");
            setCode(otpCode);

            // Automatically submit after filling all inputs
            if (otpCode.length === 6) {
              handleSubmit();
            }
          }
        })
        .catch((err) => console.error("WebOTP API error:", err));
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Add this new useEffect to focus the first input on component mount
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Function to trigger error animation
  const triggerErrorAnimation = () => {
    setIsShaking(true);
    setHasError(true);

    // Remove shake animation after 0.5s
    setTimeout(() => {
      setIsShaking(false);
    }, 500);

    // Remove error styling after 2s
    setTimeout(() => {
      setHasError(false);
    }, 2000);
  };

  return (
    <form
      className={`${styles.popupsignup} translate`}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
      <img
        onClick={() => props.backToPhone(props.nationalNumber, props.countryCode)}
        className={styles.backbtn}
        src="/back-box.svg"
        alt="Back"
        title="ℹ️ back"
      />
      <div className="headerandinput" style={{ alignItems: "center", textAlign: "center" }}>
        <div className="title">{t(LanguageKey.VerificationCode)}</div>
        <div className="explain" style={{ alignItems: "center", textAlign: "center" }}>
          {t(LanguageKey.VerificationCodeExplain)}
        </div>
      </div>

      <div className={`${styles.inputField} ${isShaking ? styles.inputFieldShake : ""} translate`}>
        {code.map((digit, index) => (
          <input
            key={index}
            id={`codeInput-${index}`}
            ref={index === 0 ? firstInputRef : null}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`${styles.input} ${hasError ? styles.inputError : ""}`}
            inputMode="numeric"
            autoComplete="one-time-code"
            disabled={timeLeft <= 0}
          />
        ))}
        {/* {error && (
          <label id="notification" className={styles.error}>
            {error}
          </label>
        )} */}
      </div>

      <div className="explain" style={{ alignItems: "center", textAlign: "center" }}>
        {t(LanguageKey.remainingTime)} <strong>{formatTime(timeLeft)}</strong>
      </div>

      {canResend ? (
        <button type="button" onClick={handleResendCode} className={styles.nextbtn}>
          {t(LanguageKey.ResendVerificationCode)}
        </button>
      ) : (
        <button
          id="submit"
          className={code.every((digit) => digit !== "") ? styles.nextbtn : `${styles.nextbtn} fadeDiv`}
          type="submit"
          disabled={timeLeft <= 0 || verifyCodeLoading}>
          {!verifyCodeLoading ? t(LanguageKey.VerifyCode) : <RingLoader />}
        </button>
      )}
    </form>
  );
}
