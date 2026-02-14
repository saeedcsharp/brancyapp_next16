import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import IncrementStepper from "saeed/components/design/incrementStepper";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { ILotteryPost } from "saeed/models/page/post/posts";
import styles from "./postLottery.module.css";
export enum LotteryPopupType {
  PostLottery,
  StoryLottery,
  LiveLottery,
}
interface PostLotteryPopupProps {
  setShowLotteryPopup: (show: boolean) => void;
  id?: number;
  lotteryType: LotteryPopupType;
  liveId?: string;
  commentCount?: number;
}
export default function LotteryPopup({
  setShowLotteryPopup,
  id,
  lotteryType,
  liveId,
  commentCount,
}: PostLotteryPopupProps) {
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const { t } = useTranslation();
  const { data: session } = useSession();

  const [createdTime, setCreatedTime] = useState<number>(1e15);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>("");
  const [winnerNumber, setWinnerNumber] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [isFilterEnabled, setIsFilterEnabled] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const createButtonRef = useRef<HTMLButtonElement>(null);

  const apiConfig = useMemo(() => {
    if (lotteryType === LotteryPopupType.StoryLottery) {
      return {
        createUrl: "/Story/CreateExportReplies",
        getUrl: "/Story/GetExportReplies",
        keyId: "storyId",
      };
    } else if (lotteryType === LotteryPopupType.LiveLottery) {
      return {
        createUrl: "/Comment/CreateExportLiveComment",
        getUrl: "/Comment/GetExportLiveComments",
        keyId: "liveMediaId",
      };
    }
    return {
      createUrl: "/Post/CreateExportComments",
      getUrl: "/Post/GetExportComments",
      keyId: "postId",
    };
  }, [lotteryType]);

  const CreateLottery = useCallback(async () => {
    if (createdTime < Date.now() + 86400000) {
      internalNotify(InternalResponseType.CreateExportAvailableWith24HourPeriod, NotifType.Info);
      return;
    }

    setIsCreating(true);
    try {
      const response = await GetServerResult<boolean, ILotteryPost>(
        MethodType.get,
        session,
        "Instagramer" + apiConfig.createUrl,
        null,
        [
          { key: apiConfig.keyId, value: id ? id.toString() : liveId },
          { key: "filterText", value: filterText },
          { key: "randomCount", value: winnerNumber },
          {
            key: "timezoneOffset",
            value: (-1 * new Date().getTimezoneOffset() * 60).toString(),
          },
        ]
      );
      if (response.succeeded) {
        setCreatedTime(response.value.createdTime * 1000);
        setWinnerNumber(response.value.randomCount.toString());
        setLink(basePictureUrl + response.value.url);
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsCreating(false);
    }
  }, [createdTime, session, apiConfig, id, liveId, filterText, winnerNumber, basePictureUrl]);
  const getLottery = useCallback(async () => {
    try {
      const response = await GetServerResult<boolean, ILotteryPost>(
        MethodType.get,
        session,
        "Instagramer" + apiConfig.getUrl,
        null,
        [{ key: apiConfig.keyId, value: id ? id.toString() : liveId }]
      );
      if (response.succeeded) {
        setCreatedTime(response.value.createdTime * 1000);
        setWinnerNumber(response.value.randomCount.toString());
        setLink(basePictureUrl + response.value.url);
      } else if (response.info.responseType === ResponseType.NotCreatedExportComment) return;
      else notify(response.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }, [session, apiConfig, id, liveId, basePictureUrl]);

  const handleFilterTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  }, []);

  const handleToggleFilter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsFilterEnabled(e.target.checked);
  }, []);

  const handleIncrement = useCallback(() => {
    setWinnerNumber((prev) => Math.min(100, (parseInt(prev) || 0) + 1).toString());
  }, []);

  const handleDecrement = useCallback(() => {
    setWinnerNumber((prev) => Math.max(0, (parseInt(prev) || 0) - 1).toString());
  }, []);

  const handleCopyLink = useCallback(() => {
    if (link) {
      navigator.clipboard.writeText(link);
      notify(ResponseType.Ok, NotifType.Success);
    }
  }, [link]);

  const handleDownload = useCallback(() => {
    if (link) {
      window.open(link, "_blank");
    }
  }, [link]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLotteryPopup(false);
      } else if (e.key === "Enter" && !isCreating && createButtonRef.current) {
        CreateLottery();
      }
    },
    [setShowLotteryPopup, isCreating, CreateLottery]
  );

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      getLottery();
    }

    return () => {
      mounted = false;
    };
  }, [getLottery]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title key="title">Bran.cy ▸ {t(LanguageKey.pageTools_WinnerPicker)}</title>
        <meta
          key="description"
          name="description"
          content="Instagram Winner Picker and Lottery Tool - Randomly select winners from post comments, story replies, and live comments with advanced filtering options"
        />
        <meta
          key="keywords"
          name="keywords"
          content="instagram winner picker, lottery tool, random comment selector, instagram giveaway, winner selection, comment export, instagram tools, Brancy"
        />
        <meta key="og:title" property="og:title" content="Bran.cy - Instagram Winner Picker & Lottery" />
        <meta
          key="og:description"
          property="og:description"
          content="Randomly select winners from Instagram comments with advanced filtering"
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:url" property="og:url" content="https://www.brancy.app/lottery" />
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content="Bran.cy Winner Picker" />
        <meta
          key="twitter:description"
          name="twitter:description"
          content="Instagram lottery and winner selection tool"
        />
        <meta key="robots" name="robots" content="index, follow" />
        <link key="canonical" rel="canonical" href="https://www.brancy.app/lottery" />
      </Head>
      <>
        {loading && <Loading />}
        {!loading && (
          <>
            <div className="headerandinput">
              <div className="title">
                {t(LanguageKey.pageTools_WinnerPicker)}

                <Tooltip
                  tooltipValue={t(LanguageKey.pageTools_WinnerPickertooltip24hour)}
                  position="bottom"
                  onClick={true}>
                  <img
                    style={{
                      marginInline: "5px",
                      cursor: "pointer",
                      width: "15px",
                      height: "15px",
                    }}
                    alt="ℹ️ tooltip"
                    src="/tooltip.svg"
                  />
                </Tooltip>
              </div>
              <div className="explain"> {t(LanguageKey.pageTools_exportcomments)}</div>
            </div>

            <div className="headerandinput">
              <div className="headerparent">
                <div className="title2">
                  {t(LanguageKey.specifickeywords)}
                  <Tooltip tooltipValue={t(LanguageKey.specifickeywordstooltip)} position="bottom" onClick={true}>
                    <img
                      style={{
                        marginInline: "5px",
                        cursor: "pointer",
                        width: "15px",
                        height: "15px",
                      }}
                      alt="ℹ️ tooltip"
                      src="/tooltip.svg"
                    />
                  </Tooltip>
                </div>
                <ToggleCheckBoxButton
                  handleToggle={handleToggleFilter}
                  checked={isFilterEnabled}
                  name="filterToggle"
                  title="Filter Keywords"
                  role="switch"
                  aria-label={t(LanguageKey.specifickeywords)}
                />
              </div>

              <div className="explain">{t(LanguageKey.pageLottery_FilterKeywords)}</div>
              <div className={!isFilterEnabled ? "fadeDiv" : ""}>
                <InputText
                  fadeTextArea={false}
                  name="Filter Keyword"
                  className={"textinputbox"}
                  placeHolder={t(LanguageKey.specifickeywords)}
                  handleInputChange={handleFilterTextChange}
                  value={filterText}
                  disabled={!isFilterEnabled}
                  aria-label={t(LanguageKey.specifickeywords)}
                />
              </div>
            </div>
            <div className="headerandinput">
              <div className="headerparent">
                <div className="title2">{t(LanguageKey.pageLottery_NumberofWinners)}</div>
                <IncrementStepper
                  data={parseInt(winnerNumber) || 0}
                  increment={handleIncrement}
                  decrement={handleDecrement}
                  id={" winnerNumber"}
                  aria-label={t(LanguageKey.pageLottery_NumberofWinners)}
                />
              </div>
              <div className="explain">{t(LanguageKey.pageLottery_NumberofWinnersexplain)}</div>
              {commentCount !== undefined && (
                <div className="explain">
                  {t(LanguageKey.totalcomments)}: {commentCount.toLocaleString()}
                </div>
              )}
            </div>
            <button
              ref={createButtonRef}
              style={{ minHeight: "42px" }}
              className={"saveButton"}
              onClick={CreateLottery}
              disabled={isCreating}
              aria-label={t(LanguageKey.start)}
              aria-busy={isCreating}>
              {isCreating ? <RingLoader color="white" /> : t(LanguageKey.start)}
            </button>

            <div className={`${styles.response} ${link ? "" : "fadeDiv"}`}>
              <div className="headerandinput">
                <div className="title2">
                  {t(LanguageKey.pageLottery_RandomFollowersWinners)}

                  <Tooltip
                    tooltipValue={t(LanguageKey.pageLottery_permanentlinktooltip)}
                    position="bottom"
                    onClick={true}>
                    <img
                      style={{
                        marginInline: "5px",
                        cursor: "pointer",
                        width: "15px",
                        height: "15px",
                      }}
                      alt="ℹ️ tooltip"
                      src="/tooltip.svg"
                    />
                  </Tooltip>
                </div>
                <div className="explain">{t(LanguageKey.pageLottery_permanentlinkexplain)}</div>
              </div>

              <div className="headerparent">
                <InputText
                  style={{
                    width: "100%",
                    backgroundColor: "var(--color-disable)",
                  }}
                  fadeTextArea={false}
                  name="Link"
                  className={"textinputbox"}
                  placeHolder={""}
                  handleInputChange={() => {}}
                  value={link}
                  aria-label={t(LanguageKey.pageLottery_permanentlinkexplain)}
                />
                <Tooltip tooltipValue={t(LanguageKey.copy)} position="top" onClick={true}>
                  <button
                    type="button"
                    className={styles.copylink}
                    onClick={handleCopyLink}
                    disabled={!link}
                    aria-label={t(LanguageKey.copy)}
                    style={{
                      cursor: link ? "pointer" : "not-allowed",
                    }}>
                    <img src="/copy.svg" alt="copy link icon" />
                  </button>
                </Tooltip>
                <Tooltip tooltipValue={t(LanguageKey.download)} position="top" onClick={true}>
                  <button
                    type="button"
                    className={styles.copylink}
                    onClick={handleDownload}
                    disabled={!link}
                    aria-label={t(LanguageKey.download)}
                    style={{
                      cursor: link ? "pointer" : "not-allowed",
                    }}>
                    <svg
                      width="36"
                      height="36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36"
                      aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.5 19.88a1.5 1.5 0 0 0-3 0v6.75h-.88l-.85.03a1.8 1.8 0 0 0-1.47.98c-.42.85.04 1.6.13 1.76.15.24.35.5.5.7l.05.05 1.58 1.88q.43.45.96.83c.3.21.83.52 1.48.52s1.17-.3 1.48-.52q.53-.38.96-.83c.57-.6 1.14-1.32 1.58-1.88l.04-.05c.16-.2.36-.46.5-.7.1-.16.56-.9.14-1.76a1.8 1.8 0 0 0-1.46-.98c-.27-.04-.6-.04-.86-.04h-.87z"
                        fill="var(--color-gray)"
                      />
                      <path
                        d="M1.88 18.75a8.6 8.6 0 0 1 6.3-8.3c.3-.09.45-.13.53-.22s.12-.23.2-.53a9.38 9.38 0 0 1 18.4 1.25c.05.37.07.55.16.66.1.1.28.15.64.24a7.88 7.88 0 0 1-1.86 15.53h-.09c-.33 0-.5 0-.6-.08-.12-.08-.2-.26-.35-.63a3.7 3.7 0 0 0-2.57-2.19c-.46-.11-.7-.17-.8-.3-.09-.11-.09-.3-.09-.7v-3.6a3.75 3.75 0 0 0-7.5 0v3.6c0 .39 0 .59-.1.7-.1.13-.33.2-.8.3a4 4 0 0 0-2.61 2.2c-.18.37-.27.56-.4.63q-.13.09-.58.03a8.63 8.63 0 0 1-7.88-8.59"
                        fill="var(--color-gray60)"
                      />
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          </>
        )}
      </>
    </>
  );
}
