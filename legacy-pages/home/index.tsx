import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResponseType } from "saeed/components/notifications/notificationBox";
import { LoginStatus, packageStatus } from "saeed/helper/loadingStatus";
import { IError } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import {
  IDemographicInsight,
  IInstagramerHomeTiles,
  ILastFollower,
  ILastLike,
  ILastMessage,
  ILastOrder,
  ILastTransaction,
  IPageSummary,
} from "saeed/models/homeIndex/home";
import { MethodType } from "saeed/helper/api";
import { IPostContent } from "saeed/models/page/post/posts";
import { IStoryContent } from "saeed/models/page/story/stories";
import AccountSummary from "../../components/homeIndex/accountSummary";
import IngageInfo from "../../components/homeIndex/ingageInfo";
import InstagramerUpgrade from "../../components/homeIndex/instagramerupgrade";
import LastMessage from "../../components/homeIndex/lastMessage";
import LastOrder from "../../components/homeIndex/lastOrder";
import PageDetail from "../../components/homeIndex/pageDetail";
import PostSummary from "../../components/homeIndex/postSummary";
import TutorialWrapper from "../../components/tutorial/tutorialWrapper";
import styles from "./homeIndex.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const initialState = {
  error: { message: null } as IError,
  lastMessages: null as ILastMessage[] | null,
  lastReplies: null as ILastMessage[] | null,
  lastComments: null as ILastMessage[] | null,
  lastOrder: null as ILastOrder[] | null,
  lastTransaction: null as ILastTransaction[] | null,
  lastLikes: null as ILastLike[] | null,
  lastFollowers: null as ILastFollower[] | null,
  hometiles: null as IInstagramerHomeTiles | null,
  demographic: {} as IDemographicInsight,
  activeStories: [] as IStoryContent[],
  posts: null as IPostContent[] | null,
  pageSummary: null as IPageSummary | null,
};

type State = typeof initialState;
type Action =
  | { type: "SET_LAST_MESSAGES"; payload: ILastMessage[] | null }
  | { type: "SET_LAST_REPLIES"; payload: ILastMessage[] | null }
  | { type: "SET_LAST_COMMENTS"; payload: ILastMessage[] | null }
  | { type: "SET_LAST_ORDER"; payload: ILastOrder[] | null }
  | { type: "SET_LAST_TRANSACTION"; payload: ILastTransaction[] | null }
  | { type: "SET_LAST_LIKES"; payload: ILastLike[] | null }
  | { type: "SET_LAST_FOLLOWERS"; payload: ILastFollower[] | null }
  | { type: "SET_HOMETILES"; payload: IInstagramerHomeTiles | null }
  | { type: "SET_ERROR"; payload: IError }
  | { type: "SET_DEMOGRAPHIC_INSIGHT"; payload: IDemographicInsight }
  | { type: "SET_ACTIVE_STORIES"; payload: IStoryContent[] }
  | { type: "SET_POSTS"; payload: IPostContent[] | null }
  | { type: "SET_PAGE_SUMMARY"; payload: IPageSummary | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LAST_MESSAGES":
      return { ...state, lastMessages: action.payload };
    case "SET_LAST_REPLIES":
      return { ...state, lastReplies: action.payload };
    case "SET_LAST_COMMENTS":
      return { ...state, lastComments: action.payload };
    case "SET_LAST_ORDER":
      return { ...state, lastOrder: action.payload };
    case "SET_LAST_TRANSACTION":
      return { ...state, lastTransaction: action.payload };
    case "SET_LAST_LIKES":
      return { ...state, lastLikes: action.payload };
    case "SET_LAST_FOLLOWERS":
      return { ...state, lastFollowers: action.payload };
    case "SET_HOMETILES":
      return { ...state, hometiles: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_DEMOGRAPHIC_INSIGHT":
      return { ...state, demographic: action.payload };
    case "SET_ACTIVE_STORIES":
      return { ...state, activeStories: action.payload };
    case "SET_POSTS":
      return { ...state, posts: action.payload };
    case "SET_PAGE_SUMMARY":
      return { ...state, pageSummary: action.payload };
    default:
      return state;
  }
}

