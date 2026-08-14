import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import RingLoader from "brancy/components/design/loader/ringLoder";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import { LanguageKey } from "brancy/i18n";
import IUserCoupon from "brancy/models/interfaces";
import styles from "./createCouponModal.module.css";
import InputBox from "brancy/components/design/inputBox/inputBox";

export interface UpdateCouponRequest {
  couponId: number;
  expireTime: number;
  maxCount: number;
  showInBio: boolean;
}

interface UpdateCouponModalProps {
  coupon: IUserCoupon;
  closePopup: () => void;
  onUpdate: (coupon: UpdateCouponRequest) => Promise<boolean>;
}

const UpdateCouponModal = ({ coupon, closePopup, onUpdate }: UpdateCouponModalProps) => {
  const { t } = useTranslation();
  const [expireTime, setExpireTime] = useState(coupon.expireTime);
  const [maxCount, setMaxCount] = useState(coupon.maxCount);
  const [showInBio, setShowInBio] = useState(coupon.showInBio);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleClose = () => {
    setShowDatePicker(false);
    closePopup();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!expireTime) return;

    setIsUpdating(true);
    const succeeded = await onUpdate({ couponId: coupon.couponId, expireTime, maxCount, showInBio });
    if (succeeded) handleClose();
    setIsUpdating(false);
  };

  return showDatePicker ? (
    <SetTimeAndDate
      removeMask={handleClose}
      saveDateAndTime={(date) => {
        if (date) setExpireTime(Number(date));
        setShowDatePicker(false);
      }}
      backToNormalPicker={() => setShowDatePicker(false)}
      startDay={expireTime ? expireTime * 1000 : Date.now() + 3600000}
      fromUnix={Date.now() + 3600000}
      endUnix={Date.now() + 31536000000}
      title={t(LanguageKey.storestatistics_couponExpiry)}
    />
  ) : (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 id="modal-title">{t(LanguageKey.update)}</h2>
      </div>
      <div className={styles.fields}>
        <div className={styles.visibilityControl}>
          <span>{t(LanguageKey.storestatistics_showInBio)}</span>
          <SwitchButton
            name={`update-coupon-${coupon.couponId}-show-in-bio`}
            checked={showInBio}
            handleToggle={(event) => setShowInBio(event.target.checked)}
            role="switch"
          />
        </div>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.storestatistics_couponExpiry)}</div>
          <div className="headerparent">
            <button className={styles.dateButton} type="button" onClick={() => setShowDatePicker(true)}>
              <span>
                {expireTime
                  ? new Date(expireTime * 1000).toLocaleString()
                  : t(LanguageKey.storestatistics_couponExpiry)}
              </span>
              <img src="/selectDate-item.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.storestatistics_couponCode)}</div>
          <div className="headerparent">
            <InputBox className="textinputbox" value={coupon.code} handleInputChange={() => {}} disabled />
          </div>
        </div>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.storestatistics_discountPercent)}</div>
          <div className="headerparent">
            <InputBox
              className="textinputbox"
              value={String(coupon.discount || "")}
              handleInputChange={() => {}}
              numberType
              inputMode="numeric"
              disabled
            />
          </div>
        </div>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.storestatistics_maxUses)}</div>
          <div className="headerparent">
            <InputBox
              className="textinputbox"
              value={String(maxCount || "")}
              handleInputChange={(event) => setMaxCount(Number(event.target.value) || 0)}
              numberType
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.storestatistics_phoneNumber)}</div>
          <div className="headerparent">
            <InputBox
              className="textinputbox"
              value={coupon.phoneNumber || "-"}
              handleInputChange={() => {}}
              disabled
            />
          </div>
        </div>
        <div className="headerandinput">
          <div className="headertext">{t(LanguageKey.storestatistics_maxDiscountOptional)}</div>
          <div className="headerparent">
            <InputBox
              className="textinputbox"
              value={coupon.maxDiscount === null ? "" : String(coupon.maxDiscount)}
              handleInputChange={() => {}}
              numberType
              inputMode="numeric"
              disabled
            />
          </div>
        </div>
      </div>
      <div className="ButtonContainer">
        <button type="button" onClick={() => setShowDatePicker(false)} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>
        <button className="saveButton" type="submit" disabled={isUpdating || !expireTime}>
          {isUpdating ? <RingLoader /> : t(LanguageKey.save)}
        </button>
      </div>
    </form>
  );
};

export default UpdateCouponModal;
