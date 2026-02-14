import { PriceType } from "saeed/components/priceFormater";

export default function priceFormatter(type: PriceType) {
  return (value: number) => {
    switch (type) {
      case PriceType.Dollar:
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      case PriceType.Euro:
        return new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      case PriceType.Pound:
        return new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: "GBP",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      case PriceType.Toman:
        // تبدیل ریال به تومان و فرمت دستی بدون گرد کردن
        const toman = value.toLocaleString("fa-IR");
        return toman + " تومان";
      default:
        return value.toString();
    }
  };
}
