import { useState } from "react";
import EmptyPopupState from "brancy/components/EmptyPopupState";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime, { convertToMilliseconds } from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { IFullLottery } from "brancy/models/interfaces";
import styles from "./lotteryPopup.module.css";

const basePictureUrl = getClientMediaBaseUrl();

interface LotteryPopupProps {
  lotteries: IFullLottery[];
  removeMask: () => void;
}

const formatLotteryDate = (timestamp: number) =>
  new DateObject({
    date: convertToMilliseconds(timestamp),
    locale: initialzedTime().locale,
    calendar: initialzedTime().calendar,
  }).format("YYYY/MM/DD - hh:mm A");

const LotteryPopup = ({ lotteries, removeMask }: LotteryPopupProps) => {
  const { t } = useTranslation();
  const [selectedLottery, setSelectedLottery] = useState<IFullLottery | null>(null);
  const visibleLotteries = lotteries.slice(0, 5);

  if (selectedLottery) {
    return (
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <button type="button" className={styles.backButton} onClick={() => setSelectedLottery(null)}>
            {t(LanguageKey.back)}
          </button>
          <span>Lottery</span>
          <span>#{selectedLottery.id}</span>
        </div>
        <div className={styles.detailMeta}>{formatLotteryDate(selectedLottery.startTime)}</div>
        <div className={styles.winnersContainer}>
          {selectedLottery.winners.length > 0 ? (
            selectedLottery.winners.map((winner, index) => (
              <div className={styles.winner} key={`${winner.lotteryId}-${winner.username}`}>
                <div className={styles.winnerCount}>{index + 1}</div>
                <img className={styles.profileImage} src={basePictureUrl + winner.profileUrl} alt={winner.username} />
                <div className={styles.winnerInfo}>
                  <div className={styles.fullName}>{winner.fullName}</div>
                  <div className={styles.username}>@{winner.username}</div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>{t(LanguageKey.pageLottery_NoWinners)}</div>
          )}
        </div>
        <button type="button" className={styles.closeButton} onClick={removeMask}>
          {t(LanguageKey.close)}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="frameParent">
        <div className="headerChild" title={t(LanguageKey.Lottery)}>
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.Lottery)}</div>
        </div>
      </div>
      {visibleLotteries.length === 0 ? (
        <EmptyPopupState label={t(LanguageKey.pageTools_emptylotteryList)} />
      ) : (
        <div className={styles.lotteryList}>
          {visibleLotteries.map((lottery) => (
            <button
              type="button"
              className={styles.lotteryItem}
              key={lottery.id}
              onClick={() => setSelectedLottery(lottery)}>
              <img className={styles.lotteryIcon} src="/adticket.svg" alt="Lottery" />
              <div className={styles.lotteryInfo}>
                <strong>#{lottery.id}</strong>
                <span>{formatLotteryDate(lottery.startTime)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <button type="button" className={styles.closeButton} onClick={removeMask}>
        {t(LanguageKey.close)}
      </button>
    </>
  );
};

export default LotteryPopup;
