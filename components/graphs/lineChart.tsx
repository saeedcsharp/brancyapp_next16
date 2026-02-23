import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { renderToStaticMarkup } from "react-dom/server";
// import styles from "brancy/components/advertise/statistics/statistics.module.css";

import {
  DayCountUnix,
  HourCountUnix,
  IMonthGraph,
  chartxType,
} from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const LineChart = (props: {
  chartId: string;
  items: IMonthGraph[] | DayCountUnix[] | HourCountUnix[];
  chartxType: chartxType;
  anonation?: ApexOptions["annotations"];
  maxY?: number;
  maxX?: number;
  minX?: number;
  minY?: number;
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + "m";
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + "k";
    }
    return num.toString();
  };
  console.log("chart item Type", props.items as IMonthGraph[]);

  const ChartInfo: { options: ApexOptions } = {
    options: {
      series:
        props.chartxType == chartxType.month
          ? [
              {
                name: "series-1",
                data: (props.items[0] as IMonthGraph).dayList.map((item) => ({
                  x: item.createdTime * 1000,
                  y: item.count,
                })),
              },
              {
                name: "series-2",
                data: (props.items[1] as IMonthGraph).dayList.map((item) => ({
                  x: item.createdTime * 1000,
                  y: item.count,
                })),
              },
            ]
          : props.chartxType == chartxType.day
            ? [
                {
                  name: "series-1",
                  data: (props.items as DayCountUnix[]).map((item) => ({
                    x: item.createdTime * 1000,
                    y: item.count,
                  })),
                },
              ]
            : [
                {
                  name: "series-1",
                  data: (props.items as HourCountUnix[]).map((item) => ({
                    x: item.relationHour,
                    y: item.count,
                  })),
                },
              ],
      chart: {
        id: props.chartId,
        type: "line",
        stacked: false,
        toolbar: {
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["var(--color-dark-blue)"],
      stroke: {
        curve: "smooth",
        width: 1,
      },

      xaxis: {
        tickAmount: 12,
        type: props.chartxType != chartxType.hour ? "datetime" : "numeric",
        axisBorder: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        labels: {
          style: {
            fontWeight: "var(--weight-600)",
            colors: ["var(--text-h2)"],
            fontSize: "var(--font-12)",
          },

          format: "d",
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        tickAmount: 5,
        floating: false,
        labels: {
          style: {
            fontWeight: "var(--weight-600)",
            colors: ["var(--text-h2)"],
            fontSize: "var(--font-12)",
          },
          offsetY: 0,
          offsetX: -15,
          formatter: (n) => {
            return formatNumber(n);
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 0.5,
          gradientToColors: ["var(--color-white)"],
        },
      },
      tooltip: {
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },
        followCursor: true,

        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          var data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
          if (props.chartxType != chartxType.hour) {
            const time = new Date(data.x);
            let a = renderToStaticMarkup(
              <div
                className="tooltip"
                style={{
                  backgroundColor: "var(--color-white)",
                  color: "var(--text-h2)",
                  border: "0px",
                  fontSize: "var(--font-12)",
                  padding: "var(--padding-5)",
                  boxSizing: "border-box",
                  borderRadius: "var(--br8)",
                }}>
                <div style={{ fontWeight: "var(--weight-700)" }}>
                  {Math.round(data.y).toLocaleString()}

                  <div style={{ fontWeight: "var(--weight-500)" }}>
                    {time.getDate() + " " + time.toLocaleString("en-US", { month: "long" })}{" "}
                  </div>
                </div>
              </div>,
            );
            return a;
          } else {
            let a = renderToStaticMarkup(
              <div
                className="tooltip"
                style={{
                  backgroundColor: "var(--color-white)",
                  color: "var(--text-h2)",
                  border: "0px",
                  fontSize: "var(--font-12)",
                  padding: "var(--padding-5)",
                  boxSizing: "border-box",
                  borderRadius: "var(--br8)",
                }}>
                <div style={{ fontWeight: "var(--weight-700)" }}>
                  {Math.round(data.y).toLocaleString()}

                  <div style={{ fontWeight: "var(--weight-500)" }}>{data.x + " "} </div>
                </div>
              </div>,
            );
            return a;
          }
        },
      },
      grid: {
        yaxis: {
          lines: { show: true },
        },
        xaxis: {
          lines: { show: true },
        },
        strokeDashArray: 1,
        borderColor: "var(--color-gray30)",
        padding: {
          left: -5,
          top: -20,
          bottom: -30,
        },
      },
    },
  };
  if (props.anonation) {
    ChartInfo.options.annotations = props.anonation;
  }
  if (props.maxX && ChartInfo.options.xaxis) ChartInfo.options.xaxis.max = props.maxX;
  if (props.minX && ChartInfo.options.xaxis) ChartInfo.options.xaxis.min = props.minX;
  if (props.maxY && ChartInfo.options.yaxis)
    (ChartInfo.options.yaxis as { max?: number; min?: number }).max = props.maxY;
  if (props.minY && ChartInfo.options.yaxis)
    (ChartInfo.options.yaxis as { max?: number; min?: number }).min = props.minY;
  return (
    <div className="app" style={{ width: "100%" }}>
      {/* <div className={styles.chart}> */}
      <Chart
        options={ChartInfo.options}
        series={ChartInfo.options.series}
        type="area"
        key={props.chartId}
        height="100%"
        width="100%"
      />
    </div>
  );
};
export default LineChart;
