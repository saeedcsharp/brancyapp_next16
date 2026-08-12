import Modal from "brancy/components/design/modal";
import NotFeature from "brancy/components/notOk/notFeature";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import GeneratedImageModal from "brancy/components/page/ai/generatedImageModal";
import GeneratedVideoModal from "brancy/components/page/ai/generatedVideoModal";
import ImageList from "brancy/components/page/ai/imageList";
import VideoList from "brancy/components/page/ai/videoList";
import { MethodType } from "brancy/helper/api";
import { fetchAndCheckFeature } from "brancy/helper/checkFeature";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import convertFirstLetterToLowerCase from "brancy/helper/convertFirstLetterToLowerCase";
import { LoginStatus } from "brancy/helper/loadingStatus";
import initialzedTime from "brancy/helper/manageTimer";
import { handleDecompress } from "brancy/helper/pako";
import { getHubConnection } from "brancy/helper/pushNotif";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { LanguageKey } from "brancy/i18n";
import { PsgFeatureType, PushResponseType } from "brancy/models/enums";
import {
  IGetImageUsageRequest,
  IGetMedia,
  IGetMedias,
  IMediaCreator,
  PendingGeneration,
  PushNotif,
} from "brancy/models/interfaces";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateObject } from "react-multi-date-picker";
import styles from "./pageAI.module.css";
import ContentCreatorHeader from "brancy/components/page/ai/contentCreatorHeader";
import MediaCreator from "brancy/components/page/ai/mediaCreator";

type MediaTab = "image" | "video" | "createimage" | "createvideo";
const SUCCESS_MEDIA_STATUS = 2;

function formatCreatedTime(timestamp: number) {
  const t = initialzedTime();
  const d = new DateObject({
    date: timestamp * 1000,
    calendar: t.calendar,
    locale: t.locale,
  });
  return d.format("YYYY/MM/DD HH:mm:ss");
}

