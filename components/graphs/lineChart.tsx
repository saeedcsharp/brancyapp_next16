import { chartxType } from "brancy/models/enums";
import { DayCountUnix, HourCountUnix, IMonthGraph } from "brancy/models/interfaces";
import ChartDay, { IChartSeries as IChartSeriesDay } from "brancy/components/design/chart/Chart_day";
import ChartMonth, { IChartSeries as IChartSeriesMonth } from "brancy/components/design/chart/Chart_month";
import HourLineChart from "brancy/components/design/chart/hourLineChart";

export const LineChart = (props: {
  chartId: string;
  items: IMonthGraph[] | DayCountUnix[] | HourCountUnix[];
  chartxType: chartxType;
  maxY?: number;
  maxX?: number;
  minX?: number;
  minY?: number;
}) => {
  if (props.chartxType === chartxType.month) {
    const monthItems = props.items as IMonthGraph[];
    const seriesData: IChartSeriesMonth[] = monthItems.map((item, i) => ({
      id: String(i),
      name: `series-${i + 1}`,
      data: [item],
    }));
    return <ChartMonth id={props.chartId} name={props.chartId} seriesData={seriesData} />;
  }

  if (props.chartxType === chartxType.day) {
    const dayItems = props.items as DayCountUnix[];
    const fakeMonth: IMonthGraph = {
      month: dayItems[0]?.month ?? 0,
      year: dayItems[0]?.year ?? 0,
      totalCount: 0,
      plusCount: 0,
      lastUpdate: null,
      previousPlusCount: undefined,
      dayList: dayItems,
      users: [],
    };
    const seriesData: IChartSeriesDay[] = [{ id: "0", name: "series-1", data: [fakeMonth] }];
    return <ChartDay id={props.chartId} name={props.chartId} seriesData={seriesData} />;
  }

  // chartxType.hour
  const hourItems = (props.items as HourCountUnix[]).map((item) => ({
    hourValue: item.hourValue,
    count: item.count,
  }));
  return <HourLineChart items={hourItems} minY={props.minY} maxY={props.maxY} />;
};
export default LineChart;
