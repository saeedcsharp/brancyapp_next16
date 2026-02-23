import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useReducer } from "react";
import { useTranslation } from "react-i18next";
import Modal from "brancy/components/design/modal";
import NotAllowed from "brancy/components/notOk/notAllowed";
import NotPermission, {
  PermissionType,
} from "brancy/components/notOk/notPermission";
import BestFollowers from "brancy/components/page/statistics/bestFollower/bestFollower";
import CardBestWorst from "brancy/components/page/statistics/cardBestWorst/cardBestWorst";
import EngageMentStatistics from "brancy/components/page/statistics/engagementStatistics/engagementStatistics";
import IngageBoxModel from "brancy/components/page/statistics/inagegBoxes/inagegBoxes";
import PostStatsViewer from "brancy/components/page/statistics/popups/PostStatsViewer";
import PostTimeAnalysis from "brancy/components/page/statistics/popups/postTimeAnalysis";
import {
  LoginStatus,
  packageStatus,
  RoleAccess,
} from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { IPostContent } from "brancy/models/page/post/posts";
import { IBestFollowers } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/bestFollower";
import { IBestTime } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/cardBestWorst";
import { GraphGhostViewersModel } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/GraphGhostViewersModel";
import { GraphViewsFourMonthModel } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/GraphViewsFourMonthModel";
import styles from "./page.module.css";
enum PopupType {
  NONE = "NONE",
  CARD_BEST = "CARD_BEST",
  MAX_VIEW = "MAX_VIEW",
  MIN_VIEW = "MIN_VIEW",
  MAX_LIKE_COMMENT = "MAX_LIKE_COMMENT",
  MIN_LIKE_COMMENT = "MIN_LIKE_COMMENT",
}
interface IPopupState {
  activePopup: PopupType;
  maxViewPopup: IPostContent[];
  minViewPopup: IPostContent[];
  maxLikeCommentPopup: IPostContent[];
  minLikeCommentPopup: IPostContent[];
  bestTimeSeries: IBestTime;
}
interface IStatisticsState {
  popups: IPopupState;
  fourMounthViews: GraphViewsFourMonthModel | null;
  ghostViewerChart: GraphGhostViewersModel | null;
  bestFollowers: IBestFollowers[] | null;
}
type StatisticsAction =
  | { type: "SET_POPUP"; popupType: PopupType }
  | { type: "SET_MAX_VIEW_POPUP"; data: IPostContent[] }
  | { type: "SET_MIN_VIEW_POPUP"; data: IPostContent[] }
  | { type: "SET_MAX_LIKE_COMMENT_POPUP"; data: IPostContent[] }
  | { type: "SET_MIN_LIKE_COMMENT_POPUP"; data: IPostContent[] }
  | { type: "SET_BEST_TIME_SERIES"; data: IBestTime };

