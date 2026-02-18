import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import RingLoader from "saeed/components/design/loader/ringLoder";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "saeed/components/design/toggleButton/types";
import Loading from "saeed/components/notOk/loading";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { getEnumValue } from "saeed/helper/handleItemTypeEnum";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/api";
import {
  FailLotteryStatus,
  FailLotteryStatusStr,
  IShortLotteriesInfo,
  LotteryStatus,
} from "saeed/models/page/tools/tools";
import styles from "./lotteryHistory.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const LotteryHistory = (props: {
  removeMask: () => void;
  lotteryId: string | null;
  showWinnersList: (lotteryId: string) => void;
  setWinnerPickerStatus: (status: LotteryStatus) => void;
  showLotteryRunning: (lotteryId: string) => void;
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
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
  const [toggleValue, setToggleValue] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const listContainerRef = useRef<HTMLDivElement>(null);
  async function fetchData() {
    try {
      var [doneRes, pendingRes, rejectRes] = await Promise.all([
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
        // const id = res.value.items.find((x) => x.id === props.lotteryId);
        // if (id) setToggleValue(ToggleOrder.SecondToggle);
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

    console.log("loadMoreData called, toggleValue:", toggleValue);
    console.log("hasMorePending:", hasMorePending, "pendingLotteries.nextMaxId:", pendingLotteries.nextMaxId);
    console.log("hasMoreDone:", hasMoreDone, "doneLotteries.nextMaxId:", doneLotteries.nextMaxId);
    console.log("hasMoreAbort:", hasMoreAbort, "abortLotteries.nextMaxId:", abortLotteries.nextMaxId);

    setLoadingMore(true);
    try {
      let nextMaxId = "";
      let lotteryStatus: LotteryStatus;

      // Determine which tab is active and get the appropriate nextMaxId
      if (toggleValue === ToggleOrder.FirstToggle) {
        if (!hasMorePending || !pendingLotteries.nextMaxId) {
          console.log("No more pending data to load");
          setLoadingMore(false);
          return;
        }
        nextMaxId = pendingLotteries.nextMaxId;
        lotteryStatus = LotteryStatus.Upcoming;
      } else if (toggleValue === ToggleOrder.SecondToggle) {
        if (!hasMoreDone || !doneLotteries.nextMaxId) {
          console.log("No more done data to load");
          setLoadingMore(false);
          return;
        }
        nextMaxId = doneLotteries.nextMaxId;
        lotteryStatus = LotteryStatus.Ended;
      } else {
        if (!hasMoreAbort || !abortLotteries.nextMaxId) {
          console.log("No more abort data to load");
          setLoadingMore(false);
          return;
        }
        nextMaxId = abortLotteries.nextMaxId;
        lotteryStatus = LotteryStatus.Failed;
      }

      console.log("Making API call with nextMaxId:", nextMaxId, "lotteryStatus:", lotteryStatus);

      const response = await clientFetchApi<boolean, IShortLotteriesInfo>("/api/lottery/GetShortLotteries", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "lotteryStatus", value: lotteryStatus.toString() },
          { key: "nextMaxId", value: nextMaxId },
        ], onUploadProgress: undefined });

      console.log("API response:", response);

      if (response.succeeded) {
        const newItems = response.value.items.filter((x) => x.status === lotteryStatus);

        console.log("New items received:", newItems.length);

        // Update the appropriate state based on current tab
        if (toggleValue === ToggleOrder.FirstToggle) {
          setPendingLotteries((prev) => ({
            items: [...prev.items, ...newItems],
            nextMaxId: response.value.nextMaxId,
          }));
          setHasMorePending(!!response.value.nextMaxId);
        } else if (toggleValue === ToggleOrder.SecondToggle) {
          setDoneLotteries((prev) => ({
            items: [...prev.items, ...newItems],
            nextMaxId: response.value.nextMaxId,
          }));
          setHasMoreDone(!!response.value.nextMaxId);
        } else {
          setAbortLotteries((prev) => ({
            items: [...prev.items, ...newItems],
            nextMaxId: response.value.nextMaxId,
          }));
          setHasMoreAbort(!!response.value.nextMaxId);
        }
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      console.error("Error in loadMoreData:", error);
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingMore(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const listContainer = listContainerRef.current;
    if (!listContainer) return;

    console.log("Setting up scroll listener, container:", listContainer);
    console.log("Container styles:", {
      height: listContainer.style.height,
      overflow: listContainer.style.overflow,
      scrollHeight: listContainer.scrollHeight,
      clientHeight: listContainer.clientHeight,
    });

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listContainer;
      // console.log("Scroll event:", {
      //   scrollTop,
      //   scrollHeight,
      //   clientHeight,
      //   atBottom: scrollTop + clientHeight >= scrollHeight - 10,
      // });

      // Check if user scrolled to bottom (with 10px threshold)
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        // Check if there's more data to load for current tab
        const hasMore =
          (toggleValue === ToggleOrder.FirstToggle && hasMorePending) ||
          (toggleValue === ToggleOrder.SecondToggle && hasMoreDone) ||
          (toggleValue === ToggleOrder.ThirdToggle && hasMoreAbort);

        console.log("At bottom, hasMore:", hasMore, "loadingMore:", loadingMore, "toggleValue:", toggleValue);

        if (hasMore && !loadingMore) {
          console.log("Triggering loadMoreData");
          loadMoreData();
        }
      }
    };

    listContainer.addEventListener("scroll", handleScroll);
    return () => listContainer.removeEventListener("scroll", handleScroll);
  }, [toggleValue, hasMorePending, hasMoreDone, hasMoreAbort, loadingMore]);
  return (
    <>
      <div className="title">
        {/* {t(LanguageKey.pageLottery_Winnerpickersstatus)} */}
        {"Lottery History"}
      </div>
      {loading && <Loading />}
      {!loading && (
        <>
          <FlexibleToggleButton
            options={[
              { label: t(LanguageKey.active), id: ToggleOrder.FirstToggle },
              { label: t(LanguageKey.done), id: ToggleOrder.SecondToggle },
              { label: t(LanguageKey.abort), id: ToggleOrder.ThirdToggle },
            ]}
            onChange={(toggleValue) => {
              setToggleValue(toggleValue);
              if (toggleValue == 0) {
                props.setWinnerPickerStatus(LotteryStatus.Active);
              } else if (toggleValue == 1) {
                props.setWinnerPickerStatus(LotteryStatus.Ended);
              } else {
                props.setWinnerPickerStatus(LotteryStatus.Failed);
              }
            }}
            selectedValue={toggleValue}
          />
          <div className={styles.activeWinnerPickerContainer} ref={listContainerRef}>
            <div className={styles.activeWinnerPickerlist}>
              {toggleValue === ToggleOrder.FirstToggle &&
                pendingLotteries.items.map((v) => (
                  <div key={v.id} className={styles.innerContainer}>
                    <div className={styles.Count}> {pendingLotteries.items.indexOf(v) + 1} </div>

                    <div className={styles.winnerInfoContainer}>
                      <div className={styles.winnerTimeContainer}>
                        <img
                          style={{
                            cursor: "pointer",
                            width: "18px",
                            height: "18px",
                          }}
                          title="ℹ️ order number"
                          src="/adticket.svg"
                        />
                        <div className={styles.winnerId}>{v.id}</div>
                      </div>
                      <div className={styles.winnerTimeContainer}>
                        {/* <svg fill="none" height="16" viewBox="0 0 160 160">
                            <path
                              className={styles.imageContainer}
                              fill="var(--text-h2)"
                              d="M134 113a6 6 0 0 1-6 6h-17a6 6 0 0 1-6-6V96a6 6 0 0 1 5-6 6 6 0 0 1 6 6v10h11a6 6 0 0 1 6 7Zm23 0a47 47 0 0 1-28 43 46 46 0 0 1-64-34 47 47 0 0 1 46-56 46 46 0 0 1 46 47m-46-35a34 34 0 0 0-32 22 35 35 0 0 0 25 47 34 34 0 0 0 36-15 35 35 0 0 0-30-54Zm49-30v22a6 6 0 0 1-5 6 5 5 0 0 1-4-1 6 6 0 0 1-2-5V58H10v58a33 33 0 0 0 34 34h26a6 6 0 0 1 6 4 6 6 0 0 1-1 5 6 6 0 0 1-5 2H44a44 44 0 0 1-44-45V48a36 36 0 0 1 4-18 36 36 0 0 1 16-14c4-2 10-4 14-4V6a6 6 0 0 1 7-6 6 6 0 0 1 6 6v6h26V6a6 6 0 0 1 7-6 6 6 0 0 1 6 6v6h23V6a6 6 0 0 1 7-6 6 6 0 0 1 6 6v6h2a40 40 0 0 1 26 13 36 36 0 0 1 9 23ZM35 32v-9a25 25 0 0 0-25 24h140v-2a30 30 0 0 0-10-16c-4-4-10-6-15-6h-2v10a6 6 0 0 1-6 5 6 6 0 0 1-7-6v-9H86v9a6 6 0 0 1-6 6 6 6 0 0 1-7-6v-9H47v9a6 6 0 0 1-6 6 6 6 0 0 1-6-6"
                            />
                          </svg> */}
                        <img
                          style={{
                            cursor: "pointer",
                            width: "18px",
                            height: "18px",
                          }}
                          title="ℹ️ create time"
                          src="/calendar-wait.svg"
                        />

                        <div className={styles.date}>
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.startTime * 1000,
                              locale: initialzedTime().locale,
                              calendar: initialzedTime().calendar,
                            }).format("YYYY/MM/DD")}
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
                      {/* {v.lotteryType === LotteryType.score ? (
                          <div className={styles.status}>
                            {t(LanguageKey.Pending)}
                          </div>
                        ) : (
                          <div className={styles.status}>
                            {t(LanguageKey.Preparing)}
                          </div>
                        )} */}
                    </div>

                    {
                      <div className={styles.arrow} onClick={() => props.showLotteryRunning(v.id)}>
                        {/* <svg
                            fill="none"
                            className={styles.icon}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20">
                            <path
                              d="M4.316 15.187a.7.7 0 0 1-.043-.223V11.44a.58.58 0 0 1 .585-.585.58.58 0 0 1 .585.585v2.105l4.927-4.924a.63.63 0 0 1 .825 0 .586.586 0 0 1 0 .833L6.268 14.38h2.107a.585.585 0 0 1 0 1.169H4.85a.59.59 0 0 1-.542-.361zM0 14.757V5.243A5.243 5.243 0 0 1 5.245 0h9.51A5.25 5.25 0 0 1 20 5.243v9.514A5.243 5.243 0 0 1 14.755 20h-9.51A5.243 5.243 0 0 1 0 14.757M13.448 5.08c0 .764.62 1.375 1.384 1.383h3.999v-.79a4.5 4.5 0 0 0-4.497-4.496h-.886zM1.169 14.757a4.083 4.083 0 0 0 4.076 4.074h9.51a4.08 4.08 0 0 0 4.076-4.074v-7.16h-4.033a2.288 2.288 0 0 1-2.528-2.389v-4.03H5.245A4.083 4.083 0 0 0 1.17 5.25z"
                              fill="var(--text-h2)"
                            />
                          </svg> */}
                        <img
                          style={{
                            cursor: "pointer",
                            width: "30px",
                            height: "30px",
                          }}
                          title="ℹ️ more"
                          src="/3dots.svg"
                        />
                      </div>
                    }
                  </div>
                ))}
              {/* Loading indicator for pending lotteries */}
              {toggleValue === ToggleOrder.FirstToggle && loadingMore && (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <RingLoader />
                </div>
              )}{" "}
              {toggleValue === ToggleOrder.SecondToggle &&
                doneLotteries.items.map((v) => (
                  <div key={v.id} className={styles.innerContainer}>
                    <div className={styles.Count}>{doneLotteries.items.indexOf(v) + 1}</div>
                    <div className={styles.winnerInfoContainer}>
                      <div className={styles.winnerTimeContainer}>
                        <img
                          style={{
                            cursor: "pointer",
                            width: "18px",
                            height: "18px",
                          }}
                          title="ℹ️ order number"
                          src="/adticket.svg"
                        />
                        <div className={styles.winnerId}>{v.id}</div>
                      </div>
                      <div className={styles.winnerTimeContainer}>
                        <img
                          style={{
                            cursor: "pointer",
                            width: "18px",
                            height: "18px",
                          }}
                          title="ℹ️ create time"
                          src="/calendar-wait.svg"
                        />
                        <div className={styles.date}>
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.startTime * 1000,
                              locale: initialzedTime().locale,
                              calendar: initialzedTime().calendar,
                            }).format("YYYY/MM/DD")}
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
                      <div className={styles.success}>{t(LanguageKey.Finished)}</div>
                    </div>
                    <div className={styles.arrow} onClick={() => props.showWinnersList(v.id)}>
                      <img
                        style={{
                          cursor: "pointer",
                          width: "30px",
                          height: "30px",
                        }}
                        title="ℹ️ more"
                        src="/3dots.svg"
                      />
                    </div>
                  </div>
                ))}
              {/* Loading indicator for done lotteries */}
              {toggleValue === ToggleOrder.SecondToggle && loadingMore && (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <RingLoader />
                </div>
              )}
              {toggleValue === ToggleOrder.ThirdToggle &&
                abortLotteries.items.map((v) => (
                  <div key={v.id} className={styles.innerContainer}>
                    <div className={styles.Count}>{abortLotteries.items.indexOf(v) + 1}</div>
                    <div className={styles.winnerInfoContainer}>
                      {" "}
                      <div className={styles.winnerTimeContainer}>
                        <img
                          style={{
                            cursor: "pointer",
                            width: "18px",
                            height: "18px",
                          }}
                          title="ℹ️ order number"
                          src="/adticket.svg"
                        />
                        <div className={styles.winnerId}>{v.id}</div>
                      </div>
                      <div className={styles.winnerTimeContainer}>
                        <img
                          style={{
                            cursor: "pointer",
                            width: "18px",
                            height: "18px",
                          }}
                          title="ℹ️ create time"
                          src="/calendar-wait.svg"
                        />
                        <div className={styles.date}>
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.startTime * 1000,
                              locale: initialzedTime().locale,
                              calendar: initialzedTime().calendar,
                            }).format("YYYY/MM/DD")}
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
                      <div className={styles.error}>
                        {v.failStatus && getEnumValue(FailLotteryStatus, FailLotteryStatusStr, v.failStatus)}
                      </div>
                    </div>
                    <div className={styles.notarrow} />
                  </div>
                ))}
              {/* Loading indicator for abort lotteries */}
              {toggleValue === ToggleOrder.ThirdToggle && loadingMore && (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <RingLoader />
                </div>
              )}
            </div>
          </div>
          <div className="ButtonContainer">
            <button onClick={props.removeMask} className="cancelButton">
              {t(LanguageKey.close)}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default LotteryHistory;
