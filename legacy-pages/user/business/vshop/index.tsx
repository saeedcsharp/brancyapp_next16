import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { MethodType } from "brancy/helper/api";
import { IBusiness, IBusinessResponse, BusinessType } from "brancy/models/userPanel/business";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import styles from "../business.module.css";

const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

function BusinessCard({ item }: { item: IBusiness }) {
  return (
    <div
      className={styles.card}
      style={item.bannerUrl ? { backgroundImage: `url(${baseMediaUrl + item.bannerUrl})` } : undefined}>
      <div className={styles.overlay} />
      <div className={styles.cardTop}>
        <span className={`${styles.badge} ${styles.badgeVShop}`}>VShop</span>
      </div>
      <div className={styles.cardMiddle}>
        <div className={styles.avatarWrapper}>
          <img
            src={baseMediaUrl + item.profileUrl}
            alt={item.username}
            width={64}
            height={64}
            className={styles.avatar}
          />
        </div>
        <p className={styles.fullName}>{item.fullName}</p>
        <p className={styles.username}>@{item.username}</p>
      </div>
      <div className={styles.cardBottom}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Followers</span>
            <span className={styles.metaValue}>{item.followerCount.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BusinessVShop() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [items, setItems] = useState<IBusiness[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const nextMaxIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session || session.user.currentIndex !== -1) return;
    let cancelled = false;
    setLoading(true);
    clientFetchApi<boolean, IBusinessResponse>("/api/business/search", {
      methodType: MethodType.get,
      session,
      data: undefined,
      queries: [{ key: "businessType", value: BusinessType.VShoper.toString() }],
      onUploadProgress: undefined,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.succeeded && res.value) {
          setItems(res.value.items);
          nextMaxIdRef.current = res.value.nextMaxId ?? null;
          setHasMore(!!res.value.nextMaxId);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [session]);

  const fetchMore = useCallback(async (): Promise<IBusiness[]> => {
    if (!session || !nextMaxIdRef.current) return [];
    const res = await clientFetchApi<boolean, IBusinessResponse>("/api/business/search", {
      methodType: MethodType.get,
      session,
      data: undefined,
      queries: [
        { key: "businessType", value: BusinessType.VShoper.toString() },
        { key: "nextMaxId", value: nextMaxIdRef.current },
      ],
      onUploadProgress: undefined,
    });
    if (res.succeeded && res.value) {
      nextMaxIdRef.current = res.value.nextMaxId ?? null;
      return res.value.items;
    }
    return [];
  }, [session]);

  const onDataFetched = useCallback((newData: IBusiness[], more: boolean) => {
    setItems((prev) => [...prev, ...newData]);
    setHasMore(more && !!nextMaxIdRef.current);
  }, []);

  const { containerRef, isLoadingMore } = useInfiniteScroll<IBusiness>({
    hasMore,
    fetchMore,
    onDataFetched,
    getItemId: (item) => item.instagramerId,
    currentData: items,
    enableAutoLoad: false,
    fetchDelay: 0,
  });

  if (session && session.user.currentIndex > -1) {
    router.push("/");
    return null;
  }

  return (
    session?.user.currentIndex === -1 && (
      <>
        <Head>
          <title>Brancy ▸ Business › VShop</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        </Head>
        <div className={styles.container} ref={containerRef}>
          <Link href="/user/business" className={styles.backBtn}>
            ← Back
          </Link>
          {loading && items.length === 0 ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
            </div>
          ) : items.length === 0 ? (
            <p className={styles.empty}>No VShops found.</p>
          ) : (
            <>
              <div className={styles.grid}>
                {items.map((item) => (
                  <BusinessCard key={item.instagramerId} item={item} />
                ))}
              </div>
              {isLoadingMore && (
                <div className={styles.loadingWrap}>
                  <div className={styles.spinner} />
                </div>
              )}
            </>
          )}
        </div>
      </>
    )
  );
}
