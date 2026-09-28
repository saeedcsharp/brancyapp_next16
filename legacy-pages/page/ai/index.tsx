import Modal from "brancy/components/design/modal";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import MediaLibrary from "brancy/components/page/ai/MediaLibrary";
import MediaCreator from "brancy/components/page/ai/mediaCreator";
import { MethodType } from "brancy/helper/api";
import { fetchAndCheckFeature } from "brancy/helper/checkFeature";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import convertFirstLetterToLowerCase from "brancy/helper/convertFirstLetterToLowerCase";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { handleDecompress } from "brancy/helper/pako";
import { getHubConnection } from "brancy/helper/pushNotif";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { LanguageKey } from "brancy/i18n";
import { PsgFeatureType, PushResponseType } from "brancy/models/enums";
import {
  IGetImageUsageRequest,
  IGetMedia,
  IGetMedias,
  IImagePrompt,
  IMediaCreator,
  PendingGeneration,
  PushNotif,
} from "brancy/models/interfaces";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./pageAI.module.css";
import GeneratedImageModal from "brancy/components/page/ai/popup/GeneratedImageModal";
import GeneratedVideoModal from "brancy/components/page/ai/popup/GeneratedVideoModal";
import ImagePromptSuggestions, { ImagePromptDetail } from "brancy/components/page/ai/popup/imagePromptSuggestions";
import { AiModelListContent } from "brancy/components/page/ai/popup/AiModelList";
type MediaTab = "image" | "video" | "createimage" | "createvideo";
type AiQueryType = "1" | "2";
const SUCCESS_MEDIA_STATUS = 2;
const VIDEO_THUMBNAIL_DELAY_MS = 1000;
export default function PageAI({ initialType }: { initialType?: AiQueryType }) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [activeTab, setActiveTab] = useState<MediaTab>(initialType === "2" ? "video" : "image");
  const [creatorTab, setCreatorTab] = useState<MediaTab>(initialType === "2" ? "createvideo" : "createimage");
  const [images, setImages] = useState<IGetMedia[]>([]);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [videos, setVideos] = useState<IGetMedia[]>([]);
  const [nextVideoMaxId, setNextVideoMaxId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createMediaLoading, setCreateMediaLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState(false);
  const [imageHistoryLoading, setImageHistoryLoading] = useState(true);
  const [videoHistoryLoading, setVideoHistoryLoading] = useState(true);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState<IGetMedia | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<IGetMedia | null>(null);
  const [imageCreators, setImageCreators] = useState<IMediaCreator[]>([]);
  const [videoCreators, setVideoCreators] = useState<IMediaCreator[]>([]);
  const [loadedImageCreators, setLoadedImageCreators] = useState(false);
  const [loadedVideoCreators, setLoadedVideoCreators] = useState(false);
  const [error, setError] = useState("");
  const [pendingGenerations, setPendingGenerations] = useState<PendingGeneration[]>([]);
  const pendingGenerationsRef = useRef<PendingGeneration[]>([]);
  const initialLibrary = initialType === "2" ? "video" : "image";
  const [libraryTab, setLibraryTab] = useState<PendingGeneration["mediaType"]>(initialLibrary);
  const [initialLibraryLoading, setInitialLibraryLoading] = useState(true);
  const [showImagePrompts, setShowImagePrompts] = useState(false);
  const [selectedImagePrompt, setSelectedImagePrompt] = useState<IImagePrompt | null>(null);
  const [promptToUse, setPromptToUse] = useState<{ key: string; text: string } | null>(null);
  const [imageModelSelection, setImageModelSelection] = useState({ creatorKey: "", modelName: "" });
  const [videoModelSelection, setVideoModelSelection] = useState({ creatorKey: "", modelName: "" });
  const [showModelList, setShowModelList] = useState(false);
  const fetchImages = useCallback(
    async (cursor: string | null): Promise<IGetMedia[]> => {
      console.log("Fetching images...");
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
      console.log("Fetching videos...");
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
  const onCreateMedia = async (request: IGetImageUsageRequest, count: number): Promise<boolean> => {
    if (createMediaLoading) return false;
    setCreateMediaLoading(true);
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
      setCreateMediaLoading(false);
      return false;
    }
    if (!checkFeatureResponse.value) {
      setShowFeaturePopup(true);
      setCreateMediaLoading(false);
      return false;
    }
    const requestClientContext = crypto.randomUUID();
    const mediaType: PendingGeneration["mediaType"] = creatorTab === "createvideo" ? "video" : "image";
    const pendingGeneration = { clientContext: requestClientContext, mediaType, prompt: request.prompt };
    pendingGenerationsRef.current = [...pendingGenerationsRef.current, pendingGeneration];
    setPendingGenerations(pendingGenerationsRef.current);
    setActiveTab(mediaType);
    setLibraryTab(mediaType);
    const response = await clientFetchApi<IGetImageUsageRequest, number>(
      `/api/mediaai/${creatorTab === "createvideo" ? "CreateVideo" : "CreateImage"}`,
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
      setCreateMediaLoading(false);
      return false;
    }
    internalNotify(
      InternalResponseType.Success,
      NotifType.Success,
      creatorTab === "createvideo" ? t("Video generation request sent.") : t("Image generation request sent."),
    );
    setCreateMediaLoading(false);
    return true;
  };
  const loadCreators = async () => {
    if (!session) return;
    console.log("loadCreators called");
    setLoading(true);
    setError("");
    const response = await clientFetchApi<boolean, IMediaCreator[]>("/api/mediaai/GetImageCreators", { session });
    if (response.succeeded && Array.isArray(response.value)) {
      setImageCreators(response.value);
      setLoadedImageCreators(true);
      setCreatorTab("createimage");
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
      setVideoCreators(response.value);
      setLoadedVideoCreators(true);
      setCreatorTab("createvideo");
    } else {
      notify(response.info?.responseType, NotifType.Warning);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (initialType) {
      setActiveTab(initialLibrary);
      setLibraryTab(initialLibrary);
      return;
    }
    if (!router.isReady) return;
    const queryType = router.query?.type;
    const type = Array.isArray(queryType) ? queryType[0] : queryType;
    if (type === "1") {
      setActiveTab("image");
      setLibraryTab("image");
    } else if (type === "2") {
      setActiveTab("video");
      setLibraryTab("video");
    }
  }, [initialLibrary, initialType, router.isReady, router.query?.type]);
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
    if (libraryTab !== "image" || loadedImages) return;
    setLoadedImages(true);
    setImageHistoryLoading(true);
    fetchImages(null)
      .then(setImages)
      .finally(() => {
        setImageHistoryLoading(false);
      });
  }, [fetchImages, libraryTab, loadedImages, session]);
  useEffect(() => {
    if (!session || libraryTab !== "video" || loadedVideos) return;
    setLoadedVideos(true);
    setVideoHistoryLoading(true);
    fetchVideos(null)
      .then(setVideos)
      .finally(() => {
        setVideoHistoryLoading(false);
      });
  }, [fetchVideos, libraryTab, loadedVideos, session]);
  const libraryHistoryLoading = libraryTab === "image" ? imageHistoryLoading : videoHistoryLoading;
  useEffect(() => {
    if (!libraryHistoryLoading) setInitialLibraryLoading(false);
  }, [libraryHistoryLoading]);
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
    isLoading: imageHistoryLoading,
    enabled: libraryTab === "image",
    useContainerScroll: true,
    fetchDelay: 0,
  });
  const fetchMoreVideos = useCallback(() => {
    console.log("Fetching more videos...");
    return fetchVideos(nextVideoMaxId);
  }, [fetchVideos, nextVideoMaxId]);
  const handleVideosFetched = useCallback((newVideos: IGetMedia[]) => {
    setVideos((current) => [...current, ...newVideos]);
  }, []);
  const { isLoadingMore: isLoadingMoreVideos } = useInfiniteScroll<IGetMedia>({
    hasMore: Boolean(nextVideoMaxId),
    fetchMore: fetchMoreVideos,
    onDataFetched: handleVideosFetched,
    getItemId: (video) => video.id,
    currentData: videos,
    isLoading: videoHistoryLoading,
    enabled: libraryTab === "video",
    useContainerScroll: true,
    containerRef,
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
  useEffect(() => {
    if (!session) return;
    if (activeTab === "image") {
      setCreatorTab("createimage");
      if (!loadedImageCreators) openImageCreator();
    } else {
      setCreatorTab("createvideo");
      if (!loadedVideoCreators) openVideoCreator();
    }
  }, [activeTab, loadedImageCreators, loadedVideoCreators, session]);
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
      if (notifObj.ResponseType === PushResponseType.AIImageSuccess) {
        console.log("generatedImage", generatedImage);
        setCreateMediaLoading(false);
        setImages((current) => {
          const alreadyAdded = current.some(
            (item) =>
              item.id === generatedImage.id ||
              item.clientContext?.toLowerCase() === generatedClientContext.toLowerCase(),
          );
          return alreadyAdded ? current : [generatedImage, ...current];
        });
        pendingGenerationsRef.current = pendingGenerationsRef.current.filter(
          (item) => item.clientContext !== generatedClientContext,
        );
        setPendingGenerations(pendingGenerationsRef.current);
      } else if (notifObj.ResponseType === PushResponseType.AIVideoSuccess) {
        console.log("generatedVideo", generatedImage);
        setCreateMediaLoading(false);
        setTimeout(() => {
          setVideos((current) => {
            const alreadyAdded = current.some(
              (item) =>
                item.id === generatedImage.id ||
                item.clientContext?.toLowerCase() === generatedClientContext.toLowerCase(),
            );
            return alreadyAdded ? current : [generatedImage, ...current];
          });
          pendingGenerationsRef.current = pendingGenerationsRef.current.filter(
            (item) => item.clientContext !== generatedClientContext,
          );
          setPendingGenerations(pendingGenerationsRef.current);
        }, VIDEO_THUMBNAIL_DELAY_MS);
      } else if (
        notifObj.ResponseType === PushResponseType.AIImageFailed ||
        notifObj.ResponseType === PushResponseType.AIVideoFailed
      ) {
        if (!pendingGeneration) return;
        console.log("generatedImagefailed", generatedImage);
        setCreateMediaLoading(false);
        pendingGenerationsRef.current = pendingGenerationsRef.current.filter(
          (item) => item.clientContext !== generatedClientContext,
        );
        setPendingGenerations(pendingGenerationsRef.current);
        internalNotify(
          InternalResponseType.InvalidMetaData,
          NotifType.Warning,
          generatedImage.metadata || t(", Media generation failed."),
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
  const modelCreators = activeTab === "image" ? imageCreators : videoCreators;
  const modelSelection = activeTab === "image" ? imageModelSelection : videoModelSelection;
  const handleModelSelectionChange = useCallback(
    (selection: { creatorKey: string; modelName: string }) => {
      if (activeTab === "image") setImageModelSelection(selection);
      else setVideoModelSelection(selection);
    },
    [activeTab],
  );
  const openModelList = useCallback(() => setShowModelList(true), []);
  if (initialLibraryLoading) {
    return <Loading />;
  }
  return (
    <>
      <Head>
        <title>Bran.cy ▸ {t(LanguageKey.navbar_AI)}</title>
        <meta name="description" content={t("Create and manage AI-generated images and videos.")} />
      </Head>
      <main className={styles.aiWorkspace}>
        <div className={styles.left}>
          <MediaLibrary
            filter={libraryTab}
            onFilterChange={setLibraryTab}
            images={images}
            videos={videos}
            loading={libraryHistoryLoading}
            isLoadingMore={isLoadingMore}
            isLoadingMoreVideos={isLoadingMoreVideos}
            setSelectedImage={setSelectedImage}
            setSelectedVideo={setSelectedVideo}
            pendingGenerations={pendingGenerations}
            containerRef={containerRef}
          />
        </div>

        {(activeTab === "image" || activeTab === "video") && (
          <MediaCreator
            creators={activeTab === "image" ? imageCreators : videoCreators}
            error={error}
            onRetry={activeTab === "video" ? loadVideoCreators : loadCreators}
            onCreateMedia={onCreateMedia}
            createMediaLoading={createMediaLoading}
            setActiveTab={setActiveTab}
            activeTab={creatorTab}
            modelSelection={modelSelection}
            onModelSelectionChange={handleModelSelectionChange}
            onOpenModelList={openModelList}
            featureUnavailable={showFeaturePopup}
            onOpenImagePrompts={() => setShowImagePrompts(true)}
            promptToUse={promptToUse}
          />
        )}
      </main>
      <Modal closePopup={() => setShowModelList(false)} classNamePopup="popupLarge" showContent={showModelList}>
        <AiModelListContent
          creators={modelCreators}
          selectedCreatorKey={modelSelection.creatorKey}
          selectedModelName={modelSelection.modelName}
          onSelect={(creatorKey, modelName) => handleModelSelectionChange({ creatorKey, modelName })}
          onClose={() => setShowModelList(false)}
        />
      </Modal>
      <Modal
        closePopup={() => {
          setSelectedImagePrompt(null);
          setShowImagePrompts(false);
        }}
        classNamePopup="popupLarge"
        showContent={showImagePrompts}>
        {selectedImagePrompt ? (
          <ImagePromptDetail
            prompt={selectedImagePrompt}
            onBack={() => setSelectedImagePrompt(null)}
            onUsePrompt={() => {
              setPromptToUse({ key: String(selectedImagePrompt.id), text: selectedImagePrompt.promptBody });
              setSelectedImagePrompt(null);
            }}
          />
        ) : (
          <ImagePromptSuggestions
            session={session}
            isOpen={showImagePrompts}
            onClose={() => setShowImagePrompts(false)}
            onSelect={setSelectedImagePrompt}
          />
        )}
      </Modal>
      <Modal closePopup={() => setSelectedImage(null)} classNamePopup="popupLarge" showContent={selectedImage !== null}>
        {selectedImage && <GeneratedImageModal image={selectedImage} />}
      </Modal>
      <Modal closePopup={() => setSelectedVideo(null)} classNamePopup="popupLarge" showContent={selectedVideo !== null}>
        {selectedVideo && <GeneratedVideoModal video={selectedVideo} />}
      </Modal>
    </>
  );
}
