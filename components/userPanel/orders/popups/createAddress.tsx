import { useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "../../../design/inputText";
import RingLoader from "../../../design/loader/ringLoder";
import TextArea from "../../../design/textArea/textArea";
import { NotifType, notify, ResponseType } from "../../../notifications/notificationBox";
import { LanguageKey } from "../../../../i18n";
import { MethodType } from "../../../../helper/api";
import { IAddress, InputTypeAddress, IUpdateUserAddress } from "../../../../models/userPanel/orders";
import styles from "./addresses.module.css";
import { clientFetchApi } from "../../../../helper/clientFetchApi";
enum CreateAddresStep {
  PostalCode,
  VerifyAddress,
}
export default function CreateAddresses({
  removeMask,
  inputTypeAddress,
  updateUserAddress,
}: {
  removeMask: () => void;
  inputTypeAddress: InputTypeAddress;
  updateUserAddress: (address: IAddress) => void;
}) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [postalCode, setPostalCode] = useState("");
  const [step, setStep] = useState(CreateAddresStep.PostalCode);
  const [address, setAddress] = useState<IAddress | null>(null);
  const [updateAddress, setUpdateAddress] = useState<IUpdateUserAddress>({
    addressId: 0,
    subject: "",
    receiver: "",
    note: "",
  } as IUpdateUserAddress);
  const [loadingCreateAddress, setLoadingCreateAddress] = useState(false);
  function handleCheckDisableButton() {
    if (step === CreateAddresStep.PostalCode) {
      return postalCode.length === 0;
    }
    if (!updateAddress) return true;
    return !updateAddress.subject || !updateAddress.receiver;
  }
  async function handleCreatePostByPostalCode() {
    setLoadingCreateAddress(true);
    try {
      const res = await clientFetchApi<IAddress, IAddress>("/api/address/CreateAddressByPostalCode", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "postalCode", value: postalCode }], onUploadProgress: undefined });
      if (res.succeeded) {
        setAddress(res.value);
        setUpdateAddress((prev) => ({
          ...prev,
          addressId: res.value.id,
        }));
        setStep(CreateAddresStep.VerifyAddress);
      } else notify(res.info.responseType, NotifType.Warning);
      setLoadingCreateAddress(false);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleUpdateUserAddress() {
    setLoadingCreateAddress(true);
    const newAddress = address!;
    newAddress.receiver = updateAddress.receiver;
    newAddress.subject = updateAddress.subject;
    newAddress.note = updateAddress.note;
    newAddress.isDefault = true;
    console.log("updateAddress", updateAddress);
    updateUserAddress(newAddress);
    try {
      const res = await clientFetchApi<IUpdateUserAddress, boolean>("/api/address/UpdateUserAddress", { methodType: MethodType.post, session: session, data: updateAddress, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        // setAddress(newAddress);
        updateUserAddress(newAddress);
        removeMask();
      } else notify(res.info.responseType, NotifType.Warning);
      setLoadingCreateAddress(false);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleCreateAddress() {
    if (step === CreateAddresStep.PostalCode) {
      switch (inputTypeAddress) {
        case InputTypeAddress.PostalCode:
          handleCreatePostByPostalCode();
          break;

        default:
          break;
      }
    } else {
      handleUpdateUserAddress();
    }
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.userpanel_AddNewAddress)}</title>
        <meta
          name="description"
          content="Manage your cart and orders efficiently with Bran.cy - Your trusted shopping companion"
        />
        <meta name="keywords" content="cart, orders, shopping, products, checkout, Brancy, e-commerce" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="canonical" href="" />
        <meta property="og:title" content={`Bran.cy ▸ ${t(LanguageKey.userpanel_AddNewAddress)}`} />
        <meta property="og:description" content="Manage your cart and orders efficiently with Bran.cy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <div onClick={removeMask} className="dialogBg" />
      <div className="popup">
        <div className="headerandinput">
          <div className="title">{t(LanguageKey.userpanel_AddNewAddress)}</div>
        </div>
        <div className={styles.containeraddress}>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
            <InputText
              className={
                updateAddress && updateAddress.subject && updateAddress.subject.length > 0 ? "textinputbox" : "danger"
              }
              handleInputChange={(e) => {
                setUpdateAddress((prev) => ({
                  ...prev!,
                  subject: e.currentTarget.value,
                }));
              }}
              value={updateAddress ? updateAddress.subject : ""}
              name="subject"
              placeHolder={t(LanguageKey.order_addressSubject)}
            />
          </div>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.userpanel_ZipCode)}</div>
            <InputText
              className={
                step === CreateAddresStep.PostalCode ? (postalCode.length > 0 ? "textinputbox" : "danger") : "disable"
              }
              handleInputChange={
                step === CreateAddresStep.PostalCode ? (e) => setPostalCode(e.currentTarget.value) : (e) => {}
              }
              value={postalCode}
              fadeTextArea={step === CreateAddresStep.VerifyAddress}
            />
          </div>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.userpanel_Address)}</div>
            <TextArea
              className={"message"}
              readOnly={true}
              value={address ? address.address : ""}
              handleKeyDown={undefined}
              role={"textbox"}
              title={"Address"}
            />
          </div>

          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.Storeorder_receiver)}</div>
            <div style={{ position: "relative" }}>
              <InputText
                className={
                  updateAddress && updateAddress.receiver && updateAddress.receiver.length > 0
                    ? "textinputbox"
                    : "danger"
                }
                handleInputChange={(e) => {
                  setUpdateAddress((prev) => ({
                    ...prev,
                    receiver: e.currentTarget.value,
                  }));
                }}
                value={updateAddress ? updateAddress.receiver : ""}
                name="receiver"
                placeHolder={t(LanguageKey.order_addressReceiver)}
              />
              {loadingCreateAddress && step === CreateAddresStep.PostalCode && (
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}>
                  <RingLoader />
                </div>
              )}
            </div>
          </div>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.note)}</div>
            <TextArea
              className={"message"}
              value={updateAddress ? updateAddress.note : ""}
              handleInputChange={(e) => {
                setUpdateAddress((prev) => ({
                  ...prev,
                  note: e.target.value,
                }));
              }}
              handleKeyDown={undefined}
              role={"textbox"}
              title={"Note"}
              name="note"
              placeHolder={t(LanguageKey.order_addressNote)}
            />
          </div>
        </div>
        <div className="ButtonContainer">
          <button onClick={removeMask} className="stopButton">
            {t(LanguageKey.cancel)}
          </button>
          <button
            disabled={handleCheckDisableButton()}
            onClick={handleCreateAddress}
            className={handleCheckDisableButton() ? "disableButton" : "saveButton"}>
            {loadingCreateAddress ? (
              <div className={styles.loadingContainer}>
                <RingLoader />
              </div>
            ) : step === CreateAddresStep.PostalCode ? (
              t(LanguageKey.Continue)
            ) : (
              t(LanguageKey.save)
            )}
          </button>
        </div>
      </div>
    </>
  );
}
