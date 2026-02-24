import { useSession } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import initialzedTime, { convertToMilliseconds } from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { IFullLottery } from "brancy/models/page/tools/tools";
import styles from "./winnersList.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const WinnersList = (props: { removeMask: () => void; lotteryId: string; handleBackToLotteryHistory: () => void }) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [fullLottery, setFullLottery] = useState<IFullLottery>();
  const [loading, setLoading] = useState(true);
  async function shareBanner() {
    try {
      var res = await clientFetchApi<boolean, IFullLottery>("/api/lottery/PublishBanner", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          {
            key: "lotteryId",
            value: fullLottery!.id,
          },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        internalNotify(InternalResponseType.Ok, NotifType.Success, ", Banner is stored successfully");
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      props.removeMask();
    }
  }
  async function fetchData() {
    try {
      var res = await clientFetchApi<boolean, IFullLottery>("/api/lottery/GetFullLottery", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          {
            key: "id",
            value: props.lotteryId.toString(),
          },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setFullLottery(res.value);
        setLoading(false);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className={styles.winnerId}>
            <div className={styles.type}>{t(LanguageKey.pageLottery_scoreLotteryWinners)}</div>
            <div> {fullLottery!?.id}</div>
            <div className={styles.date}>
              {new DateObject({
                date: convertToMilliseconds(fullLottery!.startTime),
                locale: initialzedTime().locale,
                calendar: initialzedTime().calendar,
              }).format("YYYY/MM/DD")}
              -
              {new DateObject({
                date: convertToMilliseconds(fullLottery!.startTime),
                locale: initialzedTime().locale,
                calendar: initialzedTime().calendar,
              }).format("hh:mm A")}
            </div>
          </div>
          {
            <div className={`${styles.winnersContainer} translate`}>
              {fullLottery!.winners.map((v) => (
                <>
                  <div className={styles.winner} key={v.lotteryId}>
                    <div className={styles.winnerCount}>
                      {fullLottery!.winners && fullLottery!.winners.indexOf(v) + 1}
                    </div>

                    <img className={styles.profileImage} src={basePictureUrl + v.profileUrl} />
                    <div className={styles.winnerInfo}>
                      <div className={styles.fullName}>{v.fullName}</div>
                      <div className={styles.username}>@{v.username}</div>
                    </div>
                  </div>
                </>
              ))}
            </div>
          }

          <div className="headerandinput">
            <div className="ButtonContainer">
              <button
                disabled={fullLottery!.lotteryBanner?.publishStory}
                onClick={shareBanner}
                className={fullLottery!.lotteryBanner?.publishStory ? "disableButton" : "cancelButton"}>
                {t(LanguageKey.shareStory)}
              </button>
              <a
                href={
                  basePictureUrl && fullLottery!.exportCommentUrl
                    ? basePictureUrl + fullLottery!.exportCommentUrl + "/download"
                    : ""
                }
                className={"cancelButton"}>
                {t(LanguageKey.exportXlxs)}
              </a>
            </div>
            <div className="ButtonContainer">
              <button onClick={props.removeMask} className={"cancelButton"}>
                {t(LanguageKey.close)}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default WinnersList;
