import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import BallanceHistory from "brancy/components/wallet/ballanceHistory";
import GeneralBalance from "brancy/components/wallet/generalBallance";
import InboxContainer from "brancy/components/wallet/inboxContainer";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { packageStatus } from "brancy/helper/loadingStatus";
import { SubInvoiceStatus } from "brancy/models/enums";
import {
  IBankCard,
  IGeneralBallance,
  IWallentBalanceHistoryGraph,
  IWalletBalanceHistoryResponse,
} from "brancy/models/interfaces";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Statistics = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  // وضعیت‌های نمایشی
  const [generalBalance, setGeneralBalance] = useState<IGeneralBallance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generalBalanceLoading, setGeneralBalanceLoading] = useState<boolean>(false);
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
  const fetchGeneralBalance = async (from = 0) => {
    setGeneralBalanceLoading(true);
    try {
      const response = await clientFetchApi<null, IGeneralBallance[]>("/api/wallet/getGenerallBallance", {
        session,
        methodType: MethodType.get,
        queries: [
          { key: "from", value: from.toString() },
          { key: "end", value: Date.now().toString() },
        ],
      });
      if (response.succeeded) {
        console.log("General balance response:", response.value);
        setGeneralBalance(response.value);
      } else notify(response.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setGeneralBalanceLoading(false);
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
            <InboxContainer generalBalance={generalBalance} cards={cards} />
            {/* آمار تجمیعی تراکنش */}
            <BallanceHistory balanceHistorySeries={balanceHistorySeries} />
            {/* تاریخچه تراکنش‌ها */}
            <GeneralBalance
              generalBalance={generalBalance}
              cards={cards}
              loading={generalBalanceLoading}
              onFromDateChange={fetchGeneralBalance}
            />
          </main>
        )}
      </>
    )
  );
};

export default Statistics;
