import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { MethodType } from "saeed/helper/api";
import { IProduct_FullProduct } from "saeed/models/store/IProduct";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const UpdateProduct = (props: { data: number[]; removeMask: () => void }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [fullProducts, setFullProducts] = useState<IProduct_FullProduct[]>([]);
  async function fetchData() {
    try {
      const res = await clientFetchApi<{ productIds: number[] }, IProduct_FullProduct[]>("/api/product/GetFullProductList", { methodType: MethodType.post, session: session, data: { productIds: props.data }, queries: [
          {
            key: "language",
            value: "1",
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setFullProducts(res.value);
        setLoading(false);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  return <>{loading && <Loading />}</>;
};

export default UpdateProduct;
