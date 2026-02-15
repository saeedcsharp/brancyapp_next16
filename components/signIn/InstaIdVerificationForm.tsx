import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { IRefreshToken } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { GetServerResult, GetServerResultWIthAccessToken, MethodType } from "saeed/helper/apihelper";
import RingLoader from "../design/loader/ringLoder";
import { internalNotify, InternalResponseType, NotifType, notify } from "../notifications/notificationBox";
import styles from "./verificationForm.module.css";

export default function InstaIdVerificationForm(props: {
  preInstaToken: string;
  // redirectType: RedirectType;
  backToInstaId: () => void;
  removeMask: () => void;
  sendInstaId: () => void;
}) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(180); // Countdown starts from 120 seconds (2 minutes)
  const [canResend, setCanResend] = useState(false); // State for resend availability
  const [loading, setLoading] = useState(false);
  function handleChange(element: HTMLInputElement, index: number) {
    const value = element.value;
    if (/^[0-9]$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next empty input field
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1) {
        const nextElement = document.getElementById(`codeInput-${nextEmptyIndex}`) as HTMLInputElement;
        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Backspace") {
      const newCode = [...code];
      if (code[index] !== "") {
        // Clear current input and stay in the same input field
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        // Move to the previous input field and clear it
        const prevElement = document.getElementById(`codeInput-${index - 1}`) as HTMLInputElement;
        if (prevElement) {
          prevElement.focus();
        }
        newCode[index - 1] = "";
        setCode(newCode);
      }
    }
  }
  function handleResendCode(e: MouseEvent) {
    props.sendInstaId();
    e.preventDefault();
    setCode(new Array(6).fill("")); // Clear the code inputs
    setTimeLeft(180); // Reset the timer to 2 minutes
    setCanResend(false); // Disable resend until time runs out again
    console.log("Resending code..."); // Add your resend logic here
    // You might call an API here to resend the code
  }
  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }
  async function handleSubmit() {
    if (timeLeft <= 0) {
      internalNotify(InternalResponseType.TimeExpire, NotifType.Error);
      return;
    }
    const verificationCode = code.join("");
    setLoading(true);
    try {
      console.log("Start GetServerResultWIthAccessToken");
      const response = await GetServerResultWIthAccessToken<boolean, number>(
        MethodType.get,
        props.preInstaToken,
        "PreInstagramer/VerifyCode",
        null,
        [{ key: "verificationCode", value: verificationCode }]
      );
      if (response.statusCode !== 200) {
        setCode(new Array(6).fill(""));
        notify(response.info.responseType, NotifType.Error);
      } else {
        const res = await GetServerResult<boolean, IRefreshToken>(MethodType.get, session, "user/RefreshToken");
        if (res.succeeded) {
          await update({
            ...session,
            user: {
              ...session?.user,
              instagramerIds: res.value.role.instagramerIds,
              accessToken: res.value.token,
              socketAccessToken: res.value.socketAccessToken,
              currentIndex: res.value.role.instagramerIds.indexOf(response.value),
            },
          });
        }
        router.push("/");
      }
    } catch (error) {
      internalNotify(InternalResponseType.Network, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]);

  useEffect(() => {
    document.getElementById("codeInput-0")?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true); // Enable the resend button when time runs out
    }
  }, [timeLeft]);

  return (
    <>
      <div className={styles.popupsignup} style={{ alignItems: "flex-start" }}>
        <img onClick={props.backToInstaId} className={styles.backbtn} src="/back-blue.svg" alt="Back" />

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.welcometext1}>
            Enter your verification code
            <div className={styles.welcometext2}>please insert your number to get free account</div>
          </div>
          {loading && <RingLoader />}
          {!loading && (
            <>
              <div className={styles.inputFieldall}>
                <div className={styles.welcometext1} style={{ textAlign: "left" }}>
                  Enter code
                </div>
                {!loading && (
                  <div className={styles.inputField}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`codeInput-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                        className={styles.input}
                        disabled={timeLeft <= 0}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Countdown Timer */}
              <div className={styles.timer}>Time remaining: {formatTime(timeLeft)}</div>
              {canResend ? (
                <button type="button" onClick={(e: MouseEvent) => handleResendCode(e)} className={styles.resendButton}>
                  Resend code
                </button>
              ) : (
                <button
                  id="submit"
                  className={code.every((digit) => digit !== "") ? styles.nextbtn : `${styles.nextbtn} ${"fadeDiv"}`}
                  type="submit"
                  disabled={timeLeft <= 0}>
                  Submit
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </>
  );
}
