import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LineChart from "brancy/components/graphs/lineChart";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import styles from "./priceHistory.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { chartxType } from "brancy/models/enums";
import { DayCountUnix } from "brancy/models/interfaces";

interface PriceHistoryItem {
  subProductId: number;
  createdTime: number;
  stock: number;
  price: number;
  priceType: number;
}

export default function PriceHistory({
  removeMask,
  productId,
  instagramerId,
}: {
  removeMask: () => void;
  productId: string;
  instagramerId: string;
}) {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchData() {
    try {
      const res = await clientFetchApi<boolean, PriceHistoryItem[]>("/api/shop/getPriceHistory", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          { key: "productId", value: productId },
          { key: "instagramerId", value: instagramerId },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setPriceHistory(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "loading") return;
    setLoading(true);
    fetchData();
  }, [status]);

  const chartItems: DayCountUnix[] = priceHistory.map((item) => {
    const d = new Date(item.createdTime * 1000);
    return {
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      createdTime: item.createdTime,
      count: item.price,
    };
  });

  return (
    <>
      <div className="frameParent">
        <div className="headerChild">
          <div className="circle">
            <div className="outerCircle" />
            <div className="innerCircle" />
          </div>
          <div className="Title">{t(LanguageKey.priceHistory)}</div>
        </div>
      </div>
      {loading && <Loading />}
      {!loading && priceHistory.length > 0 && (
        <div className={styles.graph}>
          <LineChart items={chartItems} chartId="priceHistory" chartxType={chartxType.day} />
        </div>
      )}
    </>
  );
}
