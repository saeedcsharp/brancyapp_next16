import { IBankCard } from "brancy/models/interfaces";
import styles from "./bankCard.module.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
type BankCardProps = {
  card: IBankCard;
  onSelectCard?: (bamckCrd: string) => void;
};
export default function BankCard({ card, onSelectCard }: BankCardProps) {
  const { t } = useTranslation();

  return (
    <article onClick={() => onSelectCard?.(card.cardNumber)} className={styles.bankCard}>
      <div className={styles.bankCardHeader}>
        <div className={styles.bankName}>{card.bankName}</div>
        <div className={styles.badges}>
          {card.isDefault && <span className={styles.defaultBadge}>{t("Default")}</span>}
          {!card.isActive && <span className={styles.suspendedBadge}>{t("Suspended")}</span>}
        </div>
      </div>
      <div className={styles.cardNumber}>{maskCard(card.cardNumber)}</div>
      <div className={styles.bankCardFooter}>
        <span className={styles.holder}>{card.accountHolderName}</span>
      </div>
    </article>
  );
}
function maskCard(s: string) {
  if (!s) return "---- ---- ---- ----";
  const cleaned = s.replace(/\s+/g, "");
  if (cleaned.length < 4) return s;
  const last = cleaned.slice(-4);
  return "**** **** **** " + last;
}
