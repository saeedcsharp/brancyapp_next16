import MultiChart from "brancy/components/design/chart/Chart_month";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import PriceFormater from "brancy/components/priceFormater";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { packageStatus } from "brancy/helper/loadingStatus";
import { PriceFormaterClassName, SubInvoiceStatus } from "brancy/models/enums";
import {
  IBankCard,
  IGeneralBalance,
  IMonthGraph,
  IWallentBalanceHistoryGraph,
  IWalletBalanceHistoryResponse,
} from "brancy/models/interfaces";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./statistics.module.css";
import Loading from "brancy/components/notOk/loading";
import BankCard from "brancy/components/wallet/bankCard";

const Statistics = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  // وضعیت‌های نمایشی
  const [generalBalance, setGeneralBalance] = useState<IGeneralBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [balanceHistorySeries, setBalanceHistorySeries] = useState<IWallentBalanceHistoryGraph[]>([]);
  const [cards, setCards] = useState<IBankCard[]>([]);
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  useEffect(() => {
    if (!session || session.user.currentIndex === -1) return;
    fetchBalanceHistory();
    fetchGeneralBalance();
    fetchCards();
    setLoading(false);
  }, [session]);
  const fetchGeneralBalance = async () => {
    try {
      const response = await clientFetchApi<null, IGeneralBalance[]>("/api/wallet/getGenerallBallance", {
        session,
        methodType: MethodType.get,
        queries: [
          { key: "from", value: "0" },
          { key: "end", value: Date.now().toString() },
        ],
      });
      if (response.succeeded) {
        console.log("General balance response:", response.value);
        setGeneralBalance(response.value);
      } else notify(response.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  };
  const fetchBalanceHistory = async () => {
    try {
      const response = await clientFetchApi<null, IWalletBalanceHistoryResponse[]>("/api/wallet/getBallanceHistory", {
        session,
      });
      if (response.succeeded) {
        console.log("Balance history response:", response.value);
        handleCastWallentBalanceHistory(response.value);
      } else notify(response.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  };
  async function fetchCards() {
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
    }
  }
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
        {loading && <Loading />}
        {!loading && (
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
                {/* <div className={styles.section4}>
                  <div className={styles.sorting}>
                    <div className={styles.calendar}>از تاریخ</div>
                    <div className={styles.calendar}>تا تاریخ</div>
                  </div>
                </div> */}
                <div className={styles.section5}>
                  <div className={styles.table}>
                    <div className={styles.tableheader}>
                      <div className={styles.header1}>#</div>
                      <div className={styles.header3}>{t("Card Number")}</div>
                      <div className={styles.header8}>{t("bank name")}</div>
                      <div className={styles.header5}>{t("Price")}</div>
                      <div className={styles.header6}>{t("Status")}</div>
                    </div>
                    {generalBalance.map((item, i) => (
                      <div key={i} className={styles.tableheader1}>
                        <div className={styles.tablecounter}>{i}</div>
                        <div className={styles.orcernumber}>{item.cardNumber}</div>
                        <div className={styles.share}>
                          {cards.find((card) => card.cardNumber === item.cardNumber)?.bankName ?? ""}
                        </div>
                        <div className={styles.viwes}>
                          {
                            <PriceFormater
                              pricetype={item.priceType}
                              fee={item.totalPrice}
                              className={PriceFormaterClassName.PostPrice}
                            />
                          }
                        </div>
                        <div className={styles.confirmedstatus}>
                          {item.status === SubInvoiceStatus.Settled
                            ? t("Settled")
                            : item.status === SubInvoiceStatus.Failed
                              ? t("Failed")
                              : item.status === SubInvoiceStatus.AwaitingSettled
                                ? t("AwaitingSettled")
                                : t("Unsettled")}
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
        )}
      </>
    )
  );
};

export default Statistics;
