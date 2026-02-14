import { t } from "i18next";
import { useSession } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { ILogistic } from "saeed/models/userPanel/orders";
import styles from "./logistic.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
export default function Logistic({
  shippingList,
  handleAddLogistic,
}: {
  shippingList: ILogistic[];
  handleAddLogistic: () => void;
}) {
  const { data: session } = useSession();
  const [showShipping, setShowShipping] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [selectedShippings, setSelectedShippings] = useState<number[]>([]);
  const handleShippingToggle = (value: number) => {
    setSelectedShippings((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
    e.stopPropagation();
    handleShippingToggle(id);
  };
  async function saveSupportLogistics() {
    setVerifyLoading(true);
    try {
      const res = await GetServerResult<number[], boolean>(
        MethodType.post,
        session,
        "Business/Authorize/SaveSupportLogestic",
        selectedShippings
      );
      if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
        setSelectedShippings([]);
      } else {
        handleAddLogistic();
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setVerifyLoading(false);
    }
  }
  return (
    <div className={styles.progressStep}>
      <div className="headerparent">
        <div className="instagramprofile">
          <img width="30px" height="30px" title="ℹ️ paste" src="/attention.svg" />
          <div className="headerandinput">
            <div className="title">{t(LanguageKey.Storeproduct_shippingmethod)}</div>
            <div className="explain">{t(LanguageKey.Storeproduct_shippingmethodExplain)}</div>
          </div>
        </div>
        <button
          className={`${styles.btn} ${selectedShippings.length > 0 ? "saveButton" : "cancelButton"}`}
          disabled={verifyLoading}
          onClick={() => {
            if (selectedShippings.length > 0) {
              saveSupportLogistics();
            } else setShowShipping((prev) => !prev);
          }}>
          {verifyLoading ? (
            <RingLoader />
          ) : selectedShippings.length > 0 ? (
            t(LanguageKey.Verify)
          ) : showShipping ? (
            t(LanguageKey.close)
          ) : (
            t(LanguageKey.add)
          )}
        </button>
      </div>
      <div className={`${styles.UploadContainer} ${showShipping ? styles.show : styles.hide}`}>
        <div className={styles.explain}>
          <img
            style={{ width: "16px", height: "16px", marginInlineEnd: "10px" }}
            title="ℹ️ attention"
            src="/tooltip.svg"
          />
          {t(LanguageKey.Storeproduct_shippingmethodtooltip)}
        </div>
        <div className={styles.shippingOptionlist}>
          {shippingList.map((v) => (
            <div
              key={v.id}
              className={`${styles.shippingOption} ${selectedShippings.includes(v.id) ? styles.activeOption : ""}`}
              onClick={() => handleShippingToggle(v.id)}>
              <div className={styles.optiondata}>
                <CheckBoxButton
                  value={selectedShippings.includes(v.id)}
                  handleToggle={(e) => handleCheckboxChange(e, v.id)}
                  title={v.langName}
                />

                <div className="headerandinput">
                  <div className="title"> {v.langName}</div>
                  <div className="explain">{v.name}</div>
                </div>
              </div>
              <div className={styles.optionimage}>
                <img className={styles.optionicon} src={baseMediaUrl + v.logo} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
