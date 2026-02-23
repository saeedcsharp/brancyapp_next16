import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../../notOk/loading";
import { LoginStatus, RoleAccess } from "../../../../helper/loadingStatus";
import { LanguageKey } from "../../../../i18n";
import { PartnerRole } from "../../../../models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "../../../../helper/api";
import { IMonthGraph, IShortMonth } from "../../../../models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import { EngagmentStatistics } from "../../../../models/page/statistics/totalStatistics/EngagmentStatistics";
import { IFollowerStatistics } from "../../../../models/page/statistics/totalStatistics/FollowerStatistics";
import MultiChart from "../../../design/chart/Chart_month";
import InlineBarChart from "../../../design/chart/inlineBarChart";
import styles from "./engagementStatistics.module.css";
import { clientFetchApi } from "../../../../helper/clientFetchApi";
type StatsState = {
  likes: IMonthGraph[] | null;
  shares: IMonthGraph[] | null;
  comments: IMonthGraph[] | null;
  engagement: IMonthGraph[] | null;
  views: IMonthGraph[] | null;
  monthViews: IShortMonth[] | null;
  followerViews: IMonthGraph[] | null;
  nonFollowerViews: IMonthGraph[] | null;
  monthEngagement: IShortMonth[] | null;
  replies: IMonthGraph[] | null;
  totalTime: IMonthGraph[] | null;
  follower: IMonthGraph[] | null;
  unFollower: IMonthGraph[] | null;
  mediaFollows: IMonthGraph[] | null;
  mediaProfileVisit: IMonthGraph[] | null;
  reach: IMonthGraph[] | null;
  reachMonth: IShortMonth[] | null;
  rePosts: IMonthGraph[] | null;
};
type StatsAction =
  | {
      type: "SET_ENGAGEMENT_DATA";
      payload: EngagmentStatistics;
    }
  | {
      type: "SET_FOLLOWER_DATA";
      payload: IFollowerStatistics;
    }
  | {
      type: "SET_MONTH_DATA";
      payload: {
        monthViews: IShortMonth[] | null;
        monthEngagement: IShortMonth[] | null;
        reachMonth: IShortMonth[] | null;
      };
    }
  | {
      type: "RESET";
    };