const Home = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Add loading and data states
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);

  // Handle authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
  }, [status, router]);
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current || !session) return;

    isFetchingRef.current = true;
    try {
      const [
        lastMessages,
        // lastReplies,
        lastComments,
        hometiles,
        demographic,
        activeStories,
        posts,
        pageSummary,
      ] = await Promise.all([
        session.user.messagePermission
          ? clientFetchApi<boolean, ILastMessage[]>("/api/home/GetLastMessages", {
              methodType: MethodType.get,
              session: session,
              data: null,
              queries: undefined,
              onUploadProgress: undefined,
            })
          : {
              succeeded: false,
              value: [],
              info: {
                exception: null,
                message: "",
                needsChallenge: false,
                actionBlockEnd: null,
                responseType: 0,
              },
              statusCode: 200,
              errorMessage: "",
            },
        // GetServerResult<boolean, ILastMessage[]>(
        //   MethodType.get,
        //   session,
        //   "Instagramer/Home/GetLastReplies",
        //   null
        // ),
        session.user.commentPermission
          ? clientFetchApi<boolean, ILastMessage[]>("/api/home/GetLastComments", {
              methodType: MethodType.get,
              session: session,
              data: null,
              queries: undefined,
              onUploadProgress: undefined,
            })
          : {
              succeeded: false,
              value: [],
              info: {
                exception: null,
                message: "",
                needsChallenge: false,
                actionBlockEnd: null,
                responseType: 0,
              },
              statusCode: 200,
              errorMessage: "",
            },
        clientFetchApi<boolean, IInstagramerHomeTiles>("/api/home/GetTiles", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        session.user.insightPermission
          ? clientFetchApi<boolean, IDemographicInsight>("/api/statistics/GetDemographicInsight", {
              methodType: MethodType.get,
              session: session,
              data: null,
              queries: undefined,
              onUploadProgress: undefined,
            })
          : {
              succeeded: false,
              value: {
                followerAge: [],
                followerGender: [],
                followerCountry: [],
                followerCity: [],
              },
              info: {
                exception: null,
                message: "",
                needsChallenge: false,
                actionBlockEnd: null,
                responseType: 0,
              },
              statusCode: 200,
              errorMessage: "",
            },
        clientFetchApi<boolean, IStoryContent[]>("/api/story/GetLastActiveStories", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IPostContent[]>("/api/post/GetPostCards", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IPageSummary>("/api/home/GetPageSummary", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);
      if (session.user.messagePermission) dispatch({ type: "SET_LAST_MESSAGES", payload: lastMessages.value });
      // dispatch({ type: "SET_LAST_REPLIES", payload: lastReplies.value });
      if (session.user.commentPermission) dispatch({ type: "SET_LAST_COMMENTS", payload: lastComments.value });
      dispatch({ type: "SET_HOMETILES", payload: hometiles.value });
      if (session.user.insightPermission)
        dispatch({
          type: "SET_DEMOGRAPHIC_INSIGHT",
          payload: demographic.value,
        });
      dispatch({ type: "SET_ACTIVE_STORIES", payload: activeStories.value });
      dispatch({ type: "SET_POSTS", payload: posts.value });
      if (!pageSummary.succeeded && pageSummary.info.responseType === ResponseType.PageSummaryNotGenerated) {
        dispatch({
          type: "SET_PAGE_SUMMARY",
          payload: {
            createdTime: Date.now() / 1000,
            instagramerId: session.user.Id,
            summary: t("Notify_PageSummaryNotGenerated"),
          },
        });
      } else if (pageSummary.succeeded) dispatch({ type: "SET_PAGE_SUMMARY", payload: pageSummary.value });
      setIsDataLoaded(true);
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: { message: error.message } });
    } finally {
      isFetchingRef.current = false;
    }
  }, [session]);

  useEffect(() => {
    // Only fetch data if not already loaded and session is authenticated
    if (!session) return;

    // Wait until session is fully loaded with packageExpireTime
    if (session.user.packageExpireTime === undefined) {
      console.log("Waiting for session to be fully loaded...");
      return;
    }
    console.log("Session loaded, checking package status...", session);
    if (!packageStatus(session) && session?.user?.loginByInsta) {
      router.push("/upgrade");
      return;
    }

    if (!isDataLoaded && LoginStatus(session) && status === "authenticated") {
      fetchData();
    }
  }, [session, status, isDataLoaded, fetchData, router]);

  if (session?.user.currentIndex === -1) {
    router.push("/user");
    return null;
  }

  return (
    session &&
    session.user.currentIndex !== -1 && (
      <>
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>Bran.cy - Advanced Instagram Management</title>
          <meta name="theme-color" />
          <meta
            name="description"
            content="Bran.cy offers advanced tools for managing Instagram posts, stories, insights, and more. Enhance your Instagram experience with our comprehensive suite of features."
          />
          <meta
            name="keywords"
            content="Instagram, management, tools, Brancy, post creation, story creation, lottery, insights, Graph API, like, share, comment, view, tag, hashtag"
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/home" />
          <meta property="og:title" content="Bran.cy - Advanced Instagram Management" />
          <meta
            property="og:description"
            content="Manage your Instagram posts, stories, and insights effortlessly with Bran.cy's advanced tools."
          />
          <meta property="og:url" content="https://www.Brancy.app/home" />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://www.Brancy.app/images/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Bran.cy - Advanced Instagram Management" />
          <meta
            name="twitter:description"
            content="Enhance your Instagram experience with Bran.cy's comprehensive management tools."
          />
          <meta name="twitter:image" content="https://www.Brancy.app/images/twitter-image.png" />
        </Head>
        <main
          id="mainContent"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          {!session.user.isShopper && !session.user.isInfluencer && <InstagramerUpgrade />}
          <div id="hometiles" className={styles.inboxContainer}>
            <IngageInfo
              data={state.hometiles}
              collaboratePostNumber={
                state?.posts && state?.hometiles?.mediaCount
                  ? state.hometiles.mediaCount - state.posts[0].tempId < 0
                    ? 0
                    : state.hometiles.mediaCount - state.posts[0].tempId
                  : 0
              }
              activeStories={state.activeStories}
            />
          </div>

          <div
            className="pinContainer"
            style={{
              maxWidth: "calc(3 * 395px + 2 * var(--gap-20))",
            }}>
            {state.pageSummary && <AccountSummary data={state.pageSummary} />}

            {session.user.messagePermission && state.hometiles && (
              <LastMessage
                data={state.lastMessages}
                repliesData={state.lastReplies}
                unreadComments={state.hometiles.items.find((x) => x.title === "Total Unseen Comment")?.value}
              />
            )}

            {state.hometiles?.followerCount &&
              state.hometiles?.followerCount > 100 &&
              session.user.insightPermission && <PageDetail data={state.demographic} items={state.hometiles?.items!} />}
            {!session.user.isShopper && !session.user.isInfluencer && (
              <PostSummary data={state.hometiles} posts={state.posts} />
            )}

            {/* {!session.user.isShopper && !session.user.isInfluencer && state.lastComments && (
              <LastComments data={state.lastComments} />
            )} */}
            {session.user.isShopper && session.user.isShopper && <LastOrder data={state.lastOrder} />}
            {/* {session.user.isShopper && (
              <LastTransaction data={state.lastTransaction} />
            )} */}
            {/* <LastFollower data={state.lastFollowers} /> */}
          </div>
        </main>

        {/* نمایش توتریال برای کاربران جدید */}
        <TutorialWrapper pageKey="home" />
      </>
    )
  );
};

export default Home;
