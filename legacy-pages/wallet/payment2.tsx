import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Soon from "brancy/components/notOk/soon";
import { packageStatus } from "brancy/helper/loadingStatus";
import styles from "./payment.module.css";

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

  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  const formatMoney = (v: number) => v.toLocaleString("fa-IR");

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayAdded(true);
  };
  const handleCardToCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardDestination || !cardAmount) return;
    // شبیه‌سازی ثبت تراکنش کارت به کارت
    setUnsettledCount((c) => c + 1);
    setUnsettledValue((v) => v + Number(cardAmount));
    setCardAmount("");
    setCardDestination("");
  };
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    // شبیه‌سازی کاهش مبلغ تسویه‌نشده پس از برداشت
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
    // شبیه‌سازی تبدیل به رمزارز بدون منطق واقعی نرخ
    setCryptoAmount("");
  };

  return (
    session &&
    session!.user.currentIndex !== -1 && (
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
        {/* {!session.user.isPartner && <Soon />} */}
        {
          <main className="pinContainer">
            {/* Hero Section */}

            {/* بخش افزودن درگاه پرداخت یار */}
            <div className="tooBigCard " style={{ gridRowEnd: "span 47" }}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.iconGradient}>💳</div>
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>افزودن درگاه پرداخت یار</h2>
                    <p className={styles.cardSubtitle}>اتصال مستقیم به API یاران</p>
                  </div>
                </div>
                <form onSubmit={handleAddGateway} className={styles.form}>
                  <label className={styles.label}>
                    نام درگاه
                    <input
                      className={styles.input}
                      value={gatewayName}
                      onChange={(e) => setGatewayName(e.target.value)}
                      placeholder="مثال: پرداخت یار برانسی"
                    />
                  </label>
                  <button className={styles.button} type="submit">
                    {gatewayAdded ? "✓ درگاه ثبت شد" : "ثبت درگاه"}
                  </button>
                  {gatewayAdded && <div className={styles.successNote}>✓ درگاه با موفقیت به کیف پول متصل شد.</div>}
                  <div className={styles.hint}>پشتیبانی از API پرداخت یاران، تسویه دوره‌ای و کارمزد پویا.</div>
                </form>
              </div>
            </div>

            {/* کارت به کارت */}
            <div className="tooBigCard " style={{ gridRowEnd: "span 47" }}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.iconGradient}>🔄</div>
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>کارت به کارت هوشمند</h2>
                    <p className={styles.cardSubtitle}>انتقال سریع با رمزنگاری</p>
                  </div>
                </div>
                <form onSubmit={handleCardToCard} className={styles.form}>
                  <div className={styles.infoBox}>
                    <span className={styles.infoLabel}>کارت مبدأ:</span>
                    <span className={styles.infoValue}>{cardSource}</span>
                  </div>
                  <label className={styles.label}>
                    کارت مقصد
                    <input
                      className={styles.input}
                      value={cardDestination}
                      onChange={(e) => setCardDestination(e.target.value)}
                      placeholder="شماره ۱۶ رقمی"
                    />
                  </label>
                  <label className={styles.label}>
                    مبلغ (ریال)
                    <input
                      className={styles.input}
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                      placeholder="مثال: 2500000"
                    />
                  </label>
                  <button className={styles.button} type="submit">
                    انتقال فوری
                  </button>
                  <div className={styles.hint}>بر اساس قوانین رمزنگاری و کنترل تقلب داخلی.</div>
                </form>
              </div>
            </div>

            {/* برداشت وجه */}
            <div className="bigcard">
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.iconGradient}>💰</div>
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>برداشت از حساب</h2>
                    <p className={styles.cardSubtitle}>تسویه T+1 با امنیت بالا</p>
                  </div>
                </div>
                <form onSubmit={handleWithdraw} className={styles.form}>
                  <label className={styles.label}>
                    مبلغ (ریال)
                    <input
                      className={styles.input}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="مثال: 1000000"
                    />
                  </label>
                  <button className={styles.button} type="submit">
                    درخواست برداشت
                  </button>
                  <div className={styles.hint}>تسویه به صورت T+1 با کنترل وضعیت حساب.</div>
                </form>
              </div>
            </div>

            {/* تبدیل به رمزارز */}
            <div className="bigcard">
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.iconGradient}>₿</div>
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>تبدیل به رمزارز</h2>
                    <p className={styles.cardSubtitle}>نرخ لحظه‌ای بازار</p>
                  </div>
                </div>
                <form onSubmit={handleConvert} className={styles.form}>
                  <label className={styles.label}>
                    مبلغ (ریال)
                    <input
                      className={styles.input}
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      placeholder="مثال: 5000000"
                    />
                  </label>
                  <label className={styles.label}>
                    نوع رمزارز
                    <select
                      className={styles.select}
                      value={cryptoType}
                      onChange={(e) => setCryptoType(e.target.value)}>
                      <option value="USDT">USDT (تتر)</option>
                      <option value="BTC">BTC (بیت‌کوین)</option>
                      <option value="ETH">ETH (اتریوم)</option>
                    </select>
                  </label>
                  <button className={styles.button} type="submit">
                    تبدیل
                  </button>
                  <div className={styles.hint}>ماژول نرخ لحظه‌ای و مدیریت ریسک داخلی (نمونه نمایشی).</div>
                </form>
              </div>
            </div>

            {/* تسویه مبالغ - کارت عریض */}
            <div className="tooBigCard " style={{ gridRowEnd: "span 47" }}>
              <div className={styles.wideCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.iconGradient}>⚡</div>
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>تسویه مبالغ نگه‌داری شده</h2>
                    <p className={styles.cardSubtitle}>الگوریتم زمان‌بندی هوشمند و تجمیع تراکنش</p>
                  </div>
                </div>
                <div className={styles.settleContent}>
                  <div className={styles.metricsRow}>
                    <div className={styles.metricBox}>
                      <div className={styles.metricIcon}>📊</div>
                      <div>
                        <div className={styles.metricLabel}>تعداد تسویه‌نشده</div>
                        <div className={styles.metricValue}>{unsettledCount}</div>
                      </div>
                    </div>
                    <div className={styles.metricBox}>
                      <div className={styles.metricIcon}>💵</div>
                      <div>
                        <div className={styles.metricLabel}>مبلغ تسویه‌نشده (ریال)</div>
                        <div className={styles.metricValue}>{formatMoney(unsettledValue)}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    className={styles.buttonPrimary}
                    onClick={handleSettle}
                    disabled={settleLoading || (!unsettledCount && !unsettledValue)}>
                    {settleLoading ? "⏳ در حال پردازش..." : "⚡ تسویه فوری"}
                  </button>
                </div>
              </div>
            </div>

            {/* خلاصه کلیدی - کارت عریض */}
          </main>
        }
      </>
    )
  );
};

export default Payment;
