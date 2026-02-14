import ImageCompressor from "compressorjs";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { _arrayBufferToBase64 } from "saeed/helper/arrayBufferToBase64";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType, UploadFile } from "saeed/models/IResult";
import { BusinessBankAccountType } from "saeed/models/store/enum";
import RingLoader from "../../design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "../../notifications/notificationBox";
import styles from "./nationalCard.module.css";

export default function NationalCard({
  handleShowCredit,
}: {
  handleShowCredit: (bankAccount: BusinessBankAccountType) => void;
}) {
  const { data: session } = useSession();
  const [showUpload, setShowUpload] = useState(false);
  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [frontDrag, setFrontDrag] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  // وضعیت تایید سرور: "idle" | "pending" | "ok" | "fail"
  const [uploadStatus, setUploadStatus] = useState<"idle" | "pending" | "ok" | "fail">("idle");
  const [uploadStatusCredit, setUploadStatusCredit] = useState<"idle" | "pending" | "ok" | "fail">("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);

  const [postalStatus, setPostalStatus] = useState<"idle" | "pending" | "ok" | "fail">("idle");

  // state for multi-select shipping methods
  // مرحله اول: اگر تایید شد، مرحله بعدی باز شود
  // useEffect(() => {
  //   if (uploadStatus === "ok" && showUpload) {
  //     setShowUpload(false);
  //     handleShowCredit();
  //   }
  // }, [uploadStatus, showUpload]);
  async function getInstagramerAuthorizeType() {
    try {
      const res = await GetServerResult<boolean, BusinessBankAccountType>(
        MethodType.get,
        session,
        "Business/Authorize/GetInstagramerAuthorizeType"
      );
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else {
        setUploadStatus("ok");
        handleShowCredit(res.value);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function uploadNationalCard(
    url: string,
    setImg: (url: string | null) => void,
    inputRef?: React.RefObject<HTMLInputElement>
  ) {
    try {
      const res = await GetServerResult<boolean, string>(
        MethodType.get,
        session,
        "Business/Authorize/UserAuthorizeByNationalCard",
        null,
        [{ key: "url", value: url }]
      );
      if (!res.succeeded) {
        if (inputRef?.current) inputRef.current.value = "";
        setImg(null);
        notify(res.info.responseType, NotifType.Warning);
        setUploadStatus("fail");
        return;
      } else {
        getInstagramerAuthorizeType();
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  const compressAndUpload = (
    file: File,
    setImg: (url: string | null) => void,
    inputRef?: React.RefObject<HTMLInputElement>
  ) => {
    if (!file) {
      if (inputRef?.current) inputRef.current.value = "";
      setFileError(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setFileError("فرمت فایل پشتیبانی نمی‌شود. فقط JPG و PNG مجاز است.");
      if (inputRef?.current) inputRef.current.value = "";
      setImg(null);
      // Add animation trigger
      setShowErrorAnimation(true);
      setTimeout(() => setShowErrorAnimation(false), 500);
      return;
    }
    setFileError(null);
    if (uploadStatusCredit === "ok") {
      setUploadStatusCredit("idle");
    }
    setUploadStatus("pending");
    new ImageCompressor(file, {
      quality: 0.95,
      maxWidth: 700,
      maxHeight: 700,
      mimeType: "jpeg",
      success(result) {
        // result is the compressed file
        const reader = new FileReader();
        reader.onload = async () => {
          const arrayToString = _arrayBufferToBase64(reader.result as ArrayBuffer);
          setImg("data:image/jpeg;base64," + arrayToString);

          // Upload the compressed file
          try {
            // Convert Blob to File with necessary properties
            const compressedFile = new File([result], "compressed-image.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            const res = await UploadFile(session, compressedFile);
            if (res.fileName.length === 0) {
              if (inputRef?.current) inputRef.current.value = "";
              setImg(null);
              return;
            }
            await uploadNationalCard(res.fileName, setImg, inputRef);
          } catch (error) {
            console.error("Upload failed:", error);
            setUploadStatus("fail");
          }
        };
        reader.readAsArrayBuffer(result);
      },
      error(error) {
        console.error(error.message);
        setFileError("خطا در فشرده‌سازی تصویر");
        setUploadStatus("fail");
      },
    });
  };
  const progressStepUploadClass =
    uploadStatus === "ok"
      ? `${styles.progressStep} ${styles.progressStepSuccess}`
      : uploadStatus === "fail"
      ? `${styles.progressStep} ${styles.progressStepFail}`
      : styles.progressStep;

  const iconSrc = uploadStatus === "ok" ? "/click-hashtag.svg" : "/attention.svg";

  return (
    <>
      {/* مرحله 1: آپلود عکس */}
      <div className={progressStepUploadClass}>
        <div className="headerparent">
          <div className="instagramprofile">
            <img loading="lazy" width="30px" height="30px" decoding="async" src={iconSrc} />
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.Storeproduct_needyourID)}</div>
              <div className="explain">{t(LanguageKey.Storeproduct_needyourIDExplain)}</div>
            </div>
          </div>
          {uploadStatus !== "ok" && (
            <button
              className={`${styles.btn} cancelButton`}
              onClick={() => {
                setShowUpload((prev) => !prev);
                setUploadStatus("idle");
              }}
              disabled={uploadStatus === "pending"}>
              {uploadStatus === "pending" ? <RingLoader /> : showUpload ? t(LanguageKey.cancel) : t(LanguageKey.upload)}
            </button>
          )}
        </div>
        <div className={`${styles.UploadContainer} ${showUpload ? styles.show : styles.hide}`}>
          <div
            className={`${styles.uploadBox} ${frontDrag ? styles.dragover : ""} ${
              showErrorAnimation || uploadStatus === "fail" ? styles.uploadBoxError : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setFrontDrag(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setFrontDrag(false);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              setFrontDrag(false);
              const file = e.dataTransfer.files[0];
              compressAndUpload(file, (url) => setFrontImg(url), frontInputRef);
            }}>
            <label className={styles.uploadlabel}>
              {frontImg ? (
                <img
                  src={frontImg}
                  alt="Front Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 188,
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="50px" fill="#8f9bb3" viewBox="0 0 36 36">
                    <path
                      opacity=".4"
                      d="m21 4.1 6.7.3A7 7 0 0 1 32 6.2a7 7 0 0 1 1.9 4.3q.3 2.6.2 6.7v1.6l-.2 6.7a7 7 0 0 1-1.9 4.3 7 7 0 0 1-4.3 1.8q-2.5.4-6.6.3h-6.2q-4.1 0-6.6-.3A7 7 0 0 1 4 29.8a7 7 0 0 1-2-4.3q-.2-2.6-.2-6.7v-1.6l.2-6.7a7 7 0 0 1 2-4.3 7 7 0 0 1 4.3-1.8q2.6-.4 6.6-.3z"
                    />
                    <path d="M6.5 23.6c1.9-4.8 9-5.1 11 0a1 1 0 0 1-1 1.5h-9a1 1 0 0 1-1-1.5m2.5-9a3 3 0 1 1 6 0 3 3 0 0 1-6 0" />
                    <path
                      fillRule="evenodd"
                      d="M19.9 12.8q.1-1.1 1.1-1.2h7.5a1.1 1.1 0 0 1 0 2.3H21a1 1 0 0 1-1.1-1.1m0 5.2q.1-1 1.1-1.1h7.5a1.1 1.1 0 0 1 0 2.2H21a1 1 0 0 1-1.1-1.1m0 5.3Q20 22.2 21 22h3.8a1.1 1.1 0 1 1 0 2.3H21a1 1 0 0 1-1.1-1.1"
                    />
                  </svg>
                  {t(LanguageKey.product_clicktoupload)} <br />
                  {t(LanguageKey.product_ordragdrop)}
                  <span className="explain" style={{ textAlign: "center" }}>
                    (JPG, PNG) <br />
                    (Max 1MB)
                  </span>
                </>
              )}
              <input
                id="frontImgInput"
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: "none" }}
                ref={frontInputRef}
                onChange={async (e) => {
                  if (uploadStatus === "ok") return;
                  const file = e.target.files?.[0];
                  if (file) {
                    // await handleFile(
                    //   file,
                    //   (url) => setFrontImg(url),
                    //   frontInputRef
                    // );
                    compressAndUpload(file, (url) => setFrontImg(url), frontInputRef);
                  }
                }}
                disabled={uploadStatus === "pending" || uploadStatus === "ok"}
              />
            </label>
          </div>

          {fileError && <div className={styles.errorMessage}>{fileError}</div>}
          <div className={styles.explain}>
            <img
              style={{ width: "16px", height: "16px", marginInlineEnd: "10px" }}
              title="ℹ️ attention"
              src="/tooltip.svg"
            />
            {t(LanguageKey.Storeproduct_NationalCardexplain)}
          </div>

          {/* <div className={styles.buttonsContainer}>
            {frontImg && uploadStatus !== "ok" && (
              <>
                <button
                  type="button"
                  className={styles.uploadActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (frontInputRef.current) {
                      frontInputRef.current.value = "";
                      setUploadStatus("idle");
                      // اگر عکس عوض شد، صحت سنجی شماره کارت هم ریست شود
                      if (uploadStatusCredit === "ok") setUploadStatusCredit("idle");
                      frontInputRef.current.click();
                    }
                  }}
                  disabled={uploadStatus === "pending"}>
                  <img
                    className={styles.uploadmenuicon}
                    src="/edit-1.svg"
                    alt="Edit Image Icon"
                    loading="lazy"
                    decoding="async"
                  />
                  {t(LanguageKey.edit)}
                </button>
                <button
                  type="button"
                  className={styles.uploadActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    // اگر عکس حذف شد، صحت سنجی شماره کارت هم ریست شود و اینپوت هم خالی شود
                    setFrontImg(null);
                    setUploadStatus("idle");
                    if (uploadStatusCredit === "ok") {
                      setUploadStatusCredit("idle");
                    }
                    if (frontInputRef.current) frontInputRef.current.value = "";
                  }}
                  disabled={uploadStatus === "pending"}>
                  <img
                    className={styles.uploadmenuicon}
                    src="/delete.svg"
                    alt="Delete Image Icon"
                    loading="lazy"
                    decoding="async"
                  />
                  {t(LanguageKey.delete)}
                </button>
              </>
            )}
          </div> */}
        </div>
      </div>
    </>
  );
}
