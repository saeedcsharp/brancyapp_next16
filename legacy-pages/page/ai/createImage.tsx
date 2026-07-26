import { useSession } from "next-auth/react";
import router from "next/router";
import { useCallback, useEffect, useState } from "react";
import ImageCreator from "brancy/components/page/ai/ImageCreator";
import Loading from "brancy/components/notOk/loading";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { IImageCreator } from "brancy/models/interfaces";

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

  return <ImageCreator creators={creators} error={error} onRetry={loadCreators} />;
}
