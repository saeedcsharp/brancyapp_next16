"use client";

import Link from "next/link";
import styles from "./error.module.css";

export default function Unauthorized() {
  return (
    <div className={styles.room}>
      <div className={styles.cuboid}>
        <div className={styles.side}></div>
        <div className={styles.side}></div>
        <div className={styles.side}></div>
      </div>

      <div className={styles.oops}>
        <h2>Unauthorized!</h2>
        <p>You are not authorized to view this page.Please login to continue.</p>
      </div>

      <div className={styles.centerLine}>
        <div className={styles.hole}>
          <div className={styles.ladderShadow}></div>

          <div className={styles.ladder}></div>
        </div>

        <div className={styles.four}>4</div>

        <div className={styles.four}>1</div>

        <div className={styles.btn}>
          <Link href="/">BACK TO HOME</Link>
        </div>
      </div>
    </div>
  );
}
