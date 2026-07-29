import { useTranslation } from "react-i18next";
import styles from "./generalBallance.module.css";
import { SubInvoiceStatus } from "brancy/models/enums";
import PriceFormater, { PriceFormaterClassName, PriceType } from "../priceFormater";
import { IBankCard, IGeneralBallance } from "brancy/models/interfaces";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import initialzedTime from "brancy/helper/manageTimer";

const statuses = [
  { status: SubInvoiceStatus.None, label: "تسویه‌نشده", className: "unsettled" },
  { status: SubInvoiceStatus.AwaitingSettled, label: "در حال تسویه", className: "awaiting" },
  { status: SubInvoiceStatus.Settled, label: "تسویه‌شده", className: "settled" },
  { status: SubInvoiceStatus.Failed, label: "برگشتی", className: "failed" },
] as const;

export default function GeneralBalance({
  generalBalance,
  cards,
  loading,
  onFromDateChange,
}: {
  generalBalance: IGeneralBallance[];
  cards: IBankCard[];
  loading: boolean;
  onFromDateChange: (from: number) => void;
}) {
  const { t } = useTranslation();
  const cardNumbers = Array.from(
    new Set([...cards.map((card) => card.cardNumber), ...generalBalance.map((item) => item.cardNumber)]),
  );

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
    <div className={styles.pinContainer1}>
      <section className={styles.balanceSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{t("Financial status of cards")}</h2>
            <p className={styles.sectionDescription}>
              {t("Total transactions from the selected date to the present moment")}
            </p>
          </div>
          <div className={styles.dateFilter}>
            <span className={styles.dateLabel}>{t("From date")}</span>
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
            {loading && <span className={styles.loadingLabel}>{t("Updating...")}</span>}
          </div>
        </div>

        <div className={`${styles.cardsGrid} ${loading ? styles.cardsLoading : ""}`}>
          {cardNumbers.map((cardNumber) => {
            const card = cards.find((item) => item.cardNumber === cardNumber);
            const cardBalances = generalBalance.filter((item) => item.cardNumber === cardNumber);
            const priceType = cardBalances[0]?.priceType ?? PriceType.Toman;

            return (
              <article key={cardNumber} className={styles.balanceCard}>
                <header className={styles.cardHeader}>
                  <div>
                    <div className={styles.bankName}>{card?.bankName || t("Bank name")}</div>
                    <div className={styles.cardHolder}>{card?.accountHolderName || "--"}</div>
                  </div>
                  {card?.isDefault && <span className={styles.defaultBadge}>{t("Default")}</span>}
                </header>

                <div className={styles.cardNumber} dir="ltr">
                  {cardNumber}
                </div>

                <div className={styles.statusGrid}>
                  {statuses.map(({ status, label, className }) => {
                    const total = cardBalances
                      .filter((item) => item.status === status)
                      .reduce((sum, item) => sum + item.totalPrice, 0);

                    return (
                      <div key={status} className={`${styles.statusItem} ${styles[className]}`}>
                        <span className={styles.statusLabel}>{label}</span>
                        <PriceFormater pricetype={priceType} fee={total} className={PriceFormaterClassName.PostPrice} />
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}

          {!loading && cardNumbers.length === 0 && (
            <div className={styles.emptyState}>
              {t("No information has been recorded for the cards in the selected date range.")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
