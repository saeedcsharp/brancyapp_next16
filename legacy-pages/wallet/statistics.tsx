import { ApexOptions } from "apexcharts";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Soon from "../../components/notOk/soon";
import { packageStatus } from "../../helper/loadingStatus";
import styles from "./statistics.module.css";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// صفحه آمار مالی — نسخه نمایشی فارسی برای پرزنت سرمایه‌گذار
// تمام داده‌ها و فرآیندها Mock هستند و صرفاً سناریوهای قدرت سیستم را نمایش می‌دهند.

const Statistics = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  // وضعیت‌های نمایشی
  const [walletBalance, setWalletBalance] = useState(22000000); // ریال
  const [monthIncome, setMonthIncome] = useState(325150000); // ریال
  const [monthWithdraw, setMonthWithdraw] = useState(25125000); // ریال
  const [transactionsUp, setTransactionsUp] = useState(150); // صعودی
  const [transactionsDown, setTransactionsDown] = useState(50); // نزولی / برگشتی
  const [unsettledCount, setUnsettledCount] = useState(18);
  const [unsettledValue, setUnsettledValue] = useState(145700000); // ریال
  const [cryptoConvertedMonth, setCryptoConvertedMonth] = useState(87000000); // ریال تبدیل شده به رمزارز
  const [autoSettlementEnabled] = useState(true);

  // داده‌های نمودار نمایشی - حجم تراکنش 7 روز اخیر
  const chartData = {
    categories: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
    series: [
      {
        name: "واریز",
        data: [45000000, 52000000, 48000000, 61000000, 55000000, 67000000, 58000000],
      },
      {
        name: "برداشت",
        data: [12000000, 8000000, 15000000, 11000000, 9000000, 13000000, 10000000],
      },
    ],
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 230,
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: "var(--text-h2)",
          fontSize: "11px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "var(--text-h2)",
          fontSize: "11px",
        },
        formatter: (val) => {
          return (val / 1000000).toFixed(0) + "م";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ["#4CAF50", "#F44336"],
    tooltip: {
      y: {
        formatter: (val) => {
          return val.toLocaleString("fa-IR") + " ریال";
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "var(--text-h2)",
      },
    },
    grid: {
      borderColor: "var(--color-gray30)",
      strokeDashArray: 2,
    },
  };

  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  // شبیه‌سازی به‌روزرسانی لحظه‌ای (افزایش درآمد ماه و کاهش مبالغ تسویه نشده)
  useEffect(() => {
    const interval = setInterval(() => {
      setMonthIncome((v) => v + 100000); // رشد تدریجی درآمد ماه
      setUnsettledValue((v) => (v - 50000 < 0 ? 0 : v - 50000));
      setWalletBalance((w) => w + 25000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatMoney = (v: number) => v.toLocaleString("fa-IR");

  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>برنسی ▸ آمار مالی و عملکرد کیف پول</title>
          <meta
            name="description"
            content="نمایش خلاقانه ظرفیت پردازش تراکنش، تسویه هوشمند، تبدیل رمزارز و تحلیل درآمد در کیف پول برانسی"
          />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        {!session.user.isPartner && <Soon />}
        {session.user.isPartner && (
          <main>
            {/* کارت‌های خلاصه بالای صفحه */}
            <div className={styles.inboxContainer}>
              <div className={styles.followers}>
                <div className={styles.title}>موجودی کیف پول</div>
                <div className={styles.div}>{formatMoney(walletBalance)}</div>
              </div>
              <div className={styles.lastPost}>
                <div className={styles.rectangleImage}></div>
                <div className={styles.title}>درآمد این ماه</div>
                <div className={styles.div}>{formatMoney(monthIncome)}</div>
                <div className={styles.title}>رشد لحظه‌ای</div>
              </div>
              <div className={styles.newlikes}>
                <div className={styles.title}>برداشت ماه</div>
                <div className={styles.div}>{formatMoney(monthWithdraw)}</div>
                <div className={styles.title}>ثبت شده</div>
              </div>
              <div className={styles.newCommnet}>
                <div className={styles.title}>تراکنش‌های موفق</div>
                <div className={styles.div}>{transactionsUp}</div>
                <div className={styles.title}>این ماه</div>
              </div>
              <div className={styles.postrequest}>
                <div className={styles.title}>تراکنش‌های برگشتی</div>
                <div className={styles.div}>{transactionsDown}</div>
                <div className={styles.title}>کنترل ریسک</div>
              </div>
              <div className={styles.followers}>
                <div className={styles.title}>تبدیل به رمزارز</div>
                <div className={styles.div}>{formatMoney(cryptoConvertedMonth)}</div>
                <div className={styles.title}>در ماه جاری</div>
              </div>
              <div className={styles.newlikes}>
                <div className={styles.title}>تعداد تسویه‌نشده</div>
                <div className={styles.div}>{unsettledCount}</div>
                <div className={styles.title}>در صف تسویه</div>
              </div>
              <div className={styles.lastPost}>
                <div className={styles.rectangleImage}></div>
                <div className={styles.title}>مبلغ تسویه‌نشده</div>
                <div className={styles.div}>{formatMoney(unsettledValue)}</div>
                <div className={styles.title}>چرخه تجمیع</div>
              </div>
            </div>

            {/* بلوک‌های جزئیات */}
            <div>
              <div className={styles.pinContainer}>
                {/* حساب / درگاه */}
                <div className="bigcard">
                  <div className="headerChild">
                    <div className="circle"></div>
                    <div className="Title">درگاه پرداخت یار متصل</div>
                  </div>
                  <div className={styles.part}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                      <div>نام درگاه: پرداخت یار برانسی</div>
                      <div>وضعیت: فعال / مانیتور SLA</div>
                      <div>میانگین تایید: ۱٫۴ ثانیه</div>
                      <div>فراخوانی API امروز: ۳۲,۸۲۰</div>
                      <div>آخرین خطای ثبت‌شده: بدون خطا</div>
                    </div>
                  </div>
                </div>

                {/* آمار تجمیعی تراکنش */}
                <div className="bigcard">
                  <div className="headerChild">
                    <div className="circle"></div>
                    <div className="Title">تحلیل تراکنش‌ها</div>
                  </div>
                  <div className={styles.section3}>
                    <div className={styles.totalchart}>
                      {/* نمودار حجم تراکنش 7 روز اخیر */}
                      <Chart options={chartOptions} series={chartData.series} type="bar" height={230} width="100%" />
                    </div>
                  </div>
                  <div className={styles.section3}>
                    <div className={styles.totalsummery}>
                      <div className={styles.totalsummerychild}>
                        <div className={styles.totalcounter}>{transactionsUp + transactionsDown}</div>
                        <div className={styles.totalabel}>کل تراکنش ثبت‌شده</div>
                      </div>
                      <div className={styles.totalsummerychild}>
                        <div className={styles.totalcounter}>{formatMoney(monthIncome)}</div>
                        <div className={styles.totalabel}>درآمد تجمیعی ماه</div>
                      </div>
                      <div className={styles.totalsummerychild}>
                        <div className={styles.totalcounter}>{formatMoney(walletBalance)}</div>
                        <div className={styles.totalabel}>موجودی لحظه‌ای</div>
                      </div>
                      <div className={styles.totalsummerychild}>
                        <div className={styles.totalcounter}>{autoSettlementEnabled ? "فعال" : "غیرفعال"}</div>
                        <div className={styles.totalabel}>تسویه خودکار</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* تاریخچه تراکنش‌ها */}
              <div className={styles.pinContainer1}>
                <div className="tooBigCard">
                  <div className="headerChild">
                    <div className="circle"></div>
                    <div className="Title">تاریخچه تراکنش نمایشی</div>
                  </div>
                  <div className={styles.section4}>
                    <div className={styles.sorting}>
                      <div className={styles.calendar}>از تاریخ</div>
                      <div className={styles.calendar}>تا تاریخ</div>
                    </div>
                  </div>
                  <div className={styles.section5}>
                    <div className={styles.table}>
                      <div className={styles.tableheader}>
                        <div className={styles.header1}>#</div>
                        <div className={styles.header2}>کد تراکنش</div>
                        <div className={styles.header3}>شماره پرداخت</div>
                        <div className={styles.header4}>نوع</div>
                        <div className={styles.header5}>مبلغ (ریال)</div>
                        <div className={styles.header6}>وضعیت</div>
                        <div className={styles.header7}>زمان</div>
                        <div className={styles.header8}>اشتراک</div>
                      </div>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={styles.tableheader1}>
                          <div className={styles.tablecounter}>{i}</div>
                          <div className={styles.orcernumber}>TRX{i}9824</div>
                          <div className={styles.orcernumber}>PMT{i}4561</div>
                          <div className={styles.viwes}>{i % 2 === 0 ? "برداشت" : "واریز"}</div>
                          <div className={styles.viwes}>{formatMoney(1200000 + i * 350000)}</div>
                          <div className={styles.confirmedstatus}>{i % 3 === 0 ? "تسویه شد" : "در انتظار"}</div>
                          <div className={styles.date}>
                            <div className={styles.day}>1404/08/2{i}</div>
                            <div className={styles.hour}>12:{40 + i} ق.ظ</div>
                          </div>
                          <div className={styles.share}>
                            <img className={styles.sharetype} src="/pdf.svg" />
                            <img className={styles.sharetype} src="/jpg.svg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.section4}>
                    <div className={styles.calendar}>فیلتر پیشرفته</div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </>
    )
  );
};

export default Statistics;
