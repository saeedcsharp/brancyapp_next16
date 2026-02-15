import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";

import Loading from "saeed/components/notOk/loading";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IPostContent } from "saeed/models/page/post/posts";
import { IIngageBox } from "saeed/models/page/statistics/statisticsContent/ingageBoxes/ingageBox";

import styles from "./ingageBoxes.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

interface StatsState {
  postCount: number;
  storyCount: number;
  maxReachCount: number;
  minReachCount: number;
  maxCommentAndLike: number;
  minCommentAndLike: number;
  maxReachPopup: IPostContent[];
  minReachPopup: IPostContent[];
  maxLikeCommentPopup: IPostContent[];
  minLikeCommentPopup: IPostContent[];
  loadingStatus: boolean;
  error: string | null;
}

type StatsAction =
  | { type: "SET_DATA"; payload: Partial<StatsState> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string };

const initialState: StatsState = {
  postCount: 0,
  storyCount: 0,
  maxReachCount: 0,
  minReachCount: 0,
  maxCommentAndLike: 0,
  minCommentAndLike: 0,
  maxReachPopup: [],
  minReachPopup: [],
  maxLikeCommentPopup: [],
  minLikeCommentPopup: [],
  loadingStatus: true,
  error: null,
};

const calculateSummary = (num: number): string => {
  if (num < 1) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

function statsReducer(state: StatsState, action: StatsAction): StatsState {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    case "SET_LOADING":
      return { ...state, loadingStatus: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loadingStatus: false };
    default:
      return state;
  }
}
const IngageBoxModel = (props: {
  showMaxPopups: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  showMinPopups: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  showMaxLikeCommentPopups: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  showMinLikeCommentPopups: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  sendMaxReachPopup: (list: IPostContent[]) => void;
  sendMinReachPopup: (list: IPostContent[]) => void;
  sendMaxCommentPopup: (list: IPostContent[]) => void;
  sendMinCommentPopup: (list: IPostContent[]) => void;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, dispatch] = useReducer(statsReducer, initialState);

  const isAuthenticated = useMemo(
    () => session && LoginStatus(session) && RoleAccess(session, PartnerRole.PageView),
    [session]
  );

  const imageUrls = useMemo(() => {
    const getImageUrl = (post?: IPostContent) =>
      post?.thumbnailMediaUrl ? `${basePictureUrl}${post.thumbnailMediaUrl}` : null;

    return {
      maxReach: getImageUrl(state.maxReachPopup[0]),
      minReach: getImageUrl(state.minReachPopup[0]),
      maxLikeComment: getImageUrl(state.maxLikeCommentPopup[0]),
      minLikeComment: getImageUrl(state.minLikeCommentPopup[0]),
    };
  }, [state.maxReachPopup, state.minReachPopup, state.maxLikeCommentPopup, state.minLikeCommentPopup]);

  const handleClickOnMaxView = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      props.showMaxPopups(e);
      props.sendMaxReachPopup(state.maxReachPopup);
    },
    [props, state.maxReachPopup]
  );

  const handleClickOnMinView = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      props.showMinPopups(e);
      props.sendMinReachPopup(state.minReachPopup);
    },
    [props, state.minReachPopup]
  );

  const handleClickOnMaxComment = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      props.showMaxLikeCommentPopups(e);
      props.sendMaxCommentPopup(state.maxLikeCommentPopup);
    },
    [props, state.maxLikeCommentPopup]
  );

  const handleClickOnMinComment = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      props.showMinLikeCommentPopups(e);
      props.sendMinCommentPopup(state.minLikeCommentPopup);
    },
    [props, state.minLikeCommentPopup]
  );

  const handleKeyDown = useCallback(
    (handler: (e: any) => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler(e as any);
      }
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      if (session && !LoginStatus(session)) {
        router.push("/");
      }
      return;
    }

    if (state.loadingStatus && !abortControllerRef.current) {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const fetchData = async () => {
        try {
          const res = await clientFetchApi<string, IIngageBox>("/api/statistics/GetOverview", { methodType: MethodType.get, session: session, data: null, queries: [], onUploadProgress: undefined });

          if (controller.signal.aborted) return;

          if (!res?.value) {
            throw new Error("Invalid response data");
          }

          const { posts, postCount, storyCount } = res.value;
          const isLoggedIn = LoginStatus(session);

          const sortedByReachDesc = [...posts].sort((a, b) => b.reachCount - a.reachCount);
          const sortedByReachAsc = [...posts].sort((a, b) => a.reachCount - b.reachCount);

          const maxLikeCommentPosts = isLoggedIn
            ? [...posts].sort((a, b) => b.commentCount + b.likeCount - (a.commentCount + a.likeCount))
            : [...posts].sort((a, b) => b.commentCount - a.commentCount);

          const minLikeCommentPosts = isLoggedIn
            ? [...posts].sort((a, b) => a.commentCount + a.likeCount - (b.commentCount + b.likeCount))
            : [...posts].sort((a, b) => a.commentCount - b.commentCount);

          const maxCommentAndLike = isLoggedIn
            ? (maxLikeCommentPosts[0]?.commentCount || 0) + (maxLikeCommentPosts[0]?.likeCount || 0)
            : maxLikeCommentPosts[0]?.commentCount || 0;

          const minCommentAndLike = isLoggedIn
            ? (minLikeCommentPosts[0]?.commentCount || 0) + (minLikeCommentPosts[0]?.likeCount || 0)
            : minLikeCommentPosts[0]?.commentCount || 0;

          dispatch({
            type: "SET_DATA",
            payload: {
              postCount,
              storyCount,
              maxReachCount: sortedByReachDesc[0]?.reachCount || 0,
              minReachCount: sortedByReachAsc[0]?.reachCount || 0,
              maxCommentAndLike,
              minCommentAndLike,
              maxReachPopup: sortedByReachDesc,
              minReachPopup: sortedByReachAsc,
              maxLikeCommentPopup: maxLikeCommentPosts,
              minLikeCommentPopup: minLikeCommentPosts,
              loadingStatus: false,
            },
          });
        } catch (error) {
          if (controller.signal.aborted) return;

          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching statistics data:", error);
          }

          dispatch({
            type: "SET_ERROR",
            payload: error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      };

      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [session, isAuthenticated, router, state.loadingStatus]);

  if (state.loadingStatus) {
    return <Loading />;
  }

  return (
    <>
      <Link href="./posts" style={{ textDecoration: "none", color: "inherit" }} aria-label="View all posts">
        <div
          className={styles.box}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown((e: any) => router.push("./posts"))}
          aria-label={`Total posts: ${state.postCount}`}>
          <div className={styles.animation1}>
            <div className={styles.gooli1} />
            <div className={styles.gooli2} />
            <div className={styles.gooli3} />
            <div className={styles.gooli4} />
          </div>
          <div className={styles.settingContainer} aria-label="Navigate to posts page">
            <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5" aria-hidden="true">
              <path
                fill="var(--color-white)"
                d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
              />
            </svg>
          </div>
          <div className="headerandinput">
            <div className={styles.title}>{t(LanguageKey.pageStatistics_post)}</div>
            <div className={styles.counter}>{state.postCount.toLocaleString()}</div>
          </div>
        </div>
      </Link>

      <Link href="./stories" style={{ textDecoration: "none", color: "inherit" }} aria-label="View all stories">
        <div
          className={styles.box}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown((e: any) => router.push("./stories"))}
          aria-label={`Total stories: ${calculateSummary(state.storyCount)}`}>
          <div className={styles.animation2}>
            <div className={styles.gooli6} />
            <div className={styles.gooli5} />
            <div className={styles.gooli8} />
            <div className={styles.gooli7} />
          </div>
          <div className={styles.settingContainer} aria-label="Navigate to stories page">
            <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5" aria-hidden="true">
              <path
                fill="var(--color-white)"
                d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
              />
            </svg>
          </div>
          <div className="headerandinput">
            <div className={styles.title}>{t(LanguageKey.pageStatistics_stories)}</div>
            <div className={styles.counter}>{calculateSummary(state.storyCount).toLocaleString()}</div>
          </div>
        </div>
      </Link>

      <div
        className={styles.box}
        role="button"
        tabIndex={0}
        onClick={handleClickOnMaxView}
        onKeyDown={handleKeyDown(handleClickOnMaxView)}
        aria-label={`Maximum reach: ${calculateSummary(state.maxReachCount)}`}>
        {imageUrls.maxReach && (
          <img
            loading="lazy"
            decoding="async"
            className={styles.picture}
            alt="Post with maximum reach"
            src={imageUrls.maxReach}
            width={100}
            height={100}
          />
        )}
        <div
          onClick={(e) => e.stopPropagation()}
          className={styles.settingContainer}
          aria-label="View posts sorted by maximum reach">
          <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5" aria-hidden="true">
            <path
              fill="var(--color-white)"
              d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
            />
          </svg>
        </div>
        <div className="headerandinput">
          <div className={styles.title}>{t(LanguageKey.pageStatistics_MaxView)}</div>
          <div className={styles.counter}>{calculateSummary(state.maxReachCount)}</div>
        </div>
      </div>

      <div
        className={styles.box}
        role="button"
        tabIndex={0}
        onClick={handleClickOnMinView}
        onKeyDown={handleKeyDown(handleClickOnMinView)}
        aria-label={`Minimum reach: ${calculateSummary(state.minReachCount)}`}>
        {imageUrls.minReach && (
          <img
            loading="lazy"
            decoding="async"
            className={styles.picture}
            alt="Post with minimum reach"
            src={imageUrls.minReach}
            width={100}
            height={100}
          />
        )}
        <div
          onClick={(e) => e.stopPropagation()}
          className={styles.settingContainer}
          aria-label="View posts sorted by minimum reach">
          <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5" aria-hidden="true">
            <path
              fill="var(--color-white)"
              d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
            />
          </svg>
        </div>
        <div className="headerandinput">
          <div className={styles.title}>{t(LanguageKey.pageStatistics_MinView)}</div>
          <div className={styles.counter}>{calculateSummary(state.minReachCount)}</div>
        </div>
      </div>

      <div
        className={styles.box}
        role="button"
        tabIndex={0}
        onClick={handleClickOnMaxComment}
        onKeyDown={handleKeyDown(handleClickOnMaxComment)}
        aria-label={`Maximum engagement: ${calculateSummary(state.maxCommentAndLike)}`}>
        {imageUrls.maxLikeComment && (
          <img
            loading="lazy"
            decoding="async"
            className={styles.picture}
            alt="Post with maximum comments and likes"
            src={imageUrls.maxLikeComment}
            width={100}
            height={100}
          />
        )}
        <div
          onClick={(e) => e.stopPropagation()}
          className={styles.settingContainer}
          aria-label="View posts sorted by maximum engagement">
          <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5" aria-hidden="true">
            <path
              fill="var(--color-white)"
              d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
            />
          </svg>
        </div>
        <div className="headerandinput">
          <div className={styles.title}>{t(LanguageKey.pageStatistics_MaxCommentLike)}</div>
          <div className={styles.counter}>{calculateSummary(state.maxCommentAndLike)}</div>
        </div>
      </div>

      <div
        className={styles.box}
        role="button"
        tabIndex={0}
        onClick={handleClickOnMinComment}
        onKeyDown={handleKeyDown(handleClickOnMinComment)}
        aria-label={`Minimum engagement: ${calculateSummary(state.minCommentAndLike)}`}>
        {imageUrls.minLikeComment && (
          <img
            loading="lazy"
            decoding="async"
            className={styles.picture}
            alt="Post with minimum comments and likes"
            src={imageUrls.minLikeComment}
            width={100}
            height={100}
          />
        )}
        <div
          onClick={(e) => e.stopPropagation()}
          className={styles.settingContainer}
          aria-label="View posts sorted by minimum engagement">
          <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5" aria-hidden="true">
            <path
              fill="var(--color-white)"
              d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
            />
          </svg>
        </div>
        <div className="headerandinput">
          <div className={styles.title}>{t(LanguageKey.pageStatistics_MinCommentLike)}</div>
          <div className={styles.counter}>{calculateSummary(state.minCommentAndLike)}</div>
        </div>
      </div>
    </>
  );
};

export default IngageBoxModel;
