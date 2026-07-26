import { useSession } from "next-auth/react";
import router from "next/router";
import { useCallback, useEffect, useState } from "react";
import ImageCreator from "brancy/components/page/ai/ImageCreator";
import Loading from "brancy/components/notOk/loading";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { IGetImage, IGetImageUsageRequest, IImageCreator, PushNotif } from "brancy/models/interfaces";
import { MethodType } from "brancy/helper/api";
import { PsgFeatureType, PushResponseType } from "brancy/models/enums";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Modal from "brancy/components/design/modal";
import NotFeature from "brancy/components/notOk/notFeature";
import { getHubConnection } from "brancy/helper/pushNotif";
import convertFirstLetterToLowerCase from "brancy/helper/convertFirstLetterToLowerCase";
import { handleDecompress } from "brancy/helper/pako";
import GeneratedImageModal from "brancy/components/page/ai/GeneratedImageModal";

export default function CreateImage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [creators, setCreators] = useState<IImageCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [createImageLoading, setCreateImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [clientContext, setClientContext] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<IGetImage | null>(null);
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
      setShowPopup(true);
      return;
    }
    setCreateImageLoading(true);
    setNewImage(null);
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
      setCreateImageLoading(false);
    }
  };
  const loadCreators = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    setError("");
    const response = await clientFetchApi<boolean, IImageCreator[]>("/api/mediaai/GetImageCreators", { session });

    if (response.succeeded && Array.isArray(response.value)) {
      setCreators(response.value);
    } else {
      setError(response.info?.message || response.errorMessage || "Could not load image models.");
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  const handleGetNotif = useCallback(
    (notif: string) => {
      try {
        const decombNotif = handleDecompress(notif);
        if (!decombNotif) return;

        const notifObj = JSON.parse(decombNotif) as PushNotif;
        if (!notifObj.Message || !notifObj.InstagramerId) return;

        const newPostPush = convertFirstLetterToLowerCase(JSON.parse(notifObj.Message));
        const generatedImage = newPostPush as IGetImage;
        if (generatedImage.clientContext !== clientContext) return;
        if (notifObj.ResponseType === PushResponseType.AiImageSuccess) setNewImage(generatedImage);
        else if (notifObj.ResponseType === PushResponseType.AiImageFail) {
          internalNotify(
            InternalResponseType.InvalidMetaData,
            NotifType.Warning,
            generatedImage.metadata || "Image generation failed.",
          );
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setCreateImageLoading(false);
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

  if (loading) return <Loading />;

  return (
    <>
      <ImageCreator
        creators={creators}
        error={error}
        onRetry={loadCreators}
        onCreateImage={onCreateImage}
        createImageLoading={createImageLoading}
      />
      <Modal closePopup={() => setNewImage(null)} classNamePopup="popupLarge" showContent={newImage !== null}>
        {newImage && <GeneratedImageModal image={newImage} onClose={() => setNewImage(null)} />}
      </Modal>
      <Modal
        closePopup={function (): void {
          setShowPopup(false);
        }}
        classNamePopup={"popupSendFile"}
        showContent={showPopup}>
        <NotFeature
          onClose={function (): void {
            setShowPopup(false);
          }}
        />
      </Modal>
    </>
  );
}
