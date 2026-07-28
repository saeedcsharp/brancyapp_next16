import RingLoader from "brancy/components/design/loader/ringLoder";
import Modal from "brancy/components/design/modal";
import NotFeature from "brancy/components/notOk/notFeature";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import ImageCreator from "brancy/components/page/ai/ImageCreator";
import GeneratedImageModal, { parseImageMetadata } from "brancy/components/page/ai/generatedImageModal";
import { MethodType } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
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
    //  await loadCreators();
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
          <>
            <header className={styles.aiHeader}>
              <div>
                <span className={styles.eyebrow}>AI media studio</span>
                <h1>Your creations</h1>
                <p>Browse previous generations or start a new creative project.</p>
              </div>
              <button
                className={styles.createButton}
                type="button"
                onClick={activeTab === "image" ? openImageCreator : openVideoCreator}>
                <span aria-hidden="true">+</span>
                Create {activeTab === "image" ? "image" : "video"}
              </button>
            </header>
            <div className={styles.mediaTabs} role="tablist" aria-label="Media type">
              <button
                className={activeTab === "image" ? styles.mediaTabActive : styles.mediaTab}
                type="button"
                role="tab"
                aria-selected={activeTab === "image"}
                onClick={() => setActiveTab("image")}>
                <span className={styles.tabIcon} aria-hidden="true">
                  ▧
                </span>
                <span>
                  <strong>Images</strong>
                  <small>Generated artwork and visuals</small>
                </span>
              </button>
              <button
                className={activeTab === "video" ? styles.mediaTabActive : styles.mediaTab}
                type="button"
                role="tab"
                aria-selected={activeTab === "video"}
                onClick={() => setActiveTab("video")}>
                <span className={styles.tabIcon} aria-hidden="true">
                  ▶
                </span>
                <span>
                  <strong>Videos</strong>
                  <small>AI motion and clips</small>
                </span>
              </button>
            </div>
          </>
        )}
        {activeTab === "image" && (
          <section className={styles.library} aria-label="Generated images">
            <div className={styles.libraryHeading}>
              <div>
                <h2>Image library</h2>
                <p>{images.length} creations loaded</p>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <RingLoader width={42} height={42} />
              </div>
            ) : images.length > 0 ? (
              <div className={styles.imageGrid}>
                {images.map((image) => {
                  const metadata = image.metadata ? parseImageMetadata(image.metadata) : null;
                  return (
                    <article className={styles.imageCard} key={image.id}>
                      <button className={styles.imagePreview} type="button" onClick={() => setSelectedImage(image)}>
                        <img src={getClientMediaBaseUrl() + image.imageUrl} alt={image.prompt || "Generated image"} />
                        <span>View details</span>
                      </button>
                      <div className={styles.imageInfo}>
                        <div className={styles.imageMetaLine}>
                          <span>{image.creatorKey}</span>
                          <time>{formatCreatedTime(image.createdTime)}</time>
                        </div>
                        <h3>{image.prompt || "Untitled generation"}</h3>
                        <p>{image.version}</p>
                        {metadata?.length ? (
                          <dl className={styles.cardMetadata}>
                            {metadata.slice(0, 3).map((item) => (
                              <div key={item.key}>
                                <dt>{item.label}</dt>
                                <dd>{item.value}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyLibrary}>
                <span aria-hidden="true">▧</span>
                <h2>No images yet</h2>
                <p>Your successful image generations will appear here.</p>
                <button type="button" onClick={openImageCreator}>
                  Create your first image
                </button>
              </div>
            )}
            {isLoadingMore && (
              <div className={styles.loadMore}>
                <RingLoader width={30} height={30} />
              </div>
            )}
          </section>
        )}
        {activeTab === "video" && (
          <section className={styles.videoLibrary}>
            <div>
              <span aria-hidden="true">▶</span>
              <h2>Video studio</h2>
              <p>Create a new AI video. Your video library will appear here when history is available.</p>
            </div>
            <button type="button" onClick={openVideoCreator}>
              Create video
            </button>
          </section>
        )}
        {activeTab === "createimage" && (
          <ImageCreator
            creators={creators}
            error={error}
            onRetry={loadCreators}
            onCreateImage={onCreateImage}
            setActiveTab={setActiveTab}
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
