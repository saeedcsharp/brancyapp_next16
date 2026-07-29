// #region
import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import NotAllowed from "brancy/components/notOk/notAllowed";
import NotShopper from "brancy/components/notOk/notShopper";
import { MethodType } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { packageStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { calculateSummary } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/enums";
import { IProduct_Candidate } from "brancy/models/interfaces";
import styles from "./selectProduct.module.css";
const basePictureUrl = getClientMediaBaseUrl();
async function fetchProductCandidates(session: any, includeProduct: boolean, nextMaxCreatedTime?: string) {
  return clientFetchApi<boolean, IProduct_Candidate[]>("shopper/Product/GetProductCandidates", {
    methodType: MethodType.get,
    session,
    data: null,
    queries: nextMaxCreatedTime
      ? [
          { key: "includeProduct", value: String(includeProduct) },
          { key: "nextMaxCreatedTime", value: nextMaxCreatedTime },
        ]
      : [{ key: "includeProduct", value: String(includeProduct) }],
    onUploadProgress: undefined,
  });
}
async function submitSelectedProducts(session: any, postIds: number[]) {
  return clientFetchApi<{ postIds: number[] }, boolean>("shopper/Product/CreateProducts", {
    methodType: MethodType.post,
    session,
    data: { postIds },
    queries: undefined,
    onUploadProgress: undefined,
  });
}
interface RequestStatus {
  initialLoading: boolean;
  loadingMore: boolean;
  saving: boolean;
}
interface State {
  products: IProduct_Candidate[];
  selectedPosts: Set<number>;
  productFilter: boolean;
  selectAllFilter: boolean;
  noMoreData: boolean;
  status: RequestStatus;
}
type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: IProduct_Candidate[] }
  | { type: "FETCH_FAILURE" }
  | { type: "FETCH_MORE_START" }
  | { type: "FETCH_MORE_SUCCESS"; payload: IProduct_Candidate[] }
  | { type: "FETCH_MORE_FAILURE" }
  | { type: "SAVE_START" }
  | { type: "SAVE_FAILURE" }
  | { type: "TOGGLE_SELECT"; postId: number }
  | { type: "TOGGLE_SELECT_ALL" }
  | { type: "SET_FILTER"; value: boolean };