export default function PageAI() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [activeTab, setActiveTab] = useState<MediaTab>("image");
  const [images, setImages] = useState<IGetMedia[]>([]);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [videos, setVideos] = useState<IGetMedia[]>([]);
  const [nextVideoMaxId, setNextVideoMaxId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState(false);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState<IGetMedia | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<IGetMedia | null>(null);
  const [creators, setCreators] = useState<IMediaCreator[]>([]);
  const [error, setError] = useState("");
  const [pendingGenerations, setPendingGenerations] = useState<PendingGeneration[]>([]);
  const pendingGenerationsRef = useRef<PendingGeneration[]>([]);

  const fetchImages = useCallback(
    async (cursor: string | null): Promise<IGetMedia[]> => {
      if (!session) return [];

      const response = await clientFetchApi<null, IGetMedias>("/api/mediaai/GetImages", {
        session,
        methodType: MethodType.get,
        queries: [
          { key: "mediaCreationStatus", value: SUCCESS_MEDIA_STATUS.toString() },
          { key: "nextMaxId", value: cursor ?? "" },
        ],
      });

      if (!response.succeeded) {
        notify(response.info?.responseType ?? ResponseType.Unexpected, NotifType.Error, response.errorMessage);
        return [];
      }

      const items = Array.isArray(response.value?.items) ? response.value.items : [];
      setNextMaxId(response.value?.nextMaxId || null);
      return items;
    },
    [session],
  );
  const fetchVideos = useCallback(
    async (cursor: string | null): Promise<IGetMedia[]> => {
      if (!session) return [];

      const response = await clientFetchApi<null, IGetMedias>("/api/mediaai/GetVideos", {
        session,
        methodType: MethodType.get,
        queries: [
          { key: "mediaCreationStatus", value: SUCCESS_MEDIA_STATUS.toString() },
          { key: "nextMaxId", value: cursor ?? "" },
        ],
      });

      if (!response.succeeded) {
        notify(response.info?.responseType ?? ResponseType.Unexpected, NotifType.Error, response.errorMessage);
        return [];
      }

      const items = Array.isArray(response.value?.items) ? response.value.items : [];
      setNextVideoMaxId(response.value?.nextMaxId || null);
      return items;
    },
    [session],
  );
  const onCreateImage = async (request: IGetImageUsageRequest, count: number) => {
    const checkFeatureResponse = await clientFetchApi<boolean, boolean>("/api/feature/hasFeatureCount", {
      session,
      methodType: MethodType.get,
      queries: [
        { key: "featureId", value: PsgFeatureType.AI.toString() },
        { key: "count", value: count.toString() },
      ],
    });

    if (!checkFeatureResponse.succeeded) {
      notify(checkFeatureResponse.info?.responseType, NotifType.Warning);
      return;
    }
    if (!checkFeatureResponse.value) {
      setShowFeaturePopup(true);
      return;
    }
    const requestClientContext = crypto.randomUUID();
    const mediaType: PendingGeneration["mediaType"] = activeTab === "createvideo" ? "video" : "image";
    const pendingGeneration = { clientContext: requestClientContext, mediaType, prompt: request.prompt };
    pendingGenerationsRef.current = [...pendingGenerationsRef.current, pendingGeneration];
    setPendingGenerations(pendingGenerationsRef.current);
    setActiveTab(mediaType);
    const response = await clientFetchApi<IGetImageUsageRequest, number>(
      `/api/mediaai/${activeTab === "createvideo" ? "CreateVideo" : "CreateImage"}`,
      {
        session,
        methodType: MethodType.post,
        data: request,
        queries: [{ key: "clientContext", value: requestClientContext }],
      },
    );
    if (!response.succeeded) {
      pendingGenerationsRef.current = pendingGenerationsRef.current.filter(
        (item) => item.clientContext !== requestClientContext,
      );
      setPendingGenerations(pendingGenerationsRef.current);
      notify(response.info?.responseType, NotifType.Warning);
      return;
    }
    internalNotify(
      InternalResponseType.Success,
      NotifType.Success,
      activeTab === "createvideo" ? t("Video generation request sent.") : t("Image generation request sent."),
    );
  };
  const loadCreators = async () => {
    if (!session) return;
    console.log("loadCreators called");
    setLoading(true);
    setError("");
    const response = await clientFetchApi<boolean, IMediaCreator[]>("/api/mediaai/GetImageCreators", { session });
    if (response.succeeded && Array.isArray(response.value)) {
      setCreators(response.value);
      setActiveTab("createimage");
    } else {
      notify(response.info?.responseType, NotifType.Warning);
    }
    setLoading(false);
  };

  const loadVideoCreators = async () => {
    if (!session) return;
    console.log("loadVideoCreators called");
    setLoading(true);
    setError("");
    const response = await clientFetchApi<boolean, IMediaCreator[]>("/api/mediaai/GetVideoCreators", { session });
    if (response.succeeded && Array.isArray(response.value)) {
      setCreators(response.value);
      setActiveTab("createvideo");
    } else {
      notify(response.info?.responseType, NotifType.Warning);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;
    if (session.user.currentIndex === -1) {
      router.push("/user");
      return;
    }
    if (!LoginStatus(session)) {
      router.push("/");
      return;
    }
    if (loadedImages) return;

    setLoadedImages(true);
    setLoading(true);
    fetchImages(null)
      .then(setImages)
      .finally(() => setLoading(false));
  }, [fetchImages, loadedImages, session]);

  useEffect(() => {
    if (!session || activeTab !== "video" || loadedVideos) return;

    setLoadedVideos(true);
    setLoading(true);
    fetchVideos(null)
      .then(setVideos)
      .finally(() => setLoading(false));
  }, [activeTab, fetchVideos, loadedVideos, session]);

  const fetchMoreImages = useCallback(() => fetchImages(nextMaxId), [fetchImages, nextMaxId]);
  const handleImagesFetched = useCallback((newImages: IGetMedia[]) => {
    setImages((current) => [...current, ...newImages]);
  }, []);

  const { containerRef, isLoadingMore } = useInfiniteScroll<IGetMedia>({
    hasMore: Boolean(nextMaxId),
    fetchMore: fetchMoreImages,
    onDataFetched: handleImagesFetched,
    getItemId: (image) => image.id,
    currentData: images,
    isLoading: loading,
    enabled: activeTab === "image",
    fetchDelay: 0,
  });
  const fetchMoreVideos = useCallback(() => fetchVideos(nextVideoMaxId), [fetchVideos, nextVideoMaxId]);
  const handleVideosFetched = useCallback((newVideos: IGetMedia[]) => {
    setVideos((current) => [...current, ...newVideos]);
  }, []);

  const { isLoadingMore: isLoadingMoreVideos } = useInfiniteScroll<IGetMedia>({
    hasMore: Boolean(nextVideoMaxId),
    fetchMore: fetchMoreVideos,
    onDataFetched: handleVideosFetched,
    getItemId: (video) => video.id,
    currentData: videos,
    isLoading: loading,
    enabled: activeTab === "video",
    fetchDelay: 0,
  });

  const openImageCreator = async () => {
    if (!(await fetchAndCheckFeature(PsgFeatureType.AI, session))) {
      setShowFeaturePopup(true);
      return;
    }
    await loadCreators();
  };
  const openVideoCreator = async () => {
    if (!(await fetchAndCheckFeature(PsgFeatureType.AI, session))) {
      setShowFeaturePopup(true);
      return;
    }
    await loadVideoCreators();
  };
  const handleGetNotif = useCallback((notif: string) => {
    try {
      const decombNotif = handleDecompress(notif);
      if (!decombNotif) return;
      const notifObj = JSON.parse(decombNotif) as PushNotif;
      if (!notifObj.Message) return;
      console.log("notifObj", notifObj);
      const rawGeneratedMedia = JSON.parse(notifObj.Message) as Record<string, unknown>;
      const newPostPush = convertFirstLetterToLowerCase(rawGeneratedMedia) as IGetMedia & {
        ClientContext?: string;
        client_context?: string;
      };
      const generatedClientContext =
        newPostPush.clientContext || newPostPush.ClientContext || newPostPush.client_context;
      if (!generatedClientContext) return;
      const generatedImage = { ...newPostPush, clientContext: generatedClientContext } as IGetMedia;
      const pendingGeneration = pendingGenerationsRef.current.find(
        (item) => item.clientContext.toLowerCase() === generatedClientContext.toLowerCase(),
      );
      if (!pendingGeneration) return;
      if (notifObj.ResponseType === PushResponseType.AiImageSuccess) {
        console.log("generatedImage", generatedImage);
        if (pendingGeneration.mediaType === "video") {
          setVideos((current) => [generatedImage, ...current]);
        } else {
          setImages((current) => [generatedImage, ...current]);
        }
        pendingGenerationsRef.current = pendingGenerationsRef.current.filter(
          (item) => item.clientContext !== generatedClientContext,
        );
        setPendingGenerations(pendingGenerationsRef.current);
      } else if (notifObj.ResponseType === PushResponseType.AiImageFail) {
        console.log("generatedImagefailed", generatedImage);
        pendingGenerationsRef.current = pendingGenerationsRef.current.filter(
          (item) => item.clientContext !== generatedClientContext,
        );
        setPendingGenerations(pendingGenerationsRef.current);
        internalNotify(
          InternalResponseType.InvalidMetaData,
          NotifType.Warning,
          generatedImage.metadata || t(", Image generation failed."),
        );
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, []);

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
  return (
    <>
      <Head>
        <title>Bran.cy ▸ {t(LanguageKey.navbar_AI)}</title>
        <meta name="description" content={t("Create and manage AI-generated images and videos.")} />
      </Head>
      <main className={styles.aiWorkspace} ref={containerRef}>
        {(activeTab === "image" || activeTab === "video") && (
          <ContentCreatorHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openImageCreator={openImageCreator}
            openVideoCreator={openVideoCreator}
          />
        )}
        {activeTab === "image" && (
          <ImageList
            images={images}
            loading={loading}
            isLoadingMore={isLoadingMore}
            setSelectedImage={setSelectedImage}
            openImageCreator={openImageCreator}
            pendingGenerations={pendingGenerations}
          />
        )}
        {activeTab === "video" && (
          <VideoList
            videos={videos}
            loading={loading && videos.length === 0}
            isLoadingMore={isLoadingMoreVideos}
            setSelectedVideo={setSelectedVideo}
            openVideoCreator={openVideoCreator}
            pendingGenerations={pendingGenerations}
          />
        )}
        {(activeTab === "createimage" || activeTab === "createvideo") && (
          <MediaCreator
            creators={creators}
            error={error}
            onRetry={activeTab === "createvideo" ? loadVideoCreators : loadCreators}
            onCreateMedia={onCreateImage}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        )}
      </main>
      <Modal closePopup={() => setSelectedImage(null)} classNamePopup="popupLarge" showContent={selectedImage !== null}>
        {selectedImage && <GeneratedImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
      </Modal>
      <Modal closePopup={() => setSelectedVideo(null)} classNamePopup="popupLarge" showContent={selectedVideo !== null}>
        {selectedVideo && <GeneratedVideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      </Modal>
      <Modal
        closePopup={() => setShowFeaturePopup(false)}
        classNamePopup="popupSendFile"
        showContent={showFeaturePopup}>
        <NotFeature onClose={() => setShowFeaturePopup(false)} />
      </Modal>
    </>
  );
}
