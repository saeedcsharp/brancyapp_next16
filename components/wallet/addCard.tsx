import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { useSession } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import styles from "./addCard.module.css";
import InputText from "../design/inputBox/inputBox";
export default function AddCard({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [newCardNumber, setNewCardNumber] = useState("");
  const [addCardLoading, setAddCardLoading] = useState(false);
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardNumber.length !== 16 || addCardLoading) return;

    setAddCardLoading(true);
    try {
      const response = await clientFetchApi<{ cardNumber: string }, boolean>("/api/wallet/addCardNumber", {
        session,
        methodType: MethodType.get,
        queries: [{ key: "cardNumber", value: newCardNumber }],
      });

      if (!response.succeeded) {
        notify(response.info.responseType, NotifType.Warning);
        return;
      }

      notify(ResponseType.Ok, NotifType.Success);
      setNewCardNumber("");
      onClose();
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setAddCardLoading(false);
    }
  };
  const handleCardNumberChange = (value: string) => {
    setNewCardNumber(value.replace(/\D/g, "").slice(0, 16));
  };
  return (
    <div className={styles.addCardPanel}>
      <form className={styles.addCardForm} onSubmit={handleAddCard}>
        <label className={styles.label} htmlFor="wallet-card-number">
          {t("Card Number")}
          <div className={styles.input}>
            <InputBox
              className={"textinputbox"}
              handleInputChange={(e: ChangeEvent<HTMLInputElement>) => handleCardNumberChange(e.target.value)}
              value={newCardNumber.replace(/(.{4})/g, "$1 ").trim()}
              disabled={addCardLoading}
              numberType
              maxLength={19}
              inputMode="numeric"
              autoComplete="cc-number"
              id="wallet-card-number"
              name="wallet-card-number"
            />
          </div>

          <small className={styles.inputHint}> {t("Insert your card number")}.</small>
        </label>
        <div className={styles.formActions}>
          <button className={"cancelButton"} type="button" onClick={onClose} disabled={addCardLoading}>
            {t("Cancel")}
          </button>
          <button
            className={newCardNumber.length !== 16 || addCardLoading ? "disableButton" : "saveButton"}
            type="submit"
            disabled={newCardNumber.length !== 16 || addCardLoading}>
            {addCardLoading ? t("Registering...") : t("Register Bank Card")}
          </button>
        </div>
      </form>
    </div>
  );
}
