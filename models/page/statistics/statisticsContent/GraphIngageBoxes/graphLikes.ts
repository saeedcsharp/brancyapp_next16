export interface GraphLikesModel {
  allLikes: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newLikes: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    likers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}
export interface IShortMonth {
  month: number;
  totalCount: number;
  year: number;
  plusCount: number;
}

export interface IMonthGraph extends IShortMonth {
  lastUpdate(lastUpdate: any): import("react").ReactNode;
  previousPlusCount: undefined;
  dayList: DayCountUnix[];
  users: StatisticsUser[];
}
export interface Figure {
  firstIndex: string;
  secondIndex: string;
  days: DayCountUnix[];
  hours: HourCountUnix[];
}
export interface SuperFigure {
  title: string;
  firstIndexes: string[];
  secondIndexes: string[][];
  figures: Figure[];
}
export interface DayCountUnix {
  day: number;
  month: number;
  year: number;
  createdTime: number;
  count: number;
}
export enum chartxType {
  month,
  day,
  hour,
}
export interface HourCountUnix extends DayCountUnix {
  hourValue: number;
  relationHour: number;
}
export interface StatisticsUser {
  profileUrl: string;
  userName: string;
  fullName: string;
  pk: number;
  createdTime: number;
}
export enum MonthName {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}
export function NumToMonth(value: number): MonthName {
  switch (value % 12) {
    case 1:
      return MonthName.January;
    case 2:
      return MonthName.February;
    case 3:
      return MonthName.March;
    case 4:
      return MonthName.April;
    case 5:
      return MonthName.May;
    case 6:
      return MonthName.June;
    case 7:
      return MonthName.July;
    case 8:
      return MonthName.August;
    case 9:
      return MonthName.September;
    case 10:
      return MonthName.October;
    case 11:
      return MonthName.November;
    case 0:
      return MonthName.December;
    //alaki
    default:
      return MonthName.April;
  }
}