const initialState: State = {
  products: [],
  selectedPosts: new Set(),
  productFilter: true,
  selectAllFilter: false,
  noMoreData: false,
  status: { initialLoading: true, loadingMore: false, saving: false },
};
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: { ...state.status, initialLoading: true } };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload,
        selectedPosts: new Set(),
        selectAllFilter: false,
        noMoreData: false,
        status: { ...state.status, initialLoading: false },
      };
    case "FETCH_FAILURE":
      return { ...state, status: { ...state.status, initialLoading: false } };
    case "FETCH_MORE_START":
      return { ...state, status: { ...state.status, loadingMore: true } };
    case "FETCH_MORE_SUCCESS": {
      const merged = [...state.products, ...action.payload];
      let selectedPosts = state.selectedPosts;
      if (state.selectAllFilter) {
        selectedPosts = new Set(selectedPosts);
        action.payload.forEach((p) => {
          if (!p.productId) selectedPosts.add(p.postId);
        });
      }
      return {
        ...state,
        products: merged,
        selectedPosts,
        noMoreData: action.payload.length === 0,
        status: { ...state.status, loadingMore: false },
      };
    }
    case "FETCH_MORE_FAILURE":
      return { ...state, status: { ...state.status, loadingMore: false } };
    case "SAVE_START":
      return { ...state, status: { ...state.status, saving: true } };
    case "SAVE_FAILURE":
      return { ...state, status: { ...state.status, saving: false } };
    case "TOGGLE_SELECT": {
      const selectedPosts = new Set(state.selectedPosts);
      if (selectedPosts.has(action.postId)) selectedPosts.delete(action.postId);
      else selectedPosts.add(action.postId);
      return { ...state, selectedPosts };
    }
    case "TOGGLE_SELECT_ALL": {
      const selectablePostIds = state.products.filter((p) => !p.productId).map((p) => p.postId);
      const isAllSelected = state.selectedPosts.size > 0 && state.selectedPosts.size === selectablePostIds.length;
      return isAllSelected
        ? { ...state, selectAllFilter: false, selectedPosts: new Set() }
        : { ...state, selectAllFilter: true, selectedPosts: new Set(selectablePostIds) };
    }
    case "SET_FILTER":
      return { ...state, productFilter: action.value };
    default:
      return state;
  }
}
const SCROLL_DEBOUNCE_MS = 150;
const SCROLL_THRESHOLD_PX = 50;
const SelectProduct = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, selectedPosts, productFilter, selectAllFilter, noMoreData, status } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const modalRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const fetchRequestIdRef = useRef(0);
  const isFetchingMoreRef = useRef(false);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, IProduct_Candidate[]>>(new Map());
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, []);
  const filteredProducts = useMemo(
    () => products.filter((p) => !p.productId || productFilter),
    [products, productFilter],
  );
  const fetchData = useCallback(
    async (includeProduct: boolean) => {
      const cacheKey = String(includeProduct);
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        dispatch({ type: "FETCH_SUCCESS", payload: cached });
      } else {
        dispatch({ type: "FETCH_START" });
      }
      const requestId = ++fetchRequestIdRef.current;
      try {
        const res = await fetchProductCandidates(session, includeProduct);
        if (!isMountedRef.current || requestId !== fetchRequestIdRef.current) return;
        if (res.succeeded) {
          cacheRef.current.set(cacheKey, res.value);
          dispatch({ type: "FETCH_SUCCESS", payload: res.value });
          scrollContainerRef.current?.scrollTo({ top: 0 });
        } else {
          notify(res.info.responseType, NotifType.Warning);
          if (!cached) dispatch({ type: "FETCH_FAILURE" });
        }
      } catch (error) {
        if (isMountedRef.current && requestId === fetchRequestIdRef.current) {
          notify(ResponseType.Unexpected, NotifType.Error);
          if (!cached) dispatch({ type: "FETCH_FAILURE" });
        }
      }
    },
    [session],
  );
  const getMoreData = useCallback(async () => {
    if (isFetchingMoreRef.current || noMoreData || products.length === 0) return;
    isFetchingMoreRef.current = true;
    dispatch({ type: "FETCH_MORE_START" });
    try {
      const nextMaxCreatedTime = products[products.length - 1].createdTime.toString();
      const res = await fetchProductCandidates(session, true, nextMaxCreatedTime);
      if (!isMountedRef.current) return;
      if (res.succeeded) {
        dispatch({ type: "FETCH_MORE_SUCCESS", payload: res.value });
      } else {
        notify(res.info.responseType, NotifType.Warning);
        dispatch({ type: "FETCH_MORE_FAILURE" });
      }
    } catch (error) {
      if (isMountedRef.current) {
        notify(ResponseType.Unexpected, NotifType.Error);
        dispatch({ type: "FETCH_MORE_FAILURE" });
      }
    } finally {
      isFetchingMoreRef.current = false;
    }
  }, [products, session, noMoreData]);
  const handleSelectPost = useCallback((postId: number, productId: number | null) => {
    if (productId) return;
    dispatch({ type: "TOGGLE_SELECT", postId });
  }, []);
  const handleSelectAllPosts = useCallback(() => {
    dispatch({ type: "TOGGLE_SELECT_ALL" });
  }, []);
  const handleScroll = useCallback(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      if (isFetchingMoreRef.current || noMoreData || status.initialLoading) return;
      const container = scrollContainerRef.current;
      if (!container) return;
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + SCROLL_THRESHOLD_PX;
      if (isNearBottom) getMoreData();
    }, SCROLL_DEBOUNCE_MS);
  }, [noMoreData, status.initialLoading, getMoreData]);
  const handleSaveCandidateProduct = useCallback(async () => {
    if (status.saving || selectedPosts.size === 0) return;
    dispatch({ type: "SAVE_START" });
    try {
      const res = await submitSelectedProducts(session, Array.from(selectedPosts));
      if (!isMountedRef.current) return;
      if (res.succeeded) {
        router.push("/store/products");
      } else {
        notify(res.info.responseType, NotifType.Warning);
        dispatch({ type: "SAVE_FAILURE" });
      }
    } catch (error) {
      if (isMountedRef.current) {
        notify(ResponseType.Unexpected, NotifType.Error);
        dispatch({ type: "SAVE_FAILURE" });
      }
    } finally {
      scrollContainerRef.current?.scrollBy({ top: -100 });
    }
  }, [session, selectedPosts, router, status.saving]);
  const handleFilterProduct = useCallback(() => {
    const nextFilter = !productFilter;
    dispatch({ type: "SET_FILTER", value: nextFilter });
    fetchData(nextFilter);
  }, [productFilter, fetchData]);
  const toggleModal = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
    setIsModalOpen((prev) => !prev);
  }, []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const orderedPostIds = useMemo(() => filteredProducts.map((p) => p.postId), [filteredProducts]);
  const handleItemKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>, postId: number, productId: number | null) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          handleSelectPost(postId, productId);
          break;
        case "ArrowRight":
        case "ArrowDown": {
          e.preventDefault();
          const currentIndex = orderedPostIds.indexOf(postId);
          const nextId = orderedPostIds[currentIndex + 1];
          if (nextId !== undefined) itemRefs.current.get(nextId)?.focus();
          break;
        }
        case "ArrowLeft":
        case "ArrowUp": {
          e.preventDefault();
          const currentIndex = orderedPostIds.indexOf(postId);
          const prevId = orderedPostIds[currentIndex - 1];
          if (prevId !== undefined) itemRefs.current.get(prevId)?.focus();
          break;
        }
        default:
          break;
      }
    },
    [handleSelectPost, orderedPostIds],
  );
  useEffect(() => {
    if (!isModalOpen) return;
    const modalNode = modalRef.current;
    const focusableItems = modalNode?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    focusableItems?.[0]?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        filterTriggerRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && focusableItems && focusableItems.length > 0) {
        const first = focusableItems[0];
        const last = focusableItems[focusableItems.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);
  useEffect(() => {
    if (!session || session.user.currentIndex === -1) return;
    if (RoleAccess(session, PartnerRole.Products)) fetchData(true);
  }, [session, fetchData]);
  useEffect(() => {
    if (!session) return;
    if (session.user.currentIndex === -1) {
      router.push("/user");
      return;
    }
    if (!packageStatus(session)) {
      router.push("/upgrade");
    }
  }, [session, router]);
  if (!session?.user.isShopper) return <NotShopper />;
  if (!RoleAccess(session, PartnerRole.Products)) return <NotAllowed />;
  // if (!session?.user.hasPackage) return <NotBasePackage />;
  if (!session || session.user.currentIndex === -1) return null;
  // #endregion
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.Storeproduct_addnewproduct)}</title>
        <meta name="description" content={String(t(LanguageKey.Storeproduct_addnewproduct))} />
        <meta name="theme-color" content="#060708" />
        <meta name="robots" content="noindex, nofollow" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <main className="fullScreenPupup_bg">
        {isModalOpen && (
          <div ref={modalRef} className={styles.modal} role="menu">
            <div
              className={styles.modalmenu}
              role="menuitem"
              tabIndex={0}
              onClick={handleFilterProduct}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleFilterProduct()}>
              <img
                src="/unselected.svg"
                className={styles.modalicon}
                alt={t(LanguageKey.ShowUnprocessedItemsOnly) as string}
                title="ℹ️ unselected"
              />
              <div className={styles.modaltext}>{t(LanguageKey.ShowUnprocessedItemsOnly)}</div>
            </div>
            <div
              className={styles.modalmenu}
              role="menuitem"
              tabIndex={0}
              onClick={handleSelectAllPosts}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelectAllPosts()}>
              <img
                src="/select_All.svg"
                className={styles.modalicon}
                alt={t(LanguageKey.selectall) as string}
                title="ℹ️ Select All"
              />
              <div className={styles.modaltext}>{t(LanguageKey.selectall)}</div>
            </div>
          </div>
        )}
        <div onClick={closeModal} className="fullScreenPupup_header">
          <div className={styles.titlecontainer}>
            {t(LanguageKey.SelectProduct)} <br />
            {!status.initialLoading && (
              <div className={styles.subtitlecontainer}>
                {t(LanguageKey.SelectedPosts)} <strong>{selectedPosts.size}</strong>
              </div>
            )}
          </div>
          {!status.initialLoading && (
            <div className={styles.titleCard}>
              <div
                ref={filterTriggerRef}
                role="button"
                tabIndex={0}
                onClick={(e) => toggleModal(e)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleModal(e as unknown as ReactMouseEvent)}
                className={styles.headerbtndiscard}>
                <img src="/Filter.svg" alt={t(LanguageKey.ShowUnprocessedItemsOnly) as string} title="ℹ️ filter" />
              </div>
              <Link href="/store/products" className={styles.headerbtndiscard}>
                <img src="/close_white.svg" alt={t(LanguageKey.close) as string} title="ℹ️ close" />
              </Link>
              <div
                onClick={handleSaveCandidateProduct}
                role="button"
                tabIndex={0}
                aria-disabled={status.saving || selectedPosts.size === 0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSaveCandidateProduct()}
                className={styles.headerbtnsave}>
                {t(LanguageKey.save)}
              </div>
            </div>
          )}
        </div>
        <div className="fullScreenPupup_content" ref={scrollContainerRef} onScroll={handleScroll}>
          <div onClick={closeModal} className={styles.frameContainer}>
            {status.initialLoading && <Loading />}
            {!status.initialLoading &&
              filteredProducts.map((v) => (
                <div
                  className={`${styles.post} ${v.isCandidate ? styles.candidate : ""} ${selectedPosts.has(v.postId) ? styles.selected : ""}`}
                  key={v.postId}
                  ref={(el) => {
                    if (el) itemRefs.current.set(v.postId, el);
                    else itemRefs.current.delete(v.postId);
                  }}
                  role="checkbox"
                  aria-checked={selectedPosts.has(v.postId)}
                  aria-disabled={Boolean(v.productId)}
                  tabIndex={v.productId ? -1 : 0}
                  onClick={() => handleSelectPost(v.postId, v.productId)}
                  onKeyDown={(e) => handleItemKeyDown(e, v.postId, v.productId)}>
                  <div className={styles.postinfo}>
                    <div className={styles.imageParent}>
                      <img
                        className={styles.postimage}
                        src={basePictureUrl + v.thumbnailMediaUrl}
                        alt="post picture"
                        loading="lazy"
                      />
                      {(v.isCandidate || selectedPosts.has(v.postId)) && (
                        <img className={`${styles.centerIcon}`} src="/tickff.svg" alt="status" />
                      )}
                      <div className={styles.postid}>{v.productTempId ? "#" + v.productTempId : v.postTempId}</div>
                    </div>
                    <div className={styles.engagmentinfo}>
                      <div className={styles.counter}>
                        <img className={styles.icon} alt="like" src="/icon-like.svg" />
                        <span>{calculateSummary(v.likeCount)}</span>
                      </div>
                      <div className={styles.counter}>
                        <img className={styles.icon} alt="view" src="/icon-view.svg" />
                        <span>{calculateSummary(v.viewCount)}</span>
                      </div>{" "}
                    </div>
                    <div className={styles.engagmentinfo}>
                      <div className={styles.counter}>
                        <img className={styles.icon} alt="comment" src="/icon-comment.svg" />
                        <span>{calculateSummary(v.commentCount)}</span>
                      </div>
                      <div className={styles.counter}>
                        <img className={styles.icon} alt="share" src="/icon-send.svg" />
                        <span>{calculateSummary(v.shareCount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {status.loadingMore && <DotLoaders />}
        </div>
      </main>
    </>
  );
};

export default SelectProduct;
