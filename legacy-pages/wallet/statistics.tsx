import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { packageStatus } from "brancy/helper/loadingStatus";
import MultiChart from "brancy/components/design/chart/Chart_month";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { IMonthGraph, IWallentBalanceHistoryGraph, IWalletBalanceHistoryResponse } from "brancy/models/interfaces";
import styles from "./statistics.module.css";
import { notify, NotifType } from "brancy/components/notifications/notificationBox";
import { LanguageKey } from "brancy/i18n";
import { t } from "i18next";
import { config } from "process";
import { SubInvoiceStatus } from "brancy/models/enums";

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
  const [balanceHistorySeries, setBalanceHistorySeries] = useState<IWallentBalanceHistoryGraph[]>([]);

  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  useEffect(() => {
    if (!session || session.user.currentIndex === -1) return;
    const fetchBalanceHistory = async () => {
      const response = await clientFetchApi<null, IWalletBalanceHistoryResponse[]>("/api/wallet/getBallanceHistory", {
        session,
      });
      if (response.succeeded) {
        console.log("Balance history response:", response.value);
        handleCastWallentBalanceHistory(response.value);
      } else notify(response.info.responseType, NotifType.Warning);
    };

    fetchBalanceHistory();
  }, [session]);
  const handleCastWallentBalanceHistory = (data: IWalletBalanceHistoryResponse[]) => {
    const statusMap: Partial<Record<SubInvoiceStatus, { id: string; name: string }>> = {
      [SubInvoiceStatus.None]: { id: "Statistics-Unsettled", name: t("Unsettled") },
      [SubInvoiceStatus.Settled]: { id: "Statistics-Settled", name: t("Settled") },
      [SubInvoiceStatus.Failed]: { id: "Statistics-Failed", name: t("Failed") },
    };

    const series: IWallentBalanceHistoryGraph[] = data
      .filter((item) => statusMap[item.status] !== undefined)
      .map((item) => {
        const mapped = statusMap[item.status]!;
        return {
          id: mapped.id,
          name: mapped.name,
          data: item.statistics,
        };
      });

    setBalanceHistorySeries(series);
  };
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
        {
          <main>
            {/* آمار تجمیعی تراکنش */}

            {balanceHistorySeries.map((item) => (
              <div className={styles.pinContainer1}>
                <div className="bigcard">
                  <div key={item.id} className="headerChild">
                    <div className="circle"></div>
                    <div className="Title"> {item.name} </div>
                  </div>
                  <div className={styles.section3}>
                    <div className={styles.totalchart}>
                      <MultiChart
                        id={item.id}
                        name={item.name}
                        allowShowAll={true}
                        showAverage={true}
                        seriesData={
                          Array.isArray(item.data) && item.data.length > 0
                            ? [
                                {
                                  id: item.id,
                                  name: item.name,
                                  data: item.data as IMonthGraph[],
                                },
                              ]
                            : []
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
          </main>
        }
      </>
    )
  );
};

export default Statistics;
