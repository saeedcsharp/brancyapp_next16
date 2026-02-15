import ImageCompressor from "compressorjs";
import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { HuePicker } from "react-color";
import { useTranslation } from "react-i18next";
import Slider from "react-slider";
import RingLoader from "saeed/components/design/loader/ringLoder";
import TextArea from "saeed/components/design/textArea/textArea";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { hexToRgb, rgbToHex } from "saeed/helper/rgbaToHex";
import { LanguageKey } from "saeed/i18n";
import { MethodType, UploadFile } from "saeed/helper/apihelper";
import { IGetLastBanner, ILotteryInfo, LotteryType } from "saeed/models/page/tools/tools";
import styles from "./winnerAnnouncementAndBanner.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

// Function to get current Persian date and time
const getCurrentPersianDateTime = (): string => {
  const now = new Date();

  // Convert Gregorian to Persian date (approximate conversion)
  // This is a simplified conversion - for production, consider using a proper Persian calendar library
  const gregorianYear = now.getFullYear();
  const persianYear = gregorianYear - 621;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  // Format: YYYY/MM/DD-HH:MM:SS
  return `${persianYear}/${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}-${hours}:${minutes}:${seconds}`;
};
const WinnerAnnouncementAndBanner = (props: {
  lotteryInfo: ILotteryInfo;
  lotteryType: LotteryType;
  loadindTosave: boolean;
  customImageBase64: string | null;
  removeMask: () => void;
  backButton: () => void;
  saveButton: (winnerResult: ILotteryInfo, customImageBase64: string | null) => void;
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [toggleCheckBoxButton, setToggleCheckBoxButton] = useState(true);
  const [bannerInfo, setBannerInfo] = useState<IGetLastBanner>({
    bannerUrls: [],
    boxColor: "bbbbbb",
    boxOpacity: 50,
    fontColor: "000000",
  });
  const [publishStoryCheckBox, setPublishStoryCheckBox] = useState(props.lotteryInfo.publishBanner);
  const [boxColor, setBoxColor] = useState({ rgb: { b: 253, g: 253, r: 253 } });
  const [boxOpacity, setBoxOpacity] = useState(props.lotteryInfo.boxOpacity ? props.lotteryInfo.boxOpacity : 100);
  const [boxBlur, setBoxBlur] = useState<number>(
    props.lotteryInfo && (props.lotteryInfo as any).boxBlur ? (props.lotteryInfo as any).boxBlur : 0
  );
  const [fontBoxColor, setFontBoxColor] = useState({
    hex: props.lotteryInfo.fontColor || "#000000",
  });
  const [textArea, setTextArea] = useState("");
  const [charCount, setcharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDiv, setSelectedDiv] = useState("");
  const [customBannerId, setCustomBannerId] = useState("");
  const bannerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDiv("");
    const file = e.target.files?.[0];
    if (file) {
      console.log("فایل اصلی - حجم:", file.size, "بایت");
      new ImageCompressor(file, {
        quality: 0.95,
        maxWidth: 700,
        maxHeight: 700,
        mimeType: "image/jpeg",
        success(result) {
          console.log("فایل فشرده شده - حجم:", result.size, "بایت");
          console.log("درصد کاهش حجم:", (((file.size - result.size) / file.size) * 100).toFixed(2) + "%");

          // تبدیل Blob به File
          const compressedFile = new File([result], file.name, {
            type: result.type,
            lastModified: Date.now(),
          });

          const reader = new FileReader();
          reader.onload = async (e) => {
            setSelectedImage(reader.result as string);
            // ارسال فایل فشرده شده به جای فایل اصلی
            const res = await UploadFile(session, compressedFile);
            console.log("آیدی فایل آپلود شده:", res);
            setCustomBannerId(res.fileName);
          };
          reader.readAsDataURL(result);
        },
        error(err) {
          console.error("خطا در فشردن فایل:", err);
          // در صورت خطا، از فایل اصلی استفاده می‌کنیم
          const reader = new FileReader();
          reader.onload = async (e) => {
            setSelectedImage(reader.result as string);
            const res = await UploadFile(session, file);
            setCustomBannerId(res.fileName);
          };
          reader.readAsDataURL(file);
        },
      });
    }
  };
  const handleUploadImage = () => {
    setSelectedDiv("");
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  const handleBoxOpacityChange = (newValue: number) => {
    setBoxOpacity(newValue);
  };
  const handleBoxBlurChange = (newValue: number) => {
    setBoxBlur(newValue);
  };
  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split("\n");
    if (lines.length > 6) {
      e.target.value = lines.slice(0, 7).join("\n");
    }
    setTextArea(e.target.value);
    setcharCount(e.target.value.length);
  };
  const [defaultBannerUrl, setDefaultBannerUrl] = useState("");
  const handleSelectBanner = (id: string) => {
    if (isDragging) return; // Prevent selection during drag
    if (id == "newBanner") {
      console.log("customBannerIddddddddd", customBannerId);
      setSelectedDiv("newBanner");
    } else {
      setDefaultBannerUrl(bannerInfo.bannerUrls[parseInt(id)]);
      setSelectedDiv(id);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bannerContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - bannerContainerRef.current.offsetLeft);
    setScrollLeft(bannerContainerRef.current.scrollLeft);
    bannerContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !bannerContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - bannerContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    bannerContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (bannerContainerRef.current) {
      bannerContainerRef.current.style.cursor = "grab";
    }
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!bannerContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - bannerContainerRef.current.offsetLeft);
    setScrollLeft(bannerContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !bannerContainerRef.current) return;
    const x = e.touches[0].pageX - bannerContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    bannerContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  const handleStartButton = () => {
    const saveBanner = props.lotteryInfo;
    saveBanner.includeBanner = toggleCheckBoxButton;
    saveBanner.publishBanner = publishStoryCheckBox;
    saveBanner.boxColor = rgbToHex(boxColor);
    saveBanner.fontColor = fontBoxColor.hex;
    saveBanner.boxOpacity = boxOpacity;
    (saveBanner as any).boxBlur = boxBlur;
    saveBanner.bannerTitle = textArea;
    saveBanner.bannerUrl = selectedDiv == "newBanner" ? customBannerId : defaultBannerUrl;
    console.log("saveBanner", saveBanner);
    props.saveButton(saveBanner, selectedImage);
  };
  async function handleGetLastBanner() {
    try {
      const res = await clientFetchApi<boolean, IGetLastBanner>("/api/lottery/GetLastBannerSetting", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        setBannerInfo(res.value);
        if (props.lotteryInfo.lotteryId) {
          const defaultBanner = res.value.bannerUrls.find((url) => url === props.lotteryInfo.bannerUrl);
          if (defaultBanner) {
            setDefaultBannerUrl(props.lotteryInfo.bannerUrl || "");
            setSelectedDiv(res.value.bannerUrls.findIndex((url) => url === props.lotteryInfo.bannerUrl).toString());
          } else {
            setCustomBannerId(props.lotteryInfo.bannerUrl || "");
            setSelectedDiv("newBanner");
          }
        } else {
          // Select first banner by default if no lottery exists yet
          if (res.value.bannerUrls.length > 0) {
            setDefaultBannerUrl(res.value.bannerUrls[0]);
            setSelectedDiv("0");
          }
        }
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function fetchData() {
    await handleGetLastBanner();
    setBoxOpacity(props.lotteryInfo.boxOpacity || bannerInfo.boxOpacity);
    setBoxBlur((props.lotteryInfo as any).boxBlur || 0);
    setFontBoxColor({
      hex: props.lotteryInfo.fontColor || bannerInfo.fontColor,
    });
    setTextArea(props.lotteryInfo.bannerTitle || "");
    setcharCount(props.lotteryInfo.bannerTitle ? props.lotteryInfo.bannerTitle.length : 0);
    setToggleCheckBoxButton(props.lotteryInfo.lotteryId ? props.lotteryInfo.includeBanner : true);
    setPublishStoryCheckBox(props.lotteryInfo.lotteryId ? props.lotteryInfo.publishBanner : false);
    setBoxColor({
      rgb: hexToRgb(props.lotteryInfo.boxColor || bannerInfo.boxColor),
    });

    if (props.customImageBase64) setSelectedImage(props.customImageBase64);
    setLoading(false);
  }
  useEffect(() => {
    fetchData();
  }, []);

  const isButtonDisabled = useMemo(() => {
    // If toggle is disabled, only check loading state
    if (!toggleCheckBoxButton) {
      return props.loadindTosave;
    }

    // If toggle is enabled, check all banner-related validations
    return (
      props.loadindTosave ||
      textArea.length === 0 ||
      (selectedDiv === "newBanner" && customBannerId.length === 0) ||
      (selectedDiv !== "newBanner" && selectedDiv.length > 0 && defaultBannerUrl.length === 0) ||
      selectedDiv.length === 0
    );
  }, [
    props.loadindTosave,
    textArea.length,
    selectedDiv,
    customBannerId.length,
    defaultBannerUrl.length,
    toggleCheckBoxButton,
  ]);

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className={styles.winnerAnnouncementContainer}>
            <div
              className="frameParent"
              style={{
                zIndex: "200",
              }}>
              <div className="title">{t(LanguageKey.pageLottery_Winnerannouncement)}</div>
              <b className={styles.step}>{t(LanguageKey.pageLottery_Step)} 3/3</b>
            </div>
            <div className="headerandinput">
              <div className="frameParent">
                <div className="title2">{t(LanguageKey.activate)}</div>
                <ToggleCheckBoxButton
                  name=""
                  checked={toggleCheckBoxButton!}
                  handleToggle={() => {
                    setToggleCheckBoxButton(!toggleCheckBoxButton);
                  }}
                  title={""}
                  role={""}
                />
              </div>
              <div className="explain">{t(LanguageKey.pageLottery_Publishasstory)}</div>
            </div>

            {/* <div className={`${styles.setting}  ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}>
              {props.lotteryInfo.publishBanner ? (
                <CheckBoxButton
                  handleToggle={() => {}}
                  value={true}
                  textlabel={t(LanguageKey.pageLottery_Publishasstory)}
                  name=""
                  title={""}
                />
              ) : (
                <div className={`${!session?.user.publishPermission && "fadeDiv"}`}>
                  <CheckBoxButton
                    handleToggle={() => {
                      if (!session?.user.publishPermission) return;
                    }}
                    value={publishStoryCheckBox}
                    textlabel={t(LanguageKey.pageLottery_Publishasstory)}
                    name=""
                    title={""}
                  />
                </div>
              )}
            </div> */}
            <div
              ref={bannerContainerRef}
              className={`${styles.bannercontainer}  ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}>
              <div onClick={handleUploadImage} className={styles.Custombanner}>
                <img
                  style={{
                    cursor: "pointer",
                    width: "60px",
                    height: "60px",
                  }}
                  title="ℹ️ Upload custom photo"
                  src="/icon-plus2.svg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={inputRef}
                  style={{ display: "none" }}
                />
                <div className={styles.customtext}>{t(LanguageKey.upload)}</div>
              </div>
              {selectedImage && (
                <div onClick={() => handleSelectBanner("newBanner")} className={styles.samplebanner}>
                  <img
                    className={styles.bannerMaskIcon}
                    alt=""
                    src={selectedImage}
                    style={{
                      border: selectedDiv == "newBanner" ? "1px solid transparent" : "none",
                      boxShadow: selectedDiv == "newBanner" ? "0 0 0 3px #44CB8C" : "none",
                    }}
                  />
                </div>
              )}
              {bannerInfo.bannerUrls.map((v, i) => (
                <div key={i} onClick={() => handleSelectBanner(i.toString())} className={styles.samplebanner}>
                  <img
                    className={styles.bannerMaskIcon}
                    alt=""
                    src={basePictureUrl + v}
                    style={{
                      border: selectedDiv === `${i.toString()}` ? "1px solid transparent" : "1px solid transparent",
                      boxShadow: selectedDiv === `${i.toString()}` ? "0 0 0 3px #44CB8C" : "none",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className={toggleCheckBoxButton ? "headerandinput" : "fadeDiv"}>
              <div className="frameParent">
                <div className="headertext">{t(LanguageKey.header)}</div>
                <div className="counter">
                  ( <strong>{charCount}</strong> / <strong>120</strong> )
                </div>
              </div>
              <TextArea
                style={{ minHeight: "120px" }}
                value={textArea}
                className="captiontextarea"
                handleInputChange={handleChangeTextArea}
                maxLength={120}
                role="textbox"
                title={t(LanguageKey.header)}
              />
              {/* <div className="explain">{t(LanguageKey.pageLottery_participantsexplain)}</div> */}
            </div>
            <div style={{ gap: "10px" }} className={`headerandinput  ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}>
              <div className="frameParent">
                <div className="title2">{t(LanguageKey.pageLottery_Font)}</div>

                <div className={`${styles.backGroundColorRight} translate`}>
                  <svg
                    onClick={() => setFontBoxColor({ hex: "#000000" })}
                    className={styles.blackRotation}
                    fill="none"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8">
                    <path fill="#272D3B" d="M4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                  </svg>

                  <div
                    style={{
                      position: "relative",
                      top: "6px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "75%",
                      maxWidth: "190px",
                      cursor: "pointer",
                    }}>
                    <HuePicker
                      width="100%"
                      height="8px"
                      color={fontBoxColor.hex}
                      onChange={(color) => {
                        setFontBoxColor(color);
                      }}
                    />
                  </div>
                  <svg
                    onClick={() => setFontBoxColor({ hex: "#ffffff" })}
                    className={styles.whiteRotation}
                    fill="none"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8">
                    <path fill="#fff" d="M4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                  </svg>
                </div>
              </div>
              <div className="frameParent">
                <div className="title2">{t(LanguageKey.pageLottery_Background)}</div>
                <div className={`${styles.backGroundColorRight} translate`}>
                  <svg
                    onClick={() => setBoxColor({ rgb: { b: 0, g: 0, r: 0 } })}
                    className={styles.blackRotation}
                    fill="none"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8">
                    <path fill="#272D3B" d="M4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                  </svg>

                  <div
                    style={{
                      position: "relative",
                      top: "6px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "75%",
                      maxWidth: "190px",
                      cursor: "pointer",
                    }}>
                    <HuePicker
                      width="100%"
                      height="8px"
                      color={boxColor.rgb}
                      onChange={(color) => {
                        setBoxColor(color);
                      }}
                    />
                  </div>
                  <svg
                    onClick={() => setBoxColor({ rgb: { b: 255, g: 255, r: 255 } })}
                    className={styles.whiteRotation}
                    fill="none"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8">
                    <path fill="#fff" d="M4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                  </svg>
                </div>
              </div>
              <div className="frameParent">
                <div className="title2">{t(LanguageKey.pageLottery_Opacity)}</div>

                <div className={`${styles.rightPosition} translate`}>
                  <Slider className={styles.slider1} onChange={handleBoxOpacityChange} value={boxOpacity} />
                  <div className={styles.option1}>{boxOpacity}%</div>
                </div>
              </div>
              <div className="frameParent">
                <div className="title2">{t(LanguageKey.pageLottery_Blur)}</div>

                <div className={`${styles.rightPosition} translate`}>
                  <Slider className={styles.slider1} onChange={handleBoxBlurChange} value={boxBlur} min={0} max={20} />
                  <div className={styles.option1}>{boxBlur}px</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.winnerBannerContainer}>
            <div className={styles.previewBannerContainer}>
              {selectedDiv && (
                <div className={`${styles.previewBanner} ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}>
                  <img
                    className={styles.previewBannerImage}
                    alt=""
                    src={
                      selectedDiv === "newBanner"
                        ? selectedImage || ""
                        : basePictureUrl + bannerInfo.bannerUrls[parseInt(selectedDiv)]
                    }
                  />
                  <div
                    style={{
                      backgroundColor: `rgba(${boxColor.rgb.r}, ${boxColor.rgb.g}, ${boxColor.rgb.b}, ${
                        boxOpacity / 100
                      })`,
                      filter: `blur(${boxBlur}px)`,
                    }}
                    className={styles.previewBoxContainer}
                  />
                  <div style={{ color: `${fontBoxColor.hex}` }} className={styles.previewWinnerCaptionContainer}>
                    <p className={styles.previewWinnerExplaineText} style={{ whiteSpace: "pre-wrap" }}>
                      {textArea || t(LanguageKey.pageLottery_Winnerannouncement)}
                    </p>
                    <div className={styles.previewWinnerCaption}>
                      {Array.from({ length: props.lotteryInfo.winnerCount }, (_, index) => {
                        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
                        return (
                          <div key={index}>
                            {medals[index] || `${index + 1}️⃣`} @winner{index + 1}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      Bran.cy/username/lottery/### {getCurrentPersianDateTime()} with🤍 Brancy
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="ButtonContainer">
              <button onClick={props.backButton} className={"cancelButton"}>
                {t(LanguageKey.back)}
              </button>
              <button
                disabled={isButtonDisabled}
                onClick={handleStartButton}
                className={isButtonDisabled ? "disableButton" : "saveButton"}>
                {props.loadindTosave ? <RingLoader /> : t(LanguageKey.start)}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default WinnerAnnouncementAndBanner;
