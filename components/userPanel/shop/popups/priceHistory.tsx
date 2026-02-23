import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import LineChart from "brancy/components/graphs/lineChart";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { chartxType, SuperFigure } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import styles from "brancy/components/userPanel/shop/popups/priceHistory.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
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
  const { data: session } = useSession();
  const [indexValue, setIndexValue] = useState<number>(0);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [priceHistory, setPriceHistory] = useState<SuperFigure>({
    figures: [],
    firstIndexes: [],
    secondIndexes: [],
    title: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const handleGetsuperFigurIndex = (superFigur: SuperFigure, firstIndex: number): number => {
    const firstIndexStr = superFigur.firstIndexes[firstIndex];
    for (let i = 0; i < superFigur.figures.length; i++) {
      if (superFigur.figures[i].firstIndex == firstIndexStr) {
        return i;
      }
    }
    return 0;
  };
  async function fetchData() {
    try {
      const res = await clientFetchApi<boolean, SuperFigure>("/api/shop/GetPriceHistory", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "productId", value: productId },
          { key: "instagramerId", value: instagramerId },
        ], onUploadProgress: undefined });
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
    fetchData();
  }, []);
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
      {!loading && priceHistory.figures.length > 0 && (
        <>
          <div className="headerparent">
            <div style={{ maxWidth: "300px", width: "100%" }}>
              <DragDrop
                data={priceHistory.firstIndexes.map((v, i) => (
                  <div key={i} id={i.toString()}>
                    {v.split("\r\n").map((x, j) => (
                      <span key={j}>
                        {x}
                        {j < v.split("\r\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                ))}
                handleOptionSelect={(selectedId: string) => {
                  const selectedIndex = parseInt(selectedId);
                  setIndexValue(selectedIndex);
                  setRefresh(!refresh);
                }}
                item={indexValue}
                isRefresh={refresh}
              />
            </div>
          </div>
          <div className={styles.graph}>
            {priceHistory.figures.length > 0 && (
              <LineChart
                items={
                  priceHistory.figures[handleGetsuperFigurIndex(priceHistory, indexValue)].days ??
                  priceHistory.figures[handleGetsuperFigurIndex(priceHistory, indexValue)].hours
                }
                chartId={priceHistory.title}
                chartxType={
                  priceHistory.figures[handleGetsuperFigurIndex(priceHistory, indexValue)].days != null
                    ? chartxType.day
                    : chartxType.hour
                }
                key={1}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
