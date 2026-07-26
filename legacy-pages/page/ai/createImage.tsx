import { useSession } from "next-auth/react";
import router from "next/router";
import { useCallback, useEffect, useState } from "react";
import ImageCreator from "brancy/components/page/ai/ImageCreator";
import Loading from "brancy/components/notOk/loading";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { IGetImageUsageRequest, IImageCreator } from "brancy/models/interfaces";
import { MethodType } from "brancy/helper/api";
import { PsgFeatureType } from "brancy/models/enums";
import { NotifType, notify } from "brancy/components/notifications/notificationBox";
import Modal from "brancy/components/design/modal";
import NotFeature from "brancy/components/notOk/notFeature";

export default function CreateImage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [creators, setCreators] = useState<IImageCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
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

    const response = await clientFetchApi<IGetImageUsageRequest, number>("/api/mediaai/CreateImage", {
      session,
      methodType: MethodType.post,
      data: request,
      queries: [{ key: "clientContext", value: crypto.randomUUID() }],
    });
    if (response.succeeded) {
    } else notify(response.info?.responseType, NotifType.Warning);
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

  if (loading) return <Loading />;

  return (
    <>
      <ImageCreator creators={creators} error={error} onRetry={loadCreators} onCreateImage={onCreateImage} />;
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
