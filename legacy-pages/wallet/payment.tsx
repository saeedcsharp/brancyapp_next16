import Modal from "brancy/components/design/modal";
import Loading from "brancy/components/notOk/loading";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import BankCard from "brancy/components/wallet/bankCard";
import SettlePopup from "brancy/components/wallet/settlePopup";
import SubInvoicesPopup from "brancy/components/wallet/subInvoicePopup";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { packageStatus } from "brancy/helper/loadingStatus";
import { IBankCard } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./payment.module.css";
const Payment = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  // حالت‌های محلی برای فرم‌ها
  const [gatewayName, setGatewayName] = useState("پرداخت یار برانسی");
  const [cardSource] = useState("6037 **** **** 1234");
  const [cardDestination, setCardDestination] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [settleLoading, setSettleLoading] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoType, setCryptoType] = useState("USDT");
  const [unsettledCount, setUnsettledCount] = useState(12);
  const [unsettledValue, setUnsettledValue] = useState(145000000);
  const [gatewayAdded, setGatewayAdded] = useState(false);
  const [cards, setCards] = useState<IBankCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettlePopup, setShowSettlePopup] = useState<string | null>(null);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [showSubInvoicesPopup, setShowSubInvoicesPopup] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleToggleAdd = () => setShowAdd((s) => !s);

  const handleCardNumberChange = (value: string) => {
    setNewCardNumber(value.replace(/\D/g, "").slice(0, 16));
  };

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
      setShowAdd(false);
      await fetchCards();
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setAddCardLoading(false);
    }
  };
  const formatMoney = (v: number) => v.toLocaleString("fa-IR");

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayAdded(true);
  };
  const handleCardToCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardDestination || !cardAmount) return;
    setUnsettledCount((c) => c + 1);
    setUnsettledValue((v) => v + Number(cardAmount));
    setCardAmount("");
    setCardDestination("");
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    const num = Number(withdrawAmount);
    setUnsettledValue((v) => (v - num < 0 ? 0 : v - num));
    setWithdrawAmount("");
  };

  const handleSettle = () => {
    setSettleLoading(true);
    setTimeout(() => {
      setUnsettledCount(0);
      setUnsettledValue(0);
      setSettleLoading(false);
    }, 1200);
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoAmount) return;
    setCryptoAmount("");
  };

  async function fetchCards() {
    setCardsLoading(true);
    try {
      const res = await clientFetchApi<null, IBankCard[]>("/api/wallet/getInstagramerBankCards", { session });
      if (res && res.succeeded) {
        const v: any = res.value;
        if (Array.isArray(v)) {
          setCards(v);
        } else if (v && Array.isArray(v.value)) {
          setCards(v.value);
        } else if (v && Array.isArray(v.cards)) {
          setCards(v.cards);
        } else if (v && typeof v === "object") {
          // single object returned — wrap into array
          setCards([v]);
        } else {
          setCards([]);
        }
      } else {
        notify(res.info.responseType, NotifType.Warning);
        setCards([]);
      }
    } catch (err) {
      console.error("fetchCards error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
      setCards([]);
    } finally {
      setCardsLoading(false);
    }
  }

  if (!session || session!.user.currentIndex === -1) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>برنسی ▸ عملیات پرداخت و کیف پول</title>
        <meta
          name="description"
          content="صفحه نمایشی فرآیندهای مالی، درگاه پرداخت یار، کارت به کارت، برداشت، تسویه و تبدیل به رمزارز در پلتفرم برانسی"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className={styles.paymentPage}>
        <section className={styles.walletSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.cardTitle}>{t("Cards and Bank Accounts")}</h2>
          </div>
          {showAdd && (
            <div className={styles.addCardPanel}>
              <form className={styles.addCardForm} onSubmit={handleAddCard}>
                <label className={styles.label} htmlFor="wallet-card-number">
                  {t("Card Number")}
                  <input
                    id="wallet-card-number"
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={newCardNumber.replace(/(.{4})/g, "$1 ").trim()}
                    onChange={(event) => handleCardNumberChange(event.target.value)}
                    aria-invalid={newCardNumber.length > 0 && newCardNumber.length !== 16}
                    disabled={addCardLoading}
                    autoFocus
                  />
                  <small className={styles.inputHint}> {t("Insert your card number")}.</small>
                </label>
                <div className={styles.formActions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    onClick={() => setShowAdd(false)}
                    disabled={addCardLoading}>
                    {t("Cancel")}
                  </button>
                  <button
                    className={styles.button}
                    type="submit"
                    disabled={newCardNumber.length !== 16 || addCardLoading}>
                    {addCardLoading ? t("Registering...") : t("Register Bank Card")}
                  </button>
                </div>
              </form>
            </div>
          )}
          {cardsLoading ? (
            <Loading />
          ) : (
            <>
              <div className={styles.cardList}>
                <button className={styles.addCardTile} type="button" onClick={handleToggleAdd} aria-expanded={showAdd}>
                  <span className={styles.addCardIcon} aria-hidden="true">
                    +
                  </span>
                  <span>{t("Add Bank Card")}</span>
                  <small>{t("Register a new card")}</small>
                </button>
                {cards.map((c, idx) => (
                  <BankCard
                    key={`${c.cardNumber}-${idx}`}
                    card={c}
                    onSettle={() => {
                      setShowSettlePopup(c.cardNumber);
                    }}
                    onSelectCard={(cardNumber) => setShowSubInvoicesPopup(cardNumber)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Modal
        closePopup={() => setShowSettlePopup(null)}
        classNamePopup={"popupSendFile"}
        showContent={showSettlePopup !== null}>
        <SettlePopup cardNumber={showSettlePopup!} onClose={() => setShowSettlePopup(null)} />
      </Modal>
      <Modal
        closePopup={() => setShowSubInvoicesPopup(null)}
        classNamePopup={"popupLarge"}
        showContent={showSubInvoicesPopup !== null}>
        <SubInvoicesPopup cardNumber={showSubInvoicesPopup ?? ""} />
      </Modal>
    </>
  );
};

export default Payment;
