import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MouseEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "saeed/components/design/dotMenu/dotMenu";
import DotLoaders from "saeed/components/design/loader/dotLoaders";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import { internalNotify, InternalResponseType, NotifType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import { checkGuid } from "saeed/helper/guidList";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { calculateSummary } from "saeed/helper/numberFormater";
import { addSignalRMethod, OnInstance, removeSignalRMethod } from "saeed/helper/pushNotif";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/apihelper";
import { IPost, IPostContent } from "saeed/models/page/post/posts";
import { IUploadPost, UploadPostSteps } from "saeed/models/page/socketPage";
import ScheduledPost from "../scheduledPost/scheduledPost";
import styles from "./postContent.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
type PostState = {
  posts: IPostContent[] | null;
  hasMore: boolean;
  nextTime: number;
  loadingStatus: boolean;
};
type PostAction =
  | {
      type: "INIT_POSTS";
      payload: { posts: IPostContent[]; hasMore: boolean; nextTime: number };
    }
  | {
      type: "ADD_POSTS";
      payload: { posts: IPostContent[]; hasMore: boolean; nextTime: number };
    }
  | { type: "ADD_NEW_POST"; payload: { post: IPostContent } }
  | { type: "SET_LOADING"; payload: boolean };
const initialState: PostState = {
  posts: null,
  hasMore: false,
  nextTime: -1,
  loadingStatus: true,
};
function postReducer(state: PostState, action: PostAction): PostState {
  switch (action.type) {
    case "INIT_POSTS":
      return {
        ...state,
        posts: action.payload.posts,
        hasMore: action.payload.hasMore,
        nextTime: action.payload.nextTime,
        loadingStatus: false,
      };
    case "ADD_POSTS":
      return {
        ...state,
        posts: state.posts ? [...state.posts, ...action.payload.posts] : action.payload.posts,
        hasMore: action.payload.hasMore,
        nextTime: action.payload.nextTime,
      };
    case "ADD_NEW_POST":
      return {
        ...state,
        posts: state.posts ? [action.payload.post, ...state.posts] : [action.payload.post],
      };
    case "SET_LOADING":
      return {
        ...state,
        loadingStatus: action.payload,
      };
    default:
      return state;
  }
}

interface PostContentProps {
  data: IPost;
  handleClickOnIcon: (e: MouseEvent, value: string) => void;
}

const PostContent = (props: PostContentProps) => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(postReducer, initialState);
  const [openMenuPostId, setOpenMenuPostId] = useState<number | null>(null);
  const [focusedPostIndex, setFocusedPostIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();
  const postRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { posts, hasMore, nextTime, loadingStatus } = state;
  const isAuthorized = useMemo(() => LoginStatus(session) && RoleAccess(session, PartnerRole.PageView), [session]);
  const uploadPostCallBack = useCallback((uploadPost: string): void => {
    const obj: IUploadPost = JSON.parse(uploadPost);
    if (obj.UploadState === UploadPostSteps.SendBackToServer) {
      getPostByGuid(obj.EventGuid);
    }
    if (checkGuid(obj.EventGuid)) return;
    else if (obj.UploadState === UploadPostSteps.DownloadFromMiddle) {
      internalNotify(InternalResponseType.StartUploadingPost, NotifType.Info);
    } else if (obj.UploadState === UploadPostSteps.Error) {
      internalNotify(InternalResponseType.UploadingPostError, NotifType.Error);
    }
  }, []);

  const oninstance: OnInstance[] = useMemo(
    () => [
      {
        callBack: uploadPostCallBack,
        functionName: "PostUploadState",
      },
    ],
    [uploadPostCallBack],
  );

  const normalizePost = useCallback(
    (post: IPostContent): IPostContent => ({
      ...post,
      likeCount: post.likeCount ?? 0,
      viewCount: post.viewCount ?? 0,
      commentCount: post.commentCount ?? 0,
      shareCount: post.shareCount ?? 0,
    }),
    [],
  );

  const { containerRef, isLoadingMore } = useInfiniteScroll<IPostContent>({
    hasMore,
    fetchMore: async () => {
      if (nextTime <= 0) return [];
      const result = await clientFetchApi<string, IPostContent[]>("/api/post/GetPostByScrollingDown", { methodType: MethodType.get, session: session, data: undefined, queries: [{ key: "createdTime", value: nextTime.toString() }], onUploadProgress: undefined });

      if (!result.succeeded || !result.value || !Array.isArray(result.value)) {
        return [];
      }
      if (result.value.length === 0) {
        dispatch({
          type: "ADD_POSTS",
          payload: {
            posts: [],
            hasMore: false,
            nextTime: 0,
          },
        });
      }

      return result.value.map(normalizePost);
    },
    onDataFetched: (newPosts, hasMoreData) => {
      dispatch({
        type: "ADD_POSTS",
        payload: {
          posts: newPosts,
          hasMore: hasMoreData,
          nextTime: newPosts.length > 0 ? newPosts[newPosts.length - 1].createdTime : nextTime,
        },
      });
    },
    getItemId: (post) => post.postId,
    currentData: posts || [],
    isLoading: loadingStatus,
    threshold: 200,
    fetchDelay: 500,
  });

  const getPostByGuid = useCallback(
    async (guid: string) => {
      if (!session || checkGuid(guid)) return;

      try {
        internalNotify(InternalResponseType.PostUploaded, NotifType.Info);

        const result = await clientFetchApi<string, IPostContent[]>("/api/post/GetPostByGuid", { methodType: MethodType.get, session: session, data: undefined, queries: [{ key: "guid", value: guid }], onUploadProgress: undefined });

        if (result.succeeded && result.value?.length > 0) {
          startTransition(() => {
            const newPost = normalizePost(result.value[0]);
            dispatch({ type: "ADD_NEW_POST", payload: { post: newPost } });
          });
        }
      } catch {
        internalNotify(InternalResponseType.UploadingPostError, NotifType.Error);
      }
    },
    [session, normalizePost],
  );

  const navigateToCreatePost = useCallback(() => {
    router.push("/page/posts/createpost?newschedulepost=false");
  }, [router]);

  const navigateToPostInfo = useCallback(
    (postId: number) => {
      (console.log("navigating to post info with id:", postId), router.push(`/page/posts/postinfo/${postId}`));
    },
    [router],
  );

  const handleMenuToggle = useCallback((postId: number) => {
    setOpenMenuPostId((prev) => (prev === postId ? null : postId));
  }, []);

  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (!posts?.length) return;

      const totalPosts = posts.length;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedPostIndex((prev) => {
            const next = prev < totalPosts - 1 ? prev + 1 : prev;
            const postId = posts[next]?.postId;
            if (postId) postRefs.current.get(postId)?.focus();
            return next;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedPostIndex((prev) => {
            const next = prev > 0 ? prev - 1 : prev;
            const postId = posts[next]?.postId;
            if (postId) postRefs.current.get(postId)?.focus();
            return next;
          });
          break;
        case "Enter":
          if (focusedPostIndex >= 0 && posts[focusedPostIndex]) {
            navigateToPostInfo(posts[focusedPostIndex].postId);
          }
          break;
        case "Escape":
          setOpenMenuPostId(null);
          setFocusedPostIndex(-1);
          break;
      }
    },
    [posts, focusedPostIndex, navigateToPostInfo],
  );

  const setPostRef = useCallback((postId: number, element: HTMLDivElement | null) => {
    if (element) {
      postRefs.current.set(postId, element);
    } else {
      postRefs.current.delete(postId);
    }
  }, []);

  useEffect(() => {
    addSignalRMethod(oninstance);
    return () => {
      removeSignalRMethod(oninstance);
    };
  }, [oninstance]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardNavigation);
    return () => {
      document.removeEventListener("keydown", handleKeyboardNavigation);
      postRefs.current.clear();
    };
  }, [handleKeyboardNavigation]);

  useEffect(() => {
    if (props.data.posts && isAuthorized) {
      const mappedPosts = props.data.posts.map(normalizePost);

      dispatch({
        type: "INIT_POSTS",
        payload: {
          posts: mappedPosts,
          hasMore: mappedPosts.length >= 10,
          nextTime: mappedPosts.length > 0 ? mappedPosts[mappedPosts.length - 1].createdTime : -1,
        },
      });
    }
  }, [props.data.posts, isAuthorized, normalizePost]);

  const processedPosts = useMemo(() => {
    if (!posts) return [];
    return posts.map((post) => ({
      ...post,
      formattedLikes: calculateSummary(post.likeCount),
      formattedViews: calculateSummary(post.viewCount),
      formattedComments: calculateSummary(post.commentCount),
      formattedShares: calculateSummary(post.shareCount),
    }));
  }, [posts]);

  const nextPostId = useMemo(() => {
    if (!posts?.length) return 1;
    const maxTempId = Math.max(...posts.map((p) => p.tempId || 0));
    return maxTempId + 1;
  }, [posts]);

  const createNewPostButton = useMemo(
    () => (
      <div
        className={styles.post}
        role="button"
        tabIndex={0}
        aria-label="Create new post"
        style={{ cursor: "pointer" }}
        onClick={navigateToCreatePost}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigateToCreatePost();
          }
        }}>
        <div className={styles.cardbackground} />
        <div className={styles.postinfo}>
          <div className={styles.newpost}>
            <svg viewBox="0 0 550 560" width="25%" aria-hidden="true">
              <path
                fill="var(--text-h2)"
                d="M458 80c-6-46-45-80-91-80H92C42 0 0 41 0 92v275c0 42 30 80 70 90v3c0 52 43 95 95 95h286c52 0 95-43 95-95V174c0-50-39-91-88-95ZM92 425a60 60 0 0 1-60-60V93a60 60 0 0 1 60-60h275a60 60 0 0 1 60 60v275a60 60 0 0 1-60 60H92Zm421 35c0 34-28 62-62 62H165a62 62 0 0 1-62-62v-1h264c50 0 92-41 92-92V112c30 4 54 30 54 62zM358 230c0 10-8 17-17 17h-94v94a18 18 0 1 1-35 0v-94h-94a18 18 0 1 1 0-35h94v-94a18 18 0 1 1 35 0v94h94c10 0 17 8 17 17Z"
              />
            </svg>
            {t(LanguageKey.CreateNewPost)}
            <br />
            <div className={styles.createpostid}>{nextPostId.toLocaleString()}</div>
          </div>
        </div>
      </div>
    ),
    [navigateToCreatePost, nextPostId, t],
  );
  const getEngagementMetrics = useCallback(
    (
      post: IPostContent & {
        formattedLikes: string;
        formattedViews: string;
        formattedComments: string;
        formattedShares: string;
      },
    ) => [
      {
        type: "like" as const,
        icon: "/icon-like.svg",
        title: "Like count",
        count: post.formattedLikes,
        fullCount: post.likeCount,
        showNew: false,
      },
      {
        type: "save" as const,
        icon: "/icon-view.svg",
        title: "View count",
        count: post.formattedViews,
        fullCount: Math.max(post.reachCount, post.viewCount),
        showNew: false,
      },
      {
        type: "comment" as const,
        icon: "/icon-comment.svg",
        title: "Comment count",
        count: post.formattedComments,
        fullCount: post.commentCount,
        showNew: post.newCommentCount > 0,
      },
      {
        type: "share" as const,
        icon: "/icon-send.svg",
        title: "Share count",
        count: post.formattedShares,
        fullCount: post.shareCount,
        showNew: false,
      },
    ],
    [],
  );

  const renderEngagementItem = useCallback(
    (
      metric: {
        type: "like" | "share" | "save" | "comment";
        icon: string;
        title: string;
        count: string;
        fullCount: number;
        showNew: boolean;
      },
      postId: string,
    ) => (
      <Tooltip
        key={`${postId}-${metric.type}`}
        tooltipValue={metric.fullCount > -1 ? metric.fullCount.toLocaleString() : "0"}
        position="top"
        onHover={true}>
        <div className={`${styles.counter} translate`}>
          <img
            title={metric.title}
            className={styles.icon}
            alt={`${metric.type} icon`}
            src={metric.icon}
            width={0}
            height={0}
            sizes="20px"
            aria-label={`Post ${metric.type}s`}
            style={{
              width: "20px",
              height: "auto",
            }}
          />
          {metric.showNew && <div className={styles.newcomment} />}
          {metric.count}
        </div>
      </Tooltip>
    ),
    [],
  );
  const pageTitle = useMemo(() => `${t(LanguageKey.navbar_Post)} | Brancy - Instagram Management`, [t]);

  const pageDescription = useMemo(
    () =>
      processedPosts.length > 0
        ? `${t(LanguageKey.CreateNewPost)} - ${processedPosts.length} posts`
        : t(LanguageKey.CreateNewPost),
    [processedPosts.length, t],
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {processedPosts.length > 0 && (
          <>
            <link
              rel="preload"
              href={basePictureUrl + processedPosts[0].thumbnailMediaUrl}
              as="image"
              imageSrcSet={`${basePictureUrl + processedPosts[0].thumbnailMediaUrl} 1x, ${
                basePictureUrl + processedPosts[0].thumbnailMediaUrl
              }?w=500 2x`}
              imageSizes="(max-width: 500px) 165px, (max-width: 768px) 200px, 250px"
            />
            <meta property="og:image" content={basePictureUrl + processedPosts[0].thumbnailMediaUrl} />
            <meta name="twitter:image" content={basePictureUrl + processedPosts[0].thumbnailMediaUrl} />
          </>
        )}
      </Head>
      <main className={styles.postsContainer} ref={containerRef}>
        <ScheduledPost data={props.data.prePosts} />
        {loadingStatus && <Loading />}
        {!isAuthorized && (
          <section className={`${styles.frameContainer} translate`}>
            <div className={styles.post} title="🔗 Create New Post" style={{ cursor: "pointer" }}>
              <div className={styles.cardbackground} />
              <div className={styles.postinfo}>
                <div className={styles.newpost}>
                  <svg viewBox="0 0 550 560" width="25%">
                    <path
                      fill="var(--text-h2)"
                      d="M458 80c-6-46-45-80-91-80H92C42 0 0 41 0 92v275c0 42 30 80 70 90v3c0 52 43 95 95 95h286c52 0 95-43 95-95V174c0-50-39-91-88-95ZM92 425a60 60 0 0 1-60-60V93a60 60 0 0 1 60-60h275a60 60 0 0 1 60 60v275a60 60 0 0 1-60 60H92Zm421 35c0 34-28 62-62 62H165a62 62 0 0 1-62-62v-1h264c50 0 92-41 92-92V112c30 4 54 30 54 62zM358 230c0 10-8 17-17 17h-94v94a18 18 0 1 1-35 0v-94h-94a18 18 0 1 1 0-35h94v-94a18 18 0 1 1 35 0v94h94c10 0 17 8 17 17Z"
                    />
                  </svg>
                  {t(LanguageKey.CreateNewPost)}
                  <br />
                  <div className={styles.createpostid}>{0}</div>
                </div>
              </div>
            </div>
          </section>
        )}
        {!RoleAccess(session, PartnerRole.PageView) && <NotAllowed />}
        {!loadingStatus && posts && (
          <section className={`${styles.frameContainer} translate`}>
            {props.data.errorDrafts.length > 0 && (
              <div className={styles.error}>
                <div className={styles.cardbackground} />
                <div className={styles.draftinfo}>
                  <div className={styles.newpost}>
                    <div className={styles.drafttitle}>
                      {t(LanguageKey.publishError)} ( <strong>{props.data.errorDrafts.length}</strong> )
                    </div>
                    <div className={styles.draftpreviewall}>
                      {props.data.errorDrafts.map((draft, index) => (
                        <Link
                          className={styles.draftpreview}
                          key={draft.draftId}
                          href={"/page/posts/createpost?newschedulepost=false&draftId=" + draft.draftId}
                          aria-label={`Edit draft ${draft.draftId}`}>
                          <img
                            style={
                              draft.statusCreatedTime > index
                                ? {
                                    border: "1px solid var(--color-dark-red)",
                                    borderRadius: "var(--br15)",
                                    cursor: "pointer",
                                    objectFit: "cover",
                                  }
                                : { border: "" }
                            }
                            className={styles.draftpreviewimage}
                            src={basePictureUrl + draft.thumbnailMediaUrl}
                            alt="Draft preview"
                            width={60}
                            height={60}
                            sizes="60px"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {props.data.nonErrorDrafts.length > 0 && (
              <div className={styles.draft}>
                <div className={styles.cardbackground} />
                <div className={styles.draftinfo}>
                  <div className={styles.newpost}>
                    <div className={styles.drafttitle}>
                      {t(LanguageKey.PostDraft)} ({props.data.nonErrorDrafts.length}/6)
                    </div>
                    <div className={styles.draftpreviewall}>
                      {props.data.nonErrorDrafts.map((draft, index) => (
                        <Link
                          className={styles.draftpreview}
                          title={`🔗 Draft No.${index + 1}`}
                          key={draft.draftId}
                          href={`/page/posts/createpost?newschedulepost=false&draftId=${draft.draftId}`}
                          aria-label={`Edit draft ${draft.draftId}`}>
                          <img
                            className={styles.draftpreviewimage}
                            src={basePictureUrl + draft.thumbnailMediaUrl}
                            alt="Draft preview"
                            width={60}
                            height={60}
                            sizes="60px"
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {createNewPostButton}
            {processedPosts.map((post, index) => (
              <div
                ref={(el) => setPostRef(post.postId, el)}
                className={styles.post}
                role="button"
                tabIndex={0}
                aria-label={`Post ${post.tempId}, ${post.likeCount} likes`}
                style={{ cursor: "pointer" }}
                onClick={() => navigateToPostInfo(post.postId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToPostInfo(post.postId);
                  }
                }}
                key={post.postId}>
                <div className={styles.cardbackground} />

                <div className={styles.postinfo}>
                  <img
                    className={`${styles.postimage} ${post.isDeleted ? styles.deleted : ""}`}
                    alt="Post thumbnail"
                    src={basePictureUrl + post.thumbnailMediaUrl}
                    width={250}
                    height={220}
                    loading={index < 4 ? "eager" : "lazy"}
                    sizes="(max-width: 500px) 165px, (max-width: 768px) 200px, 250px"
                  />
                  <div className={styles.postidandmenu}>
                    <div className={styles.postid} title={`ℹ️ Post no. ${post.tempId}`}>
                      {post.isDeleted ? <>{t(LanguageKey.DeletedPost)}</> : post.tempId.toLocaleString()}
                    </div>

                    <Dotmenu
                      showSetting={openMenuPostId === post.postId}
                      onToggle={() => handleMenuToggle(post.postId)}
                      data={[
                        {
                          icon: "/share.svg",
                          value: t(LanguageKey.linkURL),
                          onClick: () => {
                            const fakeEvent = {
                              stopPropagation: () => {},
                              preventDefault: () => {},
                              currentTarget: { id: t(LanguageKey.linkURL) },
                            } as unknown as MouseEvent;
                            props.handleClickOnIcon(fakeEvent, post.instaShareLink);
                            setOpenMenuPostId(null);
                          },
                        },
                      ]}
                    />
                  </div>
                  <div className={styles.engagmentinfo}>
                    {processedPosts.length > 0 &&
                      getEngagementMetrics(post).map((metric) => renderEngagementItem(metric, post.postId.toString()))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
        {(isLoadingMore || isPending) && hasMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
            role="status"
            aria-live="polite">
            <DotLoaders />
          </div>
        )}
      </main>
    </>
  );
};

export default PostContent;
