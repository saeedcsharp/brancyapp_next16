import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "../../../design/inputText";
import TextArea from "../../../design/textArea/textArea";
import FlexibleToggleButton from "../../../design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "../../../design/toggleButton/types";
import ToggleCheckBoxButton from "../../../design/toggleCheckBoxButton";
import { NotifType, notify, ResponseType } from "../../../notifications/notificationBox";
import Loading from "../../../notOk/loading";
import { LanguageKey } from "../../../../i18n";
import { MethodType } from "../../../../helper/api";
import { ICantactMap, IUpdateContactMap } from "../../../../models/market/properties";
import styles from "./featureBoxPU.module.css";
import { clientFetchApi } from "../../../../helper/clientFetchApi";

const OpenStreetMap = dynamic(() => import("../../../mainLeaftlet"), {
  ssr: false,
});
const ContactForm = (props: { removeMask: () => void }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [contactToggle, setContactToggle] = useState(ToggleOrder.FirstToggle);
  const [contactAndMap, setContactAndMap] = useState<ICantactMap>({
    address: "",
    email: "",
    instagramerId: 0,
    isActiveSaveContact: true,
    lastUpdate: 0,
    lat: 35.6997,
    lng: 51.337,
    phoneNumber: "",
    showMap: false,
  });
  const [loading, setLoading] = useState(true);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const handleSelectPosition = (center: any) => {
    setContactAndMap((prev) => ({ ...prev, lat: center.lat, lng: center.lng }));
  };
  async function saveButton() {
    //Api to save location and phonenumber and email and address
    if (!handleCheckSave()) return;
    const updateContactMap: IUpdateContactMap = {
      address: contactAndMap.address,
      email: contactAndMap.email,
      isActiveSaveContact: contactAndMap.isActiveSaveContact,
      lat: contactAndMap.lat,
      lng: contactAndMap.lng,
      phoneNumber: contactAndMap.phoneNumber,
      showMap: contactAndMap.showMap,
    };
    try {
      var res = await clientFetchApi<IUpdateContactMap, boolean>("/api/bio/UpdateContact", { methodType: MethodType.post, session: session, data: updateContactMap, queries: undefined, onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else props.removeMask();
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleChangeQuestionTextArea(e: ChangeEvent<HTMLTextAreaElement>): void {
    setContactAndMap((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }
  function handleCheckPhonenumber(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length === 0) {
      setPhoneError(true);
      return;
    }
    const phoneRegex = /^\+?\d+$/;
    setPhoneError(!phoneRegex.test(e.target.value));
  }
  function handleCheckEmail(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length === 0) {
      setEmailError(false);
      return;
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    setEmailError(!emailRegex.test(e.target.value));
  }
  async function fetchData() {
    var res = await clientFetchApi<string, ICantactMap>("/api/bio/GetContact", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
    if (res.succeeded) {
      setContactAndMap(res.value);
      setLoading(false);
    }
  }
  function handleCheckSave() {
    if (
      // (contactAndMap.showMap ||
      //   (contactAndMap.phoneNumber && contactAndMap.phoneNumber.length > 0) ||
      //   (contactAndMap.email && contactAndMap.email.length > 0) ||
      //   (contactAndMap.address && contactAndMap.address.length > 0)) &&
      contactAndMap.phoneNumber &&
      contactAndMap.phoneNumber.length !== 0 &&
      !phoneError &&
      !emailError
    )
      return true;
    return false;
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          {/* head for SEO */}
          <Head>
            {" "}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <title>Bran.cy ▸ {t(LanguageKey.marketPropertiesContactAndMap)}</title>
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
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.marketPropertiesContactAndMap)}</div>
            <FlexibleToggleButton
              options={[
                { label: t(LanguageKey.Contact), id: 0 },
                { label: t(LanguageKey.Map), id: 1 },
              ]}
              onChange={setContactToggle}
              selectedValue={contactToggle}
            />
          </div>

          {/* ___ first Toggle___*/}
          {contactToggle === ToggleOrder.SecondToggle && (
            <div className={styles.all}>
              <div className="headerparent">
                <div className={styles.showmaptitle}>{t(LanguageKey.Showmap)}</div>
                <ToggleCheckBoxButton
                  handleToggle={(e) =>
                    setContactAndMap((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.checked,
                    }))
                  }
                  checked={contactAndMap.showMap}
                  name="showMap"
                  role="checkbox"
                  aria-label={t(LanguageKey.Showmap)}
                  title={t(LanguageKey.Showmap)}
                />
              </div>

              {/* <div
                className={`headerandinput ${
                  !contactAndMap.showMap && "fadeDiv"
                }`}>
                <div className="headertext">{t(LanguageKey.location)}</div>
                <InputText
                  className={"textinputbox"}
                  placeHolder={""}
                  handleInputChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setContactAndMap((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }));
                  }}
                  value={contactAndMap.address}
                  maxLength={undefined}
                  name={"address"}
                />
              </div> */}

              <div className={`${styles.map} ${!contactAndMap.showMap && "fadeDiv"}`}>
                {/* <LeafLet handleSelectPosition={handleSelectPosition} /> */}
                <OpenStreetMap
                  handleSelectPosition={handleSelectPosition}
                  location={{
                    lat: contactAndMap.lat,
                    lng: contactAndMap.lng,
                  }}
                  draggable={true}
                  scrollWheelZoom={true}
                />
              </div>
            </div>
          )}
          {/* ___ second Toggle___*/}
          {contactToggle === ToggleOrder.FirstToggle && (
            <div className={styles.all}>
              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.phone)}</div>
                <InputText
                  dangerOnEmpty
                  className={"textinputbox"}
                  handleInputChange={(e) => {
                    setContactAndMap((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }));
                  }}
                  value={contactAndMap.phoneNumber ?? ""}
                  name={"phoneNumber"}
                  handleInputBlur={handleCheckPhonenumber}
                />
                {phoneError && <div style={{ color: "var(--color-light-red)" }}>{t(LanguageKey.invalidphone)}</div>}
              </div>

              <div className="headerandinput">
                <div className="headertext">{t(LanguageKey.email)}</div>
                <InputText
                  className={"textinputbox"}
                  placeHolder={""}
                  handleInputChange={(e: ChangeEvent<HTMLInputElement>) => {
                    console.log("emaillll", e.currentTarget.name);
                    setContactAndMap((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                  }}
                  value={contactAndMap.email}
                  maxLength={undefined}
                  name={"email"}
                  handleInputBlur={handleCheckEmail}
                />
                {emailError && <div style={{ color: "var(--color-light-red)" }}>{t(LanguageKey.invalidemail)}</div>}
              </div>

              <div className="headerandinput" style={{ height: "100%" }}>
                <div className="headertext">{t(LanguageKey.Address)}</div>
                <TextArea
                  className={"captiontextarea"}
                  placeHolder={""}
                  fadeTextArea={false}
                  handleInputChange={handleChangeQuestionTextArea}
                  value={contactAndMap.address}
                  maxLength={1000}
                  name="address"
                  aria-label={t(LanguageKey.Address)}
                  title={t(LanguageKey.Address)}
                  role="textbox"
                />
              </div>
              {/* <div className={styles.section}>
                <CheckBoxButton
                  handleToggle={(e: ChangeEvent<HTMLInputElement>) => {
                    setContactAndMap((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.checked,
                    }));
                  }}
                  value={contactAndMap.isActiveSaveContact}
                  textlabel={t(LanguageKey.showsavecontactbutton)}
                  name="isActiveSaveContact"
                  title={t(LanguageKey.showsavecontactbutton)}
                  aria-label={t(LanguageKey.showsavecontactbutton)}
                />
              </div> */}
            </div>
          )}

          <div className="ButtonContainer">
            <div className="cancelButton" onClick={props.removeMask}>
              {t(LanguageKey.cancel)}
            </div>
            <div onClick={saveButton} className={handleCheckSave() ? "saveButton" : "disableButton"}>
              {t(LanguageKey.save)}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ContactForm;
