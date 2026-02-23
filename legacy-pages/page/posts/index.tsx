import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "../../../components/notifications/notificationBox";
import PostContent from "../../../components/page/posts/postContent";
import convertFirstLetterToLowerCase from "../../../helper/convertFirstLetterToLowerCase";
import { handleCopyLink } from "../../../helper/copyLink";
import { LoginStatus, packageStatus } from "../../../helper/loadingStatus";
import { handleDecompress } from "../../../helper/pako";
import { getHubConnection } from "../../../helper/pushNotif";
import { LanguageKey } from "../../../i18n";
import { MethodType } from "../../../helper/api";
import { IPost, IPostContent, IShortDraft } from "../../../models/page/post/posts";
import { PushNotif, PushResponseType } from "../../../models/push/pushNotif";
import { clientFetchApi } from "../../../helper/clientFetchApi";

const Posts = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [post, setPost] = useState<IPost>({
    errorDrafts: [],
    nonErrorDrafts: [],
    posts: null,
    prePosts: null,
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);

  // Handle authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (session && !packageStatus(session)) router.push("/upgrade");
    if (status === "unauthenticated" || (session && !LoginStatus(session))) {
      router.push("/");
      return;
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current || !session || !LoginStatus(session)) return;

    isFetchingRef.current = true;
    try {
      const res = await clientFetchApi<string, IPost>("/api/post/GetPosts", { methodType: MethodType.get, session: session, data: undefined, queries: [], onUploadProgress: undefined });
      if (res.succeeded) {
        setPost(res.value);
        setIsDataLoaded(true);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [session]);

  const handleGetNotif = useCallback((notif: string) => {
    try {
      const decombNotif = handleDecompress(notif);
      if (!decombNotif) return;

      const notifObj = JSON.parse(decombNotif) as PushNotif;
      if (!notifObj.Message || !notifObj.InstagramerId) return;

      const newPostPush = convertFirstLetterToLowerCase(JSON.parse(notifObj.Message));

      if (
        notifObj.ResponseType === PushResponseType.UploadPostSuccess ||
        notifObj.ResponseType === PushResponseType.NewPostAdded
      ) {
        const newPost = newPostPush as IPostContent;
        setPost((prev) => {
          if (prev.posts?.find((x) => x.postId === newPost.postId)) return prev;
          return {
            ...prev,
            posts: prev.posts ? [newPost, ...prev.posts] : [newPost],
          };
        });
      } else if (notifObj.ResponseType === PushResponseType.UploadPostFailed) {
        const newDraft: IShortDraft = {
          createdTime: newPostPush.createdTime,
          draftId: newPostPush.draftId,
          errorMessage: newPostPush.errorMessage,
          instagramerId: newPostPush.instagramerId,
          mediaType: newPostPush.mediaType,
          mediaUploadId: newPostPush.mediaUploadId,
          statusCreatedTime: newPostPush.statusCreatedTime,
          thumbnailMediaUrl: newPostPush.thumbnailMediaUrl,
        };

        setPost((prev) => {
          if (prev.errorDrafts?.find((x) => x.draftId === newDraft.draftId)) return prev;
          return {
            ...prev,
            errorDrafts: prev.errorDrafts ? [newDraft, ...prev.errorDrafts] : [newDraft],
          };
        });
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, []);

  const handleClickOnIcon = useCallback(
    (e: MouseEvent, value: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.currentTarget.id === t(LanguageKey.linkURL)) {
        handleCopyLink(value);
      }
    },
    [t],
  );
  useEffect(() => {
    // Only fetch data if not already loaded and session is available
    if (!isDataLoaded && session && LoginStatus(session) && status === "authenticated") {
      fetchData();
    }
  }, [session, status, isDataLoaded, fetchData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const setupSignalR = () => {
      const hubConnection = getHubConnection();
      if (hubConnection) {
        hubConnection.off("Instagramer", handleGetNotif);
        hubConnection.on("Instagramer", handleGetNotif);
        return true;
      }
      return false;
    };

    // Try to setup SignalR connection
    if (!setupSignalR()) {
      intervalId = setInterval(() => {
        if (setupSignalR()) {
          clearInterval(intervalId);
        }
      }, 500);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [handleGetNotif]);
  const pageTitle = useMemo(() => `Bran.cy ▸ ${t(LanguageKey.navbar_Post)}`, [t]);

  const pageDescription = useMemo(
    () =>
      post.posts?.length
        ? `Manage your ${post.posts.length} Instagram posts - Advanced post management tool`
        : "Advanced Instagram post management tool - Create, schedule, and analyze your posts",
    [post.posts?.length],
  );

  useEffect(() => {
    if (session?.user.currentIndex === -1) {
      router.push("/user");
    }
  }, [session?.user.currentIndex, router]);

  if (!session || session.user.currentIndex === -1) return null;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1DA1F2" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy, post create, story create, lottery, insight, graph, like, share, comment, view, tag, hashtag, social media management"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.Brancy.app/page/posts" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <PostContent data={post} handleClickOnIcon={handleClickOnIcon} />
    </>
  );
};

export default Posts;
