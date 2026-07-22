import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { packageStatus } from "brancy/helper/loadingStatus";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import styles from "./payment.module.css";
import { IBankCard } from "brancy/models/interfaces";
import Loading from "brancy/components/notOk/loading";
import { notify, NotifType, ResponseType } from "brancy/components/notifications/notificationBox";
import BankCard from "brancy/components/wallet/bankCard";
import Modal from "brancy/components/design/modal";
import SettlePopup from "brancy/components/wallet/settlePopup";

// توجه: همه متون این صفحه به صورت ایستا و فارسی برای پرزنت سرمایه‌گذار هستند.
// این صفحه نمونه‌ی نمایشی (Mock) است و به سرویس‌های واقعی متصل نشده است.

const Payment = () => {
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
  const [showAdd, setShowAdd] = useState(false);
  const [showSettlePopup, setShowSettlePopup] = useState<string | null>(null);
  const [newCard, setNewCard] = useState<Partial<IBankCard>>({
    cardNumber: "",
    accountHolderName: "",
    bankName: "",
    iban: "",
    isDefault: false,
    isActive: true,
  });

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

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardNumber || !newCard.accountHolderName || !newCard.bankName) return;
    const added: IBankCard = {
      cardNumber: newCard.cardNumber!.trim(),
      accountHolderName: newCard.accountHolderName!.trim(),
      accountNumber: newCard.accountNumber ?? null,
      iban: newCard.iban ?? "",
      swiftBIC: newCard.swiftBIC ?? null,
      routingNumber: newCard.routingNumber ?? null,
      bin: newCard.bin ?? 0,
      accountType: newCard.accountType ?? null,
      createdTime: Date.now(),
      suspendReasonId: null,
      suspendTime: null,
      unSuspendTime: null,
      suspendMessage: null,
      bankName: newCard.bankName!.trim(),
      bankCountryCode: newCard.bankCountryCode ?? "IR",
      bankReasonId: null,
      bankSuspendMessage: null,
      fbId: newCard.fbId ?? 0,
      isDefault: !!newCard.isDefault,
      isActive: newCard.isActive ?? true,
      bankBranchSwiftBIC: newCard.bankBranchSwiftBIC ?? null,
    };
    // در این صفحه نمایشی فقط در حالت کلاینت به لیست اضافه می‌کنیم
    setCards((c) => (added.isDefault ? [added, ...c.map((x) => ({ ...x, isDefault: false }))] : [...c, added]));
    setNewCard({ cardNumber: "", accountHolderName: "", bankName: "", iban: "", isDefault: false, isActive: true });
    setShowAdd(false);
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
            <h2 className={styles.cardTitle}>کارت‌ها و حساب‌های بانکی</h2>
          </div>
          {cardsLoading ? (
            <Loading />
          ) : (
            <div className={styles.cardList}>
              <button className={styles.addCardTile} type="button" onClick={handleToggleAdd}>
                <span className={styles.addCardIcon} aria-hidden="true">
                  +
                </span>
                <span>{"افزودن کارت بانکی"}</span>
                <small>ثبت کارت جدید</small>
              </button>
              {cards.map((c, idx) => (
                <BankCard
                  key={`${c.cardNumber}-${idx}`}
                  card={c}
                  onSettle={() => {
                    setShowSettlePopup(c.cardNumber);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Modal
        closePopup={() => setShowSettlePopup(null)}
        classNamePopup={"popupSendFile"}
        showContent={showSettlePopup !== null}>
        <SettlePopup cardNumber={showSettlePopup!} onClose={() => setShowSettlePopup(null)} />
      </Modal>
    </>
  );
};

export default Payment;
