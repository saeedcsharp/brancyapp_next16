import Head from "next/head";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import RadioButton from "brancy/components/design/radioButton";
import { LanguageKey } from "brancy/i18n";
import { IAddress } from "brancy/models/userPanel/orders";
import styles from "./addresses.module.css";

export default function Addresses({
  removeMask,
  addresses,
  handleChangeDefaultAddress,
  handleUpdateDefaultAddress,
  handleAddAddress,
  showSetting,
  handleShowUpdateAddress,
  handleShowSetting,
  handleDeletetAddress,
}: {
  removeMask: () => void;
  addresses: IAddress[];
  handleChangeDefaultAddress: (addressId: number) => void;
  handleUpdateDefaultAddress: () => void;
  handleAddAddress: () => void;
  showSetting: number | null;
  handleShowUpdateAddress: (address: IAddress) => void;
  handleShowSetting: (id: number | null) => void;
  handleDeletetAddress: (address: IAddress) => void;
}) {
  const { t } = useTranslation();
  const handleClickOnIcon = useCallback(
    async (id: string) => {
      try {
        if (id === t(LanguageKey.delete)) {
          handleDeletetAddress(addresses.find((x) => x.id === showSetting)!);
        } else if (id === t(LanguageKey.edit)) {
          handleShowUpdateAddress(addresses.find((x) => x.id === showSetting)!);
        }
      } catch (error) {
        console.error("Error exporting chart:", error);
      }
    },
    [showSetting, t],
  );
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.userpanel_Addresses)}</title>
        <meta
          name="description"
          content="Manage your cart and orders efficiently with Bran.cy - Your trusted shopping companion"
        />
        <meta name="keywords" content="cart, orders, shopping, products, checkout, Brancy, e-commerce" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="canonical" href="" />
        <meta property="og:title" content={`Bran.cy ▸ ${t(LanguageKey.userpanel_Addresses)}`} />
        <meta property="og:description" content="Manage your cart and orders efficiently with Bran.cy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <div onClick={removeMask} className="dialogBg" />
      <div onClick={() => handleShowSetting(null)} className="popup">
        <div className="headerandinput" style={{ gap: "15px" }}>
          <div className="title">{t(LanguageKey.userpanel_Addresses)}</div>
          <header className={styles.addnewlink} onClick={handleAddAddress} title="◰ create new sub admin">
            <div className={styles.addnewicon}>
              <svg width="22" height="22" viewBox="0 0 22 22">
                <path
                  d="M22 11q-.1 1.5-1.6 1.6h-7.8v7.8a1.6 1.6 0 1 1-3.2 0v-7.8H1.6a1.6 1.6 0 1 1 0-3.2h7.8V1.6a1.6 1.6 0 1 1 3.2 0v7.8h7.8q1.5.1 1.6 1.6"
                  fill="var(--color-dark-blue)"
                />
              </svg>
            </div>
            <div className={styles.addnewcontent}>
              <div className={styles.addnewheader}>{t(LanguageKey.userpanel_AddNewAddress)}</div>
              <div className="explain">{t(LanguageKey.userpanel_AddNewAddressexplain)}</div>
            </div>
          </header>
        </div>

        <div className={styles.container}>
          {addresses.map((v) => (
            <div key={v.id} className="headerandinput">
              <div className="headerparent">
                <RadioButton
                  name="address"
                  id={v.subject}
                  checked={v.isDefault}
                  textlabel={v.subject}
                  title={v.subject}
                  handleOptionChanged={() => {
                    handleChangeDefaultAddress(v.id);
                  }}
                />

                <Dotmenu
                  showSetting={showSetting === v.id}
                  onToggle={(isOpen) => handleShowSetting(isOpen ? v.id : null)}
                  handleClickOnIcon={handleClickOnIcon}
                  data={[
                    { icon: "/delete.svg", value: t(LanguageKey.delete) },
                    {
                      icon: "/edit-1.svg",
                      value: t(LanguageKey.edit),
                    },
                  ]}
                />
              </div>
              <div className={styles.addressContent}>
                <div className={styles.addressRow}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="var(--text-h2)"
                    width="24"
                    strokeWidth="1.5">
                    <ellipse cx="12" cy="17.5" rx="7" ry="3.5" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>

                  <span className={styles.addressText}>{v.receiver}</span>
                </div>
                <div className={styles.addressRow}>
                  <img style={{ width: "20px", height: "20px" }} title="ℹ️ location" src="/order_location.svg" />
                  <span className={styles.addressText}>{v.postalCode}</span>
                </div>
                {/* <div className={styles.addressRow}>
                  <img style={{ width: "20px", height: "20px" }} title="ℹ️ call" src="/order_call.svg" />
                  <span className={styles.addressText}>{v.telephone}</span>
                </div> */}
                <div className={styles.addressRow}>
                  <img style={{ width: "20px", height: "20px" }} title="ℹ️ address" src="/order_address.svg" />
                  <span className={styles.addressText}>{v.address}</span>
                </div>

                {v.note.length > 0 && (
                  <div className={styles.addressRow}>
                    <img style={{ width: "20px", height: "20px" }} title="ℹ️ note" src="/order_note.svg" />
                    <span className={styles.addressText}>{v.note}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="ButtonContainer">
          <button onClick={removeMask} className="cancelButton">
            {t(LanguageKey.cancel)}
          </button>
          <button onClick={handleUpdateDefaultAddress} className={"saveButton"}>
            {t(LanguageKey.save)}
          </button>
        </div>
      </div>
    </>
  );
}
