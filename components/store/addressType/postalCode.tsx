import { t } from "i18next";
import { useSession } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/api";
import { IAddress, ILogistic } from "saeed/models/userPanel/orders";
import styles from "./postalCode.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

export default function PostalCode({ handleShowLogestic }: { handleShowLogestic: (logistics: ILogistic[]) => void }) {
  const { data: session } = useSession();
  const [postalStatus, setPostalStatus] = useState<"idle" | "pending" | "ok" | "fail" | "verify">("idle");
  const [postalCode, setPostalCode] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState<IAddress | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(true);
  // فقط اعداد برای کدپستی
  const handlePostalCodeInput = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    // اگر قبلا تایید شده یا رد شده و کاربر تغییر داد، به حالت اولیه برگردد
    if (postalStatus === "ok" || postalStatus === "fail" || postalStatus === "verify") {
      setPostalStatus("idle");
    }

    // Show search button when input changes
    setShowSearchButton(true);
    setPostalCode(value);
  };

  const validatePostalCode = async () => {
    setPostalStatus("pending");
    // Hide search button when clicked
    setShowSearchButton(false);
    setTimeout(() => {
      handleCreatePostByPostalCode(postalCode);
    }, 1200);
  };

  async function getShopLogistic() {
    try {
      const res = await clientFetchApi<boolean, ILogistic[]>("/api/authorize/GetShopLogestics", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        setPostalStatus("ok");
        setShowAddress(false);
        handleShowLogestic(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleVerifyAddress() {
    setPostalStatus("pending");
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/authorize/SetShopAddress", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "addressId", value: address?.id.toString() }], onUploadProgress: undefined });
      if (res.succeeded) {
        getShopLogistic();
      } else {
        setPostalStatus("fail");
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleCreatePostByPostalCode(code: string) {
    try {
      const res = await clientFetchApi<boolean, IAddress>("/api/address/CreateAddressByPostalCode", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "postalCode", value: code }], onUploadProgress: undefined });
      if (res.succeeded) {
        setPostalStatus("verify");
        setAddress(res.value);
      } else {
        setPostalStatus("fail");
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      setPostalStatus("fail");
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  return (
    <div
      className={
        postalStatus === "ok"
          ? `${styles.progressStep} ${styles.progressStepSuccess}`
          : postalStatus === "fail"
          ? `${styles.progressStep} ${styles.progressStepFail}`
          : styles.progressStep
      }>
      <div className="headerparent">
        <div className="instagramprofile">
          <img width="30px" height="30px" src={postalStatus === "ok" ? "/click-hashtag.svg" : "/attention.svg"} />
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.Storeproduct_postalcode)}</div>
            <div className="explain">{t(LanguageKey.Storeproduct_postalcodeExplain)}</div>
          </div>
        </div>
        {postalStatus !== "ok" && (
          <button
            className={`${styles.btn} ${postalStatus === "verify" && showAddress ? "saveButton" : "cancelButton"}`}
            disabled={postalStatus === "pending"}
            onClick={() => {
              if (postalStatus === "verify") {
                handleVerifyAddress();
              } else setShowAddress(!showAddress);
            }}>
            {postalStatus === "pending" ? (
              <RingLoader />
            ) : postalStatus === "verify" ? (
              showAddress ? (
                t(LanguageKey.VerifyAddress)
              ) : (
                t(LanguageKey.close)
              )
            ) : showAddress ? (
              t(LanguageKey.close)
            ) : (
              t(LanguageKey.add)
            )}
          </button>
        )}
      </div>
      <div className={`${styles.UploadContainer} ${showAddress ? styles.show : styles.hide}`}>
        <div className="headerandinput">
          <div className="headerparent" style={{ width: "max-content", minWidth: "280px" }}>
            <input
              style={{ margin: "4px" }}
              type="text"
              className={`${styles.input} ${postalStatus === "fail" ? styles.inputError : ""}`}
              placeholder={t(LanguageKey.pageToolspopup_typehere)}
              value={postalCode}
              onChange={handlePostalCodeInput}
              inputMode="numeric"
              disabled={postalStatus === "pending"}
            />
            {showSearchButton && (
              <button
                type="button"
                style={{
                  width: "max-content",
                  height: "37px",
                  paddingInline: "10px",
                }}
                className="saveButton"
                onClick={validatePostalCode}
                disabled={postalStatus === "pending"}>
                {postalStatus === "pending" ? <RingLoader /> : t(LanguageKey.search)}
              </button>
            )}
          </div>
          <div className={styles.explain}>
            <img
              style={{ width: "16px", height: "16px", marginInlineEnd: "10px" }}
              title="ℹ️ attention"
              src="/tooltip.svg"
            />
            {t(LanguageKey.Storeproduct_postalcodeinputExplain)}
          </div>
        </div>
        {postalStatus === "verify" && address && (
          <div className="headerandinput" style={{ marginTop: "15px" }}>
            {/* <div className="headertext">{t(LanguageKey.Storeproduct_postalcode)}</div> */}
            <div className={styles.addressText}>{address.address}</div>
            <div className={styles.mapContainer}>
              <img className={styles.map} src={baseMediaUrl + address.url} alt="Location map" />
            </div>
          </div>
        )}
        {/* <button
            type="button"
            className={styles.uploadActionBtn}
            style={{ marginTop: 12, marginBottom: 8 }}
            onClick={handleSelectLocation}
            disabled={postalStatus === "pending"}>
            {location ? "موقعیت انتخاب شد" : "انتخاب موقعیت روی نقشه"}
          </button> */}
        {/* {location && (
            <div className={styles.explain} style={{ color: "#0070f3" }}>
              lat: {location.lat} , lng: {location.lng}
            </div>
          )} */}
      </div>
    </div>
  );
}
