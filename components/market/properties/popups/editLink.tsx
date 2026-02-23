import Head from "next/head";
import { ChangeEvent, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";

import SetTimeAndDate from "../../../dateAndTime/setTimeAndDate";
import CheckBoxButton from "../../../design/checkBoxButton";
import InputText from "../../../design/inputText";
import Loading from "../../../notOk/loading";
import { internalNotify, InternalResponseType, NotifType } from "../../../notifications/notificationBox";

import { convertHeicToJpeg } from "../../../../helper/convertHeicToJPEG";
import initialzedTime from "../../../../helper/manageTimer";

import { LanguageKey } from "../../../../i18n";
import { TitleType } from "../../../../models/market/enums";
import { ILink, IUpdateLink } from "../../../../models/market/properties";

import styles from "./addNewLink.module.css";

const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

type LinkState = {
  linkData: ILink;
  scheduledCheck: boolean;
  selectedImage: string | null;
  showSetDateAndTime: boolean;
};

type LinkAction =
  | { type: "SET_FIELD"; field: keyof ILink; value: any }
  | { type: "SET_MULTIPLE_FIELDS"; fields: Partial<ILink> }
  | { type: "SET_SCHEDULED_CHECK"; value: boolean }
  | { type: "SET_SELECTED_IMAGE"; value: string | null }
  | { type: "TOGGLE_DATE_TIME_PICKER" }
  | { type: "SET_CUSTOM_IMAGE"; imageStr: string };

function linkReducer(state: LinkState, action: LinkAction): LinkState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, linkData: { ...state.linkData, [action.field]: action.value } };
    case "SET_MULTIPLE_FIELDS":
      return { ...state, linkData: { ...state.linkData, ...action.fields } };
    case "SET_SCHEDULED_CHECK":
      return { ...state, scheduledCheck: action.value };
    case "SET_SELECTED_IMAGE":
      return { ...state, selectedImage: action.value };
    case "TOGGLE_DATE_TIME_PICKER":
      return { ...state, showSetDateAndTime: !state.showSetDateAndTime };
    case "SET_CUSTOM_IMAGE":
      return {
        ...state,
        selectedImage: action.imageStr,
        linkData: { ...state.linkData, customLink: action.imageStr, type: TitleType.Custome, title: "Custome" },
      };
    default:
      return state;
  }
}
const Editlink = (props: { info: ILink; removeMask: () => void; handleUpdateLink: (newLink: IUpdateLink) => void }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);

  const [state, dispatch] = useReducer(linkReducer, {
    linkData: props.info,
    scheduledCheck: props.info?.expireTime > 0,
    selectedImage: null,
    showSetDateAndTime: false,
  });

  const { linkData, scheduledCheck, selectedImage, showSetDateAndTime } = state;

  const timeConfig = useMemo(() => initialzedTime(), []);

  const handleButtonClick = useCallback(async () => {
    try {
      const textFromClipboard = await navigator.clipboard.readText();
      dispatch({ type: "SET_FIELD", field: "redirectUrl", value: textFromClipboard });
    } catch (error) {
      console.error("Failed to read clipboard: ", error);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.currentTarget;
      if (name === "title" && linkData.type !== TitleType.GeneralLink && linkData.type !== TitleType.Custome) return;
      dispatch({ type: "SET_FIELD", field: name as keyof ILink, value });
    },
    [linkData.type]
  );

  const handleCkeckBoxChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    dispatch({ type: "SET_FIELD", field: name as keyof ILink, value: checked });
  }, []);

  const handleScheduledCheckChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_SCHEDULED_CHECK", value: e.target.checked });
  }, []);

  const handleSaveDateAndTime = useCallback((date: string | undefined) => {
    if (date) {
      dispatch({ type: "SET_FIELD", field: "expireTime", value: parseInt(date) / 1000 });
      dispatch({ type: "TOGGLE_DATE_TIME_PICKER" });
    }
  }, []);

  const handleSaveAddNewLink = useCallback(() => {
    const saveLink: IUpdateLink = {
      customLink: linkData.customLink !== undefined ? linkData.customLink : null,
      description: linkData.description,
      expireTime: Math.floor(linkData.expireTime),
      isBold: linkData.isBold,
      redirectUrl: linkData.redirectUrl,
      title: linkData.type === TitleType.Custome || linkData.type === TitleType.GeneralLink ? linkData.title : null,
      type: linkData.type,
      linkId: linkData.id,
    };
    props.handleUpdateLink(saveLink);
    props.removeMask();
  }, [linkData, props]);

  const handleImageChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;

    if (file.size > 100000) {
      internalNotify(InternalResponseType.ExceededMedia, NotifType.Warning);
      return;
    }

    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
    }

    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onload = () => {
      const imageStr = reader.result as string;
      dispatch({ type: "SET_CUSTOM_IMAGE", imageStr });
    };

    reader.readAsDataURL(file);
  }, []);

  const handleUploadImage = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const isSaveEnabled = useMemo(() => {
    if (!linkData) return false;
    const isTitleEmpty =
      (linkData.type === TitleType.Custome && linkData.title.length === 0) ||
      (linkData.type === TitleType.GeneralLink && linkData.title.length === 0);
    const isRedirectEmpty = linkData.redirectUrl.length === 0;
    const isExpireTooSoon = scheduledCheck && linkData.expireTime * 1000 < Date.now() + 3600000;
    return !(isTitleEmpty || isRedirectEmpty || isExpireTooSoon);
  }, [linkData, scheduledCheck]);

  const imageSrc = useMemo(
    () => selectedImage || (linkData.iconUrl ? baseMediaUrl + linkData.iconUrl : ""),
    [selectedImage, linkData.iconUrl]
  );

  const formattedDate = useMemo(
    () =>
      new DateObject({
        date: linkData.expireTime * 1000,
        calendar: timeConfig.calendar,
        locale: timeConfig.locale,
      }).format("YYYY/MM/DD"),
    [linkData.expireTime, timeConfig]
  );

  const formattedTime = useMemo(
    () =>
      new DateObject({
        date: linkData.expireTime * 1000,
        calendar: timeConfig.calendar,
        locale: timeConfig.locale,
      }).format("hh:mm"),
    [linkData.expireTime, timeConfig]
  );

  const formattedPeriod = useMemo(
    () =>
      new DateObject({
        date: linkData.expireTime * 1000,
        calendar: timeConfig.calendar,
        locale: timeConfig.locale,
      }).format("A"),
    [linkData.expireTime, timeConfig]
  );

  useEffect(() => {
    return () => {
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        props.removeMask();
      } else if (e.key === "Enter" && e.ctrlKey && isSaveEnabled) {
        e.preventDefault();
        handleSaveAddNewLink();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [props, isSaveEnabled, handleSaveAddNewLink]);

  if (!props.info) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.pageLottery_ViewandEditDetails)}</title>
        <meta
          name="description"
          content="Edit and manage your Instagram bio link with advanced customization options"
        />
        <meta
          name="keywords"
          content="instagram bio link editor, link management, custom icons, scheduled links, Instagram tools, Brancy"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {!showSetDateAndTime && (
        <>
          <div className="headerandinput">
            <h1 className="title">{t(LanguageKey.pageLottery_ViewandEditDetails)}</h1>

            <div className={styles.selected}>
              <img
                loading="lazy"
                decoding="async"
                className={styles.selectedicon}
                src={imageSrc}
                alt={`${linkData.title} icon`}
              />

              <div className="instagramprofiledetail">
                <div className="instagramusername">{linkData.title}</div>
                <div className="instagramid">{linkData.description}</div>
              </div>
            </div>
            {linkData.type === TitleType.Custome && (
              <div className={styles.customicon}>
                <button
                  type="button"
                  onClick={handleUploadImage}
                  className={styles.browse}
                  aria-label={t(LanguageKey.update)}>
                  {t(LanguageKey.update)}
                </button>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/heic"
                  onChange={handleImageChange}
                  ref={inputRef}
                  style={{ display: "none" }}
                  aria-label="Upload custom icon"
                />
                {t(LanguageKey.marketPropertiespopup_yourcustomIcon)}
              </div>
            )}
          </div>

          <div className={styles.shortcut}>
            <div className="headerandinput">
              <div className="headerparent">
                <label className="headertext" htmlFor="link-title">
                  {t(LanguageKey.SettingGeneral_Title)}
                </label>
                <div className="explain" aria-live="polite">
                  (<strong>{linkData.title.length}</strong> / <strong>15</strong>)
                </div>
              </div>

              <InputText
                className="textinputbox"
                placeHolder={""}
                handleInputChange={handleInputChange}
                value={linkData.title!}
                maxLength={15}
                name={"title"}
                fadeTextArea={linkData.type > 0}
                dangerOnEmpty
              />
            </div>
            <div className="headerandinput">
              <div className="headerparent">
                <label className="headertext" htmlFor="link-description">
                  {t(LanguageKey.SettingGeneral_Description)}
                </label>
                <div className="explain" aria-live="polite">
                  (<strong>{linkData.description ? linkData.description.length : 0}</strong> / <strong>50</strong>)
                </div>
              </div>

              <InputText
                className="textinputbox"
                placeHolder={""}
                handleInputChange={handleInputChange}
                value={linkData.description}
                maxLength={50}
                name={"description"}
                dangerOnEmpty
              />
            </div>
            <div className="headerandinput">
              <div className="headerparent">
                <label className="headertext" htmlFor="link-url">
                  {t(LanguageKey.linkURL)}
                </label>
              </div>
              <div className="headerparent">
                <InputText
                  className="textinputbox"
                  placeHolder={""}
                  handleInputChange={handleInputChange}
                  value={linkData.redirectUrl}
                  maxLength={undefined}
                  name={"redirectUrl"}
                  dangerOnEmpty
                />
                <button
                  type="button"
                  onClick={handleButtonClick}
                  style={{
                    cursor: "pointer",
                    width: "30px",
                    height: "30px",
                    padding: "var(--padding-5)",
                    border: "none",
                    background: "transparent",
                  }}
                  title="Paste from clipboard"
                  aria-label="Paste URL from clipboard">
                  <img src="/copy.svg" alt="" role="presentation" />
                </button>
              </div>
            </div>

            <div className="headerandinput">
              <CheckBoxButton
                handleToggle={handleCkeckBoxChange}
                value={linkData.isBold}
                textlabel={t(LanguageKey.Boldit)}
                name="isBold"
                title={"Bold"}
              />
            </div>
            <div className="headerandinput">
              <CheckBoxButton
                handleToggle={handleScheduledCheckChange}
                value={scheduledCheck}
                textlabel={t(LanguageKey.Scheduletime)}
                title={"Schedule"}
              />
              <div className={`headerandinput ${!scheduledCheck && `fadeDiv`}`}>
                <div className={styles.dateTime}>
                  <div className={styles.input} aria-label="Date">
                    {formattedDate}
                  </div>
                  <div className={styles.input} aria-label="Time">
                    {formattedTime}
                  </div>
                  <div className={styles.input} style={{ width: "fit-content" }} aria-label="Period">
                    {formattedPeriod}
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "TOGGLE_DATE_TIME_PICKER" })}
                    className="saveButton"
                    style={{
                      position: "relative",
                      height: "40px",
                      width: "40px",
                      maxWidth: "40px",
                      minWidth: "40px",
                      maxHeight: "40px",
                      minHeight: "40px",
                    }}
                    aria-label="Select date and time">
                    <img
                      className={styles.Calendaricon}
                      style={{ width: "23px" }}
                      alt=""
                      src="/selectDate-item.svg"
                      role="presentation"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="ButtonContainer">
            <button type="button" className="cancelButton" onClick={props.removeMask}>
              {t(LanguageKey.cancel)}
            </button>
            <button
              type="submit"
              disabled={!isSaveEnabled}
              onClick={handleSaveAddNewLink}
              className={isSaveEnabled ? "saveButton" : "disableButton"}
              aria-label="Save link changes">
              {t(LanguageKey.save)}
            </button>
          </div>
        </>
      )}
      {showSetDateAndTime && (
        <SetTimeAndDate
          removeMask={props.removeMask}
          saveDateAndTime={handleSaveDateAndTime}
          backToNormalPicker={() => dispatch({ type: "TOGGLE_DATE_TIME_PICKER" })}
          selectedDates={[]}
          startDay={linkData.expireTime * 1000}
        />
      )}
    </>
  );
};

export default Editlink;
