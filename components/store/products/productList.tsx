// #region function Section
import { useSession } from "next-auth/react";
import Link from "next/link";
import router from "next/router";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import InputText from "saeed/components/design/inputText";
import DotLoaders from "saeed/components/design/loader/dotLoaders";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Modal from "saeed/components/design/modal";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotShopper from "saeed/components/notOk/notShopper";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/apihelper";
import { AvailabilityStatus } from "saeed/models/store/enum";
import { IProduct_ShortProduct, ITempIdAndNonProductCount } from "saeed/models/store/IProduct";
import styles from "./productList.module.css";
import ProductListDesktop from "./productListComponents/ProductListDesktop";
import ProductListMobile from "./productListComponents/ProductListMobile";
import UpdateProduct from "./updateProduct";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
function debounce(func: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

type SortField = "name" | "pid" | "stock" | "price" | "lastModified" | "status" | null;
type SortDirection = "asc" | "desc";
const ProductList = () => {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const availableStatus = useMemo(
    () => [
      <div id={AvailabilityStatus.Available.toString()} className={styles.status_child}>
        <div className={styles.status_available}>
          <img width="20" alt="Available" title="ℹ️ Available" src="/product_Available.svg" />
          <span>{t(LanguageKey.product_Available)}</span>
        </div>
      </div>,
      <div id={AvailabilityStatus.Restocking.toString()} className={styles.status_child}>
        <div className={styles.status_restocking}>
          <img width="20" alt="supplying" title="ℹ️ supplying" src="/product_supplying.svg" />
          <span> {t(LanguageKey.product_supplying)}</span>
        </div>
      </div>,
      <div id={AvailabilityStatus.OutOfStock.toString()} className={styles.status_child}>
        <div className={styles.status_outofstock}>
          <img width="20" alt="Out Of Stock" title="ℹ️ Out Of Stock" src="/product_OutOfStock.svg" />
          <span>{t(LanguageKey.product_OutOfStock)}</span>
        </div>
      </div>,
      <div id={AvailabilityStatus.Stopped.toString()} className={styles.status_child}>
        <div className={styles.status_stopped}>
          <img width="20" alt="Stopped sale" title="ℹ️ Stopped sale" src="/product_Stoppedsale.svg" />
          <span>{t(LanguageKey.product_Stoppedsale)}</span>
        </div>
      </div>,
    ],
    [t],
  );
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const userRef = useRef<HTMLDivElement>(null);
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const [products, setProducts] = useState<IProduct_ShortProduct[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Orders));
  const [hasMoreData, setHasMoreData] = useState(true);
  const [productIds, setProductIds] = useState<number[]>([]);
  const [selectAllProduct, setSelectAllProduct] = useState(false);
  const [showUpdateProduct, setshowUpdateProduct] = useState(false);
  const [showSearch, setShowSearch] = useState({
    loading: false,
    noResult: false,
  });
  const [searchLocked, setSearchLocked] = useState<boolean>(false);
  const [searchproduct, setSearchProduct] = useState<IProduct_ShortProduct[]>();
  const [timoutId, setTimeoutId] = useState<any>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notInstanceFilter, setNotInstanceFilter] = useState(false);
  const [nonProductCount, setNonProductCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const [isSearchBarClosing, setIsSearchBarClosing] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [resize, setResize] = useState(0);
  const [isProductListLoading, setIsProductListLoading] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null); // <-- Add ref for search bar
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  // تغییر در تابع هندل وضعیت محصول
  const handleChangeActiveProduct = useCallback(
    async (productId: number, productInId: number | null, statusId: any) => {
      console.log("statusId", statusId.toString());
      if (!productInId) return;

      // ذخیره وضعیت جدید در مجموعه محصولات محلی
      const newArray = [...products!];
      for (let product of newArray) {
        if (product.productId === productId) {
          product.availabilityStatus = parseInt(statusId);
          if (parseInt(statusId) == AvailabilityStatus.OutOfStock) {
            product.maxStock = 0;
            product.minStock = 0;
          }
        }
      }

      // ارسال درخواست به سرور برای تغییر وضعیت
      const res = await clientFetchApi<boolean, IProduct_ShortProduct[]>("shopper" + "" + "/Product/ChangeAvailableProduct", { methodType: MethodType.get, session: session, data: null, queries: [
          {
            key: "productId",
            value: productId.toString(),
          },
          {
            key: "value",
            value: statusId,
          },
        ], onUploadProgress: undefined });

      if (res.succeeded) {
        setProducts(newArray);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    },
    [products, session],
  );

  // اصلاح تابع بررسی و تغییر خودکار وضعیت بر اساس موجودی
  const checkAndUpdateProductStatus = useCallback(
    (productList: IProduct_ShortProduct[]) => {
      if (!productList || productList.length === 0) return;

      const updatedProducts = [...productList];
      let hasChanges = false;

      // بررسی هر محصول برای تغییر وضعیت
      updatedProducts.forEach((product) => {
        if (!product.productInId) return;

        // بررسی اگر وضعیت فعلی Restocking یا Stopped است، آن را تغییر ندهیم
        if (
          product.availabilityStatus === AvailabilityStatus.Restocking ||
          product.availabilityStatus === AvailabilityStatus.Stopped
        ) {
          return; // حفظ وضعیت‌های دستی
        }

        // تغییر خودکار وضعیت بر اساس موجودی فقط برای وضعیت‌های Available و OutOfStock
        if (product.minStock === 0 && product.availabilityStatus !== AvailabilityStatus.OutOfStock) {
          product.availabilityStatus = AvailabilityStatus.OutOfStock;
          hasChanges = true;

          // ارسال درخواست به سرور بدون انتظار برای پاسخ
          clientFetchApi<boolean, IProduct_ShortProduct[]>("shopper" + "" + "/Product/ChangeAvailableProduct", { methodType: MethodType.get, session: session, data: null, queries: [
              {
                key: "productId",
                value: product.productId.toString(),
              },
              {
                key: "value",
                value: AvailabilityStatus.OutOfStock.toString(),
              },
            ], onUploadProgress: undefined });
        } else if (product.minStock > 0 && product.availabilityStatus === AvailabilityStatus.OutOfStock) {
          product.availabilityStatus = AvailabilityStatus.Available;
          hasChanges = true;

          // ارسال درخواست به سرور بدون انتظار برای پاسخ
          clientFetchApi<boolean, IProduct_ShortProduct[]>("shopper" + "" + "/Product/ChangeAvailableProduct", { methodType: MethodType.get, session: session, data: null, queries: [
              {
                key: "productId",
                value: product.productId.toString(),
              },
              {
                key: "value",
                value: AvailabilityStatus.Available.toString(),
              },
            ], onUploadProgress: undefined });
        }
      });

      // به‌روزرسانی محصولات فقط اگر تغییری رخ داده باشد
      if (hasChanges) {
        setProducts(updatedProducts);
      }
    },
    [session],
  );

  // اضافه کردن تابع برای جستجوی محصولات
  async function handleApiProductSearch(query: string) {
    try {
      var res = await clientFetchApi<[], IProduct_ShortProduct[]>("/api/product/SearchProducts", { methodType: MethodType.post, session: session, data: {}, queries: [{ key: "query", value: query }], onUploadProgress: undefined });
      console.log(res);
      if (res.succeeded && res.value.length > 0) {
        // بررسی و تغییر وضعیت محصولات جستجو شده
        checkAndUpdateProductStatus(res.value);
        setSearchProduct(res.value);
        setShowSearch({ loading: false, noResult: false });
      } else if (res.succeeded && res.value.length === 0) setShowSearch({ loading: false, noResult: true });
      else if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  // تعریف debouncedSearch بعد از تعریف handleApiProductSearch
  const debouncedSearch = useMemo(() => debounce(handleApiProductSearch, 1000), [handleApiProductSearch]);

  // تغییر در تابع fetchData برای اعمال بررسی خودکار وضعیت
  async function fetchData(filter: boolean) {
    try {
      setIsProductListLoading(true);
      const [res1, res2] = await Promise.all([
        clientFetchApi<boolean, IProduct_ShortProduct[]>("/api/product/GetProductList", { methodType: MethodType.get, session: session, data: null, queries: [
            {
              key: "excludeProductInstance",
              value: filter.toString(),
            },
          ], onUploadProgress: undefined }),
        clientFetchApi<boolean, ITempIdAndNonProductCount>("/api/product/GetLastTempIdAndNonProductsCount", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
      ]);
      if (res1.succeeded) {
        setNonProductCount(res2.value.nonProductCount);
        // بررسی و تغییر وضعیت محصولات دریافت شده
        checkAndUpdateProductStatus(res1.value);
        setProducts(res1.value);
        setLoadingStatus(false);
      } else {
        notify(res1.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsProductListLoading(false);
    }
  }

  // تغییر در تابع getMoreData برای استفاده با useInfiniteScroll
  const fetchMoreProducts = useCallback(async (): Promise<IProduct_ShortProduct[]> => {
    try {
      if (!products || products.length === 0) return [];

      const res = await clientFetchApi<boolean, IProduct_ShortProduct[]>("/api/product/GetProductList", { methodType: MethodType.get, session: session, data: null, queries: [
          {
            key: "nextMaxId",
            value: products[products.length - 1].productId.toString(),
          },
          {
            key: "excludeProductInstance",
            value: notInstanceFilter.toString(),
          },
        ], onUploadProgress: undefined });

      if (res.succeeded) {
        // بررسی و تغییر وضعیت محصولات بیشتر دریافت شده
        checkAndUpdateProductStatus(res.value);
        return res.value || [];
      } else {
        notify(res.info.responseType, NotifType.Warning);
        return [];
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
      return [];
    }
  }, [products, session, notInstanceFilter, checkAndUpdateProductStatus]);

  function getStockClass(stock: number, productInId: number | null) {
    if (!productInId) return styles.lowStock;
    if (stock < 5) return styles.lowStock;
    if (stock <= 10) return styles.mediumStock;
    return styles.highStock;
  }

  // استفاده از useInfiniteScroll hook
  const { containerRef: infiniteScrollRef, isLoadingMore } = useInfiniteScroll({
    hasMore: hasMoreData && !searchQuery,
    fetchMore: fetchMoreProducts,
    onDataFetched: (newData, hasMore) => {
      if (newData.length > 0) {
        setProducts((prev) => [...prev, ...newData]);
      }
      setHasMoreData(hasMore);
    },
    getItemId: (item) => item.productId,
    currentData: products || [],
    useContainerScroll: true,
    threshold: 300,
    enabled: !searchQuery && !isProductListLoading,
  });

  const handleSelectProduct = useCallback(
    (e: ChangeEvent<HTMLInputElement>, productId: number, productInId: number | null) => {
      if (!productInId) return;
      const newArray = [...productIds];
      if (e.target.checked) {
        const newArray2 = products!.filter((x) => x.productInId);
        if (newArray.length + 1 === newArray2.length) setSelectAllProduct(true);
        setProductIds((prev) => [...prev, productId]);
      } else {
        if (newArray.length === 1) setSelectAllProduct(false);
        setProductIds((prev) => prev.filter((x) => x !== productId));
      }
    },
    [productIds, products],
  );
  const handleSelectAllProduct = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSelectAllProduct(e.target.checked);
      if (e.target.checked) {
        const newArray = [...productIds];
        for (let product of products!) {
          if (product.productInId && !newArray.find((x) => x === product.productId)) {
            newArray.push(product.productId);
          }
        }
        setProductIds(newArray);
      } else {
        setProductIds([]);
      }
    },
    [productIds, products],
  );
  const handleSearchProductInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      startTransition(() => {
        setShowSearch({ loading: true, noResult: false });
        setSearchProduct([]);
        var query = e.currentTarget.value;
        setSearchQuery(query);
        setIsSearchBarOpen(true);
        if (query.length > 0) {
          if (searchLocked) return;
          setSearchLocked(true);
          debouncedSearch(query);
          setTimeout(() => {
            setSearchLocked(false);
          }, 2000);
        } else {
          setShowSearch({ loading: false, noResult: false });
        }
      });
    },
    [debouncedSearch],
  );
  function handleCloseSearchBar() {
    if (isSearchBarOpen) {
      setIsSearchBarClosing(true);
      // Wait for animation to complete before fully closing
      setTimeout(() => {
        setIsSearchBarOpen(false);
        setIsSearchBarClosing(false);
        setSearchQuery(""); // Clear search query
        setShowSearch({ loading: false, noResult: false }); // Reset search state
      }, 300); // Match animation duration (300ms)
    }
  }
  function handleFilterNotInstance() {
    setIsFilterActive((prevState) => !prevState);
    let filter = notInstanceFilter;
    setNotInstanceFilter((prev) => !prev);
    fetchData(!filter);
  }
  function handleResize() {
    if (typeof window !== undefined) {
      var width = window.innerWidth;
      setResize(width);
    }
  }

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection],
  );

  const sortedProducts = useMemo(() => {
    if (!products || !sortField) return products;

    const sorted = [...products];
    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "name":
          compareValue = (a.title || "").localeCompare(b.title || "");
          break;
        case "pid":
          compareValue = a.tempId - b.tempId;
          break;
        case "stock":
          compareValue = (a.minStock || 0) - (b.minStock || 0);
          break;
        case "price":
          compareValue = (a.minPrice || 0) - (b.minPrice || 0);
          break;
        case "lastModified":
          compareValue = (a.lastUpdate || 0) - (b.lastUpdate || 0);
          break;
        case "status":
          compareValue = (a.availabilityStatus || 0) - (b.availabilityStatus || 0);
          break;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [products, sortField, sortDirection]);

  const sortedSearchProducts = useMemo(() => {
    if (!searchproduct || !sortField) return searchproduct;

    const sorted = [...searchproduct];
    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "name":
          compareValue = (a.title || "").localeCompare(b.title || "");
          break;
        case "pid":
          compareValue = a.tempId - b.tempId;
          break;
        case "stock":
          compareValue = (a.minStock || 0) - (b.minStock || 0);
          break;
        case "price":
          compareValue = (a.minPrice || 0) - (b.minPrice || 0);
          break;
        case "lastModified":
          compareValue = (a.lastUpdate || 0) - (b.lastUpdate || 0);
          break;
        case "status":
          compareValue = (a.availabilityStatus || 0) - (b.availabilityStatus || 0);
          break;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [searchproduct, sortField, sortDirection]);
  useEffect(() => {
    if (productIds.length > 0) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 900); // مدت زمان انیمیشن 0.9 ثانیه است
      return () => clearTimeout(timer); // پاکسازی تایمر
    }
  }, [productIds.length]);
  //مپ محصول
  useEffect(() => {
    if (!session) return;
    fetchData(false);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [session]);

  // <-- Add useEffect for click outside
  useEffect(() => {
    // Use the native DOM MouseEvent type here
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        handleCloseSearchBar();
      }
    }

    if (isSearchBarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchBarOpen, handleCloseSearchBar]); // Add handleCloseSearchBar to dependency array
  // #endregion function Section
  return (
    <>
      {session && session.user.currentIndex !== -1 && (
        <>
          {loadingStatus && <Loading />}
          {!session.user.isShopper && <NotShopper />}
          {!loadingStatus && products && products.length > 0 && session.user.isShopper && (
            <div className={styles.pincontainer}>
              <div className="headerparent" style={{ marginBottom: "20px" }}>
                <Link
                  title="ℹ️ Add new product"
                  className="saveButton"
                  style={{ maxWidth: "170px", gap: "var(--gap-10)" }}
                  href={"/store/products/selectproduct"}>
                  {/* <img width="26px" title="ℹ️ Add new product" alt=" Add new product" src="/product_Add.svg" /> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="26px" fill="#fff" viewBox="0 0 36 36">
                    <path
                      fillRule="evenodd"
                      d="M27.4 19.5q1.4.1 1.5 1.5v3.8h3.7a1.5 1.5 0 1 1 0 3H29v3.7a1.5 1.5 0 1 1-3 0v-3.7h-4a1.5 1.5 0 1 1 0-3h4V21q.1-1.4 1.5-1.5"
                    />
                    <path d="m9.1 11.8 11.5-5.6 3.3 1.5-11.5 5.7z" />
                    <g fillRule="evenodd">
                      <path d="M4.8 17.5q.6-1 1.5-.5l3 1.5a1.1 1.1 0 0 1-1 2l-3-1.5a1 1 0 0 1-.5-1.5" />
                      <path
                        opacity=".4"
                        d="M27.4 17.3a3.7 3.7 0 0 0-3.8 3.7v1.5h-1.5a3.7 3.7 0 1 0 0 7.5h1.5v1.7l-2.1 1c-2.2.9-3.5 1.4-5 1.4s-2.8-.5-5-1.4a65 65 0 0 1-6.9-3.2c-1.5-1-2.7-2-2.7-3.7v-16c0-1.2.8-2 1.5-2.4q1-.8 2.7-1.4l4.7-2.2q3.3-1.9 5.7-2c1.8 0 3.4.8 5.7 2L27 6l2.7 1.4c.7.4 1.5 1.2 1.5 2.4v8.4q0 1.5-.2 1.7-.2 0-1.3-1.3-1-1.2-2.2-1.3m-11-12.5c-1 0-2 .4-4.7 1.7l-4.3 2-2.4 1.3L7.5 11l5 2.4c2.2 1 3 1.4 4 1.4s2-.4 4.8-1.8l4.2-2L28 9.8q-.7-.5-2.5-1.3l-5-2.3c-2.2-1.1-3-1.4-4-1.4"
                      />
                    </g>
                  </svg>

                  <span> {t(LanguageKey.Storeproduct_newproduct)}</span>
                </Link>
                <div className="headerChild">
                  <div className={styles.searchBar} title="ℹ️ search product">
                    {!isSearchBarOpen && (
                      <div
                        className={styles.searchmenubtn}
                        onClick={() => setIsSearchBarOpen(true)}
                        title="ℹ️ search products">
                        <img width="26px" title="ℹ️ search products" alt="search products" src="/product_search.svg" />
                      </div>
                    )}
                    {isSearchBarOpen && (
                      <div
                        className={`${styles.serachMenuBar} ${isSearchBarClosing ? styles.searchBarClosing : ""}`}
                        ref={searchBarRef}>
                        <InputText
                          className={"serachMenuBar"}
                          placeHolder={t(LanguageKey.search)}
                          handleInputChange={handleSearchProductInputChange}
                          value={searchQuery}
                        />
                      </div>
                    )}
                  </div>
                  <div
                    onClick={handleFilterNotInstance}
                    className={`${styles.menubtn} ${isFilterActive ? styles.activeFilter : ""} ${
                      nonProductCount === 0 ? styles.disabled : ""
                    }`}
                    title="ℹ️ see new product">
                    <img width="26px" title="ℹ️ see new product" alt=" see new product" src="/product_draft-gray.svg" />
                    {nonProductCount !== 0 && <div className={styles.reddotnonproduct}>{nonProductCount}</div>}
                  </div>

                  <div
                    onClick={() => {
                      productIds.length > 0 && setshowUpdateProduct(true);
                    }}
                    className={`${styles.menubtn} ${isShaking ? styles.shake : ""}`}
                    style={{
                      opacity: productIds.length < 1 ? 0.4 : 1,
                      pointerEvents: productIds.length < 1 ? "none" : "auto",
                    }}
                    title="ℹ️ Edit Products">
                    <img width="26px" title="ℹ️ Edit products" alt="Edit products" src="/product_edit.svg" />
                    {productIds.length > 0 && <div className={styles.reddot}>{productIds.length}</div>}
                  </div>
                </div>
              </div>
              <>
                <div className={styles.tableheaderparent}>
                  <div className={styles.productbody}>
                    <div style={{ width: "101px" }} onClick={(e) => e.stopPropagation()}>
                      <CheckBoxButton
                        handleToggle={handleSelectAllProduct}
                        value={selectAllProduct}
                        title={"Select all product"}
                        textlabel={productIds.length > 0 ? productIds.length.toString() : ""}
                      />
                    </div>
                    <div className={styles.headername} onClick={() => handleSort("name")}>
                      {t(LanguageKey.Storeproduct_name)}
                      {sortField === "name" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                    </div>
                  </div>
                  <div className={styles.headerproductid} onClick={() => handleSort("pid")}>
                    PID
                    {sortField === "pid" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                  <div className={styles.headerstock} onClick={() => handleSort("stock")}>
                    {t(LanguageKey.Storeproduct_stock)}
                    {sortField === "stock" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                  <div className={styles.headerprice} onClick={() => handleSort("price")}>
                    {t(LanguageKey.Storeproduct_price)}
                    {sortField === "price" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                  <div className={styles.headerlastmodified} onClick={() => handleSort("lastModified")}>
                    {t(LanguageKey.advertiseProperties_lastModified)}
                    {sortField === "lastModified" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                  <div className={styles.headeractive} onClick={() => handleSort("status")}>
                    {t(LanguageKey.Storeorder_STATUS)}
                    {sortField === "status" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </div>
                {/* Desktop View - Only render when width >= 600px */}
                {resize >= 600 && (
                  <div className={styles.productlist} ref={infiniteScrollRef}>
                    {isProductListLoading && (
                      <div className={styles.searchnotfound}>
                        <RingLoader />
                      </div>
                    )}
                    {!isProductListLoading && searchQuery.length === 0 && sortedProducts && (
                      <ProductListDesktop
                        products={sortedProducts}
                        productIds={productIds}
                        basePictureUrl={basePictureUrl}
                        availableStatus={availableStatus}
                        handleSelectProduct={handleSelectProduct}
                        handleChangeActiveProduct={handleChangeActiveProduct}
                        getStockClass={getStockClass}
                      />
                    )}
                    {!isProductListLoading && searchQuery.length > 0 && (
                      <>
                        {showSearch.loading && (
                          <div className={styles.searchnotfound}>
                            <RingLoader />
                          </div>
                        )}
                        {showSearch.noResult && (
                          <div className={styles.searchnotfound}>
                            <img
                              style={{
                                width: "200px",
                                height: "200px",
                                padding: "var(--padding-5)",
                              }}
                              title="ℹ️ product not found"
                              src="/noresult.svg"
                            />
                            {t(LanguageKey.noresult)}
                          </div>
                        )}
                        {sortedSearchProducts && (
                          <ProductListDesktop
                            products={sortedSearchProducts}
                            productIds={productIds}
                            basePictureUrl={basePictureUrl}
                            availableStatus={availableStatus}
                            handleSelectProduct={handleSelectProduct}
                            handleChangeActiveProduct={handleChangeActiveProduct}
                            getStockClass={getStockClass}
                          />
                        )}
                      </>
                    )}
                    {isLoadingMore && (
                      <div className={styles.loader}>
                        <DotLoaders />
                      </div>
                    )}
                  </div>
                )}
                {/* Mobile View - Only render when width < 600px */}
                {resize < 600 && (
                  <div className={styles.productlistmobile} ref={infiniteScrollRef}>
                    {isProductListLoading && (
                      <div className={styles.searchnotfound}>
                        <RingLoader />
                      </div>
                    )}
                    {!isProductListLoading && searchQuery.length === 0 && sortedProducts && (
                      <ProductListMobile
                        products={sortedProducts}
                        productIds={productIds}
                        basePictureUrl={basePictureUrl}
                        availableStatus={availableStatus}
                        handleSelectProduct={handleSelectProduct}
                        handleChangeActiveProduct={handleChangeActiveProduct}
                        getStockClass={getStockClass}
                      />
                    )}
                    {!isProductListLoading && searchQuery.length > 0 && (
                      <>
                        {showSearch.loading && (
                          <div className={styles.searchnotfound}>
                            <RingLoader />
                          </div>
                        )}
                        {showSearch.noResult && (
                          <div className={styles.searchnotfound}>
                            <img
                              style={{
                                width: "200px",
                                height: "200px",
                                padding: "var(--padding-5)",
                              }}
                              title="ℹ️ product not found"
                              src="/noresult.svg"
                            />
                            {t(LanguageKey.noresult)}
                          </div>
                        )}
                        {sortedSearchProducts && (
                          <ProductListMobile
                            products={sortedSearchProducts}
                            productIds={productIds}
                            basePictureUrl={basePictureUrl}
                            availableStatus={availableStatus}
                            handleSelectProduct={handleSelectProduct}
                            handleChangeActiveProduct={handleChangeActiveProduct}
                            getStockClass={getStockClass}
                          />
                        )}
                      </>
                    )}
                    {isLoadingMore && (
                      <div className={styles.loader}>
                        <DotLoaders />
                      </div>
                    )}
                  </div>
                )}
              </>
            </div>
          )}
          {!loadingStatus && products && products.length === 0 && session.user.isShopper && (
            <>
              <div className={styles.noproductcontainer}>
                <main className={styles.noproduct}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.noproducticon}
                    alt="add new product"
                    src="/addnewproduct.png"
                  />
                  <div className={styles.noproducttextdiscription}>{t(LanguageKey.Storeproduct_notyet)}</div>
                  <Link href="/store/products/selectproduct" className="saveButton" style={{ textDecoration: "none" }}>
                    {t(LanguageKey.Storeproduct_addnow)}
                  </Link>
                </main>
              </div>
            </>
          )}
        </>
      )}
      <Modal
        closePopup={() => {
          setshowUpdateProduct(false);
        }}
        classNamePopup={"popupSendFile"}
        showContent={showUpdateProduct}>
        <UpdateProduct
          data={productIds}
          removeMask={() => {
            setshowUpdateProduct(false);
          }}
        />
      </Modal>
    </>
  );
};

export default ProductList;
