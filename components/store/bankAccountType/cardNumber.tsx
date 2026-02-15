import { useSession } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { InputTypeAddress } from "saeed/models/userPanel/orders";
import styles from "./bankAccountType.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
export default function CardNumber({
  handleShowAddress,
}: {
  handleShowAddress: (addressType: InputTypeAddress) => void;
}) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  // وضعیت تایید سرور: "idle" | "pending" | "ok" | "fail"

  const [uploadStatusCredit, setUploadStatusCredit] = useState<"idle" | "pending" | "ok" | "fail">("idle");

  // state برای باز/بسته شدن مراحل دوم و سوم
  const [showCredit, setShowCredit] = useState(false);

  // state برای مقدار اینپوت کارت و انتخاب رادیو
  const [creditNumber, setCreditNumber] = useState("");
  const [creditError, setCreditError] = useState<string | null>(null);

  const formatCardNumber = (num: string) => {
    return num
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1-")
      .replace(/-$/, "");
  };
  // فقط اعداد و حداکثر 16 رقم و نمایش با "-"
  const handleCreditInput = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // فقط عدد
    if (value.length > 16) value = value.slice(0, 16);

    // اگر قبلا صحت سنجی شده و کاربر شماره کارت را پاک کند، وضعیت به حالت اولیه برگردد
    if ((uploadStatusCredit === "ok" || uploadStatusCredit === "fail") && value.length < 16) {
      setUploadStatusCredit("idle");
    }
    // اگر قبلا صحت سنجی شده و کاربر شماره کارت را تغییر دهد، وضعیت به حالت اولیه برگردد
    if (
      (uploadStatusCredit === "ok" || uploadStatusCredit === "fail") &&
      value.length === 16 &&
      value !== creditNumber
    ) {
      setUploadStatusCredit("idle");
    }

    setCreditNumber(value);

    if (value.length === 16) {
      setCreditError(null);
      // اگر هنوز صحت سنجی نشده، صحت سنجی را آغاز کن
      if (uploadStatusCredit === "idle") {
        setUploadStatusCredit("pending");
        setTimeout(async () => {
          await authorizeInstagramerByCardNumber(value);
        }, 1200);
      }
    } else if (value.length > 0 && value.length < 16) {
      setCreditError("شماره کارت باید 16 رقم باشد");
    } else {
      setCreditError(null);
    }
  };
  async function handleGetAddressInputType() {
    try {
      const res = await clientFetchApi<boolean, InputTypeAddress>("/api/address/GetAddressInputType", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        setUploadStatusCredit("ok");
        handleShowAddress(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function authorizeInstagramerByCardNumber(cardNumber: string) {
    try {
      const res = await clientFetchApi<boolean, number>("/api/authorize/AuthorizeInstagramerByCardNumber", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "cardNumber", value: cardNumber }], onUploadProgress: undefined });
      if (!res.succeeded) {
        setUploadStatusCredit("fail");
        notify(res.info.responseType, NotifType.Warning);
      } else {
        handleGetAddressInputType();
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  return (
    <div
      className={
        uploadStatusCredit === "ok"
          ? `${styles.progressStep} ${styles.progressStepSuccess}`
          : uploadStatusCredit === "fail"
          ? `${styles.progressStep} ${styles.progressStepFail}`
          : styles.progressStep
      }>
      <div className="headerparent">
        <div className="instagramprofile">
          <img width="30px" height="30px" src={uploadStatusCredit === "ok" ? "/click-hashtag.svg" : "/attention.svg"} />
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.Storeproduct_addcreditnumber)}</div>
            <div className="explain">{t(LanguageKey.Storeproduct_addcreditnumberExplain)}</div>
          </div>
        </div>

        <button className={`${styles.btn} cancelButton`} onClick={() => setShowCredit((prev) => !prev)}>
          {uploadStatusCredit === "pending" ? (
            <RingLoader />
          ) : uploadStatusCredit === "ok" ? (
            showCredit ? (
              t(LanguageKey.close)
            ) : (
              t(LanguageKey.done)
            )
          ) : showCredit ? (
            t(LanguageKey.close)
          ) : (
            t(LanguageKey.add)
          )}
        </button>
      </div>
      <div className={`${styles.UploadContainer} ${showCredit ? styles.show : styles.hide}`}>
        <div className="headerandinput" style={{ margin: "10px" }}>
          <input
            id="creditNumberInput"
            type="text"
            className={`${styles.input} ${uploadStatusCredit === "fail" ? styles.inputError : ""}`}
            placeholder={t(LanguageKey.pageToolspopup_typehere)}
            value={formatCardNumber(creditNumber)}
            onChange={handleCreditInput}
            inputMode="numeric"
            maxLength={19}
            disabled={uploadStatusCredit === "pending"}
          />
          <div className={styles.explain}>
            <img
              style={{ width: "16px", height: "16px", marginInlineEnd: "10px" }}
              title="ℹ️ attention"
              src="/tooltip.svg"
            />
            {t(LanguageKey.Storeproduct_creditcardsameidcard)}
          </div>

          {/* <div
            className={styles.explain}
            style={{
              color: "var(--color-dark-red)",
              visibility: creditError ? "visible" : "hidden",
            }}>
            {creditError ? creditError : ""}
          </div> */}
        </div>
      </div>
    </div>
  );
}
