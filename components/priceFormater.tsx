import { useState } from "react";
import { numberToFormattedString } from "brancy/helper/numberFormater";
import styles from "./price.module.css";

export enum PriceType {
  Dollar = 0,
  Euro = 1,
  Toman = 2,
  Pound = 3,
}

export enum PriceFormaterClassName {
  PostPrice = "postprice",
  PostPriceRed = "postpricered",
  PostPriceBlue = "postpriceblue",
}

const specifyPriceType = (type: PriceType) => {
  switch (type) {
    // case PriceType.Rial:
    //   return (
    //     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 12 11">
    //       <path d="M3.6 1.4c0-.5 1.2-.5 1.2 0v6.2q0 .7-.3 1.3l-.8.8q-.5.3-1.2.3h-.3q-1 0-1.6-.7T0 7.6V6c0-.4 1-.5 1 0v1.7q0 .6.2.9l.8.2h.5q.5 0 .8-.2t.3-.8zm6.4 4q0 .8-.4 1.2T8.5 7H6.9q-.7 0-1-.4t-.4-1.2v-5c0-.5 1-.5 1 0v5.4l.3.1H9l.1-.3V4.2c0-.8 1-.8 1 0zm2 .5v2.5q0 .8-.3 1.5-.2.5-.7.8t-1.2.3H8c-.8 0-.8-1.2 0-1.2h2q.4 0 .6-.3l.2-.8V6c0-.5 1.2-.5 1.2 0M9 7.7c.5 0 .5 1.2 0 1.2H6.5C6 9 6 7.7 6.5 7.7z" />
    //     </svg>
    //   );
    case PriceType.Toman:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 12 12">
          <path d="m1.8 9 .1.5v.6h-.4q-.8 0-1.1-.4-.4-.3-.4-1V6c0-.8 1.2-.3 1.2 0v2.7l.1.2.3.1zm-.1 0h.2l.1-.3v-.1q0-.8.5-1.2T3.7 7t1.3.4.4 1.2T5 9.8t-1.3.4h-.6l-.5-.3-.4.2-.5.1h-.3V9zm2.5-.4q0-.6-.5-.5t-.5.5l.1.3.4.2.4-.1zM10 9v1.2h-.6q0 .9-.7 1.3t-1.5.5H6c-.5 0-.4-1.2 0-1.2h1.4l.6-.1.2-.5h-.5q-.9 0-1.3-.3Q6 9.5 6 8.7q0-.5.2-.8l.6-.6q.4-.3 1-.3t1.2.5q.4.4.4 1.3V9zm-2.8-.3.1.3h.9v-.3l-.1-.4-.4-.2q-.3 0-.4.2zm4.8 0q0 .8-.5 1.1t-1.1.4h-.8l-.1-.6V9h1.1l.2-.3V7.5c0-.4 1.2-.4 1.2 0zm-.5-3.1c.7 0 .7 1 0 1H9.1c-.6 0-.6-1 0-1zM2.8 0q-.6 0-.7.7t.7.8q.7-.1.8-.8-.1-.6-.8-.7 M4.8 4.7q.5-.6.5-1.5V1S4 0 4 1v2.2q0 .5-.2.7-.3.3-1 .3h-.5L1.9 4l-.5-.4-.2-.6q0-.7.4-1.5c.4-.4-.6-1-1-.4a5 5 0 0 0-.6 2q0 .7.3 1.3.4.5 1 .7.5.3 1 .2H3l1-.1z" />
        </svg>
      );
    case PriceType.Dollar:
      return "$";
    case PriceType.Euro:
      return "€";
    case PriceType.Pound:
      return "£";
    default:
      return "";
  }
};

const PriceFormater = (props: {
  pricetype: PriceType;
  fee: number;
  className: PriceFormaterClassName;
  style?: React.CSSProperties;
}) => {
  const [, set] = useState();
  return (
    <div className={`${styles.currency} translate`} style={props.style}>
      <div className={styles[props.className]}>
        {numberToFormattedString(props.fee)}
        <div className={styles.symbol}>{specifyPriceType(props.pricetype)}</div>
      </div>
    </div>
  );
};

export default PriceFormater;
