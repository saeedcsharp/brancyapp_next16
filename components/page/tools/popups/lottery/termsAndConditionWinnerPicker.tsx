import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { HuePicker } from "react-color";
import { useTranslation } from "react-i18next";
import Slider from "react-slider";
import RingLoader from "saeed/components/design/loader/ringLoder";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import rgbaToHex from "saeed/helper/rgbaToHex";
import { BackgrounCssTodStr, SvgGenerator } from "saeed/helper/svgGenerator";
import { svgToFile, svgToJpgFile } from "saeed/helper/svgtojpeg";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import {
  ICreateTermsAndConditionInfo,
  IGetLastTermsUi,
  IGetTermsAndConditionInfo,
  ILotteryInfo,
  TermsType,
} from "saeed/models/page/tools/tools";
import styles from "./termsAndConditionWinnerPicker.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
function filterTypeSlide(backgrounds: IGetTermsAndConditionInfo, type: TermsType) {
  const result = backgrounds.background.filter((x) => x.type === type);
  return result;
}

const TermsAndConditionWinnerPicker = (props: {
  removeMask: () => void;
  backButton: () => void;
  saveTermsAndCondition: (
    termsAndCondostions: ILotteryInfo,
    termsBackgroundFile: File | null,
    termsUrlFile: File | null
  ) => void;
  data: ILotteryInfo;
  loadingToSave: boolean;
}) => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const selectBackGroundSlide = (id: number) => {
    setSelectedSlide(id);
    setReverseThumb(false);
    const background = sliderList.find((x) => x.backgroundId === id);
    if (background !== undefined) {
      setFirstHexBackgroung(background?.firstHexBackground);
      setSecondHexBackgroung(background?.secondHexBackground);
      setFirstPercentageColor(background.firstPercentageColor);
      setSecondPercentageColor(background.secondPercentageColor);
      setRangePositionValues([background.firstPercentageColor, background.secondPercentageColor]);
      setDeg(background.deg);
    }
  };
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Helper function to shuffle array randomly
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper function to generate random hex color
  const generateRandomHex = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Helper function to generate random integer between min and max
  const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Generate random linear backgrounds
  const generateLinearBackgrounds = (startId: number, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      backgroundId: startId + i,
      boxBackgroundColor: { rgb: { r: 0, g: 0, b: 0 } },
      deg: randomInt(0, 360),
      firstHexBackground: { hex: generateRandomHex() },
      firstPercentageColor: randomInt(0, 50),
      fontBoxColor: { rgb: { r: 255, g: 255, b: 255 } },
      fontOpacity: 100,
      secondHexBackground: { hex: generateRandomHex() },
      secondPercentageColor: randomInt(50, 100),
      type: TermsType.Linear,
      textBoxOpacity: 40,
      svgSrc: "",
    }));
  };

  // Generate random radial backgrounds
  const generateRadialBackgrounds = (startId: number, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      backgroundId: startId + i,
      boxBackgroundColor: { rgb: { r: 0, g: 0, b: 0 } },
      deg: 0,
      firstHexBackground: { hex: generateRandomHex() },
      firstPercentageColor: randomInt(0, 50),
      fontBoxColor: { rgb: { r: 255, g: 255, b: 255 } },
      fontOpacity: 100,
      secondHexBackground: { hex: generateRandomHex() },
      secondPercentageColor: randomInt(50, 100),
      type: TermsType.Radial,
      textBoxOpacity: 40,
      svgSrc: "",
    }));
  };

  // Generate random solid backgrounds
  const generateSolidBackgrounds = (startId: number, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      backgroundId: startId + i,
      boxBackgroundColor: { rgb: { r: 0, g: 0, b: 0 } },
      deg: 0,
      firstHexBackground: { hex: generateRandomHex() },
      firstPercentageColor: 0,
      fontBoxColor: { rgb: { r: 255, g: 255, b: 255 } },
      fontOpacity: 100,
      secondHexBackground: { hex: "#FFFFFF" },
      secondPercentageColor: 0,
      type: TermsType.Solid,
      textBoxOpacity: 40,
      svgSrc: "",
    }));
  };
  const createDefaultBanner = (): IGetTermsAndConditionInfo => {
    const linearBackgrounds = generateLinearBackgrounds(1, 10);
    const radialBackgrounds = generateRadialBackgrounds(11, 10);
    const solidBackgrounds = generateSolidBackgrounds(21, 10);
    const shuffledLinear = linearBackgrounds;
    const shuffledRadial = radialBackgrounds;
    const shuffledSolid = solidBackgrounds;

    return {
      background: [...shuffledLinear, ...shuffledRadial, ...shuffledSolid],
      terms: "",
      backgroundType: TermsType.Linear,
      isActive: true,
    };
  };
  const [defaultBanner] = useState<IGetTermsAndConditionInfo>(() => createDefaultBanner());
  const [data, setData] = useState<IGetTermsAndConditionInfo>(defaultBanner);
  const selectBackGroundType = (id: TermsType) => {
    const list = filterTypeSlide(data, id);
    const shuffledList = shuffleArray(list);
    setReverseThumb(false);
    setSliderList(shuffledList);
    setActiveType(id);
    setSelectedSlide(shuffledList[0].backgroundId);
    setFirstHexBackgroung(shuffledList[0].firstHexBackground);
    setSecondHexBackgroung(shuffledList[0].secondHexBackground);
    setFirstPercentageColor(shuffledList[0].firstPercentageColor);
    setSecondPercentageColor(shuffledList[0].secondPercentageColor);
    setRangePositionValues([shuffledList[0].firstPercentageColor, shuffledList[0].secondPercentageColor]);
    setDeg(shuffledList[0].deg);
  };

  const regenerateBackgrounds = () => {
    // Generate new random backgrounds
    const newLinearBackgrounds = generateLinearBackgrounds(1, 10);
    const newRadialBackgrounds = generateRadialBackgrounds(11, 10);
    const newSolidBackgrounds = generateSolidBackgrounds(21, 10);

    const newData = {
      ...data,
      background: [...newLinearBackgrounds, ...newRadialBackgrounds, ...newSolidBackgrounds],
    };

    setData(newData);

    // Update slider list with new backgrounds for current type
    const list = filterTypeSlide(newData, activeType);
    setSliderList(list);

    // Select first item from new list
    if (list.length > 0) {
      setSelectedSlide(list[0].backgroundId);
      setFirstHexBackgroung(list[0].firstHexBackground);
      setSecondHexBackgroung(list[0].secondHexBackground);
      setFirstPercentageColor(list[0].firstPercentageColor);
      setSecondPercentageColor(list[0].secondPercentageColor);
      setRangePositionValues([list[0].firstPercentageColor, list[0].secondPercentageColor]);
      setDeg(list[0].deg);
    }
  };

  function handleSelectUpdateBackGround() {
    setSelectedSlide(0);
    setReverseThumb(false);
    setFirstHexBackgroung(updatedUiInfo!.background.firstHexBackground);
    setSecondHexBackgroung(updatedUiInfo!.background.secondHexBackground);
    setFirstPercentageColor(updatedUiInfo!.background.firstPercentageColor);
    setSecondPercentageColor(updatedUiInfo!.background.secondPercentageColor);
    setRangePositionValues([
      updatedUiInfo!.background.firstPercentageColor,
      updatedUiInfo!.background.secondPercentageColor,
    ]);
    setDeg(updatedUiInfo!.background.deg);
  }
  const [toggleCheckBoxButton, setToggleCheckBoxButton] = useState(data.isActive);
  const [publishAsStory, setPublishAsStory] = useState(props.data.publishTerms);
  const [sliderList, setSliderList] = useState(() => {
    const initialList = filterTypeSlide(defaultBanner, defaultBanner.backgroundType);
    return shuffleArray(initialList);
  });
  const [activeType, setActiveType] = useState(data.backgroundType);
  const [selectedSlide, setSelectedSlide] = useState(sliderList[0].backgroundId ?? 0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, scrollLeft: 0 });
  const animationFrameId = useRef<number | null>(null);
  const handleDragStart = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: clientX,
      scrollLeft: sliderRef.current.scrollLeft,
    };
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grabbing";
      sliderRef.current.style.scrollBehavior = "auto";
    }
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    animationFrameId.current = requestAnimationFrame(() => {
      if (!sliderRef.current) return;
      const dx = clientX - dragStartPos.current.x;
      sliderRef.current.scrollLeft = dragStartPos.current.scrollLeft - dx;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  const [reverseThumb, setReverseThumb] = useState(false);
  const [rangePositionValues, setRangePositionValues] = useState([0, 100]);
  const handleRangePositionChange = (newValues: number[]) => {
    setRangePositionValues(newValues);
    setReverseThumb(newValues[0] > newValues[1]);
    setFirstPercentageColor(newValues[0]);
    setSecondPercentageColor(newValues[1]);
  };

  const [firstHexBackgroung, setFirstHexBackgroung] = useState({
    hex: sliderList[0].firstHexBackground.hex,
  });
  const [secondHexBackgroung, setSecondHexBackgroung] = useState<{
    hex: string;
  }>(sliderList[0].secondHexBackground);
  const [firstPercentageColor, setFirstPercentageColor] = useState(sliderList[0].firstPercentageColor);
  const [secondPercentageColor, setSecondPercentageColor] = useState(sliderList[0].secondPercentageColor);
  const [boxBackgroundColor, setBoxBackgroundColor] = useState(sliderList[0].boxBackgroundColor);
  const [fontBoxColor, setFontBoxColor] = useState(sliderList[0].fontBoxColor);
  const [textBoxOpacity, settextBoxOpacity] = useState<number>(sliderList[0].textBoxOpacity);
  const handleRangeTextBoxOpacityChange = (newValue: number) => {
    settextBoxOpacity(newValue);
  };

  const [fontOpacity, setFontOpacity] = useState<number>(sliderList[0].fontOpacity);
  const handleRangeFontOpacityChange = (newValue: number) => {
    setFontOpacity(newValue);
  };

  const [deg, setDeg] = useState<number>(sliderList[0].deg);
  const handleRangeDegreeChange = (newValue: number) => {
    setDeg(newValue);
  };

  const [textArea, settextArea] = useState(data.terms);
  const [updatedUiInfo, setUpdatedUiInfo] = useState<ICreateTermsAndConditionInfo>();
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    settextArea(e.target.value);
  };
  let inputBox = useRef<HTMLInputElement>(null);
  if (inputBox.current !== null) {
    inputBox.current.selectionStart = 0;
    inputBox.current.selectionEnd = 0;
  }

  const handleNextStep = async () => {
    const backgroundStr = BackgrounCssTodStr(
      activeType,
      reverseThumb,
      firstHexBackgroung.hex,
      secondHexBackgroung.hex,
      firstPercentageColor,
      secondPercentageColor,
      deg
    );
    const backgroundSvg = await SvgGenerator(
      <div
        style={{
          display: "flex",
          background: backgroundStr,
          width: "32",
          height: "56",
        }}></div>,
      32,
      56,
      500
    );
    const termsUrlSvg = await GetSvg();
    const termsUrlJpeg = await svgToJpgFile(termsUrlSvg);
    const termsBackGroundFile = await svgToFile(backgroundSvg);
    let termsAndConditionResult: ICreateTermsAndConditionInfo = {
      background: {
        backgroundId: selectedSlide,
        boxBackgroundColor: boxBackgroundColor,
        deg: deg,
        firstHexBackground: firstHexBackgroung,
        firstPercentageColor: firstPercentageColor,
        fontBoxColor: fontBoxColor,
        fontOpacity: fontOpacity,
        secondHexBackground: secondHexBackgroung,
        secondPercentageColor: secondPercentageColor,
        svgSrc: backgroundSvg,
        textBoxOpacity: textBoxOpacity,
        type: activeType,
      },
      terms: textArea,
    };
    const saveTerms = props.data;
    saveTerms.termsUIInfo = JSON.stringify(termsAndConditionResult);
    saveTerms.termsType = activeType;
    saveTerms.includeTerms = toggleCheckBoxButton;
    saveTerms.publishTerms = publishAsStory;
    console.log("saveTerms", saveTerms);
    props.saveTermsAndCondition(saveTerms, termsBackGroundFile, termsUrlJpeg);
  };
  const GetSvg = async () => {
    const backgroundStr = BackgrounCssTodStr(
      activeType,
      reverseThumb,
      firstHexBackgroung.hex,
      secondHexBackgroung.hex,
      firstPercentageColor,
      secondPercentageColor,
      deg
    );
    const termsAndConditionSvg = await SvgGenerator(
      /* background */
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: backgroundStr,
          width: "1080",
          height: "1920",
          gap: "36px ",
          justifyContent: "center",
          alignItems: "center",
        }}>
        {/* title */}
        <div
          style={{
            position: "relative",
            height: "115.2",
            width: "85%",
            background: "rgba(0, 0, 0, 0.4)",
            padding: "18px 36px 18px 36px",
            borderRadius: "28.8px",
            fontSize: "64.8px",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontFeatureSettings: "clig off liga off",
          }}>
          Terms and Conditions
        </div>

        {/* box*/}
        <div
          style={{
            position: "relative",
            width: "90%",
            height: "80%",
            borderRadius: "36px",
            background: `${rgbaToHex({
              rgb: boxBackgroundColor.rgb,
              a: textBoxOpacity / 100,
            })}`,
          }}
        />

        {/* text area */}
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "78%",
            height: "80%",
            background: "transparent",
            border: "none",
            fontFamily: "YekanBakh, Montserrat",
            fontWeight: "400",
            //fontSize: "50.4px",
            fontSize: "60px",
            overflow: "hidden",
            textAlign: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            // justifyContent: "center",

            color: `${rgbaToHex({
              rgb: fontBoxColor.rgb,
              a: fontOpacity / 100,
            })}`,
          }}>
          {textArea?.split("\n").map((v, i) =>
            v === "" ? (
              <div style={{ paddingTop: 36, paddingBottom: 20 }} />
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}>
                  {v.split(" ").map(
                    (v2, i2) =>
                      i2 != 0 ? (
                        <div style={{ paddingLeft: 9 }}>{v2}</div>
                      ) : v2 == "" ? (
                        <div style={{ paddingLeft: 9 }}></div>
                      ) : (
                        //  v2.length < 27 ?
                        <div style={{}}>{v2}</div>
                      )
                    //  : chunkSubstr(v2, 26).map((v3, i3) => (
                    //   <div>{v3}</div>
                    // )
                    // )
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>,
      1080,
      1920,
      500
    );
    return termsAndConditionSvg;
  };

  async function handleGetLastTermsUri() {
    try {
      var res = await GetServerResult<boolean, IGetLastTermsUi[]>(
        MethodType.get,
        session,
        "Instagramer/Lottery/GetLastTermsUis"
      );
      if (res.succeeded) {
        console.log("dataaaaaaaaa", data);
        if (res.value.length > 0) {
          const newBackgrounds: any[] = [];
          res.value.forEach((element) => {
            const terms: ICreateTermsAndConditionInfo = JSON.parse(element.info);
            const existedBackgroundTerms = defaultBanner.background.find(
              (x) => x.backgroundId === terms.background.backgroundId
            );
            if (
              existedBackgroundTerms &&
              existedBackgroundTerms.boxBackgroundColor === terms.background.boxBackgroundColor &&
              existedBackgroundTerms.deg === terms.background.deg &&
              existedBackgroundTerms.firstHexBackground.hex === terms.background.firstHexBackground.hex &&
              existedBackgroundTerms.firstPercentageColor === terms.background.firstPercentageColor &&
              existedBackgroundTerms.fontBoxColor === terms.background.fontBoxColor &&
              existedBackgroundTerms.fontOpacity === terms.background.fontOpacity &&
              existedBackgroundTerms.secondHexBackground.hex === terms.background.secondHexBackground.hex &&
              existedBackgroundTerms.secondPercentageColor === terms.background.secondPercentageColor &&
              existedBackgroundTerms.type === terms.background.type &&
              existedBackgroundTerms.textBoxOpacity === terms.background.textBoxOpacity
            ) {
              // setSelectedSlide(terms.background.backgroundId);
            } else {
              const newBackgroundId = 1000 + res.value.indexOf(element);
              // Check if this new background is already in the current data
              const alreadyExists = data.background.find((x) => x.backgroundId === newBackgroundId);

              if (!alreadyExists) {
                const newBackground = {
                  backgroundId: newBackgroundId,
                  boxBackgroundColor: terms.background.boxBackgroundColor,
                  deg: terms.background.deg,
                  firstHexBackground: terms.background.firstHexBackground,
                  firstPercentageColor: terms.background.firstPercentageColor,
                  fontBoxColor: terms.background.fontBoxColor,
                  fontOpacity: terms.background.fontOpacity,
                  secondHexBackground: terms.background.secondHexBackground,
                  secondPercentageColor: terms.background.secondPercentageColor,
                  svgSrc: element.backgroundUrl,
                  textBoxOpacity: terms.background.textBoxOpacity,
                  type: terms.background.type,
                };
                newBackgrounds.push(newBackground);
              }
            }
          });

          if (newBackgrounds.length > 0) {
            // Add new backgrounds to the beginning of the existing background array
            const updatedData = {
              ...data,
              background: [...newBackgrounds, ...data.background],
            };
            setData(updatedData);

            // Update slider list with the new data
            const updatedSliderList = filterTypeSlide(updatedData, updatedData.backgroundType);
            setSliderList(updatedSliderList);
          }
        } else {
          console.log("termsInfooooooo", data);
        }

        // setLastTermsUi(termsInfo);
        // setShowTermsAndConditionWinnerPicker(true);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function fetchData() {
    await handleGetLastTermsUri();
    console.log("props.data.termsUIInfo", props.data.termsUIInfo);
    if (props.data.termsUIInfo) {
      const termsUIInfo: ICreateTermsAndConditionInfo = JSON.parse(props.data.termsUIInfo!);
      setUpdatedUiInfo(termsUIInfo);
      settextArea(termsUIInfo.terms);
      setToggleCheckBoxButton(props.data.includeTerms);
      setSelectedSlide(0);
      setActiveType(termsUIInfo.background.type);
      const list = filterTypeSlide(data, termsUIInfo.background.type);
      setSliderList(list);
      // setReverseThumb(false);
      setFirstHexBackgroung(termsUIInfo.background.firstHexBackground);
      setSecondHexBackgroung(termsUIInfo.background.secondHexBackground);
      setFirstPercentageColor(termsUIInfo.background.firstPercentageColor);
      setSecondPercentageColor(termsUIInfo.background.secondPercentageColor);
      setRangePositionValues([
        termsUIInfo.background.firstPercentageColor,
        termsUIInfo.background.secondPercentageColor,
      ]);
      setFontBoxColor(termsUIInfo.background.fontBoxColor);
      setFontOpacity(termsUIInfo.background.fontOpacity);
      setBoxBackgroundColor(termsUIInfo.background.boxBackgroundColor);
      settextBoxOpacity(termsUIInfo.background.textBoxOpacity);
      setDeg(termsUIInfo.background.deg);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className={styles.termsAndConditionContainer}>
            <div className="frameParent">
              <div className="title">{t(LanguageKey.pageLottery_publishTermsconditions)}</div>
              <b className={styles.step}>{t(LanguageKey.pageLottery_Step)} 2/3</b>
            </div>

            <div className="headerandinput">
              <div className="frameParent">
                <div className="title2">{t(LanguageKey.activate)}</div>
                <ToggleCheckBoxButton
                  name=""
                  checked={toggleCheckBoxButton}
                  handleToggle={() => {
                    // if (session?.user.loginStatus !== 0)
                    //   internalNotify(
                    //     InternalResponseType.InstagramLoginRequired,
                    //     NotifType.Warning
                    //   );
                    setToggleCheckBoxButton(!toggleCheckBoxButton);
                  }}
                  title={""}
                  role={""}
                />
              </div>
              <div className="explain">{t(LanguageKey.pageLottery_previewTermsconditionsexplain)}</div>
            </div>
            <div style={{ gap: "10px" }} className={`headerandinput ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}>
              <div className="headerparent">
                <div className="title2">
                  {t(LanguageKey.pageLottery_model)}

                  <svg
                    onClick={regenerateBackgrounds}
                    style={{ cursor: "pointer" }}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none">
                    <path
                      d="M17.5 10a7.5 7.5 0 1 1-2.197-5.303m0 0V2.5m0 2.197H12.5"
                      stroke="var(--color-dark-blue)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className={styles.typeRight}>
                  <div
                    onClick={() => selectBackGroundType(TermsType.Solid)}
                    className={activeType === TermsType.Solid ? styles.activeButtonType : styles.buttonType}>
                    {t(LanguageKey.pageLottery_Solid)}
                  </div>
                  <div
                    onClick={() => selectBackGroundType(TermsType.Radial)}
                    className={activeType === TermsType.Radial ? styles.activeButtonType : styles.buttonType}>
                    {t(LanguageKey.pageLottery_Radial)}
                  </div>
                  <div
                    onClick={() => selectBackGroundType(TermsType.Linear)}
                    className={activeType === TermsType.Linear ? styles.activeButtonType : styles.buttonType}>
                    {t(LanguageKey.pageLottery_Linear)}
                  </div>
                </div>
              </div>

              <div className={styles.colorpalleteContainer}>
                {props.data.termsUIInfo && (
                  <div className={styles.currentcolor}>
                    <img
                      onClick={handleSelectUpdateBackGround}
                      src={
                        updatedUiInfo?.background.svgSrc?.startsWith("<svg")
                          ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(updatedUiInfo.background.svgSrc)}`
                          : updatedUiInfo?.background.svgSrc
                      }
                      style={{
                        cursor: " pointer",
                        borderRadius: "var(--br8)",
                      }}
                    />
                  </div>
                )}

                <div
                  ref={sliderRef}
                  className={styles.colorpalleteslider}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleDragStart(e.pageX);
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    handleDragMove(e.pageX);
                  }}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => {
                    handleDragStart(e.touches[0].pageX);
                  }}
                  onTouchMove={(e) => {
                    if (!isDragging) return;
                    handleDragMove(e.touches[0].pageX);
                  }}
                  onTouchEnd={handleDragEnd}
                  style={{ cursor: "grab", userSelect: "none" }}>
                  {sliderList.map((v, i) => {
                    // Generate the actual background style for each item
                    const getBackgroundStyle = () => {
                      if (v.type === TermsType.Linear) {
                        return `linear-gradient(${v.deg}deg, ${v.firstHexBackground.hex} ${v.firstPercentageColor}%, ${v.secondHexBackground.hex} ${v.secondPercentageColor}%)`;
                      } else if (v.type === TermsType.Radial) {
                        return `radial-gradient(circle, ${v.firstHexBackground.hex} ${v.firstPercentageColor}%, ${v.secondHexBackground.hex} ${v.secondPercentageColor}%)`;
                      } else {
                        return v.firstHexBackground.hex;
                      }
                    };

                    return (
                      <div key={v.backgroundId} className={styles.colorpalletesliderItem}>
                        <div
                          className={styles.colorpalletesliderItemInner}
                          onClick={(e) => {
                            if (isDragging) {
                              e.preventDefault();
                              return;
                            }
                            selectBackGroundSlide(v.backgroundId);
                          }}
                          style={{
                            background: getBackgroundStyle(),
                          }}></div>
                        {selectedSlide === v.backgroundId && <div className={styles.notification} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ gap: "10px" }} className={`headerandinput  ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}>
              <b className="title">{t(LanguageKey.pageLottery_Background)}</b>

              <div className="headerparent">
                <div className="title2">{t(LanguageKey.pageLottery_Color)}</div>
                <div className={`${styles.colorpallete} translate`}>
                  {(activeType === TermsType.Linear || activeType === TermsType.Radial) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "29px",
                        width: "72%",
                        maxWidth: "190px",
                      }}>
                      <HuePicker
                        width="100%"
                        height="8px"
                        color={secondHexBackgroung?.hex}
                        onChange={(color) => {
                          setSecondHexBackgroung(color);
                        }}
                      />
                    </div>
                  )}
                  <svg
                    onClick={() => setFirstHexBackgroung({ hex: "#272D3B" })}
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
                    }}>
                    <HuePicker
                      width="100%"
                      height="8px"
                      color={firstHexBackgroung.hex}
                      onChange={(color) => {
                        setFirstHexBackgroung(color);
                      }}
                    />
                  </div>
                  <svg
                    onClick={() => {
                      activeType === TermsType.Linear || activeType === TermsType.Radial
                        ? setSecondHexBackgroung({ hex: "white" })
                        : setFirstHexBackgroung({ hex: "white" });
                    }}
                    className={styles.whiteRotation}
                    fill="none"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8">
                    <path fill="#fff" d="M4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                  </svg>
                </div>
              </div>

              {activeType === TermsType.Linear || activeType === TermsType.Radial ? (
                <div className="headerparent">
                  <div className="title2">{t(LanguageKey.pageLottery_Position)}</div>
                  <div className={`${styles.Position} translate`}>
                    <div className={styles.option1}>{rangePositionValues[0]}%</div>
                    <Slider
                      className={styles.slider2}
                      onChange={handleRangePositionChange}
                      value={rangePositionValues}
                      minDistance={-100}
                    />
                    <div className={styles.option1}>{rangePositionValues[1]}%</div>
                  </div>
                </div>
              ) : (
                <div className="headerparent" style={{ opacity: "0.3" }}>
                  <div className="title2">{t(LanguageKey.pageLottery_Position)}</div>
                  <div className={`${styles.Position} translate`}>
                    <div className={styles.option1}>0%</div>
                    <svg
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "165px",
                        minWidth: "60px",
                      }}
                      fill="none"
                      viewBox="0 0 101 16">
                      <path stroke="#515E73" strokeLinecap="round" strokeWidth="2" d="M14.2 8H87" />
                      <path
                        fill="#BFC5D2"
                        d="M7.8 3a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0-2a7 7 0 0 0-7 7 7 7 0 0 0 7 7 7 7 0 0 0 7-7 7 7 0 0 0-7-7m85.3 2a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0-2a7 7 0 0 0-7 7 7 7 0 0 0 7 7 7 7 0 0 0 7-7c.1-3.9-3.1-7-7-7"
                      />
                    </svg>

                    <div className={styles.option1}>100%</div>
                  </div>
                </div>
              )}
              {activeType === TermsType.Linear ? (
                <div className="headerparent">
                  <div className="title2">{t(LanguageKey.pageLottery_Degree)}</div>
                  <div className={`${styles.Position} translate`}>
                    <Slider
                      className={styles.slider1}
                      onChange={handleRangeDegreeChange}
                      value={deg !== null ? deg : 0}
                      max={360}
                      min={0}
                    />
                    <div className={styles.option1}>{deg}%</div>
                  </div>
                </div>
              ) : (
                <div className="headerparent" style={{ opacity: "0.3" }}>
                  <div className="title2">{t(LanguageKey.pageLottery_Degree)}</div>
                  <div className={`${styles.Position} translate`}>
                    <svg
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "200px",
                        minWidth: "130px",
                      }}
                      fill="none"
                      viewBox="0 0 135 16">
                      <path stroke="#515E73" strokeLinecap="round" strokeWidth="2" d="M14.2 8H133" />
                      <path
                        fill="#BFC5D2"
                        d="M7.8 3a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0-2a7 7 0 0 0-7 7 7 7 0 0 0 7 7 7 7 0 0 0 7-7 7 7 0 0 0-7-7"
                      />
                    </svg>

                    <div className={styles.option1}>0%</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ gap: "10px" }} className={`headerandinput  ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}>
              <div className="title">{t(LanguageKey.pageLottery_TextBox)}</div>
              <div className="headerparent">
                <div className="title2">{t(LanguageKey.pageLottery_Color)}</div>
                <div className={`${styles.colorpallete} translate`}>
                  <svg
                    onClick={() => setBoxBackgroundColor({ rgb: { r: 0, g: 0, b: 0 } })}
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
                    }}>
                    <HuePicker
                      width="100%"
                      height="8px"
                      color={boxBackgroundColor.rgb}
                      onChange={(color) => setBoxBackgroundColor(color)}
                    />
                  </div>
                  <svg
                    onClick={() =>
                      setBoxBackgroundColor({
                        rgb: { r: 255, g: 255, b: 255 },
                      })
                    }
                    className={styles.whiteRotation}
                    fill="none"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8">
                    <path fill="#fff" d="M4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                  </svg>
                </div>
              </div>
              <div className="headerparent">
                <div className="title2">{t(LanguageKey.pageLottery_Opacity)}</div>
                <div className={`${styles.Position} translate`}>
                  <Slider
                    className={styles.slider1}
                    onChange={handleRangeTextBoxOpacityChange}
                    value={textBoxOpacity}
                  />
                  <div className={styles.option1}>{textBoxOpacity}%</div>
                </div>
              </div>
            </div>

            <div style={{ gap: "10px" }} className={`headerandinput  ${!toggleCheckBoxButton ? "fadeDiv" : ""}`}>
              <div className="title">{t(LanguageKey.pageLottery_Font)}</div>
              <div className="headerparent">
                <div className="title2">{t(LanguageKey.pageLottery_Color)}</div>
                <div className={`${styles.colorpallete} translate`}>
                  <svg
                    onClick={() => setFontBoxColor({ rgb: { b: 0, g: 0, r: 0 } })}
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
                    }}>
                    <HuePicker
                      width="100%"
                      height="8px"
                      color={fontBoxColor.rgb}
                      onChange={(color) => {
                        setFontBoxColor(color);
                      }}
                    />
                  </div>
                  <svg
                    onClick={() => setFontBoxColor({ rgb: { b: 255, g: 255, r: 255 } })}
                    className={styles.whiteRotation}
                    fill="none"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8">
                    <path fill="#fff" d="M4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                  </svg>
                </div>
              </div>
              <div className="headerparent">
                <div className="title2">{t(LanguageKey.pageLottery_Opacity)}</div>
                <div className={`${styles.Position} translate`}>
                  <Slider className={styles.slider1} onChange={handleRangeFontOpacityChange} value={fontOpacity} />
                  <div className={styles.option1}>{fontOpacity}%</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.termsAndConditionBannerContainer}>
            <div
              className={`${toggleCheckBoxButton ? styles.storybox : styles.deactiveStorybox} ${
                !toggleCheckBoxButton ? "fadeDiv" : ""
              }`}
              style={{
                background:
                  activeType === TermsType.Linear
                    ? `linear-gradient(${deg + "deg"}, ${
                        !reverseThumb ? firstHexBackgroung.hex : secondHexBackgroung?.hex
                      } ${!reverseThumb ? firstPercentageColor + "%" : secondPercentageColor + "%"}, ${
                        !reverseThumb ? secondHexBackgroung?.hex : firstHexBackgroung.hex
                      } ${!reverseThumb ? secondPercentageColor + "%" : firstPercentageColor + "%"})`
                    : activeType === TermsType.Radial
                    ? `radial-gradient(circle,${!reverseThumb ? firstHexBackgroung.hex : secondHexBackgroung?.hex} ${
                        !reverseThumb ? firstPercentageColor + "%" : secondPercentageColor + "%"
                      },${!reverseThumb ? secondHexBackgroung?.hex : firstHexBackgroung.hex} ${
                        !reverseThumb ? secondPercentageColor + "%" : firstPercentageColor + "%"
                      })`
                    : `${firstHexBackgroung.hex}`,
              }}>
              <div className={styles.storytitle}>{t(LanguageKey.pageLottery_Termsconditions)}</div>

              <div className={styles.storyinputText}>
                <div
                  style={{
                    backgroundColor: `rgba(${boxBackgroundColor.rgb.r}, ${boxBackgroundColor.rgb.g}, ${
                      boxBackgroundColor.rgb.b
                    }, ${textBoxOpacity / 100})`,
                    opacity: `${textBoxOpacity / 100}`,
                  }}
                  className={styles.divTextfield}
                />
                <textarea
                  className={`${styles.inputTextField} ${styles.whitePlaceholder} `}
                  style={{
                    color: `rgba(${fontBoxColor.rgb.r}, ${fontBoxColor.rgb.g}, ${fontBoxColor.rgb.b}, ${
                      fontOpacity / 100
                    })`,
                    border: "0px",
                  }}
                  onChange={handleInputChange}
                  value={textArea !== null ? textArea : ""}
                  placeholder={t(LanguageKey.pageToolspopup_typehere)}
                />
              </div>
            </div>

            <div className="ButtonContainer">
              <button
                onClick={props.backButton}
                className="cancelButton"
                style={{
                  zIndex: "200",
                }}>
                {t(LanguageKey.back)}
              </button>

              <button
                disabled={props.loadingToSave}
                onClick={handleNextStep}
                className="saveButton"
                style={{
                  zIndex: "200",
                }}>
                {props.loadingToSave ? <RingLoader /> : t(LanguageKey.next)}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default TermsAndConditionWinnerPicker;
