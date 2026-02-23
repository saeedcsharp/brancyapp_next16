import { useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";
import { IAddress } from "brancy/models/userPanel/orders";
import styles from "brancy/components/userPanel/orders/popups/addresses.module.css";
export default function UpdateAddresses({
  address,
  removeMask,
  updateUserAddress,
}: {
  address: IAddress;
  removeMask: () => void;
  updateUserAddress: (address: IAddress, fromUpdatedAddress: boolean) => void;
}) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [note, setNote] = useState(address.note);
  const [loadingUpdateAddress, setLoadingUpdateAddress] = useState(false);
  async function handleUpdateUserAddress() {
    // setLoadingUpdateAddress(true);
    // const updateAddress = {
    //   addressId: address.id,
    //   note: note,
    //   receiver: address.receiver,
    //   subject: address.subject,
    // } as IUpdateUserAddress;

    // const newAddress = address!;
    // newAddress.note = updateAddress.note;
    // console.log("updateAddress", updateAddress);
    // try {
    //   const res = await GetServerResult<IUpdateUserAddress, boolean>(
    //     MethodType.post,
    //     session,
    //     "User/Address/UpdateUserAddress",
    //     updateAddress
    //   );
    //   if (res.succeeded) {
    //     // setAddress(newAddress);
    //     updateUserAddress(newAddress, true);
    //     removeMask();
    //   } else notify(res.info.responseType, NotifType.Warning);
    //   setLoadingUpdateAddress(false);
    // } catch (error) {
    //   notify(ResponseType.Unexpected, NotifType.Error);
    // }
    const newAddress = address!;
    newAddress.note = note;
    updateUserAddress(newAddress, true);
  }
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.userpanel_EditAddress)}</title>
        <meta
          name="description"
          content="Manage your cart and orders efficiently with Bran.cy - Your trusted shopping companion"
        />
        <meta name="keywords" content="cart, orders, shopping, products, checkout, Brancy, e-commerce" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="canonical" href="" />
        <meta property="og:title" content={`Bran.cy ▸ ${t(LanguageKey.userpanel_EditAddress)}`} />
        <meta property="og:description" content="Manage your cart and orders efficiently with Bran.cy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <div onClick={removeMask} className="dialogBg" />
      <div className="popup">
        <div className="headerandinput">
          <div className="title">{t(LanguageKey.userpanel_EditAddress)}</div>
        </div>
        <div className={styles.containeraddress}>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
            <InputText
              className={"disable"}
              handleInputChange={(e) => {}}
              value={address.subject}
              fadeTextArea={true}
              name="subject"
              placeHolder={t(LanguageKey.order_addressSubject)}
            />
          </div>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.userpanel_ZipCode)}</div>
            <InputText
              className={"disable"}
              handleInputChange={(e) => {}}
              value={address.postalCode}
              fadeTextArea={true}
            />
          </div>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.userpanel_Address)}</div>
            <TextArea
              className={"message"}
              fadeTextArea={true}
              value={address ? address.address : ""}
              handleKeyDown={undefined}
              role={"textbox"}
              title={"Address"}
            />
          </div>

          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.Storeorder_receiver)}</div>
            <InputText
              className={"disable"}
              handleInputChange={() => {}}
              value={address.receiver}
              fadeTextArea={true}
              name="receiver"
            />
          </div>
          <div className="headerandinput">
            <div className="headertext">{t(LanguageKey.note)}</div>
            <TextArea
              className={"message"}
              value={note}
              handleInputChange={(e) => {
                setNote(e.currentTarget.value);
              }}
              handleKeyDown={undefined}
              role={"textbox"}
              title={"Note"}
              name="note"
            />
          </div>
        </div>
        <div className="ButtonContainer">
          <button onClick={removeMask} className="cancelButton">
            {t(LanguageKey.discard)}
          </button>
          <button onClick={handleUpdateUserAddress} className={"saveButton"}>
            {loadingUpdateAddress ? <RingLoader /> : t(LanguageKey.Continue)}
          </button>
        </div>
      </div>
    </>
  );
}
