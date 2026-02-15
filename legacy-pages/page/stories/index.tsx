import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { MouseEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import StoryContent from "saeed/components/page/storyContent/storyContent";
import convertFirstLetterToLowerCase from "saeed/helper/convertFirstLetterToLowerCase";
import { handleCopyLink } from "saeed/helper/copyLink";
import { LoginStatus, packageStatus } from "saeed/helper/loadingStatus";
import { handleDecompress } from "saeed/helper/pako";
import { getHubConnection } from "saeed/helper/pushNotif";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import { IStoryDraft } from "saeed/models/page/story/preStories";
import { IStory, IStoryContent } from "saeed/models/page/story/stories";
import { PushNotif, PushResponseType } from "saeed/models/push/pushNotif";

type StoryAction =
  | { type: "SET_STORY"; payload: IStory }
  | { type: "ADD_STORY_CONTENT"; payload: IStoryContent }
  | { type: "ADD_ERROR_DRAFT"; payload: IStoryDraft };

const storyReducer = (state: IStory, action: StoryAction): IStory => {
  switch (action.type) {
    case "SET_STORY":
      return action.payload;
    case "ADD_STORY_CONTENT": {
      const exists = state.storyContents?.some((x) => x.storyId === action.payload.storyId);
      if (exists) return state;
      return {
        ...state,
        storyContents: state.storyContents ? [action.payload, ...state.storyContents] : [action.payload],
      };
    }
    case "ADD_ERROR_DRAFT": {
      const exists = state.errorDrafts?.some((x) => x.draftId === action.payload.draftId);
      if (exists) return state;
      return {
        ...state,
        errorDrafts: state.errorDrafts.length > 0 ? [action.payload, ...state.errorDrafts] : [action.payload],
      };
    }
    default:
      return state;
  }
};

const INITIAL_STORY_STATE: IStory = {
  preStoryTotalCount: 0,
  scheduledStory: [],
  storyContents: [],
  drafts: [],
  errorDrafts: [],
};

const Stories = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();

  const [showDotIcon, setShowDotIcon] = useState<number | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [story, dispatch] = useReducer(storyReducer, INITIAL_STORY_STATE);

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const handleStoryShowDotIcons = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const id = parseInt(e.currentTarget.id);
    setShowDotIcon((prev) => (id !== prev ? id : null));
  }, []);

  const handleClickOnIcon = useCallback(
    (e: MouseEvent, value: string) => {
      e.stopPropagation();
      e.preventDefault();
      const actionId = e.currentTarget.id;

      if (actionId === t("linkURL")) {
        handleCopyLink(value);
      }
    },
    [t]
  );

  const fetchData = useCallback(async () => {
    if (!session || !LoginStatus(session) || isFetchingRef.current) return;

    if (session && !packageStatus(session)) {
      router.push("/upgrade");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    isFetchingRef.current = true;

    try {
      const res = await GetServerResult<string, IStory>(MethodType.get, session, "Instagramer/Story/LoadingStoryPage");

      if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) return;

      if (res.succeeded) {
        dispatch({ type: "SET_STORY", payload: res.value });
        setIsDataLoaded(true);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } finally {
      if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
        isFetchingRef.current = false;
      }
      abortControllerRef.current = null;
    }
  }, [session, router]);
  const handleGetNotif = useCallback((notif: string) => {
    if (!isMountedRef.current) return;

    try {
      const decombNotif = handleDecompress(notif);
      if (!decombNotif) return;

      const notifObj = JSON.parse(decombNotif) as PushNotif;
      if (!notifObj.Message || !notifObj.InstagramerId) return;

      const newStoryPush = convertFirstLetterToLowerCase(JSON.parse(notifObj.Message));

      if (
        notifObj.ResponseType === PushResponseType.UploadStorySuccess ||
        notifObj.ResponseType === PushResponseType.NewStoryAdded
      ) {
        dispatch({ type: "ADD_STORY_CONTENT", payload: newStoryPush as IStoryContent });
      } else if (notifObj.ResponseType === PushResponseType.UploadStoryFailed) {
        const newDraft: IStoryDraft = {
          createdTime: newStoryPush.createdTime,
          draftId: newStoryPush.draftId,
          errorMessage: newStoryPush.errorMessage,
          instagramerId: newStoryPush.instagramerId,
          mediaType: newStoryPush.mediaType,
          statusCreatedTime: newStoryPush.statusCreatedTime,
          thumbnailMediaUrl: newStoryPush.thumbnailMediaUrl,
        };
        dispatch({ type: "ADD_ERROR_DRAFT", payload: newDraft });
      }
    } catch (error) {
      console.error("Error processing SignalR notification:", error);
    }
  }, []);
  useEffect(() => {
    isMountedRef.current = true;

    if (session && !packageStatus(session)) {
      router.push("/upgrade");
      return;
    }

    if (session === null || (session && !LoginStatus(session))) {
      router.push("/");
      return;
    }

    if (!isDataLoaded && session && LoginStatus(session)) {
      fetchData();
    }

    let intervalId: NodeJS.Timeout | null = null;
    const setupConnection = () => {
      intervalId = setInterval(() => {
        if (!isMountedRef.current) {
          if (intervalId) clearInterval(intervalId);
          return;
        }

        const hubConnection = getHubConnection();
        if (hubConnection) {
          hubConnection.off("Instagramer", handleGetNotif);
          hubConnection.on("Instagramer", handleGetNotif);
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
        }
      }, 500);
    };

    setupConnection();

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isFetchingRef.current = false;
      const hubConnection = getHubConnection();
      if (hubConnection) {
        hubConnection.off("Instagramer", handleGetNotif);
      }
    };
  }, [session, router, isDataLoaded, fetchData, handleGetNotif]);
  const handleMainClick = useCallback(() => {
    setShowDotIcon(null);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDotIcon(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any);
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any);
    };
  }, [handleKeyDown]);

  const memoizedStoryContent = useMemo(
    () => ({
      data: story,
      handleStoryShowDotIcons,
      handleClickOnIcon,
      showDotIcons: showDotIcon ?? -1,
    }),
    [story, handleStoryShowDotIcons, handleClickOnIcon, showDotIcon]
  );

  if (session?.user.currentIndex === -1) {
    router.push("/user");
    return null;
  }

  if (!session || session.user.currentIndex === -1) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸{t(LanguageKey.navbar_Story)}</title>
        <meta
          name="description"
          content="Manage your Instagram stories efficiently with Brancy. Schedule, draft, and publish stories with advanced Instagram management tools."
        />
        <meta name="theme-color" content="#6366f1" />
        <meta
          name="keywords"
          content="instagram stories, story management, instagram tools, Brancy, schedule stories, story drafts, instagram automation, social media management"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/stories" />

        <meta property="og:title" content={`Bran.cy - ${t(LanguageKey.navbar_Story)}`} />
        <meta
          property="og:description"
          content="Manage your Instagram stories efficiently with Brancy. Schedule, draft, and publish stories."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.Brancy.app/page/stories" />
        <meta property="og:site_name" content="Brancy" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Bran.cy - ${t(LanguageKey.navbar_Story)}`} />
        <meta name="twitter:description" content="Manage your Instagram stories efficiently with Brancy." />
      </Head>
      <main onClick={handleMainClick} role="main" aria-label="Stories management">
        <StoryContent
          data={memoizedStoryContent.data}
          handleStoryShowDotIcons={memoizedStoryContent.handleStoryShowDotIcons}
          handleClickOnIcon={memoizedStoryContent.handleClickOnIcon}
          showDotIcons={memoizedStoryContent.showDotIcons}
        />
      </main>
    </>
  );
};

export default Stories;
