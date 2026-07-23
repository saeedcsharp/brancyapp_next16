import { useTranslation } from "react-i18next";
import MultiChart from "brancy/components/design/chart/Chart_month";
import { IWallentBalanceHistoryGraph, IMonthGraph } from "brancy/models/interfaces";
import styles from "./ballanceHistory.module.css";
export default function BallanceHistory({
  balanceHistorySeries,
}: {
  balanceHistorySeries: IWallentBalanceHistoryGraph[];
}) {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
}
