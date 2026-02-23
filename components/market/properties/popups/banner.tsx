import { useSession } from "next-auth/react";
import Head from "next/head";
import {
  ChangeEvent,
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import ProgressBar from "../../../design/progressBar/progressBar";
import RadioButton from "../../../design/radioButton";
import TextArea from "../../../design/textArea/textArea";
import FlexibleToggleButton from "../../../design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "../../../design/toggleButton/types";
import Loading from "../../../notOk/loading";
import { convertHeicToJpeg } from "../../../../helper/convertHeicToJPEG";
import { LanguageKey } from "../../../../i18n";
import { MethodType, UploadFile } from "../../../../helper/api";
import {
  IBannerSelectedImage,
  ICustomeBannerInfo,
  IProfileBanner,
  IProfileBannerCustomCaption,
  IProfileBannerCustomeFullName,
  IUpdateBanner,
  IUpdateProfileBanner,
} from "../../../../models/market/properties";
import styles from "./featureBoxPU.module.css";
import { clientFetchApi } from "../../../../helper/clientFetchApi";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/tiff", "image/gif"];
const MAX_CAPTION_LENGTH = 150;
type BannerAction =
  | { type: "SET_FULL_NAME_BANNER"; payload: IProfileBannerCustomeFullName }
  | { type: "UPDATE_FULL_NAME_BANNER"; payload: Partial<IProfileBannerCustomeFullName> }
  | { type: "SET_CAPTION_BANNER"; payload: IProfileBannerCustomCaption }
  | { type: "UPDATE_CAPTION_BANNER"; payload: Partial<IProfileBannerCustomCaption> }
  | { type: "SET_SELECTED_IMAGE"; payload: Partial<IBannerSelectedImage> }
  | { type: "SET_LOADING_IMAGE"; payload: Partial<LoadingImageState> }
  | { type: "SET_ERROR_IMAGE"; payload: Partial<ErrorImageState> }
  | { type: "SET_UPLOAD_PROGRESS"; payload: Partial<UploadProgressState> }
  | { type: "SET_DRAG_ACTIVE"; payload: Partial<DragState> }
  | { type: "RESET_IMAGE"; payload: { keys: Array<keyof IBannerSelectedImage> } };
interface LoadingImageState {
  id1: boolean;
  id2: boolean;
  id3: boolean;
}
interface ErrorImageState {
  id1: boolean;
  id2: boolean;
  id3: boolean;
}
interface UploadProgressState {
  id1: number;
  id2: number;
  id3: number;
}
interface DragState {
  id1: boolean;
  id2: boolean;
  id3: boolean;
}
interface CombinedState {
  profileFullNameBanner: IProfileBannerCustomeFullName;
  profileCaptionBanner: IProfileBannerCustomCaption;
  selectedImage: IBannerSelectedImage;
  loadingImage: LoadingImageState;
  errorImage: ErrorImageState;
  uploadProgress: UploadProgressState;
  dragActive: DragState;
}
const initialState: CombinedState = {
  profileFullNameBanner: {
    fullName: "",
    instagramerId: 0,
    isActive: false,
    lastUpdate: 0,
  },
  profileCaptionBanner: {
    caption: "",
    instagramerId: 0,
    isActive: false,
    lastUpdate: 0,
  },
  selectedImage: {
    id1: null,
    id2: null,
    id3: null,
    imgStr1: null,
    imgStr2: null,
    imgStr3: null,
    imgUrl1: null,
    imgUrl2: null,
    imgUrl3: null,
  },
  loadingImage: {
    id1: false,
    id2: false,
    id3: false,
  },
  errorImage: {
    id1: false,
    id2: false,
    id3: false,
  },
  uploadProgress: {
    id1: 0,
    id2: 0,
    id3: 0,
  },
  dragActive: {
    id1: false,
    id2: false,
    id3: false,
  },
};
function bannerReducer(state: CombinedState, action: BannerAction): CombinedState {
  switch (action.type) {
    case "SET_FULL_NAME_BANNER":
      return {
        ...state,
        profileFullNameBanner: action.payload,
      };
    case "UPDATE_FULL_NAME_BANNER":
      return {
        ...state,
        profileFullNameBanner: {
          ...state.profileFullNameBanner,
          ...action.payload,
        },
      };
    case "SET_CAPTION_BANNER":
      return {
        ...state,
        profileCaptionBanner: action.payload,
      };
    case "UPDATE_CAPTION_BANNER":
      return {
        ...state,
        profileCaptionBanner: {
          ...state.profileCaptionBanner,
          ...action.payload,
        },
      };
    case "SET_SELECTED_IMAGE":
      return {
        ...state,
        selectedImage: {
          ...state.selectedImage,
          ...action.payload,
        },
      };
    case "SET_LOADING_IMAGE":
      return {
        ...state,
        loadingImage: {
          ...state.loadingImage,
          ...action.payload,
        },
      };
    case "SET_ERROR_IMAGE":
      return {
        ...state,
        errorImage: {
          ...state.errorImage,
          ...action.payload,
        },
      };
    case "SET_UPLOAD_PROGRESS":
      return {
        ...state,
        uploadProgress: {
          ...state.uploadProgress,
          ...action.payload,
        },
      };
    case "SET_DRAG_ACTIVE":
      return {
        ...state,
        dragActive: {
          ...state.dragActive,
          ...action.payload,
        },
      };
    case "RESET_IMAGE":
      return {
        ...state,
        selectedImage: {
          ...state.selectedImage,
          ...action.payload.keys.reduce((acc, key) => ({ ...acc, [key]: null }), {}),
        },
      };
    default:
      return state;
  }
}
interface BannerProps {
  removeMask: () => void;
}
const Banner = memo((props: BannerProps) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const componentId = useId();
  const bannerRef1 = useRef<HTMLInputElement | null>(null);
  const bannerRef2 = useRef<HTMLInputElement | null>(null);
  const bannerRef3 = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, dispatch] = useReducer(bannerReducer, initialState);
  const {
    profileFullNameBanner,
    profileCaptionBanner,
    selectedImage,
    loadingImage,
    errorImage,
    uploadProgress,
    dragActive,
  } = state;
  const [profileandbannerToggle, setprofileandbannerToggle] = useState(ToggleOrder.FirstToggle);
  const [loading, setLoading] = useState(true);
  const [analizeProcessing, setAnalizeProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const baseMediaUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_MEDIA_URL, []);
  const pageTitle = useMemo(() => {
    return profileandbannerToggle === ToggleOrder.FirstToggle ? "Bran.cy ▸ Edit Profile Info" : "Bran.cy ▸ Edit Banner";
  }, [profileandbannerToggle]);
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` };
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
      return { valid: false, error: "Invalid file type. Only JPG, PNG, TIFF, GIF are allowed" };
    }
    return { valid: true };
  }, []);
  const handleDeleteImage = useCallback((id: string) => {
    const [str1, str2] = id.split("|");
    dispatch({
      type: "RESET_IMAGE",
      payload: { keys: [str1 as keyof IBannerSelectedImage, str2 as keyof IBannerSelectedImage] },
    });
  }, []);
  const processFile = useCallback(
    async (file: File, id: string) => {
      const [str1, str2, str3] = id.split("|");
      if (!file) return;
      dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: false } });
      dispatch({ type: "SET_UPLOAD_PROGRESS", payload: { [str3]: 0 } });
      const validation = validateFile(file);
      if (!validation.valid) {
        console.error(validation.error);
        dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: true } });
        setTimeout(() => {
          dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: false } });
        }, 3000);
        return;
      }
      dispatch({ type: "SET_LOADING_IMAGE", payload: { [str3]: true } });
      try {
        const convertedFile = await convertHeicToJpeg(file);
        if (!convertedFile) {
          dispatch({ type: "SET_LOADING_IMAGE", payload: { [str3]: false } });
          dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: true } });
          setTimeout(() => {
            dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: false } });
          }, 3000);
          return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const imageStr = reader.result as string;
            let currentProgress = 0;
            const progressInterval = setInterval(() => {
              currentProgress = Math.min(currentProgress + 10, 90);
              dispatch({
                type: "SET_UPLOAD_PROGRESS",
                payload: { [str3]: currentProgress },
              });
            }, 200);
            const res = await UploadFile(session, convertedFile);
            clearInterval(progressInterval);
            dispatch({ type: "SET_UPLOAD_PROGRESS", payload: { [str3]: 100 } });
            dispatch({
              type: "SET_SELECTED_IMAGE",
              payload: {
                [str1]: imageStr,
                [str2]: null,
                [str3]: res.fileName,
              },
            });
          } catch (error) {
            console.error("Error uploading file:", error);
            dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: true } });
            setTimeout(() => {
              dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: false } });
            }, 3000);
          } finally {
            dispatch({ type: "SET_LOADING_IMAGE", payload: { [str3]: false } });
            dispatch({ type: "SET_UPLOAD_PROGRESS", payload: { [str3]: 0 } });
          }
        };
        reader.onerror = () => {
          console.error("Error reading file");
          dispatch({ type: "SET_LOADING_IMAGE", payload: { [str3]: false } });
          dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: true } });
          setTimeout(() => {
            dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: false } });
          }, 3000);
        };
        reader.readAsDataURL(convertedFile);
      } catch (error) {
        console.error("Error processing image:", error);
        dispatch({ type: "SET_LOADING_IMAGE", payload: { [str3]: false } });
        dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: true } });
        setTimeout(() => {
          dispatch({ type: "SET_ERROR_IMAGE", payload: { [str3]: false } });
        }, 3000);
      }
    },
    [session, validateFile],
  );

  const handleImageChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, id: string) => {
      const inputFile = e.target.files?.[0];
      if (!inputFile) return;
      await processFile(inputFile, id);
    },
    [processFile],
  );

  const handleDragEnter = useCallback((e: React.DragEvent, loadingKey: keyof LoadingImageState) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DRAG_ACTIVE", payload: { [loadingKey]: true } });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, loadingKey: keyof LoadingImageState) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DRAG_ACTIVE", payload: { [loadingKey]: false } });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, id: string, loadingKey: keyof LoadingImageState) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: "SET_DRAG_ACTIVE", payload: { [loadingKey]: false } });

      const droppedFile = e.dataTransfer.files?.[0];
      if (!droppedFile) return;

      await processFile(droppedFile, id);
    },
    [processFile],
  );

  const handleUploadImage = useCallback((id: string) => {
    const refMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
      imgStr1: bannerRef1,
      imgStr2: bannerRef2,
      imgStr3: bannerRef3,
    };
    const ref = refMap[id];
    ref?.current?.click();
  }, []);
  const fetchData = useCallback(async () => {
    if (!session?.user?.instagramerIds?.[session.user.currentIndex]) {
      setLoading(false);
      return;
    }
    abortControllerRef.current = new AbortController();
    try {
      const [profileRes, bannerRes] = await Promise.all([
        clientFetchApi<string, IProfileBanner>("/api/bio/GetCustomProfile", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<string, ICustomeBannerInfo>("/api/bio/GetCustomBanners", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);
      if (abortControllerRef.current?.signal.aborted) return;
      if (profileRes.succeeded) {
        dispatch({
          type: "SET_FULL_NAME_BANNER",
          payload: profileRes.value.customFullName,
        });
        dispatch({
          type: "SET_CAPTION_BANNER",
          payload: profileRes.value.customCaption,
        });
      }
      if (bannerRes.succeeded) {
        const bannerInfo: Partial<IBannerSelectedImage> = {
          imgUrl1: bannerRes.value.items[0]?.url ?? null,
          imgUrl2: bannerRes.value.items[1]?.url ?? null,
          imgUrl3: bannerRes.value.items[2]?.url ?? null,
        };
        dispatch({ type: "SET_SELECTED_IMAGE", payload: bannerInfo });
      }
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error("Error fetching data:", error);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [session]);
  const handleSaveBanner = useCallback(async () => {
    setAnalizeProcessing(true);
    setProgress(0);
    try {
      const updateBanner: IUpdateBanner = { items: [] };
      const updateProfile: IUpdateProfileBanner = {
        customCaption: {
          caption: profileCaptionBanner.caption,
          isActive: profileCaptionBanner.isActive,
        },
        customFullName: {
          fullName: profileFullNameBanner.fullName,
          isActive: profileFullNameBanner.isActive,
        },
      };
      const bannerImages = [
        { imgStr: selectedImage.imgStr1, id: selectedImage.id1, imgUrl: selectedImage.imgUrl1 },
        { imgStr: selectedImage.imgStr2, id: selectedImage.id2, imgUrl: selectedImage.imgUrl2 },
        { imgStr: selectedImage.imgStr3, id: selectedImage.id3, imgUrl: selectedImage.imgUrl3 },
      ];
      bannerImages.forEach(({ imgStr, id, imgUrl }) => {
        if (imgStr && id) {
          updateBanner.items.push({ uploadImageUrl: id, imageUri: null });
        } else if (imgUrl) {
          updateBanner.items.push({ uploadImageUrl: null, imageUri: imgUrl });
        }
      });
      const [profileRes, bannerRes] = await Promise.all([
        clientFetchApi<IUpdateProfileBanner, boolean>("/api/bio/UpdateCustomProfile", {
          methodType: MethodType.post,
          session: session,
          data: updateProfile,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<IUpdateBanner, boolean>("/api/bio/UpdateCustomBanners", {
          methodType: MethodType.post,
          session: session,
          data: updateBanner,
          queries: [],
          onUploadProgress: setProgress,
        }),
      ]);
      if (profileRes.succeeded && bannerRes.succeeded) {
        props.removeMask();
      } else {
        console.error("Failed to save banner or profile");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
    } finally {
      setAnalizeProcessing(false);
    }
  }, [session, profileCaptionBanner, profileFullNameBanner, selectedImage, props]);
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLElement>, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }, []);
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !analizeProcessing) {
        props.removeMask();
      }
    },
    [analizeProcessing, props],
  );
  useEffect(() => {
    if (!session) return;
    fetchData();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [session, fetchData]);
  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey as any);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey as any);
    };
  }, [handleEscapeKey]);
  const renderBannerUpload = useCallback(
    (
      index: number,
      imgKey: keyof IBannerSelectedImage,
      urlKey: keyof IBannerSelectedImage,
      idKey: keyof IBannerSelectedImage,
      loadingKey: keyof LoadingImageState,
      ref: React.RefObject<HTMLInputElement | null>,
    ) => {
      const isLoading = loadingImage[loadingKey];
      const hasError = errorImage[loadingKey];
      const isDragActive = dragActive[loadingKey];
      const progress = uploadProgress[loadingKey];
      const imgStr = selectedImage[imgKey];
      const imgUrl = selectedImage[urlKey];
      const inputId = `${componentId}-banner-${index}`;
      return (
        <div className={styles.section} key={index}>
          {!isLoading && (
            <>
              {!imgStr && !imgUrl && (
                <label
                  htmlFor={inputId}
                  className={`${styles.uploadcover} ${hasError ? styles.uploadcoverError : ""} ${
                    isDragActive ? styles.uploadcoverDragActive : ""
                  }`}
                  style={{ aspectRatio: "16/9", cursor: "pointer" }}
                  onDragEnter={(e) => handleDragEnter(e, loadingKey)}
                  onDragLeave={(e) => handleDragLeave(e, loadingKey)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, `${imgKey}|${urlKey}|${idKey}`, loadingKey)}>
                  <img style={{ width: "50px" }} src="/icon-plus.svg" alt="Upload icon" />
                  <div className="explain" style={{ textAlign: "center" }}>
                    {index} / 3<br />
                    <strong>1920x576 (16/9)</strong>
                    <br />
                    <strong>(JPG, PNG, TIFF, GIF)</strong>
                    <br />
                    {t(LanguageKey.limitsize)} <strong>5MB</strong>
                  </div>
                </label>
              )}
              {imgStr && (
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.uploadcover}
                  src={imgStr as string}
                  alt={`Banner image ${index}`}
                />
              )}
              {imgUrl && (
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.uploadcover}
                  src={`${baseMediaUrl}${imgUrl}`}
                  alt={`Banner image ${index}`}
                />
              )}
              <input
                ref={ref}
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/tiff,image/gif"
                style={{ display: "none" }}
                onChange={(e) => handleImageChange(e, `${imgKey}|${urlKey}|${idKey}`)}
                name={`bannerImage${index}`}
                aria-label={`Upload Banner Image ${index}`}
              />
              {(imgStr || imgUrl) && (
                <div className={styles.uploadmenu} role="menu" aria-label={`Banner ${index} actions`}>
                  <div
                    onClick={() => handleUploadImage(imgKey as string)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleUploadImage(imgKey as string))}
                    className={styles.uploadmenuedit}
                    role="button"
                    tabIndex={0}
                    aria-label={`Edit banner image ${index}`}
                    title={t(LanguageKey.edit)}>
                    <img className={styles.uploadmenuicon} src="/edit-1.svg" alt="" />
                    {t(LanguageKey.edit)}
                  </div>
                  <div
                    onClick={() => handleDeleteImage(`${imgKey}|${urlKey}`)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleDeleteImage(`${imgKey}|${urlKey}`))}
                    className={styles.uploadmenudelete}
                    role="button"
                    tabIndex={0}
                    aria-label={`Delete banner image ${index}`}
                    title={t(LanguageKey.delete)}>
                    <img className={styles.uploadmenuicon} src="/delete.svg" alt="" />
                    {t(LanguageKey.delete)}
                  </div>
                </div>
              )}
            </>
          )}
          {isLoading && (
            <div className={styles.uploadcover} aria-live="polite" aria-busy="true">
              <div className={styles.uploadProgressContainer}>
                <svg className={styles.circularProgress} viewBox="0 0 100 100">
                  <circle className={styles.circularProgressBg} cx="50" cy="50" r="45" />
                  <circle
                    className={styles.circularProgressBar}
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDashoffset: `${283 - (283 * progress) / 100}`,
                    }}
                  />
                </svg>
                <div className={styles.progressText}>{progress}%</div>
              </div>
            </div>
          )}
        </div>
      );
    },
    [
      selectedImage,
      loadingImage,
      errorImage,
      uploadProgress,
      dragActive,
      baseMediaUrl,
      t,
      handleImageChange,
      handleUploadImage,
      handleDeleteImage,
      handleKeyDown,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      componentId,
    ],
  );
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <title>{pageTitle}</title>
            <meta name="description" content="Advanced Instagram profile and banner management tool" />
            <meta
              name="keywords"
              content="instagram, manage, tools, Brancy, profile, banner, biography, customization"
            />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://www.Brancy.app/page/profile-banner" />
          </Head>
          <div className={styles.header}>
            <div className="title">{t(LanguageKey.marketPropertiesProfileInfoBanner)}</div>
            <FlexibleToggleButton
              options={[
                {
                  label: t(LanguageKey.marketPropertiespopup_ProfileInfo),
                  id: 0,
                },
                { label: t(LanguageKey.marketPropertiespopup_Banner), id: 1 },
              ]}
              onChange={setprofileandbannerToggle}
              selectedValue={profileandbannerToggle}></FlexibleToggleButton>
          </div>
          <div className={styles.all}>
            {profileandbannerToggle === ToggleOrder.FirstToggle && (
              <>
                {/* <div className={styles.header}>
                  <div className="title">{t(LanguageKey.advertiseProperties_userID)}</div>

                  <div className={styles.section} style={{ gap: "var(--gap-15)" }}>
                    <RadioButton
                      name="personal"
                      id={"personal-same-as-instagram"}
                      checked={!profileFullNameBanner.isActive}
                      handleOptionChanged={() => {
                        dispatchProfile({
                          type: "UPDATE_FULL_NAME_BANNER",
                          payload: { isActive: false },
                        });
                      }}
                      textlabel={t(LanguageKey.marketPropertiespopup_SameasInstagramProfile)}
                      title={t(LanguageKey.marketPropertiespopup_SameasInstagramProfile)}
                      aria-label={t(LanguageKey.marketPropertiespopup_SameasInstagramProfile)}
                    />
                    <RadioButton
                      name="personal"
                      checked={profileFullNameBanner.isActive}
                      handleOptionChanged={() => {
                        dispatchProfile({
                          type: "UPDATE_FULL_NAME_BANNER",
                          payload: { isActive: true },
                        });
                      }}
                      id="personal-custom"
                      textlabel={t(LanguageKey.custom)}
                      title={t(LanguageKey.custom)}
                      aria-label={t(LanguageKey.custom)}
                    />
                    <div className={`${styles.input} ${!profileFullNameBanner.isActive && "fadeDiv"}`}>
                      <InputText
                        className="textinputbox"
                        placeHolder="User Name"
                        handleInputChange={(e) => {
                          dispatchProfile({
                            type: "UPDATE_FULL_NAME_BANNER",
                            payload: { fullName: e.target.value },
                          });
                        }}
                        value={profileFullNameBanner.fullName}
                        fadeTextArea={!profileFullNameBanner.isActive}
                      />
                    </div>
                  </div>
                </div> */}
                <div className={styles.header}>
                  <div className="title"> {t(LanguageKey.advertiseProperties_biography)}</div>
                  <div className={styles.section} style={{ gap: "var(--gap-15)" }}>
                    <RadioButton
                      name="biography"
                      id={`${componentId}-biography-same-as-instagram`}
                      checked={!profileCaptionBanner.isActive}
                      handleOptionChanged={() => {
                        dispatch({
                          type: "UPDATE_CAPTION_BANNER",
                          payload: { isActive: false },
                        });
                      }}
                      textlabel={t(LanguageKey.marketPropertiespopup_SameasInstagramProfile)}
                      title={t(LanguageKey.marketPropertiespopup_SameasInstagramProfile)}
                      aria-label={t(LanguageKey.marketPropertiespopup_SameasInstagramProfile)}
                    />
                    <RadioButton
                      name="biography"
                      id={`${componentId}-biography-custom`}
                      checked={profileCaptionBanner.isActive}
                      handleOptionChanged={() => {
                        dispatch({
                          type: "UPDATE_CAPTION_BANNER",
                          payload: { isActive: true },
                        });
                      }}
                      textlabel={t(LanguageKey.custom)}
                      title={t(LanguageKey.custom)}
                      aria-label={t(LanguageKey.custom)}
                    />
                    <div className={`${styles.input} ${!profileCaptionBanner.isActive && "fadeDiv"}`}>
                      <div className={styles.section} style={{ height: "100%" }}>
                        <div className={styles.counter} aria-live="polite" aria-atomic="true">
                          (<strong>{profileCaptionBanner.caption.length}</strong>/ <strong>{MAX_CAPTION_LENGTH}</strong>
                          )
                        </div>
                        <TextArea
                          className={"captiontextarea"}
                          placeHolder={""}
                          fadeTextArea={false}
                          handleInputChange={(e) => {
                            dispatch({
                              type: "UPDATE_CAPTION_BANNER",
                              payload: { caption: e.target.value },
                            });
                          }}
                          value={profileCaptionBanner.caption}
                          maxLength={MAX_CAPTION_LENGTH}
                          handleKeyDown={undefined}
                          style={{ height: "150px" }}
                          title="Caption Text Area"
                          aria-label="Biography caption text area"
                          role={"textbox"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {profileandbannerToggle === ToggleOrder.SecondToggle && (
              <>
                <div className="explain">{t(LanguageKey.uploadbannerexplain)}</div>
                {renderBannerUpload(1, "imgStr1", "imgUrl1", "id1", "id1", bannerRef1)}
                {renderBannerUpload(2, "imgStr2", "imgUrl2", "id2", "id2", bannerRef2)}
                {renderBannerUpload(3, "imgStr3", "imgUrl3", "id3", "id3", bannerRef3)}
              </>
            )}
          </div>
          {analizeProcessing && (
            <div aria-live="polite" aria-busy="true">
              <ProgressBar width={progress} />
            </div>
          )}
          {!analizeProcessing && (
            <div className="ButtonContainer" role="group" aria-label="Action buttons">
              <button
                type="button"
                className="cancelButton"
                onClick={props.removeMask}
                onKeyDown={(e) => handleKeyDown(e, props.removeMask)}
                aria-label={t(LanguageKey.cancel)}>
                {t(LanguageKey.cancel)}
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                onKeyDown={(e) => handleKeyDown(e, handleSaveBanner)}
                className="saveButton"
                aria-label={t(LanguageKey.save)}>
                {t(LanguageKey.save)}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
});
Banner.displayName = "Banner";
export default Banner;
