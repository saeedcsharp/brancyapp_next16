import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import ShopPage from "brancy/components/userPanel/shop/shop";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { BusinessType, IBusinessResponse } from "brancy/models/userPanel/business";
import styles from "../business.module.css";

export default function BusinessShop() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [loading, setLoading] = useState(true);
  const [storeMarkets, setStoreMarkets] = useState<IBusinessResponse>({ items: [], nextMaxId: "" });

  async function fetchStorewData(pagination: string): Promise<IBusinessResponse> {
    const res = await clientFetchApi<boolean, IBusinessResponse>("/api/business/search", {
      methodType: MethodType.get,
      session,
      data: null,
      queries: [
        { key: "businessType", value: BusinessType.Shop.toString() },
        { key: "nextMaxId", value: pagination },
      ],
      onUploadProgress: undefined,
    });
    if (res.succeeded) return res.value;
    notify(res.info.responseType, NotifType.Warning);
    return { items: [], nextMaxId: "" };
  }

  useEffect(() => {
    if (!session) return;
    async function fetchData() {
      try {
        const res = await clientFetchApi<boolean, IBusinessResponse>("/api/business/search", {
          methodType: MethodType.get,
          session,
          data: null,
          queries: [{ key: "businessType", value: BusinessType.Shop.toString() }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          setStoreMarkets(res.value);
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  if (session && session.user.currentIndex > -1) {
    router.push("/");
    return null;
  }

  return (
    session?.user.currentIndex === -1 && (
      <>
        <Head>
          <title>Brancy ▸ Business › Shop</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        </Head>
        <div className={styles.container}>
          <Link href="/user/business" className={styles.backBtn}>
            ← Back
          </Link>
          {loading ? <Loading /> : <ShopPage fetchStorewData={fetchStorewData} data={storeMarkets} />}
        </div>
      </>
    )
  );
}
