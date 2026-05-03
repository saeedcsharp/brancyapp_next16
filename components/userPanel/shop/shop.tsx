import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import InputText from "brancy/components/design/inputText";
import Loading from "brancy/components/notOk/loading";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { calculateSummary } from "brancy/helper/numberFormater";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { LanguageKey } from "brancy/i18n";
import { IBusiness, IBusinessResponse } from "brancy/models/userPanel/business";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./shop.module.css";

const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL ?? "";

function ShopPage(props: {
  data: IBusinessResponse | undefined;
  fetchStorewData: (pagination: string) => Promise<IBusinessResponse>;
}) {
  const { data: session } = useSession();
  const userRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [loadingStatus, setLoadingStatus] = useState(LoginStatus(session));

  // Local state for accumulated items and pagination cursor
  const [items, setItems] = useState<IBusiness[]>(props.data?.items || []);
  const nextMaxIdRef = useRef(props.data?.nextMaxId || "");
  const [nextMaxId, setNextMaxId] = useState(props.data?.nextMaxId || "");

  useEffect(() => {
    if (props.data) {
      setItems(props.data.items);
      setNextMaxId(props.data.nextMaxId);
      nextMaxIdRef.current = props.data.nextMaxId;
      setLoadingStatus(false);
    }
  }, [props.data]);

  const fetchMoreCb = useCallback(async () => {
    const result = await props.fetchStorewData(nextMaxIdRef.current);
    nextMaxIdRef.current = result.nextMaxId;
    setNextMaxId(result.nextMaxId);
    return result.items;
  }, [props.fetchStorewData]);

  const onDataFetchedCb = useCallback((newData: IBusiness[]) => {
    setItems((prev) => [...prev, ...newData]);
  }, []);

  const { containerRef: scrollRef, isLoadingMore } = useInfiniteScroll<IBusiness>({
    hasMore: !!nextMaxId,
    fetchMore: fetchMoreCb,
    onDataFetched: onDataFetchedCb,
    getItemId: (item) => item.instagramerId,
    currentData: items,
    useContainerScroll: true,
    containerRef: userRef,
    threshold: 200,
    enableAutoLoad: false,
  });

  // فیلترها
  const [sortBy, setSortBy] = useState<"followers" | "rating" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // استخراج دسته‌بندی‌ها از داده‌ها
  const categories = useMemo(() => {
    if (!items.length) return [];
    const allCats = items.flatMap((v) => v.fullShop?.categories || []);
    const unique = Array.from(new Map(allCats.map((c) => [c.categoryId, c])).values());
    return unique;
  }, [items]);

  // فیلتر و مرتب‌سازی داده‌ها
  const filteredData = useMemo(() => {
    let data = items;
    if (selectedCategory) {
      data = data.filter((shop) =>
        shop.fullShop?.categories.some((cat) => String(cat.categoryId) === selectedCategory),
      );
    }
    if (sortBy === "followers") {
      data = [...data].sort((a, b) =>
        sortOrder === "asc" ? a.followerCount - b.followerCount : b.followerCount - a.followerCount,
      );
    }
    // سرچ
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(
        (shop) =>
          (shop.fullName && shop.fullName.toLowerCase().includes(s)) ||
          (shop.username && shop.username.toLowerCase().includes(s)) ||
          shop.fullShop?.categories.some((cat) => cat.langValue && cat.langValue.toLowerCase().includes(s)),
      );
    }
    return data;
  }, [items, sortBy, sortOrder, selectedCategory, search]);

  // آیا فیلتری فعال است؟
  const isFiltered = sortBy || selectedCategory || search.trim();

  return (
    <div ref={userRef} className={styles.swiper}>
      {/* فیلترها */}

      <div className={styles.newfilter}>
        {/* دکمه فیلتر برای موبایل */}

        <div className={styles.mobileFilterToggleparent}>
          <button className={styles.mobileFilterToggle} onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <svg
              fill="none"
              width="25"
              stroke="var(--color-gray)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 28 28">
              <path
                d="M10.3 26.5h7.5c6.2 0 8.7-2.5 8.7-8.7v-7.5c0-6.3-2.5-8.8-8.7-8.8h-7.5C4 1.5 1.4 4 1.4 10.3v7.5c0 6.2 2.5 8.7 8.8 8.7"
                strokeOpacity=".4"
              />
              <path d="M18.5 22.1v-4.8m0-9V6m0 2.4a3.2 3.2 0 1 1 0 6.5 3.2 3.2 0 0 1 0-6.5m-9 13.8v-2.4m0-9V6m0 13.8a3.2 3.2 0 1 0 0-6.5 3.2 3.2 0 0 0 0 6.5" />
            </svg>
            {t(LanguageKey.filter_category)}
          </button>
          {!isFiltered && (
            <svg
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                cursor: "pointer",
                transform: isFilterOpen ? "rotate(90deg)" : "rotate(-90deg)",
                transition: "transform 0.3s ease",
              }}
              width="25"
              height="25"
              viewBox="0 0 22 22"
              fill="none">
              <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
              <path
                fill="var(--text-h1)"
                d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
              />
            </svg>
          )}
          {isFiltered && (
            <button
              className={styles.stopButton}
              style={{
                height: "40px",
                display: isFilterOpen ? "none" : "block",
              }}
              onClick={() => {
                setSortBy(null);
                setSortOrder("desc");
                setSelectedCategory(null);
                setSearch("");
              }}>
              {t(LanguageKey.filter_reset)}
            </button>
          )}
        </div>

        {/* فیلترهای دسکتاپ */}
        <div className={styles.desktopFilters}>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.search)}</div>
            <InputText
              className="serachMenuBar"
              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
              value={search}
              handleInputChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.filter_category)}</div>
            {/* دسته‌بندی با DragDrop */}
            <DragDrop
              data={[
                <div id="" key="all">
                  {t(LanguageKey.all)}
                </div>,
                ...categories.map((cat) => (
                  <div id={String(cat.categoryId)} key={cat.categoryId}>
                    {cat.langValue}
                  </div>
                )),
              ]}
              handleOptionSelect={(id) => setSelectedCategory(id || null)}
              item={
                selectedCategory ? categories.findIndex((cat) => String(cat.categoryId) === selectedCategory) + 1 : 0
              }
              searchMod={true}
              resetItemValue={!selectedCategory}
            />
          </div>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.filter_followers)}</div>

            {/* مرتب‌سازی بر اساس فالوئر با DragDrop */}
            <DragDrop
              data={[
                <div id="0" key="0">
                  {t(LanguageKey.default)}
                </div>,
                <div id="asc" key="asc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 7.3q.6.7 0 1.4l-5 5q-.6.7-1.1 1a3 3 0 0 1-1.8.7q-.8 0-1.4-.6l-1-1-1-1h-.7l-1 1-3 3a1 1 0 0 1-1.4-1.5l3-3q.6-.7 1.1-1a3 3 0 0 1 1.8-.7q.8 0 1.4.6l1 1 1 1q.4.2.7 0l1-1 5-5a1 1 0 0 1 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 8q0-1 1-1h5q1 0 1 1v5a1 1 0 1 1-2 0V9h-4a1 1 0 0 1-1-1"
                    />
                  </svg>
                  {t(LanguageKey.lowtohigh)}
                </div>,
                <div id="desc" key="desc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 16.7q.6-.7 0-1.4l-5-5q-.6-.7-1.1-1a3 3 0 0 0-1.8-.7q-.8 0-1.4.6l-1 1-1 1q-.5.2-.7 0l-1-1-3-3a1 1 0 0 0-1.4 1.5l3 3q.6.7 1.1 1a3 3 0 0 0 1.8.7q.8 0 1.4-.6l1-1 1-1q.4-.2.7 0l1 1 5 5q.7.4 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 16q0 1 1 1h5q1 0 1-1v-5a1 1 0 1 0-2 0v4h-4a1 1 0 0 0-1 1"
                    />
                  </svg>
                  {t(LanguageKey.hightolow)}
                </div>,
              ]}
              handleOptionSelect={(id) => {
                if (id === "0") {
                  setSortBy(null);
                  setSortOrder("desc");
                } else {
                  setSortBy("followers");
                  setSortOrder(id);
                }
              }}
              item={sortBy === "followers" ? (sortOrder === "asc" ? 1 : 2) : 0}
              searchMod={false}
              resetItemValue={sortBy !== "followers"}
            />
          </div>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.filter_rating)}</div>
            {/* مرتب‌سازی بر اساس امتیاز با DragDrop */}
            <DragDrop
              data={[
                <div id="0" key="0">
                  {t(LanguageKey.default)}
                </div>,
                <div id="asc" key="asc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 7.3q.6.7 0 1.4l-5 5q-.6.7-1.1 1a3 3 0 0 1-1.8.7q-.8 0-1.4-.6l-1-1-1-1h-.7l-1 1-3 3a1 1 0 0 1-1.4-1.5l3-3q.6-.7 1.1-1a3 3 0 0 1 1.8-.7q.8 0 1.4.6l1 1 1 1q.4.2.7 0l1-1 5-5a1 1 0 0 1 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 8q0-1 1-1h5q1 0 1 1v5a1 1 0 1 1-2 0V9h-4a1 1 0 0 1-1-1"
                    />
                  </svg>
                  {t(LanguageKey.lowtohigh)}
                </div>,
                <div id="desc" key="desc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 16.7q.6-.7 0-1.4l-5-5q-.6-.7-1.1-1a3 3 0 0 0-1.8-.7q-.8 0-1.4.6l-1 1-1 1q-.5.2-.7 0l-1-1-3-3a1 1 0 0 0-1.4 1.5l3 3q.6.7 1.1 1a3 3 0 0 0 1.8.7q.8 0 1.4-.6l1-1 1-1q.4-.2.7 0l1 1 5 5q.7.4 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 16q0 1 1 1h5q1 0 1-1v-5a1 1 0 1 0-2 0v4h-4a1 1 0 0 0-1 1"
                    />
                  </svg>
                  {t(LanguageKey.hightolow)}
                </div>,
              ]}
              handleOptionSelect={(id) => {
                if (id === "0") {
                  setSortBy(null);
                  setSortOrder("desc");
                } else {
                  setSortBy("rating");
                  setSortOrder(id);
                }
              }}
              item={sortBy === "rating" ? (sortOrder === "asc" ? 1 : 2) : 0}
              searchMod={false}
              resetItemValue={sortBy !== "rating"}
            />
          </div>

          {isFiltered && (
            <div className="headerandinput" style={{ minWidth: "max-content", maxWidth: "max-content" }}>
              <div className="headertext"> </div>
              <button
                className={styles.stopButton}
                style={{ height: "40px" }}
                onClick={() => {
                  setSortBy(null);
                  setSortOrder("desc");
                  setSelectedCategory(null);
                  setSearch("");
                }}>
                {t(LanguageKey.filter_reset)}
              </button>
            </div>
          )}
        </div>

        {/* فیلترهای موبایل */}
        <div className={`${styles.mobileFilters} ${isFilterOpen ? styles.mobileFiltersOpen : ""}`}>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.search)}</div>
            <InputText
              className="serachMenuBar"
              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
              value={search}
              handleInputChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.filter_category)}</div>
            {/* دسته‌بندی با DragDrop */}
            <DragDrop
              data={[
                <div id="" key="all">
                  {t(LanguageKey.all)}
                </div>,
                ...categories.map((cat) => (
                  <div id={String(cat.categoryId)} key={cat.categoryId}>
                    {cat.langValue}
                  </div>
                )),
              ]}
              handleOptionSelect={(id) => setSelectedCategory(id || null)}
              item={
                selectedCategory ? categories.findIndex((cat) => String(cat.categoryId) === selectedCategory) + 1 : 0
              }
              searchMod={true}
              resetItemValue={!selectedCategory}
            />
          </div>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.filter_followers)}</div>

            {/* مرتب‌سازی بر اساس فالوئر با DragDrop */}
            <DragDrop
              data={[
                <div id="0" key="0">
                  {t(LanguageKey.default)}
                </div>,
                <div id="asc" key="asc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 7.3q.6.7 0 1.4l-5 5q-.6.7-1.1 1a3 3 0 0 1-1.8.7q-.8 0-1.4-.6l-1-1-1-1h-.7l-1 1-3 3a1 1 0 0 1-1.4-1.5l3-3q.6-.7 1.1-1a3 3 0 0 1 1.8-.7q.8 0 1.4.6l1 1 1 1q.4.2.7 0l1-1 5-5a1 1 0 0 1 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 8q0-1 1-1h5q1 0 1 1v5a1 1 0 1 1-2 0V9h-4a1 1 0 0 1-1-1"
                    />
                  </svg>
                  {t(LanguageKey.lowtohigh)}
                </div>,
                <div id="desc" key="desc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 16.7q.6-.7 0-1.4l-5-5q-.6-.7-1.1-1a3 3 0 0 0-1.8-.7q-.8 0-1.4.6l-1 1-1 1q-.5.2-.7 0l-1-1-3-3a1 1 0 0 0-1.4 1.5l3 3q.6.7 1.1 1a3 3 0 0 0 1.8.7q.8 0 1.4-.6l1-1 1-1q.4-.2.7 0l1 1 5 5q.7.4 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 16q0 1 1 1h5q1 0 1-1v-5a1 1 0 1 0-2 0v4h-4a1 1 0 0 0-1 1"
                    />
                  </svg>
                  {t(LanguageKey.hightolow)}
                </div>,
              ]}
              handleOptionSelect={(id) => {
                if (id === "0") {
                  setSortBy(null);
                  setSortOrder("desc");
                } else {
                  setSortBy("followers");
                  setSortOrder(id);
                }
              }}
              item={sortBy === "followers" ? (sortOrder === "asc" ? 1 : 2) : 0}
              searchMod={false}
              resetItemValue={sortBy !== "followers"}
            />
          </div>
          <div className={styles.filter}>
            <div className="headertext">{t(LanguageKey.filter_rating)}</div>
            {/* مرتب‌سازی بر اساس امتیاز با DragDrop */}
            <DragDrop
              data={[
                <div id="0" key="0">
                  {t(LanguageKey.default)}
                </div>,
                <div id="asc" key="asc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 7.3q.6.7 0 1.4l-5 5q-.6.7-1.1 1a3 3 0 0 1-1.8.7q-.8 0-1.4-.6l-1-1-1-1h-.7l-1 1-3 3a1 1 0 0 1-1.4-1.5l3-3q.6-.7 1.1-1a3 3 0 0 1 1.8-.7q.8 0 1.4.6l1 1 1 1q.4.2.7 0l1-1 5-5a1 1 0 0 1 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 8q0-1 1-1h5q1 0 1 1v5a1 1 0 1 1-2 0V9h-4a1 1 0 0 1-1-1"
                    />
                  </svg>
                  {t(LanguageKey.lowtohigh)}
                </div>,
                <div id="desc" key="desc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M20.7 16.7q.6-.7 0-1.4l-5-5q-.6-.7-1.1-1a3 3 0 0 0-1.8-.7q-.8 0-1.4.6l-1 1-1 1q-.5.2-.7 0l-1-1-3-3a1 1 0 0 0-1.4 1.5l3 3q.6.7 1.1 1a3 3 0 0 0 1.8.7q.8 0 1.4-.6l1-1 1-1q.4-.2.7 0l1 1 5 5q.7.4 1.4 0"
                    />
                    <path
                      opacity=".8"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14 16q0 1 1 1h5q1 0 1-1v-5a1 1 0 1 0-2 0v4h-4a1 1 0 0 0-1 1"
                    />
                  </svg>
                  {t(LanguageKey.hightolow)}
                </div>,
              ]}
              handleOptionSelect={(id) => {
                if (id === "0") {
                  setSortBy(null);
                  setSortOrder("desc");
                } else {
                  setSortBy("rating");
                  setSortOrder(id);
                }
              }}
              item={sortBy === "rating" ? (sortOrder === "asc" ? 1 : 2) : 0}
              searchMod={false}
              resetItemValue={sortBy !== "rating"}
            />
          </div>

          {isFiltered && (
            <div className="headerandinput" style={{ minWidth: "max-content", maxWidth: "max-content" }}>
              <div className="headertext"> </div>
              <button
                className={styles.stopButton}
                style={{ height: "40px" }}
                onClick={() => {
                  setSortBy(null);
                  setSortOrder("desc");
                  setSelectedCategory(null);
                  setSearch("");
                  setIsFilterOpen(false);
                }}>
                {t(LanguageKey.filter_reset)}
              </button>
            </div>
          )}
        </div>
      </div>

      {loadingStatus && <Loading />}
      {!loadingStatus &&
        filteredData.map((v) => (
          <Link href={`/user/business/shop/${v.instagramerId}`} key={v.instagramerId} className={styles.page}>
            <div className={styles.background}>
              <img
                className={styles.backgroundImage}
                src={baseMediaUrl + v.bannerUrl}
                loading="lazy"
                decoding="async"
                alt="background image"
              />
            </div>

            <div className={styles.profile}>
              <img
                className={styles.instagramimage}
                src={baseMediaUrl + v.profileUrl}
                alt="instagram profile picture"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/no-profile.svg";
                }}
              />

              <div className={styles.instagramprofiledetail}>
                {v.fullName && <div className={styles.instagramusername}>{v.fullName}</div>}
                <div className={`${styles.instagramid} ${styles.translate}`}>@{v.username}</div>
              </div>
            </div>

            <div className={styles.summary}>
              <div className={styles.summarydata}>
                <div className={styles.rating}>{"--"}</div>
                {t(LanguageKey.markethomerating)}
              </div>
              <div className={styles.summarydata}>
                <div className={styles.follower}>{calculateSummary(v.followerCount)}</div>
                {t(LanguageKey.markethomefollower)}
              </div>
              <div className={styles.summarydata}>
                <div className={styles.post}>{v.fullShop?.shortShop.productCount}</div>
                {t(LanguageKey.marketPropertiesProduct)}
              </div>
            </div>

            <div className={styles.categorysection}>
              {v.fullShop?.categories.map((u) => (
                <div key={u.categoryId} className={styles.category}>
                  {u.langValue}
                </div>
              ))}
            </div>
            {/* <div className={styles.accounttype}>
              <img
                className={styles.accounttype}
                src={"/icon-store.svg"}
                alt=" store icon"
                loading="lazy"
                decoding="async"
              />
            </div> */}
          </Link>
        ))}
      {isLoadingMore && <Loading />}
    </div>
  );
}

export default ShopPage;
