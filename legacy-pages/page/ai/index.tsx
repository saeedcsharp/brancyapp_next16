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
import { IGetImage, IGetImages, IGetImageUsageRequest, IImageCreator, PushNotif } from "brancy/models/interfaces";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import { useCallback, useEffect, useState } from "react";
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
  const [images, setImages] = useState<IGetImage[]>([]);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(false);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState<IGetImage | null>(null);
  const [creators, setCreators] = useState<IImageCreator[]>([]);
  const [error, setError] = useState("");
  const [clientContext, setClientContext] = useState<string | null>(null);

  const fetchImages = useCallback(
    async (cursor: string | null): Promise<IGetImage[]> => {
      if (!session) return [];

      const response = await clientFetchApi<null, IGetImages>("/api/mediaai/GetImages", {
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
    setClientContext(requestClientContext);
    const response = await clientFetchApi<IGetImageUsageRequest, number>("/api/mediaai/CreateImage", {
      session,
      methodType: MethodType.post,
      data: request,
      queries: [{ key: "clientContext", value: requestClientContext }],
    });
    if (!response.succeeded) {
      notify(response.info?.responseType, NotifType.Warning);
      return;
    }
    internalNotify(InternalResponseType.Success, NotifType.Success, "Image generation request sent.");
  };
  const loadCreators = async () => {
    if (!session) return;
    console.log("loadCreators called");
    setLoading(true);
    setError("");
    const response = await clientFetchApi<boolean, IImageCreator[]>("/api/mediaai/GetImageCreators", { session });
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
    const response = await clientFetchApi<boolean, IImageCreator[]>("/api/mediaai/GetVideoCreators", { session });
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

  const fetchMoreImages = useCallback(() => fetchImages(nextMaxId), [fetchImages, nextMaxId]);
  const handleImagesFetched = useCallback((newImages: IGetImage[]) => {
    setImages((current) => [...current, ...newImages]);
  }, []);

  const { containerRef, isLoadingMore } = useInfiniteScroll<IGetImage>({
    hasMore: Boolean(nextMaxId),
    fetchMore: fetchMoreImages,
    onDataFetched: handleImagesFetched,
    getItemId: (image) => image.id,
    currentData: images,
    isLoading: loading,
    enabled: activeTab === "image",
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
  const handleGetNotif = useCallback(
    (notif: string) => {
      try {
        const decombNotif = handleDecompress(notif);
        if (!decombNotif) return;
        const notifObj = JSON.parse(decombNotif) as PushNotif;
        if (!notifObj.Message) return;
        const newPostPush = convertFirstLetterToLowerCase(JSON.parse(notifObj.Message));
        const generatedImage = newPostPush as IGetImage;
        if (generatedImage.clientContext !== clientContext) return;
        if (notifObj.ResponseType === PushResponseType.AiImageSuccess) {
          console.log("generatedImage", generatedImage);
          setImages((current) => [generatedImage, ...current]);
        } else if (notifObj.ResponseType === PushResponseType.AiImageFail) {
          console.log("generatedImagefailed", generatedImage);
          internalNotify(
            InternalResponseType.InvalidMetaData,
            NotifType.Warning,
            generatedImage.metadata || ", Image generation failed.",
          );
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [clientContext],
  );

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
        <meta name="description" content="Create and manage AI-generated images and videos." />
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
          />
        )}
        {activeTab === "video" && <VideoList openVideoCreator={openVideoCreator} />}
        {(activeTab === "createimage" || activeTab === "createvideo") && (
          <MediaCreator
            creators={creators}
            error={error}
            onRetry={loadCreators}
            onCreateImage={onCreateImage}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        )}
      </main>
      <Modal closePopup={() => setSelectedImage(null)} classNamePopup="popupLarge" showContent={selectedImage !== null}>
        {selectedImage && <GeneratedImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
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
