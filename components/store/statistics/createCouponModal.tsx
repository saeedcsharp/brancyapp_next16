import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Modal from "brancy/components/design/modal";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import { LanguageKey } from "brancy/i18n";
import styles from "./createCouponModal.module.css";

export interface CreateCouponRequest {
  code: string;
  discount: number;
  expireTime: number;
  maxCount: number;
  phoneNumber: string;
  showInBio: boolean;
  maxDiscount: number | null;
}

interface CreateCouponModalProps {
  showContent: boolean;
  closePopup: () => void;
  onCreate: (coupon: CreateCouponRequest) => Promise<boolean>;
}

const initialForm: CreateCouponRequest = {
  code: "",
  discount: 0,
  expireTime: 0,
  maxCount: 0,
  phoneNumber: "",
  showInBio: true,
  maxDiscount: null,
};

const CreateCouponModal = ({ showContent, closePopup, onCreate }: CreateCouponModalProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<CreateCouponRequest>(initialForm);
  const [isCreating, setIsCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleClose = () => {
    setShowDatePicker(false);
    closePopup();
  };

  const handleSaveDate = (date: string | undefined) => {
    if (!date) return;
    setForm((previous) => ({ ...previous, expireTime: Number(date) }));
    setShowDatePicker(false);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.code.trim() || !form.phoneNumber.trim() || !form.expireTime) return;

    setIsCreating(true);
    const succeeded = await onCreate({ ...form, code: form.code.trim(), phoneNumber: form.phoneNumber.trim() });
    if (succeeded) {
      setForm(initialForm);
      handleClose();
    }
    setIsCreating(false);
  };

  return (
    <Modal closePopup={handleClose} classNamePopup="popup" showContent={showContent}>
      {showDatePicker ? (
        <SetTimeAndDate
          removeMask={handleClose}
          saveDateAndTime={handleSaveDate}
          backToNormalPicker={() => setShowDatePicker(false)}
          startDay={form.expireTime || Date.now() + 3600000}
          fromUnix={Date.now() + 3600000}
          endUnix={Date.now() + 31536000000}
          title={t(LanguageKey.storestatistics_couponExpiry)}
        />
      ) : (
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.header}>
            <h2 id="modal-title">{t(LanguageKey.storestatistics_addCoupon)}</h2>
            <button
              className={styles.closeButton}
              type="button"
              onClick={handleClose}
              aria-label={t(LanguageKey.close)}>
              <img src="/iconbox-close.svg" alt="" aria-hidden="true" />
            </button>
          </div>
          <div className={styles.fields}>
            <InputText
              className="textinputbox"
              value={form.code}
              handleInputChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))}
              placeHolder={t(LanguageKey.storestatistics_couponCode)}
            />
            <InputText
              className="textinputbox"
              value={String(form.discount || "")}
              handleInputChange={(event) =>
                setForm((previous) => ({ ...previous, discount: Number(event.target.value) || 0 }))
              }
              placeHolder={t(LanguageKey.storestatistics_discountPercent)}
              numberType
              inputMode="numeric"
            />
            <InputText
              className="textinputbox"
              value={String(form.maxCount || "")}
              handleInputChange={(event) =>
                setForm((previous) => ({ ...previous, maxCount: Number(event.target.value) || 0 }))
              }
              placeHolder={t(LanguageKey.storestatistics_maxUses)}
              numberType
              inputMode="numeric"
            />
            <InputText
              className="textinputbox"
              value={form.phoneNumber}
              handleInputChange={(event) => setForm((previous) => ({ ...previous, phoneNumber: event.target.value }))}
              placeHolder={t(LanguageKey.storestatistics_phoneNumber)}
              inputMode="tel"
            />
            <InputText
              className="textinputbox"
              value={form.maxDiscount === null ? "" : String(form.maxDiscount)}
              handleInputChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  maxDiscount: event.target.value === "" ? null : Number(event.target.value) || 0,
                }))
              }
              placeHolder={t(LanguageKey.storestatistics_maxDiscountOptional)}
              numberType
              inputMode="numeric"
            />
            <button className={styles.dateButton} type="button" onClick={() => setShowDatePicker(true)}>
              <span>
                {form.expireTime
                  ? new Date(form.expireTime).toLocaleString()
                  : t(LanguageKey.storestatistics_couponExpiry)}
              </span>
              <img src="/selectDate-item.svg" alt="" aria-hidden="true" />
            </button>
            <label className={styles.visibilityControl}>
              {t(LanguageKey.storestatistics_showInBio)}
              <SwitchButton
                name="newCouponShowInBio"
                checked={form.showInBio}
                handleToggle={(event) => setForm((previous) => ({ ...previous, showInBio: event.target.checked }))}
                role="switch"
              />
            </label>
          </div>
          <button
            className="saveButton"
            type="submit"
            disabled={isCreating || !form.code.trim() || !form.phoneNumber.trim() || !form.expireTime}>
            {isCreating ? <RingLoader /> : t(LanguageKey.storestatistics_addCoupon)}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default CreateCouponModal;
