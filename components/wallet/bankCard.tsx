import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { SubInvoiceStatus } from "brancy/models/enums";
import { IBankCard, IGeneralBallance } from "brancy/models/interfaces";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import InputBox from "brancy/components/design/inputBox/inputBox";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import styles from "./bankCard.module.css";
import { useTranslation } from "react-i18next";
type BankCardItemProps =
  | {
      card: IBankCard;
      generalBalance: IGeneralBallance[];
      loading: boolean;
      onFromDateChange: (from: number) => void;
      onSelectCard?: (bamckCrd: string) => void;
      isAddCard?: false;
      onCardAdded?: () => void;
    }
  | {
      isAddCard: true;
      onCardAdded?: () => void;
    };
type BankCardProps = {
  cards: IBankCard[];
  generalBalance: IGeneralBallance[];
  loading: boolean;
  onFromDateChange: (from: number) => void;
  onSelectCard?: (cardNumber: string) => void;
  onCardAdded?: () => void;
};
const statuses = [
  { status: SubInvoiceStatus.None, label: "Unsettled", className: "unsettled" },
  { status: SubInvoiceStatus.AwaitingSettled, label: "Awaiting Settled", className: "awaiting" },
  { status: SubInvoiceStatus.Settled, label: "Settled", className: "settled" },
  { status: SubInvoiceStatus.Failed, label: "Failed", className: "failed" },
] as const;

function BankCardItem(props: BankCardItemProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [addCardLoading, setAddCardLoading] = useState(false);

  const handleCardNumberChange = (value: string) => {
    setNewCardNumber(value.replace(/\D/g, "").slice(0, 16));
  };

  const handleAddCard = async (event: FormEvent) => {
    event.preventDefault();
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
      props.onCardAdded?.();
      setShowAddForm(false);
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setAddCardLoading(false);
    }
  };

  if (props.isAddCard) {
    return (
      <article className={`${styles.bankCard} ${styles.addCardCard}`}>
        <button className={styles.addCardTile} type="button" onClick={() => setShowAddForm((current) => !current)}>
          <span className={styles.addCardIcon} aria-hidden="true">
            +
          </span>
          <span>{t("Add Bank Card")}</span>
          <small>{t("Register a new card")}</small>
        </button>
        {showAddForm && (
          <div className={styles.addCardPanel}>
            <form className={styles.addCardForm} onSubmit={handleAddCard}>
              <label className={styles.label} htmlFor="wallet-card-number">
                {t("Card Number")}
                <div className={styles.addCardInput}>
                  <InputBox
                    className="textinputbox"
                    handleInputChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleCardNumberChange(event.target.value)
                    }
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
                <small className={styles.inputHint}>{t("Insert your card number")}.</small>
              </label>
              <div className={styles.formActions}>
                <button
                  className="cancelButton"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={addCardLoading}>
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
        )}
      </article>
    );
  }

  const { card, generalBalance, loading, onFromDateChange, onSelectCard } = props;
  const cardBalances = generalBalance.filter((item) => item.cardNumber === card.cardNumber);
  const priceType = cardBalances[0]?.priceType ?? PriceType.Toman;

  const handleDateChange = (date: DateObject | null) => {
    if (!date) {
      onFromDateChange(0);
      return;
    }

    const from = date.toDate();
    from.setHours(0, 0, 0, 0);
    onFromDateChange(from.getTime());
  };

  return (
    <article onClick={() => onSelectCard?.(card.cardNumber)} className={styles.bankCard}>
      <div className={styles.bankCardHeader}>
        <div className={styles.bankName}>{card.bankName}</div>
        <div className={styles.badges}>
          {card.isDefault && <span className={styles.defaultBadge}>{t("Default")}</span>}
          {!card.isActive && <span className={styles.suspendedBadge}>{t("Suspended")}</span>}
        </div>
      </div>
      <div className={styles.cardNumber}>{maskCard(card.cardNumber)}</div>
      <div className={styles.bankCardFooter}>
        <span className={styles.holder}>{card.accountHolderName}</span>
      </div>
      <div className={styles.balanceContent} onClick={(event) => event.stopPropagation()}>
        <div className={styles.balanceHeader}>
          <span className={styles.balanceTitle}>{t("Financial status")}</span>
          <DatePicker
            calendar={initialzedTime().calendar}
            locale={initialzedTime().locale}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD"
            maxDate={new Date()}
            onChange={handleDateChange}
            placeholder={t("All times")}
            inputClass={styles.dateInput}
            containerClassName={styles.datePickerContainer}
            disabled={loading}
          />
        </div>
        {loading && <span className={styles.loadingLabel}>{t("Updating...")}</span>}
        <div className={`${styles.statusGrid} ${loading ? styles.cardsLoading : ""}`}>
          {statuses.map(({ status, label, className }) => {
            const total = cardBalances
              .filter((item) => item.status === status)
              .reduce((sum, item) => sum + item.totalPrice, 0);

            return (
              <div key={status} className={`${styles.statusItem} ${styles[className]}`}>
                <span className={styles.statusLabel}>{t(label)}</span>
                <PriceFormater pricetype={priceType} fee={total} className={PriceFormaterClassName.PostPrice} />
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
function maskCard(s: string) {
  if (!s) return "---- ---- ---- ----";
  const cleaned = s.replace(/\s+/g, "");
  if (cleaned.length < 4) return s;
  const last = cleaned.slice(-4);
  return "**** **** **** " + last;
}

export default function BankCard({
  cards,
  generalBalance,
  loading,
  onFromDateChange,
  onSelectCard,
  onCardAdded,
}: BankCardProps) {
  const orderedCards = [...cards].sort((first, second) => Number(second.isDefault) - Number(first.isDefault));
  const defaultCard = orderedCards.find((card) => card.isDefault);

  return (
    <Slider
      key={defaultCard?.cardNumber ?? "no-default-card"}
      className={styles.cardSlider}
      spaceBetween={16}
      initialIndex={orderedCards.length > 0 ? 1 : 0}>
      <SliderSlide className={styles.cardSlide}>
        <BankCardItem isAddCard onCardAdded={onCardAdded} />
      </SliderSlide>
      {orderedCards.map((card, index) => (
        <SliderSlide key={`${card.cardNumber}-${index}`} className={styles.cardSlide}>
          <BankCardItem
            card={card}
            generalBalance={generalBalance}
            loading={loading}
            onFromDateChange={onFromDateChange}
            onSelectCard={onSelectCard}
          />
        </SliderSlide>
      ))}
    </Slider>
  );
}
