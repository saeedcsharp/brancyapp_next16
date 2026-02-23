import Head from "next/head";
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import InputText from "brancy/components/design/inputText";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import { internalNotify, InternalResponseType, NotifType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { convertHeicToJpeg } from "brancy/helper/convertHeicToJPEG";
import { getEnumValue } from "brancy/helper/handleItemTypeEnum";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { KeyValueStore } from "brancy/models/keyValueStore";
import { TitleName, TitleType } from "brancy/models/market/enums";
import { INewLink, ISaveLink } from "brancy/models/market/properties";
import styles from "brancy/components/market/properties/popups/addNewLink.module.css";

const AddNewLink = (props: { removeMask: () => void; handleAddNewLink: (newLink: ISaveLink) => void }) => {
  const { t } = useTranslation();
  const [toggleValue, setToggleValue] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showSetDateAndTime, setShowSetDateAndTime] = useState(false);
  const [scheduledCheck, setScheduledCheck] = useState(false);
  const [addNewLink, setAddNewLink] = useState<INewLink>({
    customLink: null,
    description: t(LanguageKey.SettingGeneral_Description),
    expireTime: 0,
    isBold: false,
    redirectUrl: "",
    title: "General Link",
    type: 0,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLinkTitle, setSelectedLinkTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // initialising complete — hide loading. If you need to wait for async data, update this.
    setLoading(false);
  }, []);
  function handleSelectLink(param: TitleName) {
    setSelectedImage(null);
    setSelectedLinkTitle(param);
    const newType = getEnumValue(TitleName, TitleType, param)!;
    setAddNewLink((prev) => ({
      ...prev,
      title: param,
      type: newType,
      customLink: null,
    }));
  }
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "title" && addNewLink.type !== TitleType.GeneralLink && addNewLink.type !== TitleType.Custome)
      return;
    console.log(e.currentTarget.name);
    setAddNewLink((prev) => ({
      ...prev,
      [e.currentTarget.name]: e.currentTarget.value,
    }));
  }
  function handleCkeckBoxChange(e: ChangeEvent<HTMLInputElement>) {
    setAddNewLink((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  }
  function handleSaveDateAndTime(date: string | undefined) {
    if (date) {
      setAddNewLink((prev) => ({ ...prev, expireTime: parseInt(date) }));
      setShowSetDateAndTime(false);
    }
  }
  function handleCheckSaveCondition() {
    if (
      (addNewLink.type === TitleType.Custome && addNewLink.title.length === 0) ||
      (addNewLink.type === TitleType.GeneralLink && addNewLink.title.length === 0) ||
      addNewLink.redirectUrl.length === 0 ||
      (showSetDateAndTime && addNewLink.expireTime < Date.now() + 3600000)
    ) {
      return false;
    } else return true;
  }
  function handleSaveAddNewLink() {
    if (!handleCheckSaveCondition()) return;
    const saveLink: ISaveLink = {
      customLink: addNewLink.customLink,
      description: addNewLink.description,
      expireTime: Math.floor(addNewLink.expireTime / 1000),
      isBold: addNewLink.isBold,
      redirectUrl: addNewLink.redirectUrl,
      title:
        addNewLink.type === TitleType.Custome || addNewLink.type === TitleType.GeneralLink ? addNewLink.title : null,
      type: addNewLink.type,
    };
    props.handleAddNewLink(saveLink);
    props.removeMask();
  }
  const handleButtonClick = async () => {
    try {
      const textFromClipboard = await navigator.clipboard.readText();
      setAddNewLink({ ...addNewLink, redirectUrl: textFromClipboard });
    } catch (error) {
      console.error("Failed to read clipboard: ", error);
    }
  };
  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;

    if (file) {
      if (file === undefined) return;
      console.log(file.size);
      if (file?.size > 100000) {
        internalNotify(InternalResponseType.ExceededMedia, NotifType.Warning);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (file === undefined) return;
        const imageStr = reader.result as string;
        setSelectedImage(imageStr);
        setSelectedLinkTitle(null);
        setAddNewLink((prev) => ({
          ...prev,
          customLink: imageStr,
          type: TitleType.Custome,
          title: "Custome",
        }));
      };
      reader.readAsDataURL(file);
    }
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    if (droppedFiles && droppedFiles[0]) {
      if (droppedFiles[0]?.size > 1e1) {
        internalNotify(InternalResponseType.ExceededMedia, NotifType.Warning);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const imageStr = reader.result as string;
        setSelectedImage(imageStr);
        setSelectedLinkTitle(null);
        setAddNewLink((prev) => ({
          ...prev,
          customLink: imageStr,
          type: TitleType.Custome,
          title: "Custome",
        }));
      };
      reader.readAsDataURL(droppedFiles[0]);
      // setShowSendFile(true);
    }
  }
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  function handleUploadImage() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }
  const svgLinks = new KeyValueStore<ReactNode>();
  svgLinks.setValue(
    "General Link",
    <svg
      onClick={() => handleSelectLink(TitleName.GeneralLink)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.GeneralLink ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M15 18.9a2 2 0 0 1-.1 2.5L13 23a7.6 7.6 0 0 1-11.1-1A9 9 0 0 1 0 16a9 9 0 0 1 2.7-5.8l1.8-1.6A1.6 1.6 0 0 1 7 9a2 2 0 0 1-.2 2.5L5 13a5 5 0 0 0-.4 6.8 4.4 4.4 0 0 0 6.4.5l1.8-1.6a1.6 1.6 0 0 1 2.3.2M12 2l-2 1.6a2 2 0 0 0-.1 2.5 1.6 1.6 0 0 0 2.3.2L14 4.7a4.4 4.4 0 0 1 5-.6q.9.3 1.4 1.1a5 5 0 0 1 1.1 3.5q0 2-1.5 3.3l-1.8 1.6A2 2 0 0 0 18 16a1.6 1.6 0 0 0 2.4.2l1.8-1.6A8.7 8.7 0 0 0 23 2.9 7.6 7.6 0 0 0 11.9 2m2.5 6.3L8.3 14a2 2 0 0 0-.2 2.5 2 2 0 0 0 1.3.6q.6 0 1.1-.5l6.2-5.6a2 2 0 0 0 .2-2.5 1.6 1.6 0 0 0-2.4-.2" />
    </svg>
  );
  svgLinks.setValue(
    "PDF Link",
    <svg
      onClick={() => handleSelectLink(TitleName.PDFLink)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.PDFLink ? styles.selected : ""}`}
      viewBox="0 0 25 28">
      <path d="M3.1 0H17l.4.4 5.2 5.8q.3.4.2.7V10h.5a2 2 0 0 1 1.7 1v8.6a2 2 0 0 1-1 1.6l-.6.1h-.6v5.4a1 1 0 0 1-.8 1.2H3.6a1 1 0 0 1-1.3-.7v-5.9h-.6A1.6 1.6 0 0 1 0 19.7L.1 11a2 2 0 0 1 1.6-1h.6V1.4A1.3 1.3 0 0 1 3 0m.3 10h18.2V7.3H17q-.7 0-.7-.8V1.1H3.4zm0 11.3v5.1q0 .2.3.2h17.6q.4 0 .3-.3v-5zM9.7 20q2 .2 4-.1a4 4 0 0 0 2.3-1.3q1-1.2 1-2.9a3.6 3.6 0 0 0-3.1-3.8q-1.5-.3-3.1-.1l-1.1.1zm-5.3 0v-3H6a3 3 0 0 0 2.3-2 2.4 2.4 0 0 0-2-3.1q-1.5-.3-2.8-.1l-1 .1v8zM20 20v-3.3h3v-1.5h-3v-1.9h3.1v-1.5h-5V20zM4.4 15.5v-2l.2-.2h1a1 1 0 0 1 .9 1 1 1 0 0 1-.7 1.1q-.8.3-1.4.1m7.3-2a3 3 0 0 1 2.4.4q.6.6.7 1.3.1.9-.1 1.8a2 2 0 0 1-1.9 1.4h-1.1z" />
    </svg>
  );
  svgLinks.setValue(
    "Contact",
    <svg
      onClick={() => handleSelectLink(TitleName.Contact)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Contact ? styles.selected : ""}`}
      viewBox="0 0 25 20">
      <path d="M20 20v-1h-1v1H6v-1H5v1H1.5q-.5 0-1-.4a2 2 0 0 1-.5-1.3V1.7A2 2 0 0 1 .4.5 2 2 0 0 1 1.6 0h9.8a1 1 0 0 1 1.2.5 2 2 0 0 1 .4 1.2l.1.3h.1l.2.1h10q.5 0 .8.2l.6.6.2 1v14.6q0 .6-.5 1t-1 .5zm1-1h2.4q.6 0 .6-.7V3.6q0-.2-.2-.3l-.2-.1H12V1.6l-.1-.4-.4-.1H1.1l-.2.4v16.8q0 .7.6.6H4v-1h3v1h11v-1h3zm-10.5-4.8H3l.5-1.1.9-.5.7-.4.5-.2.2-.3v-.5l-.1-.7-.3-.6v-.2L5 9.3v-2q0-.6.4-1t1-.5h.7l.4.3.7.5.2.7q0 .7-.2 1.3v.2a1 1 0 0 1-.1 1H8q0 .6-.4 1v.8q0 .4.4.4l.8.5 1 .4.4.5.2.6zM13 8.9V8h9v1zm9 1.6v1h-9v-1zm0 3.7h-9v-1h9z" />
    </svg>
  );
  svgLinks.setValue(
    "RSS Feed",
    <svg
      onClick={() => handleSelectLink(TitleName.RSSFeed)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.RSSFeed ? styles.selected : ""}`}
      viewBox="0 0 27 27">
      <path d="M24.2 0H1.8A2 2 0 0 0 0 1.8v22.4A2 2 0 0 0 1.8 26h22.4a2 2 0 0 0 1.8-1.8V1.8A2 2 0 0 0 24.2 0M7 22.1a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6m8.6-1.3a1 1 0 0 1-.8.8h-1.9a1 1 0 0 1-.9-.8v-1a5.3 5.3 0 0 0-5.2-5.2h-1a1 1 0 0 1-.9-1v-1.8a1 1 0 0 1 1-.9h.9a9 9 0 0 1 8.8 9zm5.7.8h-1.9a1 1 0 0 1-.9-.8v-1A12 12 0 0 0 6.7 8h-1a1 1 0 0 1-.9-.8v-2a1 1 0 0 1 1-.8h.9A15.4 15.4 0 0 1 22 19.8v1a1 1 0 0 1-1 .8" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Instagram",
    <svg
      onClick={() => handleSelectLink(TitleName.Instagram)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Instagram ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M12.5 2.3h5a7 7 0 0 1 2.4.5A4 4 0 0 1 22.2 5q.5 1.2.5 2.4a88 88 0 0 1-.5 12.4 4 4 0 0 1-2.3 2.3q-1.2.5-2.3.5A88 88 0 0 1 5 22.2q-.8-.3-1.4-.9l-1-1.4q-.4-1.2-.4-2.3A88 88 0 0 1 2.8 5 4 4 0 0 1 5 2.8l2.3-.5zm0-2.3H7.3q-1.5.1-3 .7-1.2.5-2.2 1.4-1 1-1.4 2.2-.6 1.5-.6 3a89 89 0 0 0 .6 13.4Q1.2 22 2 22.9q1 1 2.2 1.4 1.5.6 3 .6a89 89 0 0 0 13.4-.6 6 6 0 0 0 3.6-3.6q.6-1.5.6-3a89 89 0 0 0-.6-13.4A6 6 0 0 0 20.7.7q-1.5-.6-3-.6zm0 6a6.4 6.4 0 1 0 0 13 6.4 6.4 0 0 0 0-13m0 10.7a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4m8.2-10.9a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Club House",
    <svg
      onClick={() => handleSelectLink(TitleName.ClubHouse)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.ClubHouse ? styles.selected : ""}`}
      viewBox="0 0 25 21">
      <path d="M8.4 5.5q-.6-3 2.4-3a2 2 0 0 1 .9-2.1q.4-.3.7-.3 1.4-.5 2.3 1l1.2-.3a2 2 0 0 1 1.9 1.3l.5 2q.5 2.3 1.9 4.3 0-.5.3-.6A3 3 0 0 1 22.9 6a2 2 0 0 1 1.7.7 2 2 0 0 1 .3 1.8l-.5 1.2q-.8 1.6-.8 3.4a9 9 0 0 1-1.2 4.5 7 7 0 0 1-8 2.9q-1.6-.6-2.7-1.7l-2.3-3.2a35 35 0 0 1-3.3-8 2 2 0 0 1 1.2-2q.3-.3.8-.2zm7.9 14.4a6 6 0 0 0 5.5-3.2q.7-1.6.7-3.3 0-2.4 1.1-4.5.3-.3.3-.7a1 1 0 0 0-.4-1h-.3a2 2 0 0 0-1.5.7l-.8 1.6-.8 1.2-.5.4q-1 .8-1 2-.2.4-.8.4-.4-.1-.3-.5.1-1.3 1-2.1l1-.9.1-.5-.1-.2q-1.7-2.4-2.3-5.2l-.4-1.7A1 1 0 0 0 16 2h-.4a1 1 0 0 0-.6.7V3q.3 3 1.8 5.5l.4.2h.5l.3.4-.3.3h-.2q-2.4.5-4 2.4l-.3.1-.4-.4.1-.6.3-.2.1-.5V10q-1.1-1.8-1.7-4l-.4-1.7-.6-.6a1 1 0 0 0-1.2.7v.9a25 25 0 0 0 2.5 6.6l-.3.3h-.2q-.4 0-.5-.3A21 21 0 0 1 8.8 7a1 1 0 0 0-.8-.4q-1.1.1-.7 1.4 1.5 5 4.4 9.2a6 6 0 0 0 4.6 2.7m-.4-11-.2-.5q-1.2-2.3-1.6-5l-.4-2-.8-.3q-1.2 0-1 1.3l.7 3.2q.5 2 1.4 3.7.1.3.5.2zM4.3 5.3 3.9 5 1.2 3.6q-.6-.3-.1-1 .3-.7.9-.4l.7.4 2 1.6.1.5q0 .5-.5.6m-2.6 9.3L2 14l3-1.1q.6-.1.7.3t-.2.8L3 15.5q-1.2.5-1.3-1m.6-4.8H.6q-.7-.1-.6-1T.8 8l3 .5q.7.1.6.7t-.7.5z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Skype",
    <svg
      onClick={() => handleSelectLink(TitleName.Skype)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Skype ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M.8 12.5A12 12 0 0 0 9.6 24q2.6.6 5 .1A6.8 6.8 0 0 0 25 19q.2-2.4-1-4.4a12 12 0 0 0-8-13.3q-3-.8-5.8-.3A6.8 6.8 0 0 0 0 6q-.2 2.4 1 4.4zm11.8-8.3c3.8.2 6 1.9 6.2 3.4a1.6 1.6 0 0 1-1.7 1.8c-1.7 0-2-2.3-4.8-2.3Q10 7.1 9.8 9c0 2.5 9.4 1 9.4 6.6 0 3.1-2.5 5.2-6.3 5.2-3.3 0-6.7-1.5-6.6-4.1a1.5 1.5 0 0 1 1.3-1.5c2 0 2 2.9 5 2.9 2.3 0 3-1.2 3-2 0-3-9.4-1.2-9.4-6.9 0-3 2.5-5.1 6.4-5" />
    </svg>
  );
  svgLinks.setValue(
    "WhatsApp",
    <svg
      onClick={() => handleSelectLink(TitleName.WhatsApp)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.WhatsApp ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M25 11.9a12.3 12.3 0 0 0-24.5.3q0 3.4 1.7 6.3L0 25l6.8-2.2A12.3 12.3 0 0 0 25 12.2zM12.7 22.4q-3.1 0-5.6-1.7L3 22l1.3-3.8A10 10 0 0 1 5.9 4.5 10.3 10.3 0 0 1 23 12.2a10.3 10.3 0 0 1-10.3 10.2M19 15q.1.7-.2 1.4a3 3 0 0 1-2 1.4c-.5 0-.5.5-3.6-.7A12 12 0 0 1 7 10.5l-.2-1a3 3 0 0 1 1-2.5 1 1 0 0 1 .9-.4h.6q.2-.1.6.5l1 2.8-.2.3-.1.2-.4.5q-.4.2-.2.6l1.7 2q1 1 2.4 1.5.4.3.7 0c.1-.2.7-1 1-1.2q.2-.4.6-.2l2 1q.5.2.6.4" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Twitter",
    <svg
      onClick={() => handleSelectLink(TitleName.Twitter)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Twitter ? styles.selected : ""}`}
      viewBox="0 0 25 20">
      <path d="M0 17.7a14.7 14.7 0 0 0 20.7-5.2q2-3.5 1.7-7.5Q24 4 25 2.4q-1.5.6-3 .8A5 5 0 0 0 24.4.4q-1.5.9-3.2 1.2A5.2 5.2 0 0 0 12.6 3a5 5 0 0 0-.3 3.2A15 15 0 0 1 1.7.9a5 5 0 0 0 1.6 6.8Q2.1 7.7 1 7a5 5 0 0 0 1.1 3.3q1.2 1.4 3 1.7-1 .3-2.3.1a5 5 0 0 0 4.8 3.5A10 10 0 0 1 0 17.7" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Dribbble",
    <svg
      onClick={() => handleSelectLink(TitleName.Dribbble)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Dribbble ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M12.5 0a12.5 12.5 0 1 0 0 25 12.5 12.5 0 0 0 0-25m0 2.2q3.5 0 6.3 2.1-2.1 2.6-5.2 3.9-1.6-3-3.6-5.7 1.2-.3 2.5-.3M7.8 3.3q2 2.7 3.7 5.6-4.5 1.2-9 1.2a10 10 0 0 1 5.3-6.8m-5.6 9.2v-.3q5.3.1 10.4-1.3l.7 1.5A16 16 0 0 0 4.6 19a10 10 0 0 1-2.4-6.6m10.3 10.3q-3.5 0-6.3-2.2a14 14 0 0 1 7.9-6.2q1.5 3.7 2.1 7.7-1.8.7-3.7.7m5.7-1.7a43 43 0 0 0-2-7.2q3.3-.4 6.5.2a10 10 0 0 1-4.5 7m-2.8-9.3-.8-1.7q3.3-1.5 5.8-4.3 2.2 2.7 2.4 6.1-3.7-.6-7.4 0" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Snapchat",
    <svg
      onClick={() => handleSelectLink(TitleName.Snapchat)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Snapchat ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="m24.8 19-.9-.3a7 7 0 0 1-3.2-2.5L19.5 14a1 1 0 0 1 0-.9q.6-.6 1.2-.8.8-.2 1.5-.8l.3-.3v-.6q-.2-.3-.6-.5a1 1 0 0 0-.9 0l-.8.2h-1V10l.1-1.8v-3a7 7 0 0 0-2.6-4Q15.2.3 13.5 0h-1.1A7 7 0 0 0 6 4.4 9 9 0 0 0 5.6 8v2.4h-1l-.8-.3-.8.2a1 1 0 0 0-.5.8q0 .3.3.5l.3.2q.7.5 1.7.8a1 1 0 0 1 .7.8q0 .8-.3 1.4a8 8 0 0 1-2.6 3.1L.7 19l-.6.4v.6l.3.3 1.8.6 1 .3.2.3.3 1.2.2.2h.4q1.5-.4 2.8-.1 1.5.5 2.6 1.5a4 4 0 0 0 2 .8h1.8q.8-.1 1.4-.6l2.7-1.7H21l.4-.3v-.1q0-.6.4-1.2l.5-.2 1.9-.5.7-.5-.2-.8" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Pinterest",
    <svg
      onClick={() => handleSelectLink(TitleName.Pinterest)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Pinterest ? styles.selected : ""}`}
      viewBox="0 0 20 25">
      <path d="M3 14.5a.5.5 0 0 0 .8-.4l.3-1.2-.2-.8a4 4 0 0 1-1-2.8A7 7 0 0 1 7.4 3a7 7 0 0 1 2.8-.4c4 0 6.2 2.3 6.2 5.5 0 4.1-2 7.6-4.7 7.6a2 2 0 0 1-2-.8 2 2 0 0 1-.4-2c.5-1.8 1.3-3.8 1.3-5a2 2 0 0 0-1.1-2l-.9-.2C7 5.6 5.8 7.2 5.8 9.3q0 1.1.4 2.3l-1.9 7.8a16 16 0 0 0 0 5.5h.3q1.8-2.1 2.7-4.7l1-4a4 4 0 0 0 3.7 1.9c4.8 0 8-4.2 8-9.9C20 4 16.3 0 10.6 0 3.6 0 0 4.9 0 9c0 2.4 1 4.6 3 5.5" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Telegram",
    <svg
      onClick={() => handleSelectLink(TitleName.Telegram)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Telegram ? styles.selected : ""}`}
      viewBox="0 0 25 26">
      <path d="M25 2.3 24 10l-2 13.7q-.1.4-.4.6-.1.3-.4.5a1 1 0 0 1-1.2 0q-.8-.2-1.4-.8L11 17.7l-.2-.7.2-.7.7-1 7-8q.3-.4 0-.9-.2-.3-.6 0l-3.8 3L8.7 14q-1 .8-2 1t-2.1 0L.8 13.5q-.6-.2-.8-1 .1-.9.7-1.1l2.9-1.6q7.8-4.2 15.9-8.1L23 0q2-.6 1.9 2.2" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Facebook",
    <svg
      onClick={() => handleSelectLink(TitleName.Facebook)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Facebook ? styles.selected : ""}`}
      viewBox="0 0 12 25">
      <path d="M2.7 25H8V12.4h3.6l.4-4.2H8V5.8q-.2-1.5 1.2-1.4H12V0H8.4Q2.6 0 2.7 4.8v3.4H0v4.2h2.7z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Behance",
    <svg
      onClick={() => handleSelectLink(TitleName.Behance)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Behance ? styles.selected : ""}`}
      viewBox="0 0 25 17">
      <path d="M9.2 15.4a4 4 0 0 0 2.8-2q.7-1.1.7-2.5 0-1.2-.6-2.3t-1.8-1.4q.8-.3 1.2-.8.8-1 .7-2.3a4 4 0 0 0-.7-2.4 5 5 0 0 0-4-1.7H0v15.6h7zM3 2.7h3.4q.9 0 1.8.3A1.4 1.4 0 0 1 9 4.4a2 2 0 0 1-.6 1.4q-.7.4-1.6.4H3zm0 10.2V8.8h3.8l1.6.2a2 2 0 0 1 1 1.7 2 2 0 0 1-1 2l-1.6.2zm12.3 1.7q1.7 1.5 4 1.4a6 6 0 0 0 4.3-1.7q1-.8 1.1-2h-3l-.6.7q-.8.6-1.7.6a3 3 0 0 1-1.7-.5 3 3 0 0 1-1.2-2.4H25l-.1-2.3q-.1-1.3-1-2.4A5 5 0 0 0 22 4.3q-1.3-.5-2.7-.5a6 6 0 0 0-4.1 1.6 6 6 0 0 0-1.6 4.6 6 6 0 0 0 1.8 4.6m2.1-7.7a2 2 0 0 1 1.8-.6q1 0 1.8.6a3 3 0 0 1 .8 1.8h-5.2q.1-1 .8-1.8m5-4.4h-6.8V.9h6.8z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Meta Messenger",
    <svg
      onClick={() => handleSelectLink(TitleName.MetaMessenger)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.MetaMessenger ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M3.8 22.4v-1.5q-.4-.6-1-1a12 12 0 0 1-2.7-9.2 12 12 0 0 1 5-8.4q4-2.7 8.6-2.2a12 12 0 0 1 10.9 9q1 4-.7 8a12 12 0 0 1-6.4 6.2q-3.2 1.3-6.7.9l-2.1-.5h-.5l-2.2 1-1.2.3a1.3 1.3 0 0 1-1-1.2zM10 9a2 2 0 0 0-1.5.6l-1 1.7-2.5 4-.1.2a1 1 0 0 0 0 1 1 1 0 0 0 1-.1l3.9-3h.4l3.3 2.3a1.6 1.6 0 0 0 2.4-.4l2.1-3.2 1.6-2.5a1 1 0 0 0-.4-1l-.7.1-4.3 3z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Ticktok",
    <svg
      onClick={() => handleSelectLink(TitleName.Ticktok)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Ticktok ? styles.selected : ""}`}
      viewBox="0 0 27 27">
      <path d="M22.8 5.6a7 7 0 0 1-2.1-1.4A6 6 0 0 1 19 1V0h-5.2v18.1q-.2.9-.7 1.8-.7.8-1.6 1.2-1 .6-2.1.5a5 5 0 0 1-3-1q-.7-.6-1-1.3a3 3 0 0 1 0-3q.3-.6 1-1.2l1.3-.8q.8-.3 1.7-.3t1.3.2V9.7a11 11 0 0 0-7.3 1.8Q2 12.5 1 14a7 7 0 0 0-.5 6.7 9 9 0 0 0 3.6 4 11 11 0 0 0 9.2.7 10 10 0 0 0 3.2-2q1-1.1 1.7-2.6.6-1.3.6-2.8V8.7l1 .5q1.4.8 3 1.1 1.5.3 3.1.4V6.3q-1.6 0-3.2-.7" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Linkedin",
    <svg
      onClick={() => handleSelectLink(TitleName.Linkedin)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Linkedin ? styles.selected : ""}`}
      viewBox="0 0 25 21">
      <path d="M25 14.8v4.4q0 .3-.2.5l-.5.3H16l-.4-.2-.3-.6v-9l.2-.5.2-.1.3-.1h8.5l.2.2.2.3v4.8m-4.4 3.5v-2.6q0-.4.2-.7l.3-.3h.4l.4.2.1.4v3h1.5v-3.4q0-.7-.5-1t-1-.5q-.4 0-.7.2-.4.1-.7.5v-.5H19v4.7zm-3.8 0h1.5v-4.7h-1.4zm.8-5.4h.2q.2 0 .3-.2.2 0 .3-.4v-.5l-.6-.5H17l-.2.3a1 1 0 0 0 .2 1.2zm6-10.4V.2H25V7h-1.3v-.7L23 7l-.6.2h-.9l-.7-.5q-.5-.5-.7-1.2-.1-1 .2-2 .2-.6.6-1l1-.4 1.1.2.4.4m0 2V4l-.2-.4-.3-.3a1 1 0 0 0-1.1.2l-.2.3q-.2.5-.1 1 0 .4.2.7l.4.4h.5l.5-.2.2-.5zM11.4.3h1.4v3.9l1.4-2h1.6l-1.6 2 1.9 3h-1.7V7h-.1l-1-2h-.1l-.4.5V7h-1.4zM20 5.1h-3v.3l.3.3q.3.3.8.3.8 0 1.4-.2h.1l.2 1-.6.3h-1.7q-.8 0-1.4-.8l-.5-1.2q0-1 .3-1.9.3-.6.7-.9l1-.4q.8 0 1.2.2.4.1.7.5l.4.7q.2.7.1 1.6zM18.7 4v-.3q0-.3-.3-.5l-.4-.3-.4.1-.3.2-.2.4-.1.4zM9.5 7V3.9q0-.3-.3-.4l-.5-.1q-.3 0-.5.3l-.2.6V7H6.6V2.3H8V3l.2-.3.5-.3.5-.2q.6 0 1 .3.6.4.7 1l.1.9V7zM0 .3h1.4v5.4H4V7H0zm4.6 2H6v4.9H4.6zm.7-.5L5 1.6l-.3-.4V.4L5 0h.9l.3.4a1 1 0 0 1-.2 1l-.4.2z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "socialMedia15",
    <svg
      onClick={() => handleSelectLink(TitleName.SoundCloud)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.SoundCloud ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="m25 13.3-.4 1.5q-.4 1-1 1.6l-.3.2v.3a8 8 0 0 1-1.6 3.8q-2 2.6-4.9 3.6-2.2.8-4.8.7a12 12 0 0 1-5-1.3Q4.6 22.5 3 20q-.9-1.4-1.2-3.2l-.1-.3Q1 16 .5 15.2a5 5 0 0 1-.3-3.8q.2-1 .8-1.7.9-1.1 2-1.3a3 3 0 0 1 2.4.5h.5a12 12 0 0 1 5.6-2q.3 0 .4-.2l1.7-6V.6l1.8.4 2.2.7.3-.2q.4-.8 1.3-1.2.7-.3 1.6-.1.8.2 1.4 1 .6.6.8 1.7a4 4 0 0 1-.5 2.5q-.6 1.2-1.8 1.4-1.1.3-2.1-.5-.9-.7-1.2-2.1V3l-2.9-.9L13.1 7l1.6.2A12 12 0 0 1 19.4 9h.2q.8-.5 1.7-.6 1 0 1.7.5.8.5 1.3 1.3.5 1 .6 2l.1.2zM12.5 23.5q2.7 0 5.3-1.3a8 8 0 0 0 3.4-3.1q.9-1.5.9-3.1a6 6 0 0 0-.9-3.1 8 8 0 0 0-3.5-3.2Q14.9 8.3 12 8.5q-2.8 0-5.4 1.6-2 1.2-3 3.5a6 6 0 0 0 0 4.8 8 8 0 0 0 3 3.5 11 11 0 0 0 6 1.6m9.2-20.1q0-.6-.2-1l-.7-.7q-.4-.3-1-.1-.4 0-.8.5l-.4 1 .1 1q.2.6.6.9l.9.3q.6 0 1-.6.6-.5.5-1.3M2 14.7A9 9 0 0 1 4.5 10a2 2 0 0 0-1.6 0q-.8.3-1.2 1.2a3 3 0 0 0 .2 3.6m21.3 0a3.4 3.4 0 0 0-.1-4L22 10q-.8-.1-1.3.1a9 9 0 0 1 2.5 4.6m-11 7A6 6 0 0 1 8.4 20l-.1-.3v-.6l.3-.2h.7a5 5 0 0 0 3 1.3q1.7 0 3-1l.6-.3h.5q.2 0 .3.2l.1.6q0 .3-.3.5a7 7 0 0 1-4.1 1.5m-1.7-7.3q0 .8-.5 1.4t-1.2.6-1.2-.5q-.5-.7-.5-1.5t.5-1.4 1.2-.6 1.2.6.5 1.4m3.9 0q0-.8.4-1.4.6-.6 1.2-.6.8 0 1.2.6.5.6.5 1.4t-.5 1.4-1.2.6-1.2-.6-.5-1.4" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "X",
    <svg
      onClick={() => handleSelectLink(TitleName.x)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.x ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="m.2.2 9 12.9.6.8-.3.3-2 2.4-7.3 8.1-.2.3h2.2l1.2-1.4L4.8 22l6-6.7 3.3 4.8 3.4 4.8v.1H25L15 10.6l3.3-4L21.6 3l2.6-3H22l-.5.6L14 9l-3.3-4.6L7.5 0H0zM3 1.7l1.5 2.2 11.7 16.3 2.3 3.2H22l-4.4-6.1-7.8-11-3.4-4.7z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Apple Music",
    <svg
      onClick={() => handleSelectLink(TitleName.AppleMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AppleMusic ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="m25 12-.1-1.2-.3-1.4a12 12 0 0 0-2.7-5.1 10 10 0 0 0-2.4-2.1l-.1-.1-.9-.5Q17.2.8 15.8.5l-.5-.2a13 13 0 0 0-4.2-.2A12 12 0 0 0 5.8 2q-1.2.7-2.1 1.7l-.5.4-1.4 2q-.7 1-1 2.2a12 12 0 0 0-.7 5.9l.2 1.2a10 10 0 0 0 1.2 3l.3.6q.1.3.4.5.6 1 1.4 1.7l1 1 1.3.9a10 10 0 0 0 3 1.4H9a11 11 0 0 0 3.4.5h.1l2.7-.3 2.3-.7 1.1-.6a12 12 0 0 0 4.8-5q.9-1.3 1.2-3l.1-.3.2-1zm-1.4 3-1 2.9-.2.3a11 11 0 0 1-4.4 4.2l-.2.1q-1 .6-2.2.8l-.2.2h-.2a12 12 0 0 1-4.3.1l-1.3-.2-.3-.1a12 12 0 0 1-4.9-3l-1.5-2-.2-.1V18l-.8-1.6V16l-.4-1.4-.2-.3v-2.8l.5-2.8.1-.2 1-2 .1-.2 1.6-2 .1-.2L5 4l.6-.5a11 11 0 0 1 9.7-2.2l.2.1A12 12 0 0 1 18.7 3l.3.1.1.2q1 .6 1.8 1.6h.2v.3l.4.3 1 1.4v.3l.2.3.7 2h.1v.3l.3 2.4v.8zm-5.5 0V4.6l-.6-.3-.5.1-4.3.9-2.8.5a1 1 0 0 0-.6.7v9l-.4.6-.6.2q-.7 0-1.5.4a2 2 0 0 0-1 2.3A2 2 0 0 0 7 20h1.2a2 2 0 0 0 1.8-2V9.8l.5-.4h.4l1.6-.4h.2l3.8-.8.6.1v4.1l-.2 2-.4.2-.5.1-1.5.5a2 2 0 0 0-1 1 2 2 0 0 0 1.4 2.3h1.5a2 2 0 0 0 1.6-2.2zm0-.7" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Amazon Music",
    <svg
      onClick={() => handleSelectLink(TitleName.AmazonMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AmazonMusic ? styles.selected : ""}`}
      viewBox="0 0 25 15">
      <path d="M12 15Q5.4 14.8.2 10.3L.1 10 0 9.8h.4l1.5.8a24 24 0 0 0 19.9.7l.3-.2q.5 0 .6.2.2.4-.2.5-.7.7-1.6 1-3 1.5-6.1 2zM1.1 2.5Q1.2 2 .4 2q-.3.1-.2.5v4.1q-.1.8.6.6.5.1.4-.4V3.3l.2-.2Q2 2.8 2.7 3h.4l.2.4v3.4q-.2.7.7.6.5.1.4-.4V4c0-.8 0-.9.9-1l.3-.1q1.1-.2 1 1v2.7q-.2 1 .8.7.3 0 .3-.2V3l-.4-.7-.7-.4h-1l-1.4.6c-.7-.8-1.3-.8-3 0zm11 4.5q.2.5.8.3.3 0 .2-.4V2.5q.1-.4-.4-.4h-.2q-.5-.1-.4.5v3.3l-.1.3q-.7.5-1.6.4l-.3-.2-.2-.3-.1-.6V2.8q.2-.9-.7-.7-.3 0-.3.4v3.4l.1.7q0 .3.4.6l.6.3h.6q1-.1 1.6-.7zm5-4q.2 0 .3-.2l-.1-.5-.2-.1q-.8-.3-1.7-.2-.4 0-.8.3l-.5.8.1 1q.3.5.8.7l1.2.5q.6.3.5.7 0 .6-.7.6l-1.4-.2h-.3q-.2.5.2.8 1.1.5 2.2.2l.8-.5q.3-.3.4-.9 0-.5-.2-.9t-.8-.5l-.5-.3-.9-.4-.2-.2V3l.3-.2.7-.1zm7 4.2h.2l.1-.4v-.2q-.2-.3-.5-.1h-.6q-1.3.2-1.6-1V4q0-.4.4-.7l.6-.3H24q.7.3.5-.3v-.2l-.2-.2-.7-.2a2 2 0 0 0-1.8.4l-.6.7q-.3.3-.4.9v.4c-.1 1.7.5 3 2.4 3q.6 0 1.1-.2m-1.8 3h.9q.6.1.5.7l-.4 1.5q0 .6-.4 1.2v.3h.4l.1-.2q.9-1 1.2-2L25 10q0-.7-.5-.8l-.7-.1a5 5 0 0 0-3.3.7l-.2.3.4.1zm-2.7-5.5v-2q.2-.7-.7-.6-.4-.1-.4.5v4q-.2.9.7.7.4.1.4-.4zm-1.2-4 .2.4.5.1.4-.1.2-.5-.2-.4-.4-.2q-.3 0-.5.2z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "SoundCloud",
    <svg
      onClick={() => handleSelectLink(TitleName.SoundCloud)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.SoundCloud ? styles.selected : ""}`}
      viewBox="0 0 26 12">
      <path d="m.8 8.8-.3 2.5H.2L0 8.8l.3-2.5h.1zm3.7-4.7h-.2v.2L4 8.8l.2 3v.1h.3v-.1l.3-3-.2-4.5zm-2 1.5h-.2v.2l-.3 3 .3 3a.1.1 0 0 0 .2 0l.3-3-.2-3zM6.6 12h.2v-.3L7 8.8l-.2-6v-.2l-.2-.1h-.2v.2l-.2 6.1.2 3v.1zm4.3 0h.2l.1-.3.2-2.8-.2-7v-.2l-.3-.1h-.2l-.1.3-.1 7v2.8l.2.3zm-2.2 0H9l.1-.2.2-2.9L9 2.7v-.2l-.3-.1h-.2v.3l-.2 6.1.2 2.9v.2zm13.1-6.7-1.2.3a6 6 0 0 0-1.8-4Q17.2 0 15 0q-1 0-2 .4-.4.1-.4.4v10.8l.1.3h.3l8.8.1q1.4 0 2.3-1a3.5 3.5 0 0 0 0-4.8q-1-1-2.3-1" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Spotify",
    <svg
      onClick={() => handleSelectLink(TitleName.Spotify)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Spotify ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M12.5 0a12.5 12.5 0 1 0 0 25 12.5 12.5 0 0 0 0-25m5.8 18a.7.7 0 0 1-1.1.3q-4.4-2.7-11-1.2a.8.8 0 1 1-.4-1.5 16 16 0 0 1 12.4 1.6 1 1 0 0 1 0 .9m1.5-3.5a1 1 0 0 1-1.3.3A16 16 0 0 0 6 13.5a1 1 0 0 1-.6-1.8 18 18 0 0 1 14.4 2 1 1 0 0 1 0 1m.2-3.5A21 21 0 0 0 5 9.8a1.1 1.1 0 0 1-.2-2.2A23 23 0 0 1 21 9.2a1.2 1.2 0 0 1 .4 1.6 1.3 1.3 0 0 1-1.6.3" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Aparat",
    <svg
      onClick={() => handleSelectLink(TitleName.Aparat)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Aparat ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M12.5 1.7a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6M6.4 7a3.1 3.1 0 1 1 6 1.1 3.1 3.1 0 0 1-6-1.1m4.5 9.3a3.1 3.1 0 1 1-6-1.2 3.1 3.1 0 0 1 6 1.2m1.3-2.5a1.4 1.4 0 1 1 .5-2.7 1.4 1.4 0 0 1-.5 2.7m6.5 4a3.1 3.1 0 1 1-6.1-1.2 3.1 3.1 0 0 1 6 1.2m-2-5.7a3.1 3.1 0 1 1 1-6 3.1 3.1 0 0 1-1 6m-2.5 12 2.3.7a4 4 0 0 0 4.8-2.8l.6-2.5a12 12 0 0 1-7.7 4.6m8-20.4L19.6 3a12 12 0 0 1 4.5 8l.7-2.6A4 4 0 0 0 22 3.7M.6 14.4l-.5 2.1a4 4 0 0 0 2.7 4.7l2.2.6Q1.5 19 .7 14.4M10.8.7 8.5.1A4 4 0 0 0 3.8 3l-.6 2q3-3.7 7.6-4.4" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "twitch",
    <svg
      onClick={() => handleSelectLink(TitleName.twitch)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.twitch ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M5.2 0H25v12.5h-.1l-9.4 8h-4l-.1.1L6.3 25v-4.5H0V4.3zm1 1.8v13.4H11v3.1h.1l3.7-3.1h4.1l4.1-3.7V1.8zm8 2.9v6.2h-2.4V4.7zm5.7 0v6.2h-2.5V4.7z" />
    </svg>
  );
  svgLinks.setValue(
    "YouTube",
    <svg
      onClick={() => handleSelectLink(TitleName.YouTube)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.YouTube ? styles.selected : ""}`}
      viewBox="0 0 25 17">
      <path d="M24.5 2.7a3 3 0 0 0-.8-1.4L22.3.5c-2-.5-9.8-.5-9.8-.5S4.7 0 2.7.5q-.8.2-1.4.8a3 3 0 0 0-.8 1.4 33 33 0 0 0 0 11.6q.3.8.8 1.4t1.4.8c2 .5 9.8.5 9.8.5s7.8 0 9.8-.5q.8-.2 1.4-.8t.8-1.4a33 33 0 0 0 0-11.6M9.9 12V4.9l6.6 3.6z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Shazam",
    <svg
      onClick={() => handleSelectLink(TitleName.Shazam)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Shazam ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M12.5 0a12.5 12.5 0 1 0 0 25 12.5 12.5 0 0 0 0-25m-2.2 17.4A6 6 0 0 1 5 14.2a6 6 0 0 1-.3-4.6q.3-1 1.2-2l3.4-3.4a1.5 1.5 0 0 1 2 2.1l-3.9 4.3a3 3 0 0 0 .2 2.3q.3.6.8 1a3 3 0 0 0 3.7 0l1.4-1.5a1.5 1.5 0 0 1 2.1 2s-.8 1-1.6 1.6q-1.6 1.4-3.8 1.4m8.7 0-3.4 3.4a1.5 1.5 0 0 1-2-2.1l3.9-4.3a3 3 0 0 0-.2-2.3q-.2-.6-.8-1a3 3 0 0 0-3.7 0L11 13a1.4 1.4 0 0 1-1.6-2.3s.8-1 1.6-1.6a5.8 5.8 0 0 1 8.1 8.3" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Discord",
    <svg
      onClick={() => handleSelectLink(TitleName.Discord)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Discord ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M15.1 10.5q-.5 0-.9.2t-.6.6-.2.8.4.7.9.4h.9l.7-.5q.3-.4.3-.8l-.1-.5q0-.3-.3-.5l-.5-.3zm-5.2 0-.9.2q-.5.2-.6.6-.2.3-.2.8t.4.7.8.4h1l.7-.5q.3-.4.3-.8l-.1-.5q0-.3-.3-.5l-.5-.3zM22.1 0H2.9a3 3 0 0 0-2 .8l-.7.8-.2 1v16.9l.2 1 .7.8 1 .6 1 .2h16.2l-.7-2.3 1.8 1.4 1.7 1.4L25 25V2.6q0-1.1-.9-1.8-.9-.8-2-.8m-5.6 16.3-.9-1q1.6-.3 2.6-1.5l-1.6.8a11 11 0 0 1-9-.5h-.1l-.4-.3q1 1.2 2.5 1.5l-1 1q-1.3 0-2.4-.4a5 5 0 0 1-2-1.5q.1-3.8 2.1-7.3a8 8 0 0 1 4-1.3l.1.2q-2 .4-3.7 1.6l.8-.3a12 12 0 0 1 3.5-.8 14 14 0 0 1 7.2 1.1Q16.6 6.5 14.6 6l.2-.2q2.3.2 4 1.3 2 3.5 2.1 7.3-.8.9-2 1.5-1 .4-2.4.4" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "vimeo",
    <svg
      onClick={() => handleSelectLink(TitleName.vimeo)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.vimeo ? styles.selected : ""}`}
      viewBox="0 0 25 11">
      <path d="M9.7 9.9q-1 .2-1.5-1-.7.9-1.8 1h-.3l-.3-.2-.1-.4v-.5l.1-1.5q0-.8.3-1.4L6 5.3l-.3.1-.2.3-1.5 3-.9 1q-.9.7-1.2-.5l-.6-2.5q0-.6-.3-1 0-.7-.6-.3l-.1.2L0 5l1.3-1.4.3-.3h.3q.3.1.3.4l.2.5.3 1.9q0 .6.2 1 .1.6.4.2L4 5.9q.3-1-.5-.8h-.1q0-.5.2-.8 0-.4.4-.6.2-.3.5-.3H5q.6.3.6 1.1l.6-.6q.2-.3.5-.4h.5q.5.7.3 1.4 0 1.1-.3 2.3v.4q0 .8.6.4l.3-.3.2-.6.1-1.4v-.5l-.5.4-.3-.5 1.3-1.5.2-.2h.2l.2.2v.2l.4 1 .1-.2q.3-.5.8-.7l.9-.3q.8 0 .9 1.1V5l.3-.4.7-.7q.4-.3.8-.3 1 0 1 1.3l-.3 3q0 .3.3.2t.3-.3c-.1-2 1.5-4.3 3.1-4.3h.5l.5.2.3.5.1.6v.6q-.5 1.4-1.4 2l-1.3.6q.3.3.5.3 1.1.2 2.1-.6l.1-.3q0-.8.3-1.7l.8-1.3q.5-.6 1-.8a2 2 0 0 1 1.3-.2q.5 0 .9.6.3.5.4 1.3a6 6 0 0 1-.4 3q-.4.7-.9 1.1t-1 .5q-.6.3-1.2 0-.6-.4-1-1.2l-.6.5q-1.1.7-2.2.8l-1-.2L16 9l-1 .7q-.4.2-.9.2H14l-.2-.2-.2-.3v-.3l.2-3-.1-.5h-.3l-.2.2q-.5.8-.8 1.8-.2 1 0 2.1v.1q-1.6.3-1.5-1.6l.2-2q0-.4-.2-.6-.4-.2-.5.3l-.6 1.9zm13.9-4q.1-.6-.4-1h-.4l-.4.4-.5 1-.2 1.2.1.6q0 .3.3.4h.4l.4-.3.1-.2a4 4 0 0 0 .6-2m-6.3 1.4q.9-.4 1.4-1.6v-.5l-.3-.1h-.2l-.6.9q-.3.6-.3 1.3m-10.5-5h-.4L6.2 2v-.6l.1-.6.5-.5.5-.2.3.1.3.3.1.5v.4l-.5.8z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Radio Javan",
    <svg
      onClick={() => handleSelectLink(TitleName.RadioJavan)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.RadioJavan ? styles.selected : ""}`}
      viewBox="0 0 25 22">
      <path d="M9.4.3c-3.8.9-6.6 4.5-7.2 9.4-.5 4.3 1.4 9 4.6 11q2 1.2 4 1.3 1 0-.6-.3c-3-.6-5.7-3.4-6.8-7-1.3-4.5 0-9.4 3-12.3A8 8 0 0 1 10.8.3l.4-.2q0-.3-1.8.2M14 0l.4.2c1.3 0 3.2 1 4.4 2 2.8 2.7 4 7 3.3 11.1-.6 3.1-2.4 6-4.7 7.4q-1.2.7-2.7 1H14c-.4.3 1.4.1 2.5-.2 4.2-1.4 7-6.6 6.4-11.9-.4-4-2.5-7.3-5.3-8.7-1.4-.7-3.7-1.3-3.7-.9m-3.1.8Q5.7 2.6 4 9.2l-.2 2.5q0 1.5.4 3l.5 1.5a14 14 0 0 1-.4-4Q4.5 8 7.6 4.8C11.2 1.3 16.2 2 19 6.5a12 12 0 0 1 1.3 9.8q0 .3.1 0l.5-1.5c.4-1.6.4-4.7 0-6.4-.7-3-2.7-5.7-4.8-6.8a7 7 0 0 0-5.3-.7M2 6.5c-2.9 2.7-2.6 8 .6 10.3q1 .8 0-.3a9 9 0 0 1 0-10.3q.8-.9-.6.3m20.5-.2a9 9 0 0 1 1 7.7 6 6 0 0 1-1.3 2.6l-.5.6.4-.3a7 7 0 0 0 2.8-6.5 7 7 0 0 0-1.8-3.9q-1.3-1.4-.6-.2M8.1 15.6l.6.7c2.2 2 6.6 1.7 8.2-.6l.3-.4-.5.4a6 6 0 0 1-4.2 1.5q-2.4 0-4-1.4-.6-.5-.4-.2" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Dropbox",
    <svg
      onClick={() => handleSelectLink(TitleName.Dropbox)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Dropbox ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="m6.3 0 6.2 4.7-6.2 4.7L0 4.7zm6.2 4.7 6.2 4.7L25 4.7 18.7 0zM0 14l6.3 4.7 6.2-4.7-6.2-4.7zm18.7-4.7L12.5 14l6.2 4.7L25 14zm-12.4 11 6.2 4.7 6.3-4.7-6.3-4.7z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Mega",
    <svg
      onClick={() => handleSelectLink(TitleName.Mega)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Mega ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="m3.4 8.3.2-.8a9 9 0 0 1 4.2-6.1Q9.3.4 11 .1l1.5-.1a10 10 0 0 1 6 2.1 9 9 0 0 1 3.2 6.3v1a9 9 0 0 1-6.2 8.5l-1.8.5h-2.2L9.8 18a8 8 0 0 1-3-1.6L5.4 15l-1.2-2.1-.6-2-.2-.8zm9.2.8Q11.2 7.8 10 6.4a2 2 0 0 0-1.8-.7q-.3 0-.3.3v6.4q0 .4.3.4h1q.5 0 .5-.5V8.7l.2.3 2.3 2.2a.6.6 0 0 0 1 0L15.3 9l.3-.2v3.7q0 .4.3.4h1q.5 0 .4-.5V6l-.3-.3h-.7l-.6.2L13 9zM5.8 21.8l-.2.2L4 23.7a.4.4 0 0 1-.7 0L1.5 22l-.2-.1v2.6q0 .4-.3.4H.3q-.3 0-.3-.3v-4.7q0-.3.2-.3a1 1 0 0 1 1.3.5l2 2h.2l2.1-2.2.6-.3H7l.2.2v4.7q0 .4-.3.4H6q-.3 0-.3-.3zm3.7 0h2.8q.4 0 .4.2v.5q0 .3-.3.3H9.7q-.2 0-.2.2v.5q0 .3.2.2h2.6q.4-.1.4.4v.5q0 .3-.3.3h-4a.2.2 0 0 1-.2-.3V20q0-.3.2-.3h4q.2 0 .3.3v.6q0 .3-.3.3H9.7q-.3 0-.2.2zm7.5 1h-.5q-.3 0-.3-.4V22q0-.2.3-.2h2l.5.5a3 3 0 0 1-2.2 2.6 3 3 0 0 1-2.3-.5 3 3 0 0 1-1-2.8l.5-1a3 3 0 0 1 1.8-1.1 3 3 0 0 1 2 .5h.2a.2.2 0 0 1 0 .4l-.5.5h-.3a1.6 1.6 0 0 0-2.2.3l-.3.7a1.6 1.6 0 0 0 3 1l-.1-.2zm7.3 2q-.7.3-.9-.5l-.2-.5h-2.4l-.4.9-.3.2h-.9q-.3 0-.1-.3l2.4-5h.7l.5.3 1.9 4 .4.7q0 .3-.2.3zm-1.7-2v-.1l-.5-1.2h-.2l-.5 1.1v.2z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "iCloud Drive",
    <svg
      onClick={() => handleSelectLink(TitleName.IclouadDrive)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.IclouadDrive ? styles.selected : ""}`}
      viewBox="0 0 25 30">
      <path d="M19.2 23.6H5.5a6 6 0 0 1-4.8-3.3Q.1 19 0 17.7V6.8l.2-2A6 6 0 0 1 5.5 0H19l1 .1a6 6 0 0 1 5 6v12.3q-.3 1.5-1.4 3-1.5 1.6-3.6 2zM19 10.7q0-1.5-1.2-2.9a5 5 0 0 0-2.7-1.6q-1.7-.5-3.3.3a5 5 0 0 0-2.4 2.1 2 2 0 0 0-2.1-.2q-.7.3-1.2.8t-.5 1.3v.2h-.2q-1.2.7-1.8 1.6t-.4 2.3q.2 1.2 1.2 2 1 1 2.4 1h11.1a4 4 0 0 0 3.6-2.4q.3-.7.2-1.6-.2-1.2-1.1-2-.6-.6-1.6-.9m-.8.6.6.1a3 3 0 0 1 1.5 1.1 3 3 0 0 1-.2 3.3 3 3 0 0 1-1.6 1H6.8a3 3 0 0 1-1.6-.6 3 3 0 0 1-1-3.4 3 3 0 0 1 2-1.6q.3 0 .2-.2-.1-.7.2-1.2a2 2 0 0 1 2-.7l.7.3.4.5q.3-1 1-1.7T12.3 7q1.4-.4 2.7-.1 1.5.4 2.4 1.6 1 1.3.8 2.8" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Google Drive",
    <svg
      onClick={() => handleSelectLink(TitleName.GoogleDrive)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.GoogleDrive ? styles.selected : ""}`}
      viewBox="0 0 25 22">
      <path d="M8.2 0 0 14.6 4.2 22l7-12.6zM25 14.6 16.7 0H8.2l7.2 12.5zH10.7L4.3 22h16.6z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "MediaFire",
    <svg
      onClick={() => handleSelectLink(TitleName.MediaFire)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.MediaFire ? styles.selected : ""}`}
      viewBox="0 0 25 15">
      <path d="M0 9v-.2q.2-.7.7-1.2a4 4 0 0 1 1.8-1.2q.7-.2 1.5-.7l.7-.5-.7-.4h-.5L2.2 5h-.1l.3-.6 1-.8a7 7 0 0 1 2.7-.5q2 0 4 .5l2.3.4h1.2q.6-.3.2-1-.2-.5-.8-.6l-1-.2h-.7q.4-.8 1.2-1.1 1.8-1.2 4-1.1 1.7 0 3.3.7 2 .6 3.5 2.3a7 7 0 0 1 1.6 3.3l.1.8V8a8 8 0 0 1-5 6.6l-1.3.4h-2.2a5 5 0 0 1-2.5-.5L11 13q-1.8-1-4-1.5l-.8-.3q-.2 0 0-.2a4 4 0 0 1 1.6-1q.5.1 0-.4a4 4 0 0 0-2.3-1.5 8 8 0 0 0-5.4 1zm12-1 .3.2.8.5 3 1.6q1.4.7 3.2.6.8 0 1.4-.6.8-.3 1-1.2.5-.7.2-1.6 0-.9-.6-1.5T20 5q-1.3-.4-2.5.1-1.4.6-2.4 1.3l-2 1-.8.3h-.2z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "OneDrive",
    <svg
      onClick={() => handleSelectLink(TitleName.OneDrive)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.OneDrive ? styles.selected : ""}`}
      viewBox="0 0 25 20">
      <path d="M12.6 15H4.3q-1.5-.1-2.8-1.3a4 4 0 0 1-1.2-2.6Q.1 9.5 1 8q.7-1.4 2-2l.3-.1.1-.3q0-1.9 1.2-3.4t3-2a6 6 0 0 1 6.7 2l.6.5q.5.2.9.1 1.3-.2 2.4.4t1.4 2q.3.7 1 .6 1.5 0 2.8 1 1 1 1.4 2.5a5 5 0 0 1-.8 3.9 4 4 0 0 1-3.2 1.7zM5.2 7.3h-.5A3 3 0 0 0 3 8q-.7.6-1 1.4-.2.9-.1 1.9 0 1 .9 1.6.7.7 1.7.7h16.2q1.1 0 1.9-.7t.8-1.8V9.7q-.1-1-.8-1.6-.6-.6-1.6-.7h-2.5c0-1.2 0-2.3-1.2-2.9a3 3 0 0 0-3 .6Q13.8 4 13 3a4 4 0 0 0-2-1.3 4.6 4.6 0 0 0-6 3.5zM2 20a2 2 0 0 1-1.5-.5A2 2 0 0 1 0 18a2 2 0 0 1 .6-1.5 2 2 0 0 1 1.5-.5 2 2 0 0 1 1.4.5A2 2 0 0 1 4 18a2 2 0 0 1-.5 1.4A2 2 0 0 1 2 20m0-3.5-1 .4a2 2 0 0 0 0 2.3 1 1 0 0 0 1 .4l1.1-.4.4-1.1q0-.7-.4-1.2a1 1 0 0 0-1-.4m5.3 3.4h-.5v-1.5q0-.9-.7-.9a1 1 0 0 0-.8.9v1.5h-.5v-2.7h.5v.5a1 1 0 0 1 1-.5l.8.3q.3.3.2.8zm3.4-1.2H8.5l.3.7q.3.3.7.2.6 0 1-.3v.4l-1 .3a1 1 0 0 1-1-.4 1 1 0 0 1-.5-1 1.4 1.4 0 0 1 .9-1.3l.5-.1a1 1 0 0 1 1 .3q.3.4.3 1zm-.5-.4-.2-.6-.6-.2-.6.3-.2.5zm1.3 1.6v-3.7h1.2q2.2 0 2.2 1.8a2 2 0 0 1-.6 1.4q-.7.6-1.7.5zm.5-3.3v3h.6q.8 0 1.3-.5a1 1 0 0 0 .5-1.1q0-1.5-1.7-1.5zm5.3 1a1 1 0 0 0-.9.2q-.2.3-.2.8v1.3h-.5v-2.7h.5v.6q0-.2.3-.5l.5-.1h.3zm.8-1-.3-.1V16l.3-.1h.2v.5zm.2 3.3h-.5v-2.7h.5zm3.4-2.7L20.5 20H20l-1.2-2.7h.6l.7 2 .1.4.2-.4.8-2zm3 1.5h-2.2l.3.7.7.2q.5 0 1-.3v.4l-1.1.3a1 1 0 0 1-1-.4 1 1 0 0 1-.4-1 1.4 1.4 0 0 1 .9-1.3l.5-.1a1 1 0 0 1 1 .3q.3.4.2 1zm-.6-.4-.2-.6-.5-.2-.6.2-.3.6z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "appStore1",
    <svg
      onClick={() => handleSelectLink(TitleName.AppleMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AppleMusic ? styles.selected : ""}`}
      viewBox="0 0 25 23">
      <path d="M9.1 14.6h4.8a2 2 0 0 1 1.7 1 2 2 0 0 1 .3 1.9l-.2.2H1.5q-.5 0-.8-.2t-.6-.7A2 2 0 0 1 .5 15q.5-.4 1.2-.4h3.8l.2-.3 5-9-.2-.4-1.6-3.1A2 2 0 0 1 9.3.5 2 2 0 0 1 11 .1q.5.3.8.8l.6 1.2.2-.3.6-1 .9-.7 1.2.1.7 1-.2 1.2L13 7.6l-3.7 6.6zm5.6-8.3.2.3 4.5 8h4.5l.8.7a2 2 0 0 1-.2 2q-.4.4-1 .5h-2.3q0 .3.2.4l1.3 2.4a2 2 0 0 1 0 1.6l-.6.6-.8.2q-.4 0-.8-.3l-.5-.6-4-7-1.9-3.7a5 5 0 0 1 .4-4.9zM4.2 18.5a2 2 0 0 1 2 .8v.5L4.9 22q-.3.5-.7.7-.5.3-.9.2t-.8-.4l-.5-.8q0-.8.3-1.3l.8-1.4q0-.3.3-.5l.5-.1z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "appStore2",
    <svg
      onClick={() => handleSelectLink(TitleName.AppleMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AppleMusic ? styles.selected : ""}`}
      viewBox="0 0 25 28">
      <path d="M0 27.8V.4l14 13.7zM1.1 0c5.8 3.1 11.8 6 17.5 9.5l-4 4zm13.5 14.8 3.6 3.5q-8.4 5-17 9.7zm.7-.7 2.7-2.7 1.2-1.1.3-.2h.3q2.2 1.6 4.6 2.8a1 1 0 0 1 .6 1 1 1 0 0 1-.6.8l-5.1 3h-.4l-3.5-3.4z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "appStore3",
    <svg
      onClick={() => handleSelectLink(TitleName.AmazonMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AmazonMusic ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M13.3 0q1.5 0 3 .6 1.1.5 1.9 1.2.7.9 1 2l.2 1.2v7.4q0 .7.3 1.4t.6 1l.4.6.2.4-.2.5-.4.4-2 1.7-.7.2h-.4L16 17.3l-.6-.8v-.1h-.1l-1.2 1.1q-1 .8-2.3 1-.8.3-1.4.2h-1q-1.2 0-2.2-.5-1.5-.7-2.2-2.4-.3-.7-.3-1.5v-.8q0-1.6.8-3t2.4-2l2-.7 1.9-.4 1.9-.2h1V5.7q0-.5-.2-.9 0-.5-.5-.8l-.8-.5a3 3 0 0 0-2.5.3q-1 .5-1 1.5l-.2.2q0 .3-.2.3L9 6l-3.4-.3-.3-.3V5Q5.6 3.2 7 2q1-.8 2-1.3a9 9 0 0 1 3.5-.7zm1.5 9.8q-1.2 0-2.2.2-.8 0-1.4.5A3 3 0 0 0 9.8 12a4 4 0 0 0 .1 2.1l.5.7.7.5h1.3q.8-.3 1.3-.9t.9-1.5l.2-1.6zm-2 15.2h-1.9A15 15 0 0 1 6 23.5a19 19 0 0 1-5.9-4.2L0 19h.5l.9.5a37 37 0 0 0 5.8 2.7l3.2.6h.8l1.6.1h1.4l.6-.1.8-.2q.9 0 1.7-.3 2-.5 4-1.4l.6-.2h.5v.4l-.3.3-1.1 1a14 14 0 0 1-5.9 2.3l-1 .2h-.8l-.6.1M23 18.7l1.6.2.2.2.1.2v.8l-.5 1.3a5 5 0 0 1-1.3 1.8H23v-.3l.3-.9.5-1.8V20l-.1-.2-.2-.2-.6-.1h-1.8l-.7.1h-.2v-.2l.3-.3a5 5 0 0 1 2.2-.5z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "appStore4",
    <svg
      onClick={() => handleSelectLink(TitleName.AppleMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AppleMusic ? styles.selected : ""}`}
      viewBox="0 0 26 26">
      <path d="M0 6.3h7.7a6 6 0 0 1 1.4-5A4 4 0 0 1 12.5 0c2.3 0 5.2 1.6 4.8 6.3h.8q.4-2.1-.6-4 1.4.6 1.8 4H25v16.5a2 2 0 0 1-2.2 2.2h-21A1.6 1.6 0 0 1 0 23.1zm12 9v-4.9H7.4v4.8zm5.7-4.9H13v4.8h4.7zM7.3 16.1V21h4.8v-4.8zm10.4 0H13V21h4.7zm-7-9.8h5.7L16 3.5A2 2 0 0 0 14.3 2q-3.6.4-3.6 4.3m4-4.5a3.5 3.5 0 0 0-4.2-.2Q8.3 3 8.8 6.3h.9c0-3.8 2.3-5 5-4.5" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "appStore5",
    <svg
      onClick={() => handleSelectLink(TitleName.AppleMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AppleMusic ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M0 22.3v-.2l.1-.3 2-14.2q0-.6.7-.8l2.4-.6.3-.2.2-.2.8-2.1C7.5 1.9 8.7.5 11 0h1l1 .7h.3q.8.1 1.4.5.6.3 1 .9l.6 1L17 3v.5L16 25h-.3l-.4-.1-4.9-.8zm4.5-4.8-.7 2v.2l.2.2q1.2.9 2.8 1.2 1 .3 2.1 0 1.2-.1 2-.8t1.1-1.7 0-1.9q-.2-1.5-1.6-2.3l-1.8-1.2-.3-.5v-.6q0-.2.3-.5l.5-.2h1.5l1.6.3.7-2.8-.6-.1q-1.4-.2-2.8-.1-1.5 0-2.6.9t-1.6 2A3 3 0 0 0 5 14q.5 1.2 1.6 1.9l1 .7.5 1v.4l-.2.3-.4.3H7a7 7 0 0 1-2.6-1M6.8 5.8l1.6-.5q.3 0 .5-.2l.2-.4a5 5 0 0 1 .9-2q.7-.9 1.8-1.5l.1-.2a3 3 0 0 0-2 .4C8.1 2.4 7.4 4 6.8 5.8m3.4-1 2.5-.7.3-.4-.3-2A5 5 0 0 0 11.1 3q-.7.9-1 1.9m3.8-1 1.3-.2c-.2-1-1-1.9-1.6-1.8zM16.6 25h-.2l.3-6.3.9-15.6.3.3q.6.8 1.6 1.1a4 4 0 0 0 2 .2q.4 0 .5.5l2.5 15.4.5 2.6v.2l-4.5.9z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "appStore6",
    <svg
      onClick={() => handleSelectLink(TitleName.AppleMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AppleMusic ? styles.selected : ""}`}
      viewBox="0 0 17 17">
      <path d="M0 8.2A8 8 0 0 1 5 .6a8 8 0 0 1 8.8 1.8 8.2 8.2 0 0 1-5.8 14 8 8 0 0 1-5.6-2.5A8 8 0 0 1 0 8.2m3.4 1.3a3 3 0 0 0 1.5 2.7l1 .2h3.7a2 2 0 0 0 2.2-1.2l1.3-1.5q.3-.3.3-.7l-1.2.3-1.7.8a2 2 0 0 1-1.7.4v-.9a2 2 0 0 0 1.7-1.2 2 2 0 0 0 0-2.1L9 4.7l-.3-.6c-.1-.3 0-.8-.5-.9q-.6.2-.5.9l-1-.1q.5 1.3.7 2.8L7 9.6h.9v.8c-1.4.2-1.6.1-2.1-.9zM6 5 3.8 8.6h2l.6-.3C7 7 6.6 6 6 4.9" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "appStore7",
    <svg
      onClick={() => handleSelectLink(TitleName.AppleMusic)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AppleMusic ? styles.selected : ""}`}
      viewBox="0 0 25 20">
      <path d="m12.3 20-1-1.5A6 6 0 0 0 9 16.8a9 9 0 0 0-7.7.8l-.5.4q-.4.3-.6-.2L0 17V3.7q0-.9.5-1.6.5-.6 1.3-1Q3 .6 4.4.3a7 7 0 0 1 4 .2A7 7 0 0 1 11.3 2q.6.7 1 1.5l.2 1.2V8zm.4 0 1-1.5q.9-1.2 2.4-1.7 1.7-.7 3.7-.5t4 1.3l.5.4q.5.3.6-.2V3.7q.2-.8-.4-1.6-.5-.6-1.2-1L20.7.3a7 7 0 0 0-4.1.2A7 7 0 0 0 13.8 2q-.6.7-1 1.5l-.1 1.3z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "PayPal",
    <svg
      onClick={() => handleSelectLink(TitleName.PayPal)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.PayPal ? styles.selected : ""}`}
      viewBox="0 0 26 30">
      <path d="M22.5 7.6v.6c-1.3 6.3-5.4 8.5-10.7 8.5H9.1q-.5 0-.8.3t-.5.8v-.3l-1.4 9.2H.8l-.6-.3-.2-.7L3.8 1.1q0-.5.5-.8.3-.3.8-.3h9.2q4.9 0 7 2.3a6 6 0 0 1 1.2 5.3M24 8.8q-2.1 9.4-12.2 9.5H9.4L7.6 30h3.9q.4 0 .7-.3.4-.3.4-.7v-.2l1-5.8v-.4l.4-.7.8-.2h.7c4.6 0 8.2-2 9.3-7.5a7 7 0 0 0-.8-5.4" />{" "}
    </svg>
  );
  svgLinks.setValue(
    " Square",
    <svg
      onClick={() => handleSelectLink(TitleName.Square)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Square ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M21.9 25H3.2A4 4 0 0 1 0 20.8V3.5A4 4 0 0 1 4.3 0H21l.9.1a4 4 0 0 1 3 3l.1.2V22a4 4 0 0 1-3 2.9zm-9.4-4.5h6.8a1.3 1.3 0 0 0 1.2-1.4V6a1.3 1.3 0 0 0-1-1.3H5.9a1 1 0 0 0-1.2.8l-.1.6v13.2a1 1 0 0 0 .7 1.2l.7.1zm3.5-8v2.7l-.4.7-.3.1H9.7a1 1 0 0 1-.6-.7V9.6l.7-.5h5.7l.5.7z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Venmo",
    <svg
      onClick={() => handleSelectLink(TitleName.Venmo)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Venmo ? styles.selected : ""}`}
      viewBox="0 0 25 10">
      <path d="M12.5 10H.5l-.3-.3-.1-.3L0 9V1Q0 .6.2.4L.6 0h23.7q.2 0 .4.3l.3.7v8q0 .4-.2.6 0 .3-.4.4zm2.6-7.7h-1.2l-.6 5.5h1.4l.1-1.4L15 5V4l.1-.1v-.1l.5-.1h.1l.1.1v.3l-.1 1.2-.1 1.1-.2 1.1v.3h1.4L17 5l.1-1v-.1l.1-.1.4-.1h.1l.1.2V4l-.1 1.1-.1 1.1-.2 1.2v.3H19l.1-1 .2-1.5.1-1.7V3l-.1-.5-.2-.2-.4-.2H18q-.4 0-.8.4l-.2.2-.4-.5H16q-.5 0-.8.4zM9 7.7h1.3l.1-.6.2-1.2.1-1.1.1-1 .5-.2.2.1v1.1L11.3 6l-.1 1.2-.1.7h1.4v-.4l.2-2 .2-1.8v-1l-.3-.3-.5-.2q-.6-.1-1.1.4l-.2.1v-.3H9.6zm12.2.2h.6l.8-.6.5-1q.3-.8.3-1.7v-.4l-.1-.8-.3-.6q0-.4-.4-.4-.3-.3-.7-.3h-.5l-.8.5-.6.8-.4 1.9.1 1.4.3.6.4.4zm-18-2-.4-3.7-1.4.1.6 5.4h1.6l1.5-3.3.1-1.4L5 2l-1 .3h-.3v.1l.2.9v.6l-.3 1zm3.6-.5h.7l.8-.5q.3-.1.4-.6.3-.4.2-1l-.2-.5q0-.3-.3-.5l-.8-.2h-.4a2 2 0 0 0-1.2 1A5 5 0 0 0 5.5 6l.1.6.3.7.4.4.9.3h.2l.6-.2.5-.2V7l.2-.9V6l-.2.1q-.5.3-1 .3-.3 0-.4-.2L7 5.8z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "VisaCard",
    <svg
      onClick={() => handleSelectLink(TitleName.VisaCard)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.VisaCard ? styles.selected : ""}`}
      viewBox="0 0 25 10">
      <path d="M25 9.8h-1.6l-.3-.4c-.2-1-.2-1-1-1h-1.3q-.4 0-.6.5c-.2 1-.2 1-1 1h-1.3l.1-.6 2.8-8.1q0-.5.4-.8.3-.3.7-.2h1.4l.2.3L25 9.7zM22 3l-1 3.4h1.6zM5 6.5l.4-1.1L6.8.6q.1-.5.6-.5H9v.5L6 9.4l-.2.3-.3.1H4.2l-.3-.1-.1-.2L2.3 2l1.9 1.8q-.7-1.5-1.9-2.2L0 0h3q1 0 1.2 1.4zm13.3-6L18 2.4 16.3 2l-.5.1q-.4.3-.5.7l.3.7 1.1.8q.6.3 1 1 .3.7.3 1.4 0 1-.4 1.7t-1 1q-2.2 1.2-4.3.1l.3-2L15 8q.7 0 .9-.8 0-.8-.6-1l-1.2-1q-.4-.3-.7-.9a3 3 0 0 1 .5-3.2A4 4 0 0 1 16 0q1.2-.2 2.3.4M11 9.8H9l.6-4.3.6-4.9q0-.5.5-.4h1.6z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "TipJar",
    <svg
      onClick={() => handleSelectLink(TitleName.TipJar)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.TipJar ? styles.selected : ""}`}
      viewBox="0 0 25 12">
      <path d="M24.7 12H.3l-.2-.3v-.3L0 10V.3L.4 0h24.4l.2.3v11.4zM.9 11H24V1H.9zm18.4-4.5v2q.1.4-.4.4c-.7 0-.6 0-.6-.6V3.4q-.1-.4.4-.4H20q.5 0 1 .3t.6.8a2 2 0 0 1-.5 2l-.3.2.8 2.1q.2.6-.3.5c-.8 0-.7.1-1-.6L20 6.8q-.1-.5-.7-.3m0-1h.9l.4-.3q.2-.2.1-.4v-.5l-.4-.2h-1zm-3.5 2.7c-.2.7-.2.7-.9.7q-.5 0-.3-.4l.7-3.5.3-1.6q0-.4.5-.4c.9 0 .7-.1.9.8l1 4.7q.1.5-.4.4h-.3q-.3 0-.4-.3 0-.4-.4-.4zm.8-1.1q0-.9-.3-1.7l-.4 1.7zm-7-.6v2.1q0 .3-.3.3-.8 0-.8-.7V3.5q-.1-.6.5-.5h1.4a2 2 0 0 1 1.3.7 2 2 0 0 1 .3 1.5q0 .6-.6 1-.4.3-1 .3zm0-1.7v.6c.2.2 1.1 0 1.3-.3a1 1 0 0 0-.2-1h-.4c-.9 0-.7-.1-.7.7M5.3 6.5v2q.1.4-.4.4-.9.2-.7-.7V4.5q.1-.4-.4-.4c-.8 0-.8.1-.8-.8q0-.3.3-.3h2.9q.3 0 .3.3c0 .8 0 .8-.7.8l-.4.1-.1.4zM13.2 3q1-.1 1 .8v3.4a2 2 0 0 1-.7 1.3 1.4 1.4 0 0 1-1.4.2q-.4-.2-.7-.6l-.2-1h1l.1.2q0 .4.4.4t.4-.5V3.1M6.8 4.2l.6.3.5-.3v4.4q.1.4-.4.4c-.7 0-.7.1-.7-.7zM8 3.5l-.1.5-.4.1L7 4l-.2-.4q0-.3.2-.4l.6-.2.3.3z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "ZarinPal",
    <svg
      onClick={() => handleSelectLink(TitleName.ZarinPal)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.ZarinPal ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M2.9 25a3.6 3.6 0 0 1-2.5-5.1c.2-.4 2.2-2.5 9.6-9.9C18.9 1.1 19.3.6 20 .4c.5-.3.6-.4 1.4-.4s1 0 1.5.3a3.5 3.5 0 0 1 1.7 4.9l-9.3 9.5-9.6 9.5a4 4 0 0 1-2.8.7m14-.2-.2-.5c0-.2.4-.6 3.6-3.9l3.8-3.7q.6-.2.8.4l.1 4c0 3.3 0 3.5-.2 3.7l-.1.3h-3.8c-3.6 0-3.7 0-4-.2M.3 8.1l-.2-4V.5L.2.2c.2-.2.4-.2 4-.2C7.4 0 7.8 0 8 .2q.2 0 .3.4L.7 8.3Q.4 8.3.2 8" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "AsanPardakht",
    <svg
      onClick={() => handleSelectLink(TitleName.AsanPardakht)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.AsanPardakht ? styles.selected : ""}`}
      viewBox="0 0 25 20">
      <path d="M15.4.3q-4.2.9-6.2 4.5-1.2 2.4.4 3.6c1.3 1 3.6.7 5.7-.5Q16.5 7 18 5.3l.5-.6.6.2q.6.1 1.6.8 2 1.3 3 1 .7 0 1-.3.4-.5 0-1.4a9 9 0 0 0-6-4.6c-1.4-.3-2-.3-3.3 0m3.4 6.1q-.6.3-1.2 1.2-.2.4-.2 1.7c0 1.1 0 1.4.4 2.3l.3 1.1-1.2.9q-1.7 1.1-1.4 1.9 0 .6 1.6.3a5.4 5.4 0 0 0 4.7-5.3c0-2.4-1.6-4.6-3-4M2 7.1q-2 .6-2 2.3a5 5 0 0 0 1.2 2.9q1.8 2.4 5 3.2c1 .3 3 .3 4.2 0a9 9 0 0 0 3.6-2c.8-.7 1.8-2 2.2-2.9.4-1-.9-1.8-2.4-1.3l-1.8 1-1.7.9c-.4 0-.5 0-1.2-.9A11 11 0 0 0 6.4 8 6 6 0 0 0 2 7m9.8 9q-.9.3-1.9 1.3l-.7.8-.5-.3C7.5 17 7.2 17 6.8 17q-.3 0-.5.2c-.2.2-.2.2 0 .8a5 5 0 0 0 2.3 2q2.3.6 4-.7c1.3-.8 1.9-2.4 1.2-3-.4-.3-1.4-.5-2-.3" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Zibal",
    <svg
      onClick={() => handleSelectLink(TitleName.Zibal)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Zibal ? styles.selected : ""}`}
      viewBox="0 0 25 20">
      <path d="m16 8-4 4 5.1 5L25 9.2 20 4zM3.9 7 0 10.8 5 16l8-7.8L7.8 3zm4.8 8.4-2 2L9.3 20l2-2 1.8-1.8L12 15l-1.5-1.4zM14 1.9l-2 2 2.6 2.5 2-2 1.8-1.8-1.1-1.2L15.8 0z" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "Pay.ir",
    <svg
      onClick={() => handleSelectLink(TitleName.Payir)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.Payir ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M11 14V.9c0-.7.8-1.1 1.3-.8l10.3 6.6c.5.3.5 1.1 0 1.4l-10.3 6.6A1 1 0 0 1 11 14m-8 1V1c0-.8.8-1.2 1.3-.9l10.3 7a1 1 0 0 1 0 1.6l-10.3 7c-.5.4-1.3 0-1.3-.8m18.7 5.3h-10l.1.4.1.8a3 3 0 0 1-1 2.3q-.7.6-1.5 1-1 .3-2.3.3H5q-2.4 0-3.6-1.4T0 19.8V18q.1-1 1.1-1t1.1 1v1.7l.2 1.2q0 .6.5 1 .3.3.9.5.5.3 1.3.3h1.6q.8 0 1.5-.2.6 0 .9-.3l.5-.5.1-.6q0-.4-.2-.7l-.5-.2h-.3a1 1 0 0 1-1-1.2q.1-1 1.1-1.1h12.9q1.1-.2 1.2-1.2v-1.4q.1-1 1.1-1a1 1 0 0 1 1.1 1v1.4c0 1.8-1.5 3.4-3.4 3.4M16 25h8a1 1 0 0 0 1.1-1q-.1-1.1-1-1.2h-8a1 1 0 0 0-1.2 1.1Q15 25 16 25" />{" "}
    </svg>
  );
  svgLinks.setValue(
    "NextPay",
    <svg
      onClick={() => handleSelectLink(TitleName.NextPay)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.NextPay ? styles.selected : ""}`}
      viewBox="0 0 25 25">
      <path d="M19 1c-.2.2-2.3 2-4.6 4.3l-4.2 4-2.2-2-2.8-2.5q-1.7-.7-3 .6c-.8.7-1 1-1 1.9 0 1 .2 1.2 2.7 3.7C8 15 8 15.2 4 19.3 1.4 21.9 1.3 22 1.3 23c0 1.8 1.6 3.1 3.2 2.8a34 34 0 0 0 4.8-4.1l4.4-4 2.2 2c1.2 1.1 2.4 2.2 2.8 2.4 2.2 1 4.9-1.2 4-3.4a22 22 0 0 0-3-3.4c-2.5-2.5-2.6-2.7-2.6-3.7s.1-1.2 2.8-3.8c3-3 3.5-3.8 2.7-5.3-.7-1.2-2.4-2-3.5-1.5m2.3 8.5q-1.8 1.7-1.8 2.3t2 2.3q1.7 1.7 2.2 1.8c.4 0 1.2-.8 1.2-1.1q-.1-.3-1.1-1.4-1.1-1-1.2-1.7 0-.4 1-1.3 1.6-1.3 1-2.1-.7-1.6-3.3 1.2m-21.1 2q-1 .6.8 2.2 1.1 1 1.2 1.5-.2.5-1.2 1.6-2 2.3-.2 2.3.7.1 2.5-1.7Q5 15.8 5 15.2c0-.5-3.5-4-4.1-4q-.3 0-.7.3" />
    </svg>
  );
  svgLinks.setValue(
    "IDPay",
    <svg
      onClick={() => handleSelectLink(TitleName.IDPay)}
      className={`${styles.pooliconchild} ${selectedLinkTitle === TitleName.IDPay ? styles.selected : ""}`}
      viewBox="0 0 25 15">
      <path d="M17 7.3a2 2 0 0 0 .4 1.3 2 2 0 0 0 1.2.6h5.8l.3-3.5h-6q-.7 0-1.2.4T17 7.3m2.5.1-.1.5q-.2.3-.4.3a1 1 0 0 1-1-.2l-.2-.4V7l.4-.5a1 1 0 0 1 1 .2q.3.2.3.6M23.6 0h-17Q6 0 5.6.4t-.4 1l-.4 4.9H2.9l-.3.1-.2.4q0 .3.2.4l.3.2h4.7q.4 0 .6.3.3.3.3.7t-.3.6-.6.3h-7q-.3 0-.4.2l-.2.4q0 .3.2.4 0 .3.4.2h3.8l-.2 2.9.3 1.1a1 1 0 0 0 1.1.5h17q.5 0 1-.4t.4-1l.3-3.7h-5.7A2 2 0 0 1 17 9a3 3 0 0 1-.6-1.9q.2-.9.8-1.5t1.6-.6h6l.3-3.4-.4-1.1a1 1 0 0 0-1-.5M.6 3.1h2.8l.4-.1.1-.4-.1-.4-.4-.2H.6l-.3.2-.2.4.2.4z" />{" "}
    </svg>
  );
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.marketPropertiesaddnew)}</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      {loading && <Loading />}
      {!loading && !showSetDateAndTime && (
        <>
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.marketPropertiesaddnew)}</div>
            <FlexibleToggleButton
              options={[
                { label: t(LanguageKey.icon), id: 0 },
                { label: t(LanguageKey.details), id: 1 },
              ]}
              onChange={setToggleValue}
              selectedValue={toggleValue}
            />
          </div>
          <div className={styles.all} onDrop={handleDrop} onDragOver={handleDragOver}>
            <div className={styles.selected}>
              {!selectedImage && (
                <div className={styles.selectedicon}>
                  {svgLinks.getValue(getEnumValue(TitleType, TitleName, addNewLink.type)!)}
                </div>
              )}
              {selectedImage && (
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.selectedicon}
                  style={{
                    border: "1px solid var(--color-dark-blue)",
                  }}
                  src={selectedImage}
                  alt="Selected"
                />
              )}
              <div className="instagramprofiledetail">
                <div className="instagramusername">{addNewLink.title}</div>
                <div className="instagramid">{addNewLink.description}</div>
              </div>
            </div>
            {toggleValue === ToggleOrder.FirstToggle && (
              <div className="headerandinput">
                <div className={styles.linkiconpool}>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.marketPropertiespopup_GeneralCustom)}</div>
                    <div className={styles.poolicon}>
                      {svgLinks.getValue("General Link")}
                      {svgLinks.getValue("PDF Link")}
                      {svgLinks.getValue("Contact")}
                      {svgLinks.getValue("RSS Feed")}
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.marketPropertiespopup_socialmedia)}</div>
                    <div className={styles.poolicon}>
                      {svgLinks.getValue("Instagram")}
                      {svgLinks.getValue("Club House")}
                      {svgLinks.getValue("Skype")}
                      {svgLinks.getValue("WhatsApp")}
                      {svgLinks.getValue("Twitter")}
                      {svgLinks.getValue("Dribbble")}
                      {svgLinks.getValue("Snapchat")}
                      {svgLinks.getValue("Pinterest")}
                      {svgLinks.getValue("Telegram")}
                      {svgLinks.getValue("Facebook")}
                      {svgLinks.getValue("Behance")}
                      {svgLinks.getValue("Meta Messenger")}
                      {svgLinks.getValue("Ticktok")}
                      {svgLinks.getValue("Linkedin")}
                      {svgLinks.getValue("X")}
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.marketPropertiespopup_mediastream)}</div>
                    <div className={styles.poolicon}>
                      {svgLinks.getValue("Apple Music")}
                      {svgLinks.getValue("Amazon Music")}
                      {svgLinks.getValue("SoundCloud")}
                      {svgLinks.getValue("Spotify")}
                      {svgLinks.getValue("Aparat")}
                      {svgLinks.getValue("twitch")}
                      {svgLinks.getValue("YouTube")}
                      {svgLinks.getValue("Shazam")}
                      {svgLinks.getValue("Discord")}
                      {svgLinks.getValue("vimeo")}
                      {svgLinks.getValue("Radio Javan")}
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.marketPropertiespopup_clouddrivecontent)}</div>
                    <div className={styles.poolicon}>
                      {svgLinks.getValue("Dropbox")}
                      {svgLinks.getValue("Mega")}
                      {svgLinks.getValue("iCloud Drive")}
                      {svgLinks.getValue("Google Drive")}
                      {svgLinks.getValue("MediaFire")}
                      {svgLinks.getValue("OneDrive")}
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.marketPropertiespopup_Finance)}</div>
                    <div className={styles.poolicon}>
                      {svgLinks.getValue("PayPal")}
                      {svgLinks.getValue(" Square")}
                      {svgLinks.getValue("Venmo")}
                      {svgLinks.getValue("VisaCard")}
                      {svgLinks.getValue("TipJar")}
                      {svgLinks.getValue("ZarinPal")}
                      {svgLinks.getValue("AsanPardakht")}
                      {svgLinks.getValue("Zibal")}
                      {svgLinks.getValue("Pay.ir")}
                      {svgLinks.getValue("NextPay")}
                      {svgLinks.getValue("IDPay")}
                    </div>
                  </div>
                </div>

                <div className={styles.customicon}>
                  <div onClick={handleUploadImage} className={styles.browse}>
                    {t(LanguageKey.upload)}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg"
                    onChange={handleImageChange}
                    ref={inputRef}
                    style={{ display: "none" }}
                  />
                  {t(LanguageKey.marketPropertiespopup_yourcustomIcon)}
                </div>
              </div>
            )}
            {toggleValue === ToggleOrder.SecondToggle && (
              <div className={styles.all}>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                    <div className="explain">
                      (<strong>{addNewLink.title?.length}</strong> / <strong>15</strong>)
                    </div>
                  </div>

                  <InputText
                    className={"textinputbox"}
                    placeHolder={""}
                    handleInputChange={handleInputChange}
                    value={addNewLink.title!}
                    maxLength={15}
                    name={"title"}
                    fadeTextArea={addNewLink.type > 0}
                    dangerOnEmpty
                  />
                </div>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="headertext">{t(LanguageKey.SettingGeneral_Description)}</div>
                    <div className="explain">
                      (<strong>{addNewLink.description.length}</strong> / <strong>50</strong>)
                    </div>
                  </div>

                  <InputText
                    className={"textinputbox"}
                    placeHolder={""}
                    handleInputChange={handleInputChange}
                    value={addNewLink.description}
                    maxLength={50}
                    name={"description"}
                    dangerOnEmpty
                  />
                </div>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="headertext">{t(LanguageKey.linkURL)}</div>
                  </div>
                  <div className="headerparent">
                    <InputText
                      className={"textinputbox"}
                      placeHolder={"URL Address"}
                      handleInputChange={handleInputChange}
                      value={addNewLink.redirectUrl}
                      maxLength={undefined}
                      name={"redirectUrl"}
                      dangerOnEmpty
                    />
                    <img
                      onClick={handleButtonClick}
                      style={{
                        cursor: "pointer",
                        width: "30px",
                        height: "30px",
                        padding: "var(--padding-5)",
                      }}
                      title="ℹ️ paste"
                      src="/copy.svg"
                    />
                  </div>
                </div>

                <CheckBoxButton
                  handleToggle={handleCkeckBoxChange}
                  value={addNewLink.isBold}
                  textlabel={t(LanguageKey.Boldit)}
                  name="isBold"
                  title={"Bold"}
                />

                <div className="headerandinput">
                  <CheckBoxButton
                    handleToggle={(e: ChangeEvent<HTMLInputElement>) => {
                      setAddNewLink((prev) => ({
                        ...prev,
                        expireTime: e.target.checked ? Date.now() + 3600000 : 0,
                      }));
                      setScheduledCheck(e.target.checked);
                    }}
                    value={scheduledCheck}
                    textlabel={t(LanguageKey.Scheduletime)}
                    title={"Schedule"}
                  />
                  <div className={`headerandinput ${!scheduledCheck && `fadeDiv`}`}>
                    <div className={styles.dateTime}>
                      <div className={styles.input}>
                        {new DateObject({
                          date: addNewLink.expireTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY/MM/DD")}
                      </div>
                      <div className={styles.input}>
                        {new DateObject({
                          date: addNewLink.expireTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("hh:mm")}
                      </div>
                      <div className={styles.input} style={{ width: "fit-content" }}>
                        {new DateObject({
                          date: addNewLink.expireTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("A")}
                      </div>
                      <div
                        onClick={() => setShowSetDateAndTime(true)}
                        className="saveButton"
                        style={{
                          position: "relative",
                          height: "40px",
                          width: "40px",
                          maxWidth: "40px",
                          minWidth: "40px",
                          maxHeight: "40px",
                          minHeight: "40px",
                        }}>
                        <img
                          className={styles.Calendaricon}
                          style={{ width: "23px" }}
                          alt="calendar"
                          src="/selectDate-item.svg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="ButtonContainer">
            <div className="cancelButton" onClick={props.removeMask}>
              {t(LanguageKey.cancel)}
            </div>
            <div onClick={handleSaveAddNewLink} className={handleCheckSaveCondition() ? "saveButton" : "disableButton"}>
              {t(LanguageKey.save)}
            </div>
          </div>
        </>
      )}
      {!loading && showSetDateAndTime && (
        <SetTimeAndDate
          removeMask={props.removeMask}
          saveDateAndTime={handleSaveDateAndTime}
          backToNormalPicker={() => setShowSetDateAndTime(false)}
          selectedDates={[]}
          startDay={addNewLink.expireTime}
        />
      )}
    </>
  );
};

export default AddNewLink;
