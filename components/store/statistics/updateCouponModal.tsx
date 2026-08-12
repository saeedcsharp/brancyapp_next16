import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import { LanguageKey } from "brancy/i18n";
import IUserCoupon from "brancy/models/interfaces";
import styles from "./createCouponModal.module.css";

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
        <h2 id="modal-title">{t(LanguageKey.save)}</h2>
        <button className={styles.closeButton} type="button" onClick={handleClose} aria-label={t(LanguageKey.close)}>
          <img src="/iconbox-close.svg" alt="" aria-hidden="true" />
        </button>
      </div>
      <div className={styles.fields}>
        <InputText
          className="textinputbox"
          value={coupon.code}
          handleInputChange={() => {}}
          placeHolder={t(LanguageKey.storestatistics_couponCode)}
          disabled
        />
        <InputText
          className="textinputbox"
          value={String(coupon.discount || "")}
          handleInputChange={() => {}}
          placeHolder={t(LanguageKey.storestatistics_discountPercent)}
          numberType
          inputMode="numeric"
          disabled
        />
        <InputText
          className="textinputbox"
          value={String(maxCount || "")}
          handleInputChange={(event) => setMaxCount(Number(event.target.value) || 0)}
          placeHolder={t(LanguageKey.storestatistics_maxUses)}
          numberType
          inputMode="numeric"
        />
        <InputText
          className="textinputbox"
          value={coupon.phoneNumber || "-"}
          handleInputChange={() => {}}
          placeHolder={t(LanguageKey.storestatistics_phoneNumber)}
          inputMode="tel"
          disabled
        />
        <InputText
          className="textinputbox"
          value={coupon.maxDiscount === null ? "" : String(coupon.maxDiscount)}
          handleInputChange={() => {}}
          placeHolder={t(LanguageKey.storestatistics_maxDiscountOptional)}
          numberType
          inputMode="numeric"
          disabled
        />
        <button className={styles.dateButton} type="button" onClick={() => setShowDatePicker(true)}>
          <span>
            {expireTime ? new Date(expireTime * 1000).toLocaleString() : t(LanguageKey.storestatistics_couponExpiry)}
          </span>
          <img src="/selectDate-item.svg" alt="" aria-hidden="true" />
        </button>
        <label className={styles.visibilityControl}>
          {t(LanguageKey.storestatistics_showInBio)}
          <SwitchButton
            name={`update-coupon-${coupon.couponId}-show-in-bio`}
            checked={showInBio}
            handleToggle={(event) => setShowInBio(event.target.checked)}
            role="switch"
          />
        </label>
      </div>
      <button className="saveButton" type="submit" disabled={isUpdating || !expireTime}>
        {isUpdating ? <RingLoader /> : t(LanguageKey.save)}
      </button>
    </form>
  );
};

export default UpdateCouponModal;
