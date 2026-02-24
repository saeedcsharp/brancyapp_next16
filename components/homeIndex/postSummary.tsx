import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { memo, useCallback, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { IInstagramerHomeTiles } from "brancy/models/homeIndex/home";
import { IPostContent } from "brancy/models/page/post/posts";
import styles from "./postSummary.module.css";

// Cache for posts data
// const postsCache = new Map<
//   string,
//   {
//     data: IPostContent[];
//     timestamp: number;
//     allPosts: IPostContent[];
//   }
// >();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to clear expired cache entries
// const clearExpiredCache = () => {
//   const now = Date.now();
//   for (const [key, value] of postsCache.entries()) {
//     if (now - value.timestamp >= CACHE_DURATION) {
//       postsCache.delete(key);
//     }
//   }
// };

interface PostSummaryState {
  posts: IPostContent[] | null;
  page: number;
  hasMore: boolean;
  isHidden: boolean;
  allPosts: IPostContent[] | null;
}

type PostSummaryAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOADING_MORE"; payload: boolean }
  | { type: "SET_POSTS"; payload: IPostContent[] }
  | { type: "APPEND_POSTS"; payload: IPostContent[] }
  | { type: "SET_HAS_MORE"; payload: boolean }
  | { type: "INCREMENT_PAGE" }
  | { type: "TOGGLE_HIDDEN" }
  | { type: "SET_ALL_POSTS"; payload: IPostContent[] }
  | { type: "RESET" };

const initialState: PostSummaryState = {
  posts: null,
  page: 1,
  hasMore: true,
  isHidden: false,
  allPosts: null,
};

const postSummaryReducer = (state: PostSummaryState, action: PostSummaryAction): PostSummaryState => {
  switch (action.type) {
    case "SET_POSTS":
      return { ...state, posts: action.payload };
    case "APPEND_POSTS":
      return {
        ...state,
        posts: state.posts ? [...state.posts, ...action.payload] : action.payload,
      };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    case "INCREMENT_PAGE":
      return { ...state, page: state.page + 1 };
    case "TOGGLE_HIDDEN":
      return { ...state, isHidden: !state.isHidden };
    case "SET_ALL_POSTS":
      return { ...state, allPosts: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const PostItem = memo(
  ({
    post,
    basePictureUrl,
    onPostClick,
  }: {
    post: IPostContent;
    basePictureUrl: string;
    onPostClick: (postId: number) => void;
  }) => (
    <div
      className={styles.postItem}
      onClick={() => onPostClick(post.postId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPostClick(post.postId)}
      aria-label={`Post ${post.tempId}`}>
      <img
        // priority
        decoding="async"
        src={`${basePictureUrl}${post.thumbnailMediaUrl}`}
        alt={`Post ${post.tempId}`}
        // fill
        className={styles.postImage}
        sizes="(max-width: 480px) 40px, (max-width: 768px) 80px, 90px"
      />
      <span className={styles.postNumber}>{post.tempId.toLocaleString()}</span>
    </div>
  ),
);

PostItem.displayName = "PostItem";

const PostSummary = memo((props: { data: IInstagramerHomeTiles | null; posts: IPostContent[] | null }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(postSummaryReducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);

  const basePictureUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_MEDIA_URL || "", []);

  const POSTS_PER_PAGE = useMemo(() => 12, []);

  const handleCircleClick = useCallback(() => {
    dispatch({ type: "TOGGLE_HIDDEN" });
  }, []);

  const handlePostClick = useCallback(
    (postId: number) => {
      router.push(`/page/posts/postinfo/${postId}`);
    },
    [router],
  );

  // const fetchPosts = useCallback(
  //   async (pageNumber: number, isFirstLoad = false) => {
  //     if (!session || !LoginStatus(session)) return;

  //     // const cacheKey = `posts_${session.user?.Id || "default"}`;
  //     // const now = Date.now();

  //     // Check if we have valid cached data
  //     // if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
  //     //   const allPosts = cachedData.allPosts;
  //     //   const startIndex = (pageNumber - 1) * POSTS_PER_PAGE;
  //     //   const endIndex = startIndex + POSTS_PER_PAGE;
  //     //   const newPosts = allPosts.slice(startIndex, endIndex);

  //     //   if (isFirstLoad) {
  //     //     dispatch({ type: "SET_ALL_POSTS", payload: allPosts });
  //     //     dispatch({ type: "SET_POSTS", payload: newPosts });
  //     //   } else {
  //     //     dispatch({ type: "APPEND_POSTS", payload: newPosts });
  //     //   }

  //     //   dispatch({
  //     //     type: "SET_HAS_MORE",
  //     //     payload: endIndex < allPosts.length,
  //     //   });

  //     //   dispatch({
  //     //     type: isFirstLoad ? "SET_LOADING" : "SET_LOADING_MORE",
  //     //     payload: false,
  //     //   });
  //     //   return;
  //     // }

  //     // If we have allPosts in state but need more pages, use them instead of API call
  //     if (!isFirstLoad && state.allPosts) {
  //       const startIndex = (pageNumber - 1) * POSTS_PER_PAGE;
  //       const endIndex = startIndex + POSTS_PER_PAGE;
  //       const newPosts = state.allPosts.slice(startIndex, endIndex);

  //       dispatch({ type: "APPEND_POSTS", payload: newPosts });
  //       dispatch({
  //         type: "SET_HAS_MORE",
  //         payload: endIndex < state.allPosts.length,
  //       });

  //       dispatch({ type: "SET_LOADING_MORE", payload: false });
  //       return;
  //     }

  //     // dispatch({
  //     //   type: isFirstLoad ? "SET_LOADING" : "SET_LOADING_MORE",
  //     //   payload: true,
  //     // });

  //     try {
  //       const result = await GetServerResult<string, IPost>(
  //         MethodType.get,
  //         session,
  //         "Instagramer/Post/GetPosts",
  //         null,
  //         []
  //       );

  //       if (result.succeeded && result.value?.posts) {
  //         const allPosts = result.value.posts;

  //         // Cache the data
  //         // postsCache.set(cacheKey, {
  //         //   data: allPosts,
  //         //   timestamp: now,
  //         //   allPosts: allPosts,
  //         // });

  //         const startIndex = (pageNumber - 1) * POSTS_PER_PAGE;
  //         const endIndex = startIndex + POSTS_PER_PAGE;
  //         const newPosts = allPosts.slice(startIndex, endIndex);

  //         if (isFirstLoad) {
  //           dispatch({ type: "SET_ALL_POSTS", payload: allPosts });
  //           dispatch({ type: "SET_POSTS", payload: newPosts });
  //         } else {
  //           dispatch({ type: "APPEND_POSTS", payload: newPosts });
  //         }

  //         dispatch({
  //           type: "SET_HAS_MORE",
  //           payload: endIndex < allPosts.length,
  //         });
  //       }
  //     } catch (error) {
  //       // Error handling can be added here if needed
  //     } finally {
  //       dispatch({
  //         type: isFirstLoad ? "SET_LOADING" : "SET_LOADING_MORE",
  //         payload: false,
  //       });
  //     }
  //   },
  //   [session, POSTS_PER_PAGE, state.allPosts]
  // );

  // const handleScroll = useCallback(() => {
  //   const container = containerRef.current;
  //   if (!container || state.isLoadingMore || !state.hasMore) return;

  //   const { scrollTop, scrollHeight, clientHeight } = container;
  //   if (scrollTop + clientHeight >= scrollHeight - 10) {
  //     dispatch({ type: "INCREMENT_PAGE" });
  //     fetchPosts(state.page + 1, false);
  //   }
  // }, [state.isLoadingMore, state.hasMore, state.page, fetchPosts]);

  const postsCount = useMemo(() => props.data?.mediaCount?.toLocaleString() || "0", [props.data?.mediaCount]);

  const followerCount = useMemo(() => props.data?.followerCount?.toLocaleString() || "0", [props.data?.followerCount]);

  const followingCount = useMemo(
    () => props.data?.followingCount?.toLocaleString() || "0",
    [props.data?.followingCount],
  );

  const containerStyle = useMemo(
    () => ({
      maxHeight: state.isHidden ? "0" : "100%",
      opacity: state.isHidden ? 0 : 1,
    }),
    [state.isHidden],
  );

  // useEffect(() => {
  //   // Clear expired cache entries on component mount
  //   // clearExpiredCache();
  //   fetchPosts(1, true);
  // }, [fetchPosts]);

  // useEffect(() => {
  //   const container = containerRef.current;
  //   if (container) {
  //     container.addEventListener("scroll", handleScroll, { passive: true });
  //     return () => container.removeEventListener("scroll", handleScroll);
  //   }
  // }, [handleScroll]);

  // Cleanup expired cache entries periodically
  // useEffect(() => {
  //   const interval = setInterval(clearExpiredCache, CACHE_DURATION);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <section
      className={`${styles.tooBigCard} ${state.isHidden ? styles.toobigcardclose : ""} tooBigCard`}
      role="region"
      aria-label="Post Summary">
      <div className={styles.contactBox}>
        <header
          className={styles.headersection}
          style={{ cursor: "pointer" }}
          onClick={handleCircleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCircleClick()}
          aria-label="Toggle card visibility">
          <div className={styles.backdropfade} />
          <img style={{ height: "50px" }} src="/home-post.svg" alt="Post icon" title="↕ Resize the Card" />
          {/* <div className={styles.headerandinput}>
              <span className="title">{postsCount}</span>
              <span className="explain">{t(LanguageKey.navbar_Post)}</span>
            </div> */}
          <div className={styles.headerandinput}>
            <span className="title">{followerCount}</span>
            <span className="explain">{t(LanguageKey.Followers)}</span>
          </div>
          <div className={styles.headerandinput}>
            <span className="title">{followingCount}</span>
            <span className="explain">{t(LanguageKey.home_Followings)}</span>
          </div>
        </header>
        <div
          className={styles.frameContainer}
          ref={containerRef}
          style={containerStyle}
          role="feed"
          aria-label="Posts feed">
          {
            <>
              {props.posts?.map((post) => (
                <PostItem key={post.postId} post={post} basePictureUrl={basePictureUrl} onPostClick={handlePostClick} />
              ))}

              {/* {state.isLoadingMore && (
                  <div
                    className={styles.loadingMore}
                    role="status"
                    aria-label="Loading more posts">
                    <RingLoader />
                  </div>
                )} */}
            </>
          }
        </div>
      </div>
    </section>
  );
});

PostSummary.displayName = "PostSummary";

export default PostSummary;
