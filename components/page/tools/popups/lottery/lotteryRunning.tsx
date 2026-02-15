import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { IFullLottery } from "saeed/models/page/tools/tools";
import ConstantCounterDown from "../../../../design/counterDown/constantCounterDown";
import styles from "./lotteryRunning.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const LotteryRunning = (props: {
  removeMask: () => void;
  handleBachFromLotteryRunning: () => void;
  isNewLottery: boolean;
  lotteryId: string;
  handleViewAndDetails: (lotteryId: string) => void;
  handleShowShareTerms: (backgroundUrl: string, lotteryId: string) => void;
  handleShowDeleteLottery: (lotteryId: string) => void;
  // handleShareRemainingTime:()=>void;
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [fullLottery, setFullLottery] = useState<IFullLottery>();
  async function fetchData() {
    try {
      var res = await clientFetchApi<boolean, IFullLottery>("/api/lottery/GetFullLottery", { methodType: MethodType.get, session: session, data: null, queries: [
          {
            key: "id",
            value: props.lotteryId.toString(),
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setLoading(false);
        setFullLottery(res.value);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
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
      {!loading && fullLottery && (
        <>
          <div className={styles.header}>{t(LanguageKey.pageLottery_Winnerpickerisrunning)}</div>
          <div className={styles.winnerId}>
            #{fullLottery.id}
            <ConstantCounterDown
              unixTime={fullLottery.startTime !== null ? fullLottery.startTime * 1000 : 0}
              classNamewrapper={"countdownWrapperWinnerPicker"}
              colorSvg="var(--text-h1)"
              colorTimeTitle="var(--text-h1)"
            />
          </div>
          <div className={styles.winnerPickerRunningContainer}>
            <button onClick={() => props.handleViewAndDetails(fullLottery.id)} className="cancelButton">
              {t(LanguageKey.pageLottery_ViewandEditDetails)}
            </button>
            <button
              disabled={fullLottery.lotteryTerms?.publishStory || false}
              onClick={() => props.handleShowShareTerms(fullLottery.lotteryTerms?.bannerUrl || "", fullLottery.id)}
              className={fullLottery.lotteryTerms?.publishStory ? "disableButton" : "cancelButton"}>
              {t(LanguageKey.ShareTermsAndCondition)}
            </button>
            {/* <button
                disabled={fullLottery.termsBanner ? false : true}
                onClick={() =>
                  props.handleShowRemainingTime({
                    backgroundUrl: fullLottery.termsBanner!.backgroundUrl,
                    timeUnix: fullLottery.timeUnix,
                    lotteryId: fullLottery.lotteryId,
                    boxColor: fullLottery.termsBanner!.boxColor,
                    boxOpacity: fullLottery.termsBanner!.boxOpacity,
                    textColor: fullLottery.termsBanner!.textColor,
                    textOpacity: fullLottery.termsBanner!.textOpacity,
                  })
                }
                className={
                  fullLottery.termsBanner ? "cancelButton" : "disableButton"
                }
              >
                {t(LanguageKey.pageLottery_ShareRemainingTime)}
              </button> */}
          </div>
          <div className="ButtonContainer">
            <div onClick={() => props.handleShowDeleteLottery(fullLottery.id)} className="stopButton">
              {t(LanguageKey.abort)}
            </div>
            <button onClick={props.removeMask} className={"cancelButton"}>
              {t(LanguageKey.close)}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default LotteryRunning;