const statsReducer = (state: StatsState, action: StatsAction): StatsState => {
  switch (action.type) {
    case "SET_ENGAGEMENT_DATA":
      if (!action.payload) {
        return state;
      }
      console.log("Engagement Data repost:", action.payload);
      return {
        ...state,
        likes: action.payload.likes || null,
        shares: action.payload.shares || null,
        comments: action.payload.comments || null,
        engagement: action.payload.engagement || null,
        views: action.payload.views || null,
        followerViews: action.payload.followerViews || null,
        nonFollowerViews: action.payload.nonFollowerViews || null,
        replies: action.payload.replies || null,
        totalTime: action.payload.totalTime || null,
        rePosts: action.payload.reposts || null,
      };
    case "SET_FOLLOWER_DATA":
      if (!action.payload) {
        return state;
      }
      return {
        ...state,
        follower: action.payload.overallFollowers || null,
        unFollower: action.payload.unFollowers || null,
        mediaFollows: action.payload.mediaFollows || null,
        mediaProfileVisit: action.payload.mediaProfileVisits || null,
        reach: action.payload.reach || null,
      };
    case "SET_MONTH_DATA":
      return {
        ...state,
        monthViews: action.payload.monthViews,
        monthEngagement: action.payload.monthEngagement,
        reachMonth: action.payload.reachMonth,
      };
    case "RESET":
      return {
        likes: null,
        shares: null,
        comments: null,
        engagement: null,
        views: null,
        monthViews: null,
        followerViews: null,
        nonFollowerViews: null,
        monthEngagement: null,
        replies: null,
        totalTime: null,
        follower: null,
        unFollower: null,
        mediaFollows: null,
        mediaProfileVisit: null,
        reach: null,
        reachMonth: null,
        rePosts: null,
      };
    default:
      return state;
  }
};
function loadingReducer(state: any, action: { type: any; payload: any }) {
  switch (action.type) {
    case "SET_LOADING":
      return action.payload;
    default:
      return state;
  }
}
const getAdvancedTrendFromPoints = (points: any[]) => {
  if (!points || points.length === 0) return "neutral";
  const values = points.map((p) => (typeof p.totalCount === "number" ? p.totalCount : p.plusCount ?? 0));
  const n = values.length;
  if (values.every((v) => v === 0)) return "zero";
  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < n; i++) {
    const weight = i + 1;
    weightedSum += values[i] * weight;
    totalWeight += weight;
  }
  const weightedAvg = weightedSum / totalWeight;
  const x = values.map((_, i) => i + 1);
  const y = values;
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let numerator = 0,
    denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const slopeThreshold = 0.05;
  const weightedDiffThreshold = Math.max(1, Math.abs(values[0]) * 0.05);
  if (Math.abs(slope) > slopeThreshold) {
    return slope > 0 ? "up" : "down";
  } else if (Math.abs(values[n - 1] - weightedAvg) > weightedDiffThreshold) {
    return values[n - 1] > weightedAvg ? "up" : "down";
  } else {
    return "neutral";
  }
};
type SuggestionItemType = {
  title: string;
  summary: string;
  actions: string[];
  urgency: string;
};
type SuggestionSet = {
  up: SuggestionItemType;
  neutral: SuggestionItemType;
  down: SuggestionItemType;
  zero: SuggestionItemType;
};
const SuggestionCard = ({
  item,
  isOpen,
  onToggle,
}: {
  item: SuggestionItemType | { message: string };
  isOpen?: boolean;
  onToggle?: () => void;
}) => {
  if ((item as any).message) return <div>{(item as any).message}</div>;
  const s = item as SuggestionItemType;
  return (
    <div className={styles.analysisuggestioncard}>
      <button
        type="button"
        className="frameParent"
        style={{
          gap: "10px",
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "inherit",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle && onToggle();
        }}>
        <div className={styles.suggestiontitle}>{s.title}</div>
        <svg
          className={`${styles.showmore} ${isOpen ? styles.showmoreOpen : ""}`}
          width="21"
          height="21"
          viewBox="0 0 22 22"
          fill="none"
          role="img">
          <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
          <path
            fill="var(--text-h1)"
            d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
          />
        </svg>
      </button>
      {isOpen ? (
        <>
          <div className={styles.suggestionheader}>{s.summary}</div>
          {s.actions && s.actions.length > 0 && (
            <ul className={styles.suggestioncontent}>
              {s.actions.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
};
// #region MounthViews
const MounthViews = (props: { data: IShortMonth[] | null; id?: string; name: string }) => {
  const { data: session } = useSession();
  const chartId = useId();
  const [isPending, startTransition] = useTransition();
  const [loadingStatus, dispatchLoading] = useReducer(
    loadingReducer,
    LoginStatus(session) && RoleAccess(session, PartnerRole.PageView)
  );
  useEffect(() => {
    if (props.data && LoginStatus(session)) {
      startTransition(() => {
        dispatchLoading({ type: "SET_LOADING", payload: false });
      });
    }
  }, [props.data, session]);
  const shouldShowChart = useMemo(() => {
    return !loadingStatus && !isPending && !!props.data;
  }, [loadingStatus, isPending, props.data]);
  const showLoading = useMemo(() => {
    return loadingStatus || isPending;
  }, [loadingStatus, isPending]);
  return (
    <>
      {showLoading ? (
        <Loading />
      ) : (
        shouldShowChart && (
          <div className={styles.chartsummary}>
            <InlineBarChart chartId={props.id || `chart-${chartId}`} items={props.data || []} height="100%" />
          </div>
        )
      )}
    </>
  );
};
const EngageMentStatistics = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const [statsState, dispatch] = useReducer(statsReducer, {
    likes: null,
    shares: null,
    comments: null,
    engagement: null,
    views: null,
    monthViews: null,
    followerViews: null,
    nonFollowerViews: null,
    monthEngagement: null,
    replies: null,
    totalTime: null,
    follower: null,
    unFollower: null,
    mediaFollows: null,
    mediaProfileVisit: null,
    reach: null,
    reachMonth: null,
    rePosts: null,
  });
  useEffect(() => {
    if (session && !LoginStatus(session)) {
      router.push("/");
    }
  }, [session, router]);
  useEffect(() => {
    if (!isDataLoaded && !isFetchingRef.current) {
    }
  }, [isDataLoaded]);
  const { t } = useTranslation();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const update = () => setIsSmallScreen(typeof window !== "undefined" && window.innerWidth < 480);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const mounthGraphToShortCast = useCallback((mounthgraph: IMonthGraph[]) => {
    if (!mounthgraph || mounthgraph.length < 3) return [];
    return mounthgraph.slice(2).map((element) => ({
      month: element.month,
      plusCount: element.plusCount,
      totalCount: element.totalCount,
      year: element.year,
    }));
  }, []);
  const fetchData = useCallback(async () => {
    if (!session || !LoginStatus(session) || !RoleAccess(session, PartnerRole.PageView)) {
      return;
    }
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    try {
      const [engagementRes, followerRes] = await Promise.all([
        clientFetchApi<string, EngagmentStatistics>("/api/statistics/GetEngagmentStatistics", { methodType: MethodType.get, session: session, data: null, queries: [], onUploadProgress: undefined }),
        clientFetchApi<string, IFollowerStatistics>("/api/statistics/GetFollowerStatistics", { methodType: MethodType.get, session: session, data: null, queries: [], onUploadProgress: undefined }),
      ]);
      if (engagementRes && engagementRes.value) {
        dispatch({ type: "SET_ENGAGEMENT_DATA", payload: engagementRes.value });
        const monthViews = mounthGraphToShortCast(engagementRes.value.views || []);
        const monthEngagement = mounthGraphToShortCast(engagementRes.value.engagement || []);
        if (followerRes && followerRes.value) {
          dispatch({ type: "SET_FOLLOWER_DATA", payload: followerRes.value });
          const reachMonth = mounthGraphToShortCast(followerRes.value.reach || []);
          dispatch({
            type: "SET_MONTH_DATA",
            payload: { monthViews, monthEngagement, reachMonth },
          });
        } else {
          dispatch({
            type: "SET_MONTH_DATA",
            payload: { monthViews, monthEngagement, reachMonth: null },
          });
        }
        setIsDataLoaded(true);
      }
    } catch (error) {
    } finally {
      isFetchingRef.current = false;
    }
  }, [session, mounthGraphToShortCast]);
  useEffect(() => {
    if (session && LoginStatus(session) && RoleAccess(session, PartnerRole.PageView) && !isDataLoaded) {
      fetchData();
    }
  }, [session, fetchData, isDataLoaded]);
  const graphConfigs = useMemo(
    () => [
      {
        id: "Statistics_UnFollowers",
        name: t(LanguageKey.pageStatistics_UnFollowers),
        data: statsState.unFollower,
      },
      {
        id: "Statistics_Followers",
        name: t(LanguageKey.pageStatistics_Followers),
        data: statsState.follower,
      },
      {
        id: "Statistics_MediaFollows",
        name: t(LanguageKey.pageStatistics_MediaFollows),
        data: statsState.mediaFollows,
      },
      {
        id: "Statistics_Reach",
        name: t(LanguageKey.pageStatistics_Reach),
        data: statsState.reach,
      },
      {
        id: "Statistics_ProfileVisit",
        name: t(LanguageKey.pageStatistics_ProfileVisit),
        data: statsState.mediaProfileVisit,
      },
      {
        id: "Statistics_Likes",
        name: t(LanguageKey.pageStatistics_likes),
        data: statsState.likes,
      },
      {
        id: "Statistics_Comments",
        name: t(LanguageKey.pageStatistics_Comments),
        data: statsState.comments,
      },
      {
        id: "Statistics_Views",
        name: t(LanguageKey.pageStatistics_Views),
        data: statsState.views,
      },
      {
        id: "Statistics_FollowerViews",
        name: t(LanguageKey.pageStatistics_followerViews),
        data: statsState.followerViews,
      },
      {
        id: "Statistics_NonFollowerViews",
        name: t(LanguageKey.pageStatistics_ghostViewers),
        data: statsState.nonFollowerViews,
      },
      {
        id: "Statistics_Shares",
        name: t(LanguageKey.pageStatistics_Shares),
        data: statsState.shares,
      },
      {
        id: "Statistics_Engagement",
        name: t(LanguageKey.pageStatistics_Engagements),
        data: statsState.engagement,
      },
      {
        id: "Statistics_Replies",
        name: t(LanguageKey.replies),
        data: statsState.replies,
      },
      {
        id: "Statistics_TotalTime",
        name: "Total Time",
        data: statsState.totalTime,
      },
      {
        id: "Statistics_RePosts",
        name: t(LanguageKey.pageStatistics_RePosts),
        data: statsState.rePosts,
      },
      {
        id: "Statistics_ReachMonth",
        name: t(LanguageKey.pageStatistics_Reach) + " (" + t(LanguageKey.pageStatistics_summary) + ")",
        data: statsState.reachMonth,
        isMonth: true,
      },
      {
        id: "Statistics_MonthEngagement",
        name: t(LanguageKey.pageStatistics_Engagements) + " (" + t(LanguageKey.pageStatistics_summary) + ")",
        data: statsState.monthEngagement,
        isMonth: true,
      },
      {
        id: "Statistics_MonthView",
        name: t(LanguageKey.pageStatistics_Views) + " (" + t(LanguageKey.pageStatistics_summary) + ")",
        data: statsState.monthViews,
        isMonth: true,
      },
    ],
    [statsState, t]
  );
  const suggestionsMap = useMemo<Record<string, SuggestionSet>>(
    () => ({
      Statistics_UnFollowers: {
        up: {
          title: t(LanguageKey.Statistics_UnFollowers_up_title),
          summary: t(LanguageKey.Statistics_UnFollowers_up_summary),
          actions: [
            t(LanguageKey.Statistics_UnFollowers_up_action1),
            t(LanguageKey.Statistics_UnFollowers_up_action2),
            t(LanguageKey.Statistics_UnFollowers_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_UnFollowers_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_UnFollowers_neutral_title),
          summary: t(LanguageKey.Statistics_UnFollowers_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_UnFollowers_neutral_action1),
            t(LanguageKey.Statistics_UnFollowers_neutral_action2),
            t(LanguageKey.Statistics_UnFollowers_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_UnFollowers_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_UnFollowers_down_title),
          summary: t(LanguageKey.Statistics_UnFollowers_down_summary),
          actions: [
            t(LanguageKey.Statistics_UnFollowers_down_action1),
            t(LanguageKey.Statistics_UnFollowers_down_action2),
            t(LanguageKey.Statistics_UnFollowers_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_UnFollowers_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_UnFollowers_zero_title),
          summary: t(LanguageKey.Statistics_UnFollowers_zero_summary),
          actions: [
            t(LanguageKey.Statistics_UnFollowers_zero_action1),
            t(LanguageKey.Statistics_UnFollowers_zero_action2),
            t(LanguageKey.Statistics_UnFollowers_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_UnFollowers_zero_urgency),
        },
      },

      Statistics_Followers: {
        up: {
          title: t(LanguageKey.Statistics_Followers_up_title),
          summary: t(LanguageKey.Statistics_Followers_up_summary),
          actions: [
            t(LanguageKey.Statistics_Followers_up_action1),
            t(LanguageKey.Statistics_Followers_up_action2),
            t(LanguageKey.Statistics_Followers_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_Followers_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_Followers_neutral_title),
          summary: t(LanguageKey.Statistics_Followers_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Followers_neutral_action1),
            t(LanguageKey.Statistics_Followers_neutral_action2),
            t(LanguageKey.Statistics_Followers_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_Followers_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_Followers_down_title),
          summary: t(LanguageKey.Statistics_Followers_down_summary),
          actions: [
            t(LanguageKey.Statistics_Followers_down_action1),
            t(LanguageKey.Statistics_Followers_down_action2),
            t(LanguageKey.Statistics_Followers_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_Followers_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_Followers_zero_title),
          summary: t(LanguageKey.Statistics_Followers_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Followers_zero_action1),
            t(LanguageKey.Statistics_Followers_zero_action2),
            t(LanguageKey.Statistics_Followers_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_Followers_zero_urgency),
        },
      },

      Statistics_MediaFollows: {
        up: {
          title: t(LanguageKey.Statistics_MediaFollows_up_title),
          summary: t(LanguageKey.Statistics_MediaFollows_up_summary),
          actions: [
            t(LanguageKey.Statistics_MediaFollows_up_action1),
            t(LanguageKey.Statistics_MediaFollows_up_action2),
            t(LanguageKey.Statistics_MediaFollows_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_MediaFollows_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_MediaFollows_neutral_title),
          summary: t(LanguageKey.Statistics_MediaFollows_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_MediaFollows_neutral_action1),
            t(LanguageKey.Statistics_MediaFollows_neutral_action2),
            t(LanguageKey.Statistics_MediaFollows_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_MediaFollows_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_MediaFollows_down_title),
          summary: t(LanguageKey.Statistics_MediaFollows_down_summary),
          actions: [
            t(LanguageKey.Statistics_MediaFollows_down_action1),
            t(LanguageKey.Statistics_MediaFollows_down_action2),
            t(LanguageKey.Statistics_MediaFollows_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_MediaFollows_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_MediaFollows_zero_title),
          summary: t(LanguageKey.Statistics_MediaFollows_zero_summary),
          actions: [
            t(LanguageKey.Statistics_MediaFollows_zero_action1),
            t(LanguageKey.Statistics_MediaFollows_zero_action2),
            t(LanguageKey.Statistics_MediaFollows_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_MediaFollows_zero_urgency),
        },
      },
      Statistics_Reach: {
        up: {
          title: t(LanguageKey.Statistics_Reach_up_title),
          summary: t(LanguageKey.Statistics_Reach_up_summary),
          actions: [
            t(LanguageKey.Statistics_Reach_up_action_1),
            t(LanguageKey.Statistics_Reach_up_action_2),
            t(LanguageKey.Statistics_Reach_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Reach_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_Reach_neutral_title),
          summary: t(LanguageKey.Statistics_Reach_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Reach_neutral_action_1),
            t(LanguageKey.Statistics_Reach_neutral_action_2),
            t(LanguageKey.Statistics_Reach_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Reach_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_Reach_down_title),
          summary: t(LanguageKey.Statistics_Reach_down_summary),
          actions: [
            t(LanguageKey.Statistics_Reach_down_action_1),
            t(LanguageKey.Statistics_Reach_down_action_2),
            t(LanguageKey.Statistics_Reach_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Reach_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_Reach_zero_title),
          summary: t(LanguageKey.Statistics_Reach_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Reach_zero_action_1),
            t(LanguageKey.Statistics_Reach_zero_action_2),
            t(LanguageKey.Statistics_Reach_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Reach_zero_urgency),
        },
      },

      Statistics_ProfileVisit: {
        up: {
          title: t(LanguageKey.Statistics_ProfileVisit_up_title),
          summary: t(LanguageKey.Statistics_ProfileVisit_up_summary),
          actions: [
            t(LanguageKey.Statistics_ProfileVisit_up_action_1),
            t(LanguageKey.Statistics_ProfileVisit_up_action_2),
            t(LanguageKey.Statistics_ProfileVisit_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ProfileVisit_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_ProfileVisit_neutral_title),
          summary: t(LanguageKey.Statistics_ProfileVisit_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_ProfileVisit_neutral_action_1),
            t(LanguageKey.Statistics_ProfileVisit_neutral_action_2),
            t(LanguageKey.Statistics_ProfileVisit_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ProfileVisit_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_ProfileVisit_down_title),
          summary: t(LanguageKey.Statistics_ProfileVisit_down_summary),
          actions: [
            t(LanguageKey.Statistics_ProfileVisit_down_action_1),
            t(LanguageKey.Statistics_ProfileVisit_down_action_2),
            t(LanguageKey.Statistics_ProfileVisit_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ProfileVisit_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_ProfileVisit_zero_title),
          summary: t(LanguageKey.Statistics_ProfileVisit_zero_summary),
          actions: [
            t(LanguageKey.Statistics_ProfileVisit_zero_action_1),
            t(LanguageKey.Statistics_ProfileVisit_zero_action_2),
            t(LanguageKey.Statistics_ProfileVisit_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ProfileVisit_zero_urgency),
        },
      },

      Statistics_Likes: {
        up: {
          title: t(LanguageKey.Statistics_Likes_up_title),
          summary: t(LanguageKey.Statistics_Likes_up_summary),
          actions: [
            t(LanguageKey.Statistics_Likes_up_action_1),
            t(LanguageKey.Statistics_Likes_up_action_2),
            t(LanguageKey.Statistics_Likes_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Likes_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_Likes_neutral_title),
          summary: t(LanguageKey.Statistics_Likes_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Likes_neutral_action_1),
            t(LanguageKey.Statistics_Likes_neutral_action_2),
            t(LanguageKey.Statistics_Likes_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Likes_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_Likes_down_title),
          summary: t(LanguageKey.Statistics_Likes_down_summary),
          actions: [
            t(LanguageKey.Statistics_Likes_down_action_1),
            t(LanguageKey.Statistics_Likes_down_action_2),
            t(LanguageKey.Statistics_Likes_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Likes_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_Likes_zero_title),
          summary: t(LanguageKey.Statistics_Likes_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Likes_zero_action_1),
            t(LanguageKey.Statistics_Likes_zero_action_2),
            t(LanguageKey.Statistics_Likes_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Likes_zero_urgency),
        },
      },
      Statistics_Comments: {
        up: {
          title: t(LanguageKey.Statistics_Comments_up_title),
          summary: t(LanguageKey.Statistics_Comments_up_summary),
          actions: [
            t(LanguageKey.Statistics_Comments_up_action1),
            t(LanguageKey.Statistics_Comments_up_action2),
            t(LanguageKey.Statistics_Comments_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_Comments_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_Comments_neutral_title),
          summary: t(LanguageKey.Statistics_Comments_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Comments_neutral_action1),
            t(LanguageKey.Statistics_Comments_neutral_action2),
            t(LanguageKey.Statistics_Comments_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_Comments_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_Comments_down_title),
          summary: t(LanguageKey.Statistics_Comments_down_summary),
          actions: [
            t(LanguageKey.Statistics_Comments_down_action1),
            t(LanguageKey.Statistics_Comments_down_action2),
            t(LanguageKey.Statistics_Comments_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_Comments_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_Comments_zero_title),
          summary: t(LanguageKey.Statistics_Comments_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Comments_zero_action1),
            t(LanguageKey.Statistics_Comments_zero_action2),
            t(LanguageKey.Statistics_Comments_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_Comments_zero_urgency),
        },
      },

      Statistics_Views: {
        up: {
          title: t(LanguageKey.Statistics_Views_up_title),
          summary: t(LanguageKey.Statistics_Views_up_summary),
          actions: [
            t(LanguageKey.Statistics_Views_up_action1),
            t(LanguageKey.Statistics_Views_up_action2),
            t(LanguageKey.Statistics_Views_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_Views_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_Views_neutral_title),
          summary: t(LanguageKey.Statistics_Views_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Views_neutral_action1),
            t(LanguageKey.Statistics_Views_neutral_action2),
            t(LanguageKey.Statistics_Views_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_Views_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_Views_down_title),
          summary: t(LanguageKey.Statistics_Views_down_summary),
          actions: [
            t(LanguageKey.Statistics_Views_down_action1),
            t(LanguageKey.Statistics_Views_down_action2),
            t(LanguageKey.Statistics_Views_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_Views_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_Views_zero_title),
          summary: t(LanguageKey.Statistics_Views_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Views_zero_action1),
            t(LanguageKey.Statistics_Views_zero_action2),
            t(LanguageKey.Statistics_Views_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_Views_zero_urgency),
        },
      },

      Statistics_FollowerViews: {
        up: {
          title: t(LanguageKey.Statistics_FollowerViews_up_title),
          summary: t(LanguageKey.Statistics_FollowerViews_up_summary),
          actions: [
            t(LanguageKey.Statistics_FollowerViews_up_action1),
            t(LanguageKey.Statistics_FollowerViews_up_action2),
            t(LanguageKey.Statistics_FollowerViews_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_FollowerViews_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_FollowerViews_neutral_title),
          summary: t(LanguageKey.Statistics_FollowerViews_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_FollowerViews_neutral_action1),
            t(LanguageKey.Statistics_FollowerViews_neutral_action2),
            t(LanguageKey.Statistics_FollowerViews_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_FollowerViews_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_FollowerViews_down_title),
          summary: t(LanguageKey.Statistics_FollowerViews_down_summary),
          actions: [
            t(LanguageKey.Statistics_FollowerViews_down_action1),
            t(LanguageKey.Statistics_FollowerViews_down_action2),
            t(LanguageKey.Statistics_FollowerViews_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_FollowerViews_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_FollowerViews_zero_title),
          summary: t(LanguageKey.Statistics_FollowerViews_zero_summary),
          actions: [
            t(LanguageKey.Statistics_FollowerViews_zero_action1),
            t(LanguageKey.Statistics_FollowerViews_zero_action2),
            t(LanguageKey.Statistics_FollowerViews_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_FollowerViews_zero_urgency),
        },
      },

      Statistics_NonFollowerViews: {
        up: {
          title: t(LanguageKey.Statistics_NonFollowerViews_up_title),
          summary: t(LanguageKey.Statistics_NonFollowerViews_up_summary),
          actions: [
            t(LanguageKey.Statistics_NonFollowerViews_up_action1),
            t(LanguageKey.Statistics_NonFollowerViews_up_action2),
            t(LanguageKey.Statistics_NonFollowerViews_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_NonFollowerViews_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_NonFollowerViews_neutral_title),
          summary: t(LanguageKey.Statistics_NonFollowerViews_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_NonFollowerViews_neutral_action1),
            t(LanguageKey.Statistics_NonFollowerViews_neutral_action2),
            t(LanguageKey.Statistics_NonFollowerViews_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_NonFollowerViews_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_NonFollowerViews_down_title),
          summary: t(LanguageKey.Statistics_NonFollowerViews_down_summary),
          actions: [
            t(LanguageKey.Statistics_NonFollowerViews_down_action1),
            t(LanguageKey.Statistics_NonFollowerViews_down_action2),
            t(LanguageKey.Statistics_NonFollowerViews_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_NonFollowerViews_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_NonFollowerViews_zero_title),
          summary: t(LanguageKey.Statistics_NonFollowerViews_zero_summary),
          actions: [
            t(LanguageKey.Statistics_NonFollowerViews_zero_action1),
            t(LanguageKey.Statistics_NonFollowerViews_zero_action2),
            t(LanguageKey.Statistics_NonFollowerViews_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_NonFollowerViews_zero_urgency),
        },
      },

      Statistics_Shares: {
        up: {
          title: t(LanguageKey.Statistics_Shares_up_title),
          summary: t(LanguageKey.Statistics_Shares_up_summary),
          actions: [
            t(LanguageKey.Statistics_Shares_up_action1),
            t(LanguageKey.Statistics_Shares_up_action2),
            t(LanguageKey.Statistics_Shares_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_Shares_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_Shares_neutral_title),
          summary: t(LanguageKey.Statistics_Shares_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Shares_neutral_action1),
            t(LanguageKey.Statistics_Shares_neutral_action2),
            t(LanguageKey.Statistics_Shares_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_Shares_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_Shares_down_title),
          summary: t(LanguageKey.Statistics_Shares_down_summary),
          actions: [
            t(LanguageKey.Statistics_Shares_down_action1),
            t(LanguageKey.Statistics_Shares_down_action2),
            t(LanguageKey.Statistics_Shares_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_Shares_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_Shares_zero_title),
          summary: t(LanguageKey.Statistics_Shares_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Shares_zero_action1),
            t(LanguageKey.Statistics_Shares_zero_action2),
            t(LanguageKey.Statistics_Shares_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_Shares_zero_urgency),
        },
      },

      Statistics_Engagement: {
        up: {
          title: t(LanguageKey.Statistics_Engagement_up_title),
          summary: t(LanguageKey.Statistics_Engagement_up_summary),
          actions: [
            t(LanguageKey.Statistics_Engagement_up_action1),
            t(LanguageKey.Statistics_Engagement_up_action2),
            t(LanguageKey.Statistics_Engagement_up_action3),
          ],
          urgency: t(LanguageKey.Statistics_Engagement_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_Engagement_neutral_title),
          summary: t(LanguageKey.Statistics_Engagement_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Engagement_neutral_action1),
            t(LanguageKey.Statistics_Engagement_neutral_action2),
            t(LanguageKey.Statistics_Engagement_neutral_action3),
          ],
          urgency: t(LanguageKey.Statistics_Engagement_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_Engagement_down_title),
          summary: t(LanguageKey.Statistics_Engagement_down_summary),
          actions: [
            t(LanguageKey.Statistics_Engagement_down_action1),
            t(LanguageKey.Statistics_Engagement_down_action2),
            t(LanguageKey.Statistics_Engagement_down_action3),
          ],
          urgency: t(LanguageKey.Statistics_Engagement_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_Engagement_zero_title),
          summary: t(LanguageKey.Statistics_Engagement_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Engagement_zero_action1),
            t(LanguageKey.Statistics_Engagement_zero_action2),
            t(LanguageKey.Statistics_Engagement_zero_action3),
          ],
          urgency: t(LanguageKey.Statistics_Engagement_zero_urgency),
        },
      },

      Statistics_Replies: {
        up: {
          title: t(LanguageKey.Statistics_Replies_up_title),
          summary: t(LanguageKey.Statistics_Replies_up_summary),
          actions: [
            t(LanguageKey.Statistics_Replies_up_action_1),
            t(LanguageKey.Statistics_Replies_up_action_2),
            t(LanguageKey.Statistics_Replies_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Replies_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_Replies_neutral_title),
          summary: t(LanguageKey.Statistics_Replies_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_Replies_neutral_action_1),
            t(LanguageKey.Statistics_Replies_neutral_action_2),
            t(LanguageKey.Statistics_Replies_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Replies_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_Replies_down_title),
          summary: t(LanguageKey.Statistics_Replies_down_summary),
          actions: [
            t(LanguageKey.Statistics_Replies_down_action_1),
            t(LanguageKey.Statistics_Replies_down_action_2),
            t(LanguageKey.Statistics_Replies_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Replies_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_Replies_zero_title),
          summary: t(LanguageKey.Statistics_Replies_zero_summary),
          actions: [
            t(LanguageKey.Statistics_Replies_zero_action_1),
            t(LanguageKey.Statistics_Replies_zero_action_2),
            t(LanguageKey.Statistics_Replies_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_Replies_zero_urgency),
        },
      },

      Statistics_TotalTime: {
        up: {
          title: t(LanguageKey.Statistics_TotalTime_up_title),
          summary: t(LanguageKey.Statistics_TotalTime_up_summary),
          actions: [
            t(LanguageKey.Statistics_TotalTime_up_action_1),
            t(LanguageKey.Statistics_TotalTime_up_action_2),
            t(LanguageKey.Statistics_TotalTime_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_TotalTime_up_urgency),
        },

        neutral: {
          title: t(LanguageKey.Statistics_TotalTime_neutral_title),
          summary: t(LanguageKey.Statistics_TotalTime_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_TotalTime_neutral_action_1),
            t(LanguageKey.Statistics_TotalTime_neutral_action_2),
            t(LanguageKey.Statistics_TotalTime_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_TotalTime_neutral_urgency),
        },

        down: {
          title: t(LanguageKey.Statistics_TotalTime_down_title),
          summary: t(LanguageKey.Statistics_TotalTime_down_summary),
          actions: [
            t(LanguageKey.Statistics_TotalTime_down_action_1),
            t(LanguageKey.Statistics_TotalTime_down_action_2),
            t(LanguageKey.Statistics_TotalTime_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_TotalTime_down_urgency),
        },

        zero: {
          title: t(LanguageKey.Statistics_TotalTime_zero_title),
          summary: t(LanguageKey.Statistics_TotalTime_zero_summary),
          actions: [
            t(LanguageKey.Statistics_TotalTime_zero_action_1),
            t(LanguageKey.Statistics_TotalTime_zero_action_2),
            t(LanguageKey.Statistics_TotalTime_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_TotalTime_zero_urgency),
        },
      },

      Statistics_ReachMonth: {
        up: {
          title: t(LanguageKey.Statistics_ReachMonth_up_title),
          summary: t(LanguageKey.Statistics_ReachMonth_up_summary),
          actions: [
            t(LanguageKey.Statistics_ReachMonth_up_action_1),
            t(LanguageKey.Statistics_ReachMonth_up_action_2),
            t(LanguageKey.Statistics_ReachMonth_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ReachMonth_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_ReachMonth_neutral_title),
          summary: t(LanguageKey.Statistics_ReachMonth_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_ReachMonth_neutral_action_1),
            t(LanguageKey.Statistics_ReachMonth_neutral_action_2),
            t(LanguageKey.Statistics_ReachMonth_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ReachMonth_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_ReachMonth_down_title),
          summary: t(LanguageKey.Statistics_ReachMonth_down_summary),
          actions: [
            t(LanguageKey.Statistics_ReachMonth_down_action_1),
            t(LanguageKey.Statistics_ReachMonth_down_action_2),
            t(LanguageKey.Statistics_ReachMonth_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ReachMonth_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_ReachMonth_zero_title),
          summary: t(LanguageKey.Statistics_ReachMonth_zero_summary),
          actions: [
            t(LanguageKey.Statistics_ReachMonth_zero_action_1),
            t(LanguageKey.Statistics_ReachMonth_zero_action_2),
            t(LanguageKey.Statistics_ReachMonth_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_ReachMonth_zero_urgency),
        },
      },

      Statistics_MonthEngagement: {
        up: {
          title: t(LanguageKey.Statistics_MonthEngagement_up_title),
          summary: t(LanguageKey.Statistics_MonthEngagement_up_summary),
          actions: [
            t(LanguageKey.Statistics_MonthEngagement_up_action_1),
            t(LanguageKey.Statistics_MonthEngagement_up_action_2),
            t(LanguageKey.Statistics_MonthEngagement_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthEngagement_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_MonthEngagement_neutral_title),
          summary: t(LanguageKey.Statistics_MonthEngagement_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_MonthEngagement_neutral_action_1),
            t(LanguageKey.Statistics_MonthEngagement_neutral_action_2),
            t(LanguageKey.Statistics_MonthEngagement_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthEngagement_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_MonthEngagement_down_title),
          summary: t(LanguageKey.Statistics_MonthEngagement_down_summary),
          actions: [
            t(LanguageKey.Statistics_MonthEngagement_down_action_1),
            t(LanguageKey.Statistics_MonthEngagement_down_action_2),
            t(LanguageKey.Statistics_MonthEngagement_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthEngagement_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_MonthEngagement_zero_title),
          summary: t(LanguageKey.Statistics_MonthEngagement_zero_summary),
          actions: [
            t(LanguageKey.Statistics_MonthEngagement_zero_action_1),
            t(LanguageKey.Statistics_MonthEngagement_zero_action_2),
            t(LanguageKey.Statistics_MonthEngagement_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthEngagement_zero_urgency),
        },
      },
      Statistics_MonthView: {
        up: {
          title: t(LanguageKey.Statistics_MonthView_up_title),
          summary: t(LanguageKey.Statistics_MonthView_up_summary),
          actions: [
            t(LanguageKey.Statistics_MonthView_up_action_1),
            t(LanguageKey.Statistics_MonthView_up_action_2),
            t(LanguageKey.Statistics_MonthView_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthView_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_MonthView_neutral_title),
          summary: t(LanguageKey.Statistics_MonthView_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_MonthView_neutral_action_1),
            t(LanguageKey.Statistics_MonthView_neutral_action_2),
            t(LanguageKey.Statistics_MonthView_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthView_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_MonthView_down_title),
          summary: t(LanguageKey.Statistics_MonthView_down_summary),
          actions: [
            t(LanguageKey.Statistics_MonthView_down_action_1),
            t(LanguageKey.Statistics_MonthView_down_action_2),
            t(LanguageKey.Statistics_MonthView_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthView_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_MonthView_zero_title),
          summary: t(LanguageKey.Statistics_MonthView_zero_summary),
          actions: [
            t(LanguageKey.Statistics_MonthView_zero_action_1),
            t(LanguageKey.Statistics_MonthView_zero_action_2),
            t(LanguageKey.Statistics_MonthView_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_MonthView_zero_urgency),
        },
      },

      Statistics_RePosts: {
        up: {
          title: t(LanguageKey.Statistics_RePosts_up_title),
          summary: t(LanguageKey.Statistics_RePosts_up_summary),
          actions: [
            t(LanguageKey.Statistics_RePosts_up_action_1),
            t(LanguageKey.Statistics_RePosts_up_action_2),
            t(LanguageKey.Statistics_RePosts_up_action_3),
          ],
          urgency: t(LanguageKey.Statistics_RePosts_up_urgency),
        },
        neutral: {
          title: t(LanguageKey.Statistics_RePosts_neutral_title),
          summary: t(LanguageKey.Statistics_RePosts_neutral_summary),
          actions: [
            t(LanguageKey.Statistics_RePosts_neutral_action_1),
            t(LanguageKey.Statistics_RePosts_neutral_action_2),
            t(LanguageKey.Statistics_RePosts_neutral_action_3),
          ],
          urgency: t(LanguageKey.Statistics_RePosts_neutral_urgency),
        },
        down: {
          title: t(LanguageKey.Statistics_RePosts_down_title),
          summary: t(LanguageKey.Statistics_RePosts_down_summary),
          actions: [
            t(LanguageKey.Statistics_RePosts_down_action_1),
            t(LanguageKey.Statistics_RePosts_down_action_2),
            t(LanguageKey.Statistics_RePosts_down_action_3),
          ],
          urgency: t(LanguageKey.Statistics_RePosts_down_urgency),
        },
        zero: {
          title: t(LanguageKey.Statistics_RePosts_zero_title),
          summary: t(LanguageKey.Statistics_RePosts_zero_summary),
          actions: [
            t(LanguageKey.Statistics_RePosts_zero_action_1),
            t(LanguageKey.Statistics_RePosts_zero_action_2),
            t(LanguageKey.Statistics_RePosts_zero_action_3),
          ],
          urgency: t(LanguageKey.Statistics_RePosts_zero_urgency),
        },
      },
    }),
    [t]
  );
  const getSuggestionFor = useCallback(
    (id: string, points: any[], isOpen?: boolean, onToggle?: () => void): React.ReactNode => {
      if (!points || points.length === 0)
        return <SuggestionCard item={{ message: t(LanguageKey.pageStatistics_EmptyList) }} />;
      const values = points.map((p) =>
        typeof p.totalCount === "number" ? p.totalCount : typeof p.plusCount === "number" ? p.plusCount : 0
      );
      const allZero = values.every((v) => v === 0);
      const map = suggestionsMap[id];
      if (!map) return <SuggestionCard item={{ message: t(LanguageKey.pageStatistics_EmptyList) }} />;
      if (allZero) return <SuggestionCard item={map.zero} isOpen={isOpen} onToggle={onToggle} />;
      const trend = getAdvancedTrendFromPoints(points);
      const chosen = trend === "up" ? map.up : trend === "down" ? map.down : map.neutral;
      return <SuggestionCard item={chosen} isOpen={isOpen} onToggle={onToggle} />;
    },
    [suggestionsMap, t]
  );
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [openSuggestionIds, setOpenSuggestionIds] = useState<string[]>([]);
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const isCurrentlyCollapsed = prev.includes(id);
      const newCollapsed = isCurrentlyCollapsed ? prev.filter((i) => i !== id) : [...prev, id];
      if (!isCurrentlyCollapsed) {
        setOpenSuggestionIds((prevOpen) => prevOpen.filter((i) => i !== id));
      }
      return newCollapsed;
    });
  }, []);
  const toggleSuggestion = useCallback((id: string) => {
    setOpenSuggestionIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);
  return (
    <>
      {graphConfigs.map((config) => {
        const isCollapsed = collapsedIds.includes(config.id);
        const isSuggestionOpen = openSuggestionIds.includes(config.id);
        const isDataLoading = !config.data || (Array.isArray(config.data) && config.data.length === 0);
        const rowSpan = isSuggestionOpen
          ? (config as any).isMonth
            ? 60
            : 67
          : isCollapsed
          ? 10
          : (config as any).isMonth
          ? 49
          : 52;
        return (
          <div
            key={config.id}
            className="bigcard"
            style={{
              gridRowEnd: `span ${rowSpan}`,
            }}>
            <div className="frameParent" style={{ maxWidth: "85%" }}>
              <button
                type="button"
                className="headerChild"
                onClick={() => toggleCollapse(config.id)}
                style={{
                  cursor: "pointer",
                  padding: isCollapsed && isSmallScreen ? "7px" : undefined,
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                }}>
                <div className="circle"></div>
                <div className="Title">{config.name}</div>
              </button>
            </div>
            <div className={styles.all} style={{ display: isCollapsed ? "none" : undefined }}>
              {isDataLoading ? (
                <Loading />
              ) : (
                <>
                  {(config as any).isMonth ? (
                    <MounthViews id={config.id} name={config.name} data={(config as any).data as any} />
                  ) : (
                    <div style={{ height: 342 }}>
                      <MultiChart
                        id={config.id}
                        name={config.name}
                        allowShowAll={true}
                        showAverage={true}
                        seriesData={
                          Array.isArray(config.data) && (config as any).isMonth !== true
                            ? [
                                {
                                  id: `${config.id}_series`,
                                  name: config.name,
                                  data: config.data as IMonthGraph[],
                                },
                              ]
                            : []
                        }
                      />
                    </div>
                  )}
                  {getSuggestionFor(config.id, config.data as any, isSuggestionOpen, () => toggleSuggestion(config.id))}
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
export default EngageMentStatistics;
