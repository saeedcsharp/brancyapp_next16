"use client";

import Link from "next/link";
import styles from "./error.module.css";

export default function NotFound() {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.oops}>
          <h2>OOPS!</h2>
          <h1>404</h1>
          <p>We can't find the page that you're looking for</p>
          <div className={styles.btn}>
            <Link href="/">BACK TO HOME</Link>
          </div>
        </div>
        <svg className={styles.svg1} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1106">
          <g clipPath="url(#a)">
            <path
              d="M-534 1C926.2 1 1211.7 1105 2672 1105c-1452.2.3-1753.8-66.8-3206-66.5m3206 66.5c-1453 .2-1753-170.5-3206-170.3M2672 1105c-1453.8.2-1752.2-274.2-3206-274m3206 274c-1454.6.2-1751.4-378-3206-377.8M2672 1105c-1455.4.2-1750.6-481.7-3206-481.5M2672 1105c-1456.2.1-1749.8-585.4-3206-585.3M2672 1105c-1457 .1-1749-689.1-3206-689m3206 689c-1457.8 0-1748.2-792.8-3206-792.7M2672 1105c-1458.7 0-1747.4-896.6-3206-896.5M2672 1105C1212.6 1105 925.4 104.7-534 104.8"
              strokeWidth="3"
              strokeMiterlimit="10"
              stroke="url(#b)"
            />
          </g>
          <defs>
            <linearGradient id="b" x1="1069" y1="1" x2="1069" y2="1105" gradientUnits="userSpaceOnUse">
              <stop stopColor="#25ce73" />
              <stop offset=".2" stopColor="#00fff7" />
              <stop offset=".3" stopColor="#346aff" />
              <stop offset=".5" stopColor="#f13fff" />
              <stop offset=".7" stopColor="#f96a6f" />
              <stop offset=".9" stopColor="#e47018" />
              <stop offset="1" stopColor="#efbc5b" />
            </linearGradient>
          </defs>
        </svg>
        <svg className={styles.svg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1106">
          <g clipPath="url(#a)">
            <path
              d="M-534 1C926.2 1 1211.7 1105 2672 1105c-1452.2.3-1753.8-66.8-3206-66.5m3206 66.5c-1453 .2-1753-170.5-3206-170.3M2672 1105c-1453.8.2-1752.2-274.2-3206-274m3206 274c-1454.6.2-1751.4-378-3206-377.8M2672 1105c-1455.4.2-1750.6-481.7-3206-481.5M2672 1105c-1456.2.1-1749.8-585.4-3206-585.3M2672 1105c-1457 .1-1749-689.1-3206-689m3206 689c-1457.8 0-1748.2-792.8-3206-792.7M2672 1105c-1458.7 0-1747.4-896.6-3206-896.5M2672 1105C1212.6 1105 925.4 104.7-534 104.8"
              strokeWidth="2"
              strokeMiterlimit="10"
              stroke="url(#b)"
            />
          </g>
          <defs>
            <linearGradient id="b" x1="1069" y1="1" x2="1069" y2="1105" gradientUnits="userSpaceOnUse">
              <stop stopColor="#25ce73" />
              <stop offset=".2" stopColor="#00fff7" />
              <stop offset=".3" stopColor="#346aff" />
              <stop offset=".5" stopColor="#f13fff" />
              <stop offset=".7" stopColor="#f96a6f" />
              <stop offset=".9" stopColor="#e47018" />
              <stop offset="1" stopColor="#efbc5b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}
