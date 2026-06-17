import { MonthName } from "brancy/models/enums";

export function calculateSummary(num: number): string {
  let summary: string = "";
  if (num === -1) summary = "--";
  else if (num >= 1000000000) {
    summary =
      (num / 1000000000).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }) + " B";
  } else if (num >= 1000000) {
    summary =
      (num / 1000000).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      }) + " M";
  } else if (num >= 1000) {
    summary = (num / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + " K";
  } else {
    summary = num.toLocaleString();
  }
  return summary;
}
export function numberToFormattedString(number: string | number) {
  if (!Number.isNaN(Number(number))) return Number(number).toLocaleString();
  else return number;
}
export function numberToFormattedString2(number: string | number) {
  if (!Number.isNaN(Number(number))) return number.toLocaleString();
  else return "";
}
export function convertFormatedStringToNumber(input: string): number | null {
  var numberStr = input.replaceAll(",", "");
  const numbersRegex = /^[0-9]+$/;
  var checkNumber = numbersRegex.test(numberStr);
  if (!checkNumber) return null;
  return parseInt(numberStr);
}
export function numbToAmAndPmTime(number: number | undefined): string {
  if (number === undefined) return "";
  var result = "12:00 AM";
  if (number === 0) return result;
  var hour = Math.floor(number / 3600);
  var residual = Math.floor((number % 3600) / 60);
  var minStr: string = residual < 10 ? `0${residual}` : residual.toString();
  // hourStr = hour < 10 || hour - 12 < 10 ? `0${hour}:` : hour.toString() + ":";
  if (hour < 10) {
    result = `0${hour}:` + minStr + " AM";
  } else if (hour < 12) {
    result = `${hour}:` + minStr + " AM";
  } else if (hour === 12) {
    result = `${12}:` + minStr + " PM";
  } else if (hour - 12 < 10) {
    result = `0${hour - 12}:` + minStr + " PM";
  } else {
    result = `${hour - 12}:` + minStr + " PM";
  }
  return result;
}
export function numbTo24HourTime(number: number | undefined): number {
  if (!number) return 0;
  return parseFloat((number / 3600).toFixed(1));
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
