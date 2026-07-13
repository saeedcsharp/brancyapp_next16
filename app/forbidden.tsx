"use client";

import Link from "next/link";
import styles from "./error.module.css";

export default function Forbidden() {
  return (
    <div className={styles.room}>
      <div className={styles.cuboid}>
        <div className={styles.side}></div>
        <div className={styles.side}></div>
        <div className={styles.side}></div>
      </div>

      <div className={styles.oops}>
        <h2>Forbidden!</h2>
        <p>You don't have permission to view this page.Go back in initial page, is better! </p>
      </div>

      <div className={styles.centerLine}>
        <div className={styles.hole}>
          <div className={styles.ladderShadow}></div>

          <div className={styles.ladder}></div>
        </div>

        <div className={styles.four}>4</div>

        <div className={styles.four}>3</div>

        <div className={styles.btn}>
          <Link href="/">BACK TO HOME</Link>
        </div>
      </div>
    </div>
  );
}
