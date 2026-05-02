import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { MethodType } from "brancy/helper/api";
import { IBusiness, IBusinessResponse, BusinessType } from "brancy/models/userPanel/business";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import styles from "./business.module.css";

const DEFAULT_AVATAR = "/images/default-avatar.png";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
function isValidUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function BusinessTypeLabel({ type }: { type: BusinessType }) {
  switch (type) {
    case BusinessType.Shop:
      return <span className={`${styles.badge} ${styles.badgeShop}`}>Shop</span>;
    case BusinessType.Advertise:
      return <span className={`${styles.badge} ${styles.badgeAdvertise}`}>Advertise</span>;
    case BusinessType.VShoper:
      return <span className={`${styles.badge} ${styles.badgeVShop}`}>VShop</span>;
    default:
      return null;
  }
}

function BusinessCard({ item }: { item: IBusiness }) {
  const bannerSrc = isValidUrl(item.bannerUrl) ? baseMediaUrl + item.bannerUrl : null;

  return (
    <div className={styles.card} style={bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : undefined}>
      <div className={styles.overlay} />

      {/* Top: badge */}
      <div className={styles.cardTop}>
        <BusinessTypeLabel type={item.businessType} />
      </div>

      {/* Middle: avatar + name */}
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

      {/* Bottom: meta */}
      <div className={styles.cardBottom}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Followers</span>
            <span className={styles.metaValue}>{item.followerCount.toLocaleString()}</span>
          </span>
          {item.fullShop && (
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Products</span>
              <span className={styles.metaValue}>{item.fullShop.shortShop.productCount.toLocaleString()}</span>
            </span>
          )}
        </div>
        {item.fullShop?.categories && item.fullShop.categories.length > 0 && (
          <div className={styles.categories}>
            {item.fullShop.categories.slice(0, 3).map((cat) => (
              <span key={cat.categoryId} className={styles.categoryChip}>
                {cat.langValue} ({cat.count})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Business() {
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

  // بارگذاری اولیه
  useEffect(() => {
    if (!session || session.user.currentIndex !== -1) return;
    let cancelled = false;
    setLoading(true);
    clientFetchApi<boolean, IBusinessResponse>("/api/business/search", {
      methodType: MethodType.get,
      session,
      data: undefined,
      queries: undefined,
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

  // fetchMore برای infinite scroll
  const fetchMore = useCallback(async (): Promise<IBusiness[]> => {
    if (!session || !nextMaxIdRef.current) return [];
    const res = await clientFetchApi<boolean, IBusinessResponse>("/api/business/search", {
      methodType: MethodType.get,
      session,
      data: undefined,
      queries: [{ key: "maxId", value: nextMaxIdRef.current }],
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
      <div className={styles.container} ref={containerRef}>
        {loading && items.length === 0 ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : items.length === 0 ? (
          <p className={styles.empty}>No businesses found.</p>
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
    )
  );
}