const initialPopupState: IPopupState = {
  activePopup: PopupType.NONE,
  maxViewPopup: [],
  minViewPopup: [],
  maxLikeCommentPopup: [],
  minLikeCommentPopup: [],
  bestTimeSeries: {
    day30CountUnixes: [],
    day120CountUnixes: [],
    day60CountUnixes: [],
    day90CountUnixes: [],
  },
};
const initialState: IStatisticsState = {
  popups: initialPopupState,
  fourMounthViews: null,
  ghostViewerChart: null,
  bestFollowers: null,
};
const statisticsReducer = (
  state: IStatisticsState,
  action: StatisticsAction
): IStatisticsState => {
  switch (action.type) {
    case "SET_POPUP":
      return {
        ...state,
        popups: {
          ...state.popups,
          activePopup: action.popupType,
        },
      };
    case "SET_MAX_VIEW_POPUP":
      return {
        ...state,
        popups: {
          ...state.popups,
          maxViewPopup: action.data,
        },
      };
    case "SET_MIN_VIEW_POPUP":
      return {
        ...state,
        popups: {
          ...state.popups,
          minViewPopup: action.data,
        },
      };
    case "SET_MAX_LIKE_COMMENT_POPUP":
      return {
        ...state,
        popups: {
          ...state.popups,
          maxLikeCommentPopup: action.data,
        },
      };
    case "SET_MIN_LIKE_COMMENT_POPUP":
      return {
        ...state,
        popups: {
          ...state.popups,
          minLikeCommentPopup: action.data,
        },
      };
    case "SET_BEST_TIME_SERIES":
      return {
        ...state,
        popups: {
          ...state.popups,
          bestTimeSeries: action.data,
        },
      };

    default:
      return state;
  }
};
const Stattistics = (prop: { onComponentClick: () => void }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  React.useEffect(() => {
    if (session && !LoginStatus(session)) router.push("/");
    if (session && !packageStatus(session)) router.push("/upgrade");
  }, [session, router]);
  const [state, dispatch] = useReducer(statisticsReducer, initialState);
  const { popups } = state;
  const handleShowPopup = useCallback(
    (popupType: PopupType, e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e?.stopPropagation();
      dispatch({ type: "SET_POPUP", popupType });
    },
    []
  );
  const handleRemoveMask = useCallback(() => {
    dispatch({ type: "SET_POPUP", popupType: PopupType.NONE });
  }, []);
  const handleSetMaxViewPopup = useCallback((list: IPostContent[]) => {
    dispatch({ type: "SET_MAX_VIEW_POPUP", data: list });
  }, []);
  const handleSetMinViewPopup = useCallback((list: IPostContent[]) => {
    dispatch({ type: "SET_MIN_VIEW_POPUP", data: list });
  }, []);
  const handleSetMaxLikeCommentPopup = useCallback((list: IPostContent[]) => {
    dispatch({ type: "SET_MAX_LIKE_COMMENT_POPUP", data: list });
  }, []);
  const handleSetMinLikeCommentPopup = useCallback((list: IPostContent[]) => {
    dispatch({ type: "SET_MIN_LIKE_COMMENT_POPUP", data: list });
  }, []);
  const handleSetBestTimeSeries = useCallback((bestTime: IBestTime) => {
    dispatch({ type: "SET_BEST_TIME_SERIES", data: bestTime });
  }, []);
  const isAnyPopupActive = popups.activePopup !== PopupType.NONE;
  if (session?.user.currentIndex === -1) router.push("/user");
  if (session && !session?.user.insightPermission)
    return <NotPermission permissionType={PermissionType.Insights} />;
  return (
    <>
      {!RoleAccess(session, PartnerRole.PageView) && <NotAllowed />}
      {session && session.user.currentIndex !== -1 && (
        <>
          {/* head for SEO */}
          <Head>
            {" "}
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
            />
            <title>Bran.cy ▸ {t(LanguageKey.navbar_Statistics)}</title>
            <meta
              name="description"
              content="Advanced Instagram post management tool"
            />
            <meta name="theme-color"></meta>
            <meta
              name="keywords"
              content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
            />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://www.Brancy.app/page/posts" />
            {/* Add other meta tags as needed */}
          </Head>
          {/* head for SEO */}
          <main>
            <div
              onClick={handleRemoveMask}
              className={
                isAnyPopupActive ? styles.frameGroupFade : styles.frameGroup
              }>
              <section className={styles.inboxContainer}>
                <IngageBoxModel
                  // data={ingageBoxes}
                  showMaxPopups={(e) => handleShowPopup(PopupType.MAX_VIEW, e)}
                  showMinPopups={(e) => handleShowPopup(PopupType.MIN_VIEW, e)}
                  showMaxLikeCommentPopups={(e) =>
                    handleShowPopup(PopupType.MAX_LIKE_COMMENT, e)
                  }
                  showMinLikeCommentPopups={(e) =>
                    handleShowPopup(PopupType.MIN_LIKE_COMMENT, e)
                  }
                  sendMaxReachPopup={handleSetMaxViewPopup}
                  sendMaxCommentPopup={handleSetMaxLikeCommentPopup}
                  sendMinCommentPopup={handleSetMinLikeCommentPopup}
                  sendMinReachPopup={handleSetMinViewPopup}
                />
              </section>
              <section className="pinContainer">
                <CardBestWorst
                  handleShowPopups={(e) =>
                    handleShowPopup(PopupType.CARD_BEST, e)
                  }
                  setCardBestTime={handleSetBestTimeSeries}
                />
                <EngageMentStatistics />
                <BestFollowers largSizeForIngage={() => {}} />
              </section>
            </div>
            <Modal
              style={{ maxWidth: "700px", width: "100%" }}
              closePopup={handleRemoveMask}
              classNamePopup={"popup"}
              showContent={popups.activePopup === PopupType.CARD_BEST}>
              <PostTimeAnalysis
                removeMask={handleRemoveMask}
                bestTimeSeries={popups.bestTimeSeries}
              />
            </Modal>
            <Modal
              closePopup={handleRemoveMask}
              classNamePopup={"popup"}
              showContent={popups.activePopup === PopupType.MAX_VIEW}>
              <PostStatsViewer
                removeMask={handleRemoveMask}
                data={popups.maxViewPopup}
                sortType="maxView"
              />
            </Modal>
            <Modal
              closePopup={handleRemoveMask}
              classNamePopup={"popup"}
              showContent={popups.activePopup === PopupType.MIN_VIEW}>
              <PostStatsViewer
                removeMask={handleRemoveMask}
                data={popups.minViewPopup}
                sortType="minView"
              />
            </Modal>
            <Modal
              closePopup={handleRemoveMask}
              classNamePopup={"popup"}
              showContent={popups.activePopup === PopupType.MAX_LIKE_COMMENT}>
              <PostStatsViewer
                removeMask={handleRemoveMask}
                data={popups.maxLikeCommentPopup}
                sortType="maxEngagement"
              />
            </Modal>
            <Modal
              closePopup={handleRemoveMask}
              classNamePopup={"popup"}
              showContent={popups.activePopup === PopupType.MIN_LIKE_COMMENT}>
              <PostStatsViewer
                removeMask={handleRemoveMask}
                data={popups.minLikeCommentPopup}
                sortType="minEngagement"
              />
            </Modal>
          </main>
        </>
      )}
    </>
  );
};
export default Stattistics;
