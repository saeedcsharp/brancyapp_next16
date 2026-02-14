import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { IProduct_FullProduct } from "saeed/models/store/IProduct";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const UpdateProduct = (props: { data: number[]; removeMask: () => void }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [fullProducts, setFullProducts] = useState<IProduct_FullProduct[]>([]);
  async function fetchData() {
    try {
      const res = await GetServerResult<{ productIds: number[] }, IProduct_FullProduct[]>(
        MethodType.post,
        session,
        "shopper/Product/GetFullProductList",
        { productIds: props.data },
        [
          {
            key: "language",
            value: "1",
          },
        ]
      );
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
