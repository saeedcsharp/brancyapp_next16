import { useSession } from "next-auth/react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import Slider, { SliderSlide } from "saeed/components/design/slider/slider";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { getEnumValue } from "saeed/helper/handleItemTypeEnum";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import {
  FailLotteryStatus,
  FailLotteryStatusStr,
  IShortLotteriesInfo,
  LotteryStatus,
} from "saeed/models/page/tools/tools";
import styles from "./winnerPicker.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const WinnerPicker = (props: {
  handleShowWinnerPickerPopup: (e: MouseEvent) => void;
  showLotteryRunning: (lotteryId: string) => void;
  showWinnersList: (lotteryId: string) => void;
}) => {
  const handleOuterClick = (e: MouseEvent) => {
    props.handleShowWinnerPickerPopup(e);
  };
  const handleInnerClick = (e: MouseEvent, divId: string) => {
    e.stopPropagation();
  };
  const [isHidden, setIsHidden] = useState(false);
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };
  const { t } = useTranslation();
  const { data: session } = useSession();

  // Lottery history state
  const [doneLotteries, setDoneLotteries] = useState<IShortLotteriesInfo>({
    items: [],
    nextMaxId: "",
  });
  const [abortLotteries, setAbortLotteries] = useState<IShortLotteriesInfo>({
    items: [],
    nextMaxId: "",
  });
  const [pendingLotteries, setPendingLotteries] = useState<IShortLotteriesInfo>({
    items: [],
    nextMaxId: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePending, setHasMorePending] = useState(true);
  const [hasMoreDone, setHasMoreDone] = useState(true);
  const [hasMoreAbort, setHasMoreAbort] = useState(true);

  const mergedItems = useMemo(() => {
    const all = [...pendingLotteries.items, ...doneLotteries.items, ...abortLotteries.items];
    return all.sort((a, b) => {
      // Sort by ID descending. Try numeric compare first; fallback to localeCompare numeric.
      const aNum = typeof a.id === "number" ? a.id : parseInt(a.id as any, 10);
      const bNum = typeof b.id === "number" ? b.id : parseInt(b.id as any, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) return bNum - aNum; // higher id first
      return String(b.id).localeCompare(String(a.id), undefined, { numeric: true, sensitivity: "base" });
    });
  }, [pendingLotteries.items, doneLotteries.items, abortLotteries.items]);

  // Check if we have more data to load
  const hasMoreData = hasMorePending || hasMoreDone || hasMoreAbort;

  async function fetchData() {
    try {
      const [doneRes, pendingRes, rejectRes] = await Promise.all([
        clientFetchApi<boolean, IShortLotteriesInfo>("/api/lottery/GetShortLotteries", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "lotteryStatus", value: LotteryStatus.Ended.toString() },
            { key: "nextMaxId", value: "" },
          ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IShortLotteriesInfo>("/api/lottery/GetShortLotteries", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "lotteryStatus", value: LotteryStatus.Upcoming.toString() },
            { key: "nextMaxId", value: "" },
          ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IShortLotteriesInfo>("/api/lottery/GetShortLotteries", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "lotteryStatus", value: LotteryStatus.Failed.toString() },
            { key: "nextMaxId", value: "" },
          ], onUploadProgress: undefined }),
      ]);
      if (doneRes.succeeded) {
        setDoneLotteries({
          items: doneRes.value.items.filter((x) => x.status === LotteryStatus.Ended),
          nextMaxId: doneRes.value.nextMaxId,
        });
        setHasMoreDone(!!doneRes.value.nextMaxId);
      } else notify(doneRes.info.responseType, NotifType.Warning);
      if (pendingRes.succeeded) {
        setPendingLotteries({
          items: pendingRes.value.items.filter((x) => x.status === LotteryStatus.Upcoming),
          nextMaxId: pendingRes.value.nextMaxId,
        });
        setHasMorePending(!!pendingRes.value.nextMaxId);
      } else notify(pendingRes.info.responseType, NotifType.Warning);
      if (rejectRes.succeeded) {
        setAbortLotteries({
          items: rejectRes.value.items.filter((x) => x.status === LotteryStatus.Failed),
          nextMaxId: rejectRes.value.nextMaxId,
        });
        setHasMoreAbort(!!rejectRes.value.nextMaxId);
      } else notify(rejectRes.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreData() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const requests: Array<Promise<any>> = [];
      const applyFns: Array<(value: IShortLotteriesInfo) => void> = [];

      if (hasMorePending && pendingLotteries.nextMaxId) {
        requests.push(
          clientFetchApi<boolean, IShortLotteriesInfo>("/api/lottery/GetShortLotteries", { methodType: MethodType.get, session: session, data: null, queries: [
              { key: "lotteryStatus", value: LotteryStatus.Upcoming.toString() },
              { key: "nextMaxId", value: pendingLotteries.nextMaxId },
            ], onUploadProgress: undefined })
        );
        applyFns.push((value) => {
          const newItems = value.items.filter((x) => x.status === LotteryStatus.Upcoming);
          setPendingLotteries((prev) => ({ items: [...prev.items, ...newItems], nextMaxId: value.nextMaxId }));
          setHasMorePending(!!value.nextMaxId);
        });
      }

      if (hasMoreDone && doneLotteries.nextMaxId) {
        requests.push(
          clientFetchApi<boolean, IShortLotteriesInfo>("/api/lottery/GetShortLotteries", { methodType: MethodType.get, session: session, data: null, queries: [
              { key: "lotteryStatus", value: LotteryStatus.Ended.toString() },
              { key: "nextMaxId", value: doneLotteries.nextMaxId },
            ], onUploadProgress: undefined })
        );
        applyFns.push((value) => {
          const newItems = value.items.filter((x) => x.status === LotteryStatus.Ended);
          setDoneLotteries((prev) => ({ items: [...prev.items, ...newItems], nextMaxId: value.nextMaxId }));
          setHasMoreDone(!!value.nextMaxId);
        });
      }

      if (hasMoreAbort && abortLotteries.nextMaxId) {
        requests.push(
          clientFetchApi<boolean, IShortLotteriesInfo>("/api/lottery/GetShortLotteries", { methodType: MethodType.get, session: session, data: null, queries: [
              { key: "lotteryStatus", value: LotteryStatus.Failed.toString() },
              { key: "nextMaxId", value: abortLotteries.nextMaxId },
            ], onUploadProgress: undefined })
        );
        applyFns.push((value) => {
          const newItems = value.items.filter((x) => x.status === LotteryStatus.Failed);
          setAbortLotteries((prev) => ({ items: [...prev.items, ...newItems], nextMaxId: value.nextMaxId }));
          setHasMoreAbort(!!value.nextMaxId);
        });
      }

      if (requests.length === 0) return;
      const responses = await Promise.all(requests);
      responses.forEach((res, i) => {
        if (res.succeeded) applyFns[i](res.value);
        else notify(res.info.responseType, NotifType.Warning);
      });
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="bigcard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
        <div className="headerChild" onClick={handleCircleClick}>
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.pageTools_WinnerPicker)}</div>
        </div>
        <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
          <div id="score" onClick={handleOuterClick} className={styles.score}>
            <img className={styles.icon} alt="lottery" src="/icon-lottery.svg" />
            <div className={styles.frame}>
              <div className={styles.title}>{t(LanguageKey.pageTools_Lottery)}</div>
              <div className="explain">{t(LanguageKey.pageTools_LotteryExplain)}</div>
            </div>
          </div>
          <div className={styles.lotteryresult}>
            {loading && (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <Loading />
              </div>
            )}

            {!loading && mergedItems.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "var(--text-h2)",
                  fontSize: "var(--font-16)",
                }}>
                {t(LanguageKey.pageTools_emptylotteryList)}
              </div>
            )}

            {!loading && mergedItems.length > 0 && (
              <div className={styles.activeWinnerPickerlist}>
                <Slider
                  itemsPerSlide={6}
                  onReachEnd={hasMoreData && !loadingMore ? loadMoreData : undefined}
                  isLoading={loadingMore && hasMoreData}>
                  {mergedItems.map((v) => (
                    <SliderSlide key={v.id}>
                      <div className={styles.innerContainer}>
                        <div className={styles.winnerInfoContainer}>
                          <div className={styles.winnerTimeContainer}>
                            <img
                              style={{ cursor: "pointer", width: "18px", height: "18px" }}
                              title="ℹ️ order number"
                              src="/adticket.svg"
                            />
                            <div className="title"> #{v.id}</div>
                          </div>

                          <div className={styles.winnerTimeContainer}>
                            <div className="counter">
                              <span className={styles.day}>
                                {new DateObject({
                                  date: v.startTime * 1000,
                                  locale: initialzedTime().locale,
                                  calendar: initialzedTime().calendar,
                                }).format("YYYY/MM/DD")}
                                -
                              </span>
                              <span className={styles.hour}>
                                {new DateObject({
                                  date: v.startTime * 1000,
                                  locale: initialzedTime().locale,
                                  calendar: initialzedTime().calendar,
                                }).format("hh:mm A")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.winnermoreContainer}>
                          <>
                            {v.status === LotteryStatus.Ended && (
                              <div className={styles.success}>{t(LanguageKey.Finished)}</div>
                            )}
                            {v.status === LotteryStatus.Failed && (
                              <div className={styles.error}>
                                {v.failStatus && getEnumValue(FailLotteryStatus, FailLotteryStatusStr, v.failStatus)}
                              </div>
                            )}
                            {v.status === LotteryStatus.Upcoming && (
                              <div className={styles.pending}>{t(LanguageKey.Pending)}</div>
                            )}
                          </>
                          <>
                            {v.status === LotteryStatus.Upcoming && (
                              <div className={styles.arrow} onClick={() => props.showLotteryRunning(v.id)}>
                                <img
                                  style={{ cursor: "pointer", width: "30px", height: "30px" }}
                                  title="ℹ️ more"
                                  src="/3dots.svg"
                                />
                              </div>
                            )}
                            {v.status === LotteryStatus.Ended && (
                              <div className={styles.arrow} onClick={() => props.showWinnersList(v.id)}>
                                <img
                                  style={{ cursor: "pointer", width: "30px", height: "30px" }}
                                  title="ℹ️ more"
                                  src="/3dots.svg"
                                />
                              </div>
                            )}
                            {v.status === LotteryStatus.Failed && <div className={styles.notarrow} />}
                          </>
                        </div>
                      </div>
                    </SliderSlide>
                  ))}
                </Slider>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WinnerPicker;
