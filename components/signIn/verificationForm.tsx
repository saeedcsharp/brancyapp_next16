import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import RingLoader from "brancy/components/design/loader/ringLoder";
import { NotifType, notify } from "brancy/components/notifications/notificationBox";
import styles from "./verificationForm.module.css";

const CODE_LENGTH = 6;
const RESEND_DELAY_SECONDS = 60;
const SHAKE_DURATION_MS = 500;
const ERROR_DISPLAY_DURATION_MS = 2000;
const CODE_PATTERN = new RegExp(`^\\d{${CODE_LENGTH}}$`);

type WebOtpCredential = Credential & { code: string };
type WebOtpRequestOptions = CredentialRequestOptions & {
  otp: { transport: ["sms"] };
};

function createEmptyCode() {
  return new Array<string>(CODE_LENGTH).fill("");
}

function formatTime(time: number) {
  return String(time);
}

function normalizeDigits(input: string) {
  return input
    .replace(/[۰-۹]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 1584));
}

export default function VerificationForm(props: {
  nationalNumber: string;
  countryCode: string;
  preuserToken: string;
  backToPhone: (nationalNumber: string, countryCode: string) => void;
  sendPhonenumber: () => void;
}) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [code, setCode] = useState<string[]>(new Array(CODE_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(RESEND_DELAY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const { t } = useTranslation();
  const [verifyCodeLoading, setVerifyLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const codeRef = useRef<string[]>(createEmptyCode());
  const submitInFlightRef = useRef(false);
  const isMountedRef = useRef(true);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);
  const triggerErrorAnimation = useCallback(() => {
    setIsShaking(true);
    setHasError(true);

    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);

    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false);
    }, SHAKE_DURATION_MS);

    errorTimeoutRef.current = setTimeout(() => {
      setHasError(false);
    }, ERROR_DISPLAY_DURATION_MS);
    focusInput(0);
  }, [focusInput]);

  const verificationCode = useMemo(() => code.join(""), [code]);
  const isCodeComplete = useMemo(() => CODE_PATTERN.test(verificationCode), [verificationCode]);

  codeRef.current = code;

  const handleChange = useCallback(
    (element: HTMLInputElement, index: number) => {
      const normalizedValue = normalizeDigits(element.value);

      if (!/^\d+$/.test(normalizedValue)) {
        return;
      }

      const digits = normalizedValue.slice(0, CODE_LENGTH - index).split("");
      setCode((previousCode) => {
        const nextCode = [...previousCode];
        digits.forEach((digit, digitIndex) => {
          nextCode[index + digitIndex] = digit;
        });
        return nextCode;
      });
      focusInput(Math.min(index + digits.length, CODE_LENGTH - 1));
    },
    [focusInput],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = normalizeDigits(e.clipboardData.getData("Text").trim());
      if (CODE_PATTERN.test(pastedData)) {
        const newCode = pastedData.split("");
        setCode(() => newCode);
        focusInput(CODE_LENGTH - 1);
      }
    },
    [focusInput],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === "Backspace") {
        const currentCode = codeRef.current;
        if (currentCode[index] !== "") {
          setCode((previousCode) => {
            const nextCode = [...previousCode];
            nextCode[index] = "";
            return nextCode;
          });
        } else if (index > 0) {
          focusInput(index - 1);
          setCode((previousCode) => {
            const nextCode = [...previousCode];
            nextCode[index - 1] = "";
            return nextCode;
          });
        }
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        focusInput(index - 1);
      } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
        event.preventDefault();
        focusInput(index + 1);
      }
    },
    [focusInput],
  );

  function handleResendCode(e: MouseEvent) {
    e.preventDefault();
    props.sendPhonenumber();
    setCode(() => createEmptyCode());
    setTimeLeft(RESEND_DELAY_SECONDS);
    setCanResend(false);
  }

  const handleSubmit = useCallback(async () => {
    if (timeLeft <= 0 || submitInFlightRef.current || !isCodeComplete) {
      return;
    }

    submitInFlightRef.current = true;
    setVerifyLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        preuserToken: props.preuserToken,
        verificationCode,
      });

      if (res && !res.error) {
        await updateSession();
        if (isMountedRef.current) {
          await router.replace("/home");
        }
        return;
      }

      if (isMountedRef.current && res?.error) {
        setCode(() => createEmptyCode());
        triggerErrorAnimation();
        notify(Number.parseInt(res.error, 10), NotifType.Warning);
      }
    } catch (error) {
      if (isMountedRef.current) {
        triggerErrorAnimation();
        notify(0, NotifType.Warning);
      }
      console.error("Verification sign-in failed:", error);
    } finally {
      submitInFlightRef.current = false;
      if (isMountedRef.current) {
        setVerifyLoading(false);
      }
    }
  }, [isCodeComplete, props.preuserToken, router, timeLeft, triggerErrorAnimation, updateSession, verificationCode]);

  useEffect(() => {
    if (isCodeComplete) {
      handleSubmit();
    }
  }, [handleSubmit, isCodeComplete]);

  useEffect(() => {
    if ("OTPCredential" in window) {
      const controller = new AbortController();
      navigator.credentials
        .get({ otp: { transport: ["sms"] }, signal: controller.signal } as WebOtpRequestOptions)
        .then((otp) => {
          if (otp) {
            const otpCode = normalizeDigits((otp as WebOtpCredential).code).split("");
            if (otpCode.length === CODE_LENGTH && CODE_PATTERN.test(otpCode.join(""))) {
              setCode(otpCode);
            }
          }
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("WebOTP API error:", err);
        });

      return () => controller.abort();
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft((currentTime) => currentTime - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    isMountedRef.current = true;
    focusInput(0);
    return () => {
      isMountedRef.current = false;
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [focusInput]);

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

      <div
        className={`${styles.inputField} ${isShaking ? styles.inputFieldShake : ""} translate`}
        aria-live={hasError ? "assertive" : "off"}>
        {code.map((digit, index) => (
          <input
            key={index}
            id={`codeInput-${index}`}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            maxLength={CODE_LENGTH}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`${styles.input} ${hasError ? styles.inputError : ""}`}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`${t(LanguageKey.VerificationCode)} ${index + 1}`}
            aria-invalid={hasError}
            aria-describedby="verification-timer"
            onFocus={(e) => e.currentTarget.select()}
            disabled={timeLeft <= 0}
          />
        ))}
        {/* {error && (
          <label id="notification" className={styles.error}>
            {error}
          </label>
        )} */}
      </div>

      <div id="verification-timer" className="explain" style={{ alignItems: "center", textAlign: "center" }}>
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
