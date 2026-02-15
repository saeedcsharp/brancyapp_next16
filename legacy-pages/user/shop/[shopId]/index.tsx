import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import RingLoader from "saeed/components/design/loader/ringLoder";
import PriceSlider from "saeed/components/design/sliders/priceSlider";
import Loading from "saeed/components/notOk/loading";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import SignIn, { RedirectType, SignInType } from "saeed/components/signIn/signIn";
import SignInPage1 from "saeed/components/signIn/signInPage1";
import findSystemLanguage from "saeed/helper/findSystemLanguage";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { AvailabilityStatus } from "saeed/models/store/enum";
import {
  IFilter,
  IFilterInfo,
  IFullShop,
  IProduct,
  IProductCard,
  ITopHashtags,
  ProductSortType,
} from "saeed/models/userPanel/shop";
import styles from "./products.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const ProductsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  //   {
  //   required: true,
  //   onUnauthenticated() {
  //     router.push("/");
  //   },
  // }
  const { shopId } = router.query;
  const { t } = useTranslation();
  const [products, setProducts] = useState<IProduct>({
    products: [],
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [category, setCategory] = useState<number | null>(null);
  const [fullShop, setFullShop] = useState<IFullShop | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<number[] | null>(null);
  const [maxPriceRange, setMaxPriceRange] = useState(0);
  const [minPriceRange, setMinPriceRange] = useState(0);
  const [filter, setFilter] = useState<IFilterInfo>({
    priceRange: null,
    topHashtags: [],
  });
  const [rating, setRating] = useState(0);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [nextMaxId, setNextMaxId] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortProduct, setSortProduct] = useState<ProductSortType>(ProductSortType.LastProduct);
  const [includeUnavailable, setIncludeUnavailable] = useState(true);
  const [showSortProduct, setShowSortProduct] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState<number | null>(null);
  const [isHashtagsExpanded, setIsHashtagsExpanded] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isFiltersActive, setIsFiltersActive] = useState(false);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchBarClosing, setIsSearchBarClosing] = useState(false);
  const searchBarRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<IProductCard[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isBannerAutoplay, setIsBannerAutoplay] = useState(true);
  const [selectedSortOption, setSelectedSortOption] = useState(0);
  const [selectedPriceSortOption, setSelectedPriceSortOption] = useState(0);
  const [selectedAvailabilityOption, setSelectedAvailabilityOption] = useState(0);
  const [availableRefresh, setAvailableRefresh] = useState(false);
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const featuresContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Touch/swipe support for mobile banner
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [showSearch, setShowSearch] = useState({
    searchMode: false,
    loading: false,
    noResult: false,
  });
  const removeMask = useCallback(() => {
    setShowSignIn(false);
  }, []);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - (featuresContainerRef.current?.offsetLeft || 0));
    setScrollLeft(featuresContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (featuresContainerRef.current?.offsetLeft || 0);
    const walk = x - startX;
    if (featuresContainerRef.current) {
      featuresContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const handleShowVerification = useCallback((preUserToken: string) => {
    setPreUserToken(preUserToken);
    setSignInType(SignInType.VerificaionCode);
    setShowSignIn(true);
  }, []);
  useEffect(() => {
    if (!shopId || !session) return;
    setLoading(true);
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [res, res2, res3] = await Promise.all([
          clientFetchApi<boolean, IProduct>("/api/shop/getshopproducts", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "instagramerId", value: shopId.toString() },
            { key: "nextMaxId", value: undefined },
            { key: "includeUnavailable", value: "true" },
            { key: "categoryId", value: undefined },
            { key: "maxPrice", value: undefined },
            { key: "minPrice", value: undefined },
            { key: "hashtagId", value: undefined },
          ], onUploadProgress: undefined }),
          clientFetchApi<boolean, IFullShop>("/api/shop/getfullshop", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "instagramerId", value: shopId.toString() },
            { key: "language", value: findSystemLanguage().toString() },
          ], onUploadProgress: undefined }),
          clientFetchApi<boolean, IFilterInfo>("/api/shop/getfilters", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "instagramerId", value: shopId.toString() },
            { key: "categoryId", value: undefined },
          ], onUploadProgress: undefined }),
        ]);
        if (res3.succeeded && res3.value.priceRange) {
          setPriceRange([Math.ceil(res3.value.priceRange.minPrice), Math.ceil(res3.value.priceRange.maxPrice)]);
          setMaxPriceRange(res3.value.priceRange.maxPrice);
          setMinPriceRange(res3.value.priceRange.minPrice);
          setFilter(res3.value);
        }
        if (res2.succeeded) {
          setFullShop(res2.value);
        }
        if (res.succeeded) {
          setProducts(res.value);
          if (res.value.products.length > 0) {
            const lastProduct = res.value.products[res.value.products.length - 1];
            setNextMaxId(lastProduct.shortProduct.productId.toString());
            setHasMoreProducts(true);
          } else {
            setHasMoreProducts(false);
          }
          setCategory(-1);
          setLoading(false);
        } else {
          notify(res.info.responseType, NotifType.Warning);
          setHasMoreProducts(false);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
        setHasMoreProducts(false);
      }
    };

    fetchProducts();
  }, [shopId, session]);
  useEffect(() => {
    if (isBannerAutoplay && fullShop?.banners && fullShop.banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBannerIndex((prevIndex) => (prevIndex + 1) % fullShop.banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isBannerAutoplay, fullShop?.banners]);
  const prevBanner = useCallback(() => {
    if (!fullShop?.banners || fullShop.banners.length <= 1) return;
    setActiveBannerIndex((prevIndex) => (prevIndex - 1 + fullShop.banners.length) % fullShop.banners.length);
  }, [fullShop?.banners]);

  const nextBanner = useCallback(() => {
    if (!fullShop?.banners || fullShop.banners.length <= 1) return;
    setActiveBannerIndex((prevIndex) => (prevIndex + 1) % fullShop.banners.length);
  }, [fullShop?.banners]);

  const toggleBannerAutoplay = useCallback(() => {
    setIsBannerAutoplay((prev) => !prev);
  }, []);

  const handleBannerClick = useCallback((index: number) => {
    setActiveBannerIndex(index);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && fullShop?.banners) {
      // Swipe left - next banner
      nextBanner();
    }
    if (isRightSwipe && fullShop?.banners) {
      // Swipe right - previous banner
      prevBanner();
    }
  }, [touchStartX, touchEndX, fullShop?.banners, nextBanner, prevBanner]);
  // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   console.log("Scroll event triggered");
  //   const target = e.target as HTMLDivElement;
  //   const isNearBottom =
  //     target.scrollHeight - target.scrollTop - target.clientHeight < 200;
  //   if (isNearBottom && !loadingMore && hasMoreProducts) {
  //     console.log("Near bottom of scroll, loading more products...");
  //     loadMoreProducts();
  //   }
  // };
  async function getAllProducts() {
    setProductsLoading(true);
    try {
      const res = await clientFetchApi<boolean, IProduct>("/api/shop/getshopproducts", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "instagramerId", value: shopId!.toString() },
        { key: "nextMaxId", value: undefined },
        { key: "includeUnavailable", value: "true" },
        { key: "categoryId", value: undefined },
        { key: "maxPrice", value: undefined },
        { key: "minPrice", value: undefined },
        { key: "hashtagId", value: undefined },
      ], onUploadProgress: undefined });
      if (res.succeeded) {
        setIsFiltersActive(false);
        setProducts(res.value);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setProductsLoading(false);
    }
  }
  const handleCategoryClick = async (categoryId: number) => {
    setProductsLoading(true);
    setHasMoreProducts(true);
    setSortProduct(ProductSortType.LastProduct);
    if (categoryId !== undefined) setCategory(categoryId);
    try {
      const [res, res2] = await Promise.all([
        clientFetchApi<boolean, IProduct>("/api/shop/getshopproducts", { methodType: MethodType.get, session: session, data: null, queries: [
          {
            key: "instagramerId",
            value: fullShop?.shortShop.instagramerId.toString(),
          },
          { key: "nextMaxId", value: undefined },
          { key: "includeUnavailable", value: "true" },
          {
            key: "categoryId",
            value: categoryId === -1 ? undefined : categoryId.toString(),
          },
          { key: "maxPrice", value: undefined },
          { key: "minPrice", value: undefined },
          { key: "hashtagId", value: undefined },
        ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IFilterInfo>("/api/shop/getfilters", { methodType: MethodType.get, session: session, data: null, queries: [
          {
            key: "instagramerId",
            value: fullShop?.shortShop.instagramerId.toString(),
          },
          {
            key: "categoryId",
            value: categoryId === -1 ? undefined : categoryId.toString(),
          },
        ], onUploadProgress: undefined }),
      ]);
      console.log("res2.value.priceRange", res2.value.priceRange);
      if (res.succeeded) {
        setFilter(res2.value);
        setSelectedPriceSortOption(0);
        setSelectedAvailabilityOption(0);
        setIncludeUnavailable(true);
        setFiltersResetKey((prev) => prev + 1);
        setProducts(res.value);
        if (res2.value.priceRange) {
          setPriceRange([res2.value.priceRange.minPrice, res2.value.priceRange.maxPrice]);
        }
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setProductsLoading(false);
    }
  };
  const loadMoreProducts = React.useCallback(async () => {
    console.log("Attempting to load more products...", {
      loadingMore,
      hasMoreProducts,
      nextMaxId,
    });
    if (loadingMore || !hasMoreProducts || !shopId || !nextMaxId) {
      console.log("Conditions not met for loading more products.");
      return;
    }

    setLoadingMore(true);
    console.log("Fetching more products with nextMaxId:", products.products.length);

    try {
      const params = [
        { key: "instagramerId", value: shopId.toString() },
        { key: "nextMaxId", value: products.products.length.toString() },
        {
          key: "includeUnavailable",
          value: includeUnavailable ? "true" : "false",
        },
        {
          key: "categoryId",
          value: category !== -1 ? category?.toString() : undefined,
        },
        {
          key: "maxPrice",
          value: includeUnavailable ? undefined : priceRange?.[1]?.toString(),
        },
        {
          key: "minPrice",
          value: includeUnavailable ? undefined : priceRange?.[0]?.toString(),
        },
        {
          key: "hashtagId",
          value: includeUnavailable ? undefined : selectedHashtag?.toString(),
        },
        {
          key: "productSortBy",
          value: includeUnavailable ? undefined : sortProduct.toString(),
        },
      ];
      const validParams = params.filter((p) => p.value !== undefined);
      console.log("API Params for loading more:", validParams);

      const res = await clientFetchApi<boolean, IProduct>("/api/shop/getshopproducts", { methodType: MethodType.get, session: session, data: null, queries: validParams, onUploadProgress: undefined });

      if (res.succeeded) {
        console.log(`Received ${res.value.products.length} more products.`);
        if (res.value.products.length > 0) {
          setProducts((prevProducts) => {
            const newProducts = [...prevProducts.products, ...res.value.products];
            console.log("Updated products count:", newProducts.length);
            return {
              products: newProducts,
              totalCount: prevProducts.totalCount,
            };
          });
          const lastProduct = res.value.products[res.value.products.length - 1];
          const newNextMaxId = lastProduct.shortProduct.productId.toString();
          setNextMaxId(newNextMaxId);
          console.log("New nextMaxId set:", newNextMaxId);
          setHasMoreProducts(true);
        } else {
          console.log("No more products to load.");
          setHasMoreProducts(false);
        }
      } else {
        console.log("API call failed:", res.info?.responseType);
        notify(res.info.responseType, NotifType.Warning);
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      notify(ResponseType.Unexpected, NotifType.Error);
      setHasMoreProducts(false);
    } finally {
      console.log("Finished loading more products attempt.");
      setLoadingMore(false);
    }
  }, [
    shopId,
    session,
    nextMaxId,
    loadingMore,
    hasMoreProducts,
    includeUnavailable,
    category,
    priceRange,
    selectedHashtag,
    sortProduct,
  ]);
  useEffect(() => {
    console.log("Setting up Intersection Observer. Dependencies:", {
      loadingMore,
      hasMoreProducts,
    });
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log("Intersection Observer triggered. Is intersecting:", entry.isIntersecting);
        if (entry.isIntersecting && !loadingMore && hasMoreProducts) {
          console.log("Loader element is intersecting, calling loadMoreProducts...");
          loadMoreProducts();
        } else if (entry.isIntersecting) {
          console.log("Loader element is intersecting, but conditions not met:", { loadingMore, hasMoreProducts });
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    const currentRef = loaderRef.current;

    if (currentRef) {
      observer.observe(currentRef);
      console.log("Observer attached to loader element:", currentRef);
    } else {
      console.log("Loader ref is null, cannot attach observer yet.");
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
        console.log("Observer detached from:", currentRef);
      } else {
        console.log("Observer cleanup: No ref to detach from.");
      }
    };
  }, [loadingMore, hasMoreProducts, loadMoreProducts]);
  const filteredProducts = products;
  function handleSelectHashtag(h: ITopHashtags): void {
    let hashtag: string | undefined = undefined;
    if (h.hashtagId === selectedHashtag) {
      setSelectedHashtag(null);
      // doFilters(undefined, hashtag);
      resetAllFilters();
    } else {
      setSelectedHashtag(h.hashtagId);
      hashtag = h.hashtagId.toString();
      handleGetAllProductsWithHashtag(hashtag);
    }
  }
  async function handleGetAllProductsWithHashtag(hashtagId: string) {
    setSelectedPriceSortOption(0);
    setSelectedAvailabilityOption(0);
    setIncludeUnavailable(false);
    setSortProduct(ProductSortType.LastProduct);
    if (filter && filter.priceRange) {
      setPriceRange([filter.priceRange.minPrice, filter.priceRange.maxPrice]);
    }
    setFiltersResetKey((prev) => prev + 1);
    setIsFiltersActive(false);
    setProductsLoading(true);
    try {
      const res = await clientFetchApi<boolean, IProduct>("/api/shop/getshopproducts", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "instagramerId", value: shopId!.toString() },
        { key: "nextMaxId", value: undefined },
        { key: "includeUnavailable", value: "true" },
        { key: "categoryId", value: undefined },
        { key: "maxPrice", value: undefined },
        { key: "minPrice", value: undefined },
        { key: "hashtagId", value: hashtagId },
      ], onUploadProgress: undefined });
      if (res.succeeded) {
        setProducts(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setProductsLoading(false);
      // setShowSortProduct(false);
    }
  }
  const doFilters = async (filter?: IFilter, hashtagId?: string) => {
    setProductsLoading(true);
    try {
      const params = [
        {
          key: "instagramerId",
          value: fullShop?.shortShop.instagramerId.toString(),
        },
        { key: "nextMaxId", value: undefined },
        {
          key: "includeUnavailable",
          value: filter?.minPrice !== undefined ? filter.includeUnavailable.toString() : "true",
        },
        {
          key: "categoryId",
          value: category !== -1 ? category?.toString() : undefined,
        },
      ];
      if (filter?.maxPrice !== undefined) {
        params.push({ key: "maxPrice", value: filter.maxPrice.toString() });
      } else if (priceRange?.[1] !== undefined) {
        params.push({ key: "maxPrice", value: priceRange[1].toString() });
      }
      if (filter?.minPrice !== undefined) {
        params.push({ key: "minPrice", value: filter.minPrice.toString() });
      } else if (priceRange?.[0] !== undefined) {
        params.push({ key: "minPrice", value: priceRange[0].toString() });
      }
      if (hashtagId !== undefined) {
        params.push({ key: "hashtagId", value: hashtagId });
      } else if (filter !== undefined && selectedHashtag !== null) {
        params.push({ key: "hashtagId", value: selectedHashtag.toString() });
      } else params.push({ key: "hashtagId", value: undefined });
      if (filter?.sortProductBy !== undefined) {
        params.push({
          key: "productSortBy",
          value: filter.sortProductBy.toString(),
        });
      } else {
        params.push({ key: "productSortBy", value: sortProduct.toString() });
      }
      const res = await clientFetchApi<boolean, IProduct>("/api/shop/getshopproducts", { methodType: MethodType.get, session: session, data: null, queries: params, onUploadProgress: undefined });
      if (res.succeeded) {
        setProducts(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setProductsLoading(false);
      setShowSortProduct(false);
    }
  };
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await clientFetchApi<boolean, IProductCard[]>("/api/shop/searchshopproducts", { methodType: MethodType.get, session: session, data: null, queries: [
          {
            key: "instagramerId",
            value: fullShop?.shortShop.instagramerId.toString(),
          },
          { key: "query", value: query },
          { key: "languageId", value: findSystemLanguage().toString() },
        ], onUploadProgress: undefined });

      if (res.succeeded) {
        setSearchResults(res.value);
        setShowSearch({
          searchMode: true,
          loading: false,
          noResult: res.value.length === 0,
        });
        console.log("searchhhhhhhhhhhhhhhhhhhh");
      } else {
        notify(res.info.responseType, NotifType.Warning);
        setShowSearch({ searchMode: true, loading: false, noResult: false });
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
      setShowSearch({ searchMode: false, loading: false, noResult: false });
    }
  };
  const [searchLocked, setSearchLocked] = useState<boolean>(false);
  const [timoutId, setTimeoutId] = useState<any>();
  const handleSearchQuery = async (e: ChangeEvent<HTMLInputElement>) => {
    setShowSearch({ searchMode: true, loading: true, noResult: false });
    setSearchResults([]);
    const query = e.target.value;
    setSearchQuery(query);
    if (timoutId) clearTimeout(timoutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (searchLocked) return;
          console.log("searchhhchhhhhhh");
          setSearchLocked(true);
          handleSearch(query);
          setTimeout(() => {
            setSearchLocked(false);
          }, 2000);
        }
      }, 1000);
      setTimeoutId(timeOutId);
    } else {
      setShowSearch({
        searchMode: false,
        loading: false,
        noResult: false,
      });
    }
  };

  const clearSearchQuery = () => {
    setSearchQuery("");
    setShowSearch({
      searchMode: false,
      loading: false,
      noResult: false,
    });
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (searchQuery) {
  //       handleSearch(searchQuery);
  //     } else {
  //       setSearchResults([]);
  //     }
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [searchQuery]);
  const openSearch = () => {
    setIsSearchOpen(true);
    setIsSearchBarClosing(false);
    setTimeout(() => {
      if (searchBarRef.current) {
        const input = searchBarRef.current.querySelector("input");
        if (input) (input as HTMLInputElement).focus();
      }
    }, 100);
  };
  const closeSearch = () => {
    setIsSearchBarClosing(true);
    setShowSearch({ searchMode: false, loading: false, noResult: false });
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsSearchBarClosing(false);
      setSearchQuery("");
      setSearchResults([]);
    }, 300);
  };
  const shopInfo = {
    name: shopId ? `فروشگاه ${shopId}` : "فروشگاه",
    productsCount: filteredProducts.totalCount,
  };
  if (router.isFallback || !shopId) {
    return (
      <div className={styles.loadingContainer}>
        <RingLoader />
      </div>
    );
  }
  if (session && session.user.currentIndex > -1) router.push("/");
  const renderAvailabilityStatus = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.Available:
        return (
          <div className={styles.status_child}>
            <img height="22" alt={t("product_Available")} title={t("product_Available")} src="/product_Available.svg" />
            {/* <div className={styles.status_available}>{t("product_Available")}</div> */}
          </div>
        );
      case AvailabilityStatus.Restocking:
        return (
          <div className={styles.status_child}>
            <img height="22" alt={t("product_supplying")} title={t("product_supplying")} src="/product_supplying.svg" />
            {/* <div className={styles.status_restocking}>{t("product_supplying")}</div> */}
          </div>
        );
      case AvailabilityStatus.OutOfStock:
        return (
          <div className={styles.status_child}>
            <img
              height="22"
              alt={t("product_OutOfStock")}
              title={t("product_OutOfStock")}
              src="/product_OutOfStock.svg"
            />
            {/* <div className={styles.status_outofstock}>{t("product_OutOfStock")}</div> */}
          </div>
        );
      case AvailabilityStatus.Stopped:
        return (
          <div className={styles.status_child}>
            <img
              height="22"
              alt={t("product_Stoppedsale")}
              title={t("product_Stoppedsale")}
              src="/product_Stoppedsale.svg"
            />
            {/* <div className={styles.status_stopped}>{t("product_Stoppedsale")}</div> */}
          </div>
        );
      default:
        return <span>-</span>;
    }
  };
  const toggleHashtagsExpanded = () => {
    setIsHashtagsExpanded((prev) => !prev);
  };
  const toggleFiltersExpanded = () => {
    setIsFiltersExpanded((prev) => !prev);
  };
  const sortOptions = [
    <div id="0" key="0">
      {t(LanguageKey.Pleaseselect)}
    </div>,
    <div id={ProductSortType.LastProduct.toString()} key="1">
      {t(LanguageKey.filter_newest)}
    </div>,
    <div id={ProductSortType.MaxPrice.toString()} key="2">
      {t(LanguageKey.filter_most_expensive)}
    </div>,
    <div id={ProductSortType.MinPrice.toString()} key="3">
      {t(LanguageKey.filter_cheapest)}
    </div>,
    <div id={ProductSortType.MostDiscount.toString()} key="4">
      {t(LanguageKey.filter_highest_discount)}
    </div>,
  ];
  const priceSortOptions = [
    <div id="price-default" key="0">
      {t(LanguageKey.Pleaseselect)}
    </div>,
    <div id={ProductSortType.MaxPrice.toString()} key="1">
      {t(LanguageKey.filter_most_expensive)}
    </div>,
    <div id={ProductSortType.MinPrice.toString()} key="2">
      {t(LanguageKey.filter_cheapest)}
    </div>,
    <div id={ProductSortType.LastProduct.toString()} key="3">
      {t(LanguageKey.filter_newest)}
    </div>,
    <div id={ProductSortType.MostDiscount.toString()} key="4">
      {t(LanguageKey.filter_highest_discount)}
    </div>,
  ];
  // const discountSortOptions = [
  //   <div id="sort-default" key="0">
  //     مرتب‌سازی
  //   </div>,
  //   <div id={ProductSortType.LastProduct.toString()} key="1">
  //     جدیدترین
  //   </div>,
  //   <div id={ProductSortType.MostDiscount.toString()} key="2">
  //     بیشترین تخفیف
  //   </div>,
  // ];
  const availabilityOptions = [
    <div id="availability-all" key="0">
      {t(LanguageKey.filter_all_products)}
    </div>,
    <div id="availability-instock" key="1">
      {t(LanguageKey.filter_only_available)}
    </div>,
  ];
  const handleSortOptionChange = (id: string) => {
    const sortTypeId = parseInt(id);
    if (!isNaN(sortTypeId)) {
      setSortProduct(sortTypeId as ProductSortType);
      setSelectedSortOption(sortOptions.findIndex((option) => option.props.id === id));
    }
  };

  const handlePriceSortOptionChange = (id: string) => {
    if (id !== "price-default") {
      setSelectedAvailabilityOption(1);
      setAvailableRefresh((prev) => !prev);
      const sortTypeId = parseInt(id);
      if (!isNaN(sortTypeId)) {
        setSortProduct(sortTypeId as ProductSortType);
        setSelectedPriceSortOption(priceSortOptions.findIndex((option) => option.props.id === id));

        doFilters({
          includeUnavailable: includeUnavailable,
          maxPrice: priceRange?.[1] ?? 0,
          minPrice: priceRange?.[0] ?? 0,
          sortProductBy: sortTypeId,
        });
        setIsFiltersActive(true);
      }
    }
  };

  // const handleDiscountSortOptionChange = (id: string) => {
  //   if (id !== "sort-default") {
  //     const sortTypeId = parseInt(id);
  //     if (!isNaN(sortTypeId)) {
  //       setSortProduct(sortTypeId as ProductSortType);
  //       setSelectedDiscountSortOption(
  //         discountSortOptions.findIndex((option) => option.props.id === id)
  //       );
  //       setSelectedPriceSortOption(0);

  //       doFilters({
  //         includeUnavailable: includeUnavailable,
  //         maxPrice: priceRange?.[1] ?? 0,
  //         minPrice: priceRange?.[0] ?? 0,
  //         sortProductBy: sortTypeId,
  //       });
  //       setIsFiltersActive(true);
  //     }
  //   }
  // };
  const handleAvailabilityOptionChange = (id: string) => {
    setSelectedAvailabilityOption(availabilityOptions.findIndex((option) => option.props.id === id));
    console.log("Selected availability option:", id);
    const newIncludeUnavailable = id === "availability-all";
    setIncludeUnavailable(newIncludeUnavailable);
    if (newIncludeUnavailable) {
      resetAllFilters();
    } else
      doFilters({
        includeUnavailable: newIncludeUnavailable,
        maxPrice: priceRange?.[1] ?? 0,
        minPrice: priceRange?.[0] ?? 0,
        sortProductBy: sortProduct,
      });
    setIsFiltersActive(true);
  };
  const resetAllFilters = () => {
    setSelectedPriceSortOption(0);
    setSelectedAvailabilityOption(0);
    setIncludeUnavailable(false);
    setSortProduct(ProductSortType.LastProduct);

    if (filter && filter.priceRange) {
      setPriceRange([filter.priceRange.minPrice, filter.priceRange.maxPrice]);
    }
    getAllProducts();
    setFiltersResetKey((prev) => prev + 1);
  };

  const resetHashtagSelection = () => {
    setSelectedHashtag(null);
    resetAllFilters();
  };

  const handleChangePrice = (minValue: number, maxValue: number) => {
    console.log("minPriceRange", minPriceRange);
    console.log("maxPriceRange", maxPriceRange);
    if (minValue === Math.ceil(minPriceRange) && maxValue === Math.ceil(maxPriceRange)) return;
    setIsFiltersActive(true);
    var newSideBarInfo = priceRange;
    if (!newSideBarInfo) return;
    newSideBarInfo[1] = maxValue;
    newSideBarInfo[0] = minValue;
    setPriceRange(newSideBarInfo);
    setSelectedAvailabilityOption(1);
    setAvailableRefresh((prev) => !prev);
    doFilters({
      includeUnavailable: includeUnavailable,
      maxPrice: maxValue,
      minPrice: minValue,
      sortProductBy: sortProduct,
    });
  };
  // const isInitialPriceRangeMount = React.useRef(true);

  // useEffect(() => {
  //   if (loading || !priceRange || !filter?.priceRange) return;
  //   if (isInitialPriceRangeMount.current) {
  //     isInitialPriceRangeMount.current = false;
  //     return;
  //   }
  //   const isDefault = priceRange[0] === filter.priceRange.minPrice && priceRange[1] === filter.priceRange.maxPrice;
  //   if (!isDefault) {
  //     const timer = setTimeout(() => {
  //       doFilters({
  //         includeUnavailable: includeUnavailable,
  //         maxPrice: priceRange[1],
  //         minPrice: priceRange[0],
  //         sortProductBy: sortProduct,
  //       });
  //       setIsFiltersActive(true);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [priceRange, filter?.priceRange, loading, includeUnavailable, sortProduct]);

  if (!session)
    return (
      <>
        <SignInPage1 handleShowVerification={handleShowVerification} />
        {showSignIn && (
          <SignIn
            preUserToken={preUserToken}
            redirectType={RedirectType.Instagramer}
            signInType={signInType}
            removeMask={removeMask}
            removeMaskWithNotif={() => {}}
          />
        )}
      </>
    );
  else
    return (
      session?.user.currentIndex === -1 && (
        <>
          <Head>
            <title>{`${shopInfo.name} | ${t(LanguageKey.filter_all_products)}`}</title>
            <meta name="description" content={`مشاهده و خرید محصولات ${shopInfo.name}`} />
          </Head>

          <>
            {loading && <Loading />}
            {!loading && (
              <>
                <div className={styles.stickyNavigation}>
                  <Link href="/user/shop">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 36 36"
                      width="32"
                      height="32"
                      style={{ cursor: "pointer" }}>
                      <path
                        stroke="#06F"
                        strokeWidth="3"
                        d="m32 12.6-9.8-9A6 6 0 0 0 18 2a6 6 0 0 0-4.2 1.6l-9.7 9Q2 14.6 2 17.3V29q0 2 1.6 3.5Q5 34 7.3 34h3.2q.8 0 1.4-.5t.6-1.4V25a4 4 0 0 1 1.3-3q1.4-1 3.2-1.1h2q1.8 0 3.2 1.2a4 4 0 0 1 1.3 2.9v7a2 2 0 0 0 .6 1.4 2 2 0 0 0 1.4.5h3.2q2.1 0 3.7-1.5Q34 31.1 34 29V17.3a6 6 0 0 0-2-4.7Z"
                      />
                    </svg>
                  </Link>
                  /
                  <div className="instagramprofile" style={{ height: "32px" }}>
                    <img
                      loading="lazy"
                      decoding="async"
                      className="instagramimage"
                      alt="instagram profile picture"
                      src={baseMediaUrl + fullShop!.shortShop.profileUrl}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/no-profile.svg";
                      }}
                    />
                    <div className="instagramprofiledetail" style={{ gap: "0px" }}>
                      <span className="instagramusername translate">@{fullShop?.shortShop.username}</span>
                      <span className="instagramname">{fullShop?.shortShop.fullName}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.container}>
                  <div className={styles.PageHeader}>
                    <div className={styles.bannerSlider}>
                      {fullShop?.banners && fullShop.banners.length > 0 && (
                        <div className={styles.bannerContainer}>
                          {/* Desktop/Tablet Advanced Carousel (>720px) */}
                          <div className={styles.bannerAdvancedCarousel}>
                            <ul className={styles.bannerCarouselList} data-count={fullShop.banners.length}>
                              {fullShop.banners.map((banner, index) => (
                                <li
                                  key={banner.orderId}
                                  className={styles.bannerCarouselItem}
                                  data-active={index === activeBannerIndex}
                                  onClick={() => handleBannerClick(index)}>
                                  <img
                                    className={styles.bannerImage}
                                    src={baseMediaUrl + banner.url}
                                    alt={`Banner ${banner.orderId}`}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    sizes="(max-width: 720px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                  />
                                </li>
                              ))}
                            </ul>

                            {fullShop.banners.length > 1 && (
                              <div className={styles.bannerCarouselNav}>
                                <button className={styles.bannerPrev} onClick={prevBanner} aria-label="Previous Banner">
                                  <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                  </svg>
                                </button>

                                <button
                                  className={styles.bannerPlayPause}
                                  onClick={toggleBannerAutoplay}
                                  aria-label={isBannerAutoplay ? "Pause Autoplay" : "Play Autoplay"}>
                                  {isBannerAutoplay ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                  ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  )}
                                </button>
                                <button className={styles.bannerNext} onClick={nextBanner} aria-label="Next Banner">
                                  <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Mobile Simple Carousel (≤720px) */}
                          <div className={styles.bannerSimpleCarousel}>
                            <div
                              className={styles.bannerTrack}
                              onTouchStart={handleTouchStart}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}>
                              <div
                                className={styles.bannerSlides}
                                style={{
                                  transform: `translateX(-${activeBannerIndex * 100}%)`,
                                  transition: "transform 0.3s ease-in-out",
                                }}>
                                {fullShop.banners.map((banner, index) => (
                                  <div key={banner.orderId} className={styles.bannerSlide}>
                                    <img
                                      className={styles.bannerImageSimple}
                                      src={baseMediaUrl + banner.url}
                                      alt={`Banner ${banner.orderId}`}
                                      loading={index === 0 ? "eager" : "lazy"}
                                      draggable={false}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {fullShop.banners.length > 1 && (
                              <>
                                <button
                                  className={styles.bannerSimplePrev}
                                  onClick={prevBanner}
                                  aria-label="Previous Banner">
                                  <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                  </svg>
                                </button>
                                <button
                                  className={styles.bannerSimpleNext}
                                  onClick={nextBanner}
                                  aria-label="Next Banner">
                                  <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                                  </svg>
                                </button>

                                {/* Dots indicator for mobile */}
                                <div className={styles.bannerDots}>
                                  {fullShop.banners.map((_, index) => (
                                    <button
                                      key={index}
                                      className={`${styles.bannerDot} ${
                                        index === activeBannerIndex ? styles.bannerDotActive : ""
                                      }`}
                                      onClick={() => handleBannerClick(index)}
                                      aria-label={`Go to banner ${index + 1}`}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={styles.featuresContainer}
                      ref={featuresContainerRef}
                      style={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        whiteSpace: "nowrap",
                        cursor: isDragging ? "grabbing" : "grab",
                        userSelect: "none",
                        WebkitOverflowScrolling: "touch",
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseLeave={handleMouseLeave}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}>
                      {/* مخفی کردن اسکرول‌بار با CSS */}
                      <style jsx>{`
                        .${styles.featuresContainer}::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      <div
                        className={category === -1 ? styles.activeFeature : styles.featureCard}
                        onClick={() => handleCategoryClick(-1)}>
                        {t(LanguageKey.AllProducts)}
                        <div className={styles.featurecount}>
                          {fullShop?.categories.reduce((sum, category) => sum + category.count, 0) || 0}
                        </div>
                      </div>
                      {fullShop?.categories.map((feature) => (
                        <div
                          key={feature.categoryId}
                          className={category === feature.categoryId ? styles.activeFeature : styles.featureCard}
                          onClick={() => handleCategoryClick(feature.categoryId)}>
                          {feature.langValue}
                          <div className={styles.featurecount}>{feature.count}</div>
                        </div>
                      ))}
                    </div>
                    {/* {!showSearch.searchMode && (
                      <div
                        className={styles.featuresContainer}
                        ref={featuresContainerRef}
                        style={{
                          overflowX: "auto",
                          overflowY: "hidden",
                          whiteSpace: "nowrap",
                          cursor: isDragging ? "grabbing" : "grab",
                          userSelect: "none",
                          WebkitOverflowScrolling: "touch",
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}>

                        <style jsx>{`
                          .${styles.featuresContainer}::-webkit-scrollbar {
                            display: none;
                          }
                        `}</style>
                        <div
                          className={category === -1 ? styles.activeFeature : styles.featureCard}
                          onClick={() => handleCategoryClick(-1)}>
                          {t(LanguageKey.AllProducts)}
                          <div className={styles.featurecount}>
                            {fullShop?.categories.reduce((sum, category) => sum + category.count, 0) || 0}
                          </div>
                        </div>
                        {fullShop?.categories.map((feature) => (
                          <div
                            key={feature.categoryId}
                            className={category === feature.categoryId ? styles.activeFeature : styles.featureCard}
                            onClick={() => handleCategoryClick(feature.categoryId)}>
                            {feature.langValue}
                            <div className={styles.featurecount}>{feature.count}</div>
                          </div>
                        ))}
                      </div>
                    )} */}
                    <div className="headerandinput">
                      <div className={styles.serachparent}>
                        <div className={`${styles.serachchild} ${isSearchFocused ? styles.focused : ""}`}>
                          <svg
                            width="40"
                            stroke="var(--text-h1)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 42 42">
                            <path
                              opacity=".4"
                              d="M14.5 5.3h14.8c5.1 0 8.3 3.6 8.3 8.7v14c0 5.1-3.2 8.8-8.3 8.8H14.5C9.3 36.8 6 33 6 28V14c0-5.1 3.2-8.7 8.4-8.7"
                            />
                            <path d="M21.1 27.3a7.1 7.1 0 1 0 0-14.3 7.1 7.1 0 0 0 0 14.3m7.9.7-1.5-1.5" />
                          </svg>
                          <input
                            ref={searchInputRef}
                            title="ℹ️ search product"
                            id="shop-search-input"
                            name="searchQuery"
                            type="text"
                            className={styles.serachMenuorigin}
                            placeholder={t(LanguageKey.search)}
                            onChange={handleSearchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            value={searchQuery}
                          />
                          {searchQuery && (
                            <>
                              <img
                                role="button"
                                title={t(LanguageKey.filter_reset)}
                                onClick={clearSearchQuery}
                                style={{
                                  cursor: "pointer",
                                  width: "30px",
                                  height: "30px",
                                }}
                                src="/close-box.svg"
                              />
                            </>
                          )}
                        </div>
                      </div>
                      {!showSearch.searchMode && filter!.topHashtags.length > 0 && (
                        <div className={styles.hashtagListContainer}>
                          <div
                            className={`${styles.hashtagList} ${isHashtagsExpanded ? styles.expanded : ""}`}
                            onClick={toggleHashtagsExpanded}>
                            <div className="headerparent">
                              <svg
                                width="40"
                                stroke="var(--text-h1)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 42 42">
                                <path
                                  opacity=".4"
                                  d="M14.5 5.3h14.8c5.1 0 8.3 3.6 8.3 8.7v14c0 5.1-3.2 8.8-8.3 8.8H14.5C9.3 36.8 6 33 6 28V14c0-5.1 3.2-8.7 8.4-8.7"
                                />
                                <path d="m17.7 27.7 1.7-13.4m5 13.4 1.7-13.4m3 3.4H15.2m13.1 6.6H14.7" />
                              </svg>
                              <span className="title">{t(LanguageKey.pageToolspopup_hashtags)}</span>
                              <div className={styles.expandIndicator}></div>
                              {selectedHashtag !== null && (
                                <div
                                  className={styles.resetFilterButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetHashtagSelection();
                                  }}
                                  title="Reset hashtag selection">
                                  {t(LanguageKey.filter_reset)}

                                  {/* <img
                                  style={{
                                    cursor: "pointer",
                                    width: "20px",
                                    height: "20px",
                                    alignSelf: "end",
                                  }}
                                  title="ℹ️ close"
                                  src="/iconbox-close.svg"
                                /> */}
                                </div>
                              )}
                              <svg
                                width="30"
                                height="30"
                                viewBox="0 0 22 22"
                                fill="none"
                                style={{
                                  transform: isHashtagsExpanded ? "rotate(-90deg)" : "rotate(90deg)",
                                  transition: "transform 0.3s ease",
                                }}>
                                <path
                                  stroke="var(--text-h2)"
                                  d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                                  opacity=".5"
                                />
                                <path
                                  fill="var(--text-h1)"
                                  d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"
                                />
                              </svg>
                            </div>
                          </div>

                          <div className={`${styles.hashtagListExpanded} ${isHashtagsExpanded ? styles.show : ""}`}>
                            <div className={styles.hashtagListItem}>
                              {filter?.topHashtags.map((h) => (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectHashtag(h);
                                  }}
                                  key={h.hashtagId}
                                  className={`${styles.tagHashtag} ${
                                    /[\u0600-\u06FF]/.test(h.hashtag) ? styles.rtlTag : ""
                                  }`}>
                                  <img
                                    className={styles.hashtagicon}
                                    title="ℹ️ hashtag"
                                    alt="#"
                                    src={selectedHashtag === h.hashtagId ? "/deleteHashtag.svg" : "/icon-hashtag.svg"}
                                  />
                                  <span>{h.hashtag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {!showSearch.searchMode && (
                        <div className={styles.filterListContainer}>
                          {!showSearch.searchMode && (
                            <div
                              className={`${styles.filterList} ${isFiltersExpanded ? styles.expanded : ""}`}
                              onClick={toggleFiltersExpanded}>
                              <div className="headerparent">
                                <svg
                                  width="40"
                                  stroke="var(--text-h1)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 42 42">
                                  <path
                                    opacity=".4"
                                    d="M13.6 5.3h14.8c5.1 0 8.4 3.6 8.4 8.7v14c0 5.1-3.3 8.8-8.4 8.8H13.6c-5.1 0-8.3-3.7-8.3-8.8V14c0-5.1 3.2-8.7 8.3-8.7"
                                  />
                                  <path
                                    clipRule="evenodd"
                                    d="M21 16a2.5 2.5 0 1 0-2.5 2.4h0q2.3-.1 2.5-2.4m0 10a2.5 2.5 0 1 0 2.5-2.4h0c-1.4 0-2.5 1-2.5 2.4"
                                  />
                                  <path d="M13.7 26H21m5 0h2.3m0-10H21m-5 0h-2.3" />
                                </svg>
                                <span className="title">{t(LanguageKey.filter_sortby)}</span>
                                <div className={styles.expandIndicator}></div>
                                {isFiltersActive && (
                                  <div
                                    className={styles.resetFilterButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      resetAllFilters();
                                    }}
                                    title="Reset all filters">
                                    {t(LanguageKey.filter_reset)}

                                    {/* <img
                                    style={{
                                      cursor: "pointer",
                                      width: "20px",
                                      height: "20px",
                                      alignSelf: "end",
                                    }}
                                    title="ℹ️ close"
                                    src="/iconbox-close.svg"
                                  /> */}
                                  </div>
                                )}
                                <svg
                                  width="30"
                                  height="30"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  style={{
                                    transform: isFiltersExpanded ? "rotate(-90deg)" : "rotate(90deg)",
                                    transition: "transform 0.3s ease",
                                  }}>
                                  <path
                                    stroke="var(--text-h2)"
                                    d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                                    opacity=".5"
                                  />
                                  <path
                                    fill="var(--text-h1)"
                                    d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}

                          {!showSearch.searchMode && (
                            <div className={`${styles.filterListExpanded} ${isFiltersExpanded ? styles.show : ""}`}>
                              <div className={styles.sortby}>
                                <div className="headerandinput">
                                  <div className="headertext"> {t(LanguageKey.filter_price)}</div>
                                  <DragDrop
                                    key={`price-${filtersResetKey}`}
                                    data={priceSortOptions}
                                    handleOptionSelect={handlePriceSortOptionChange}
                                    item={selectedPriceSortOption}
                                    isRefresh={false}
                                  />
                                </div>
                                {/* <div className={`${styles.sortby} headerandinput`}>
                            <div className="headertext">product sort</div>
                            <DragDrop
                              key={`discount-${filtersResetKey}`}
                              data={discountSortOptions}
                              handleOptionSelect={
                                handleDiscountSortOptionChange
                              }
                              item={selectedDiscountSortOption}
                              isRefresh={false}
                            />
                          </div> */}
                                <div className="headerandinput">
                                  <div className="headertext"> {t(LanguageKey.Storeproduct_stock)} </div>
                                  <DragDrop
                                    key={`availability-${filtersResetKey}`}
                                    data={availabilityOptions}
                                    handleOptionSelect={handleAvailabilityOptionChange}
                                    item={selectedAvailabilityOption}
                                    isRefresh={availableRefresh}
                                  />
                                </div>

                                {filter && filter.priceRange !== null && priceRange && (
                                  <div className="headerandinput">
                                    <h3 className="headertext">{t(LanguageKey.Pricerange)}</h3>

                                    <PriceSlider
                                      handleChangePrice={(min, max) => {
                                        setPriceRange([min, max]);
                                        handleChangePrice(min, max);
                                      }}
                                      price={{
                                        max: priceRange[1],
                                        min: priceRange[0],
                                      }}
                                      maxPrice={maxPriceRange}
                                      minPrice={minPriceRange}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {!showSearch.searchMode && (
                    <div className={styles.scrollableProducts}>
                      {productsLoading && (
                        <div
                          style={{
                            minHeight: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          <Loading />
                        </div>
                      )}
                      {!productsLoading && (
                        <>
                          {/* <div className={styles.productsHeader}>
                        <h2 className={styles.productsTitle}>
                          {activeCategory === "All Products"
                            ? "همه محصولات"
                            : categories.find((c) => c.id === activeCategory)
                                ?.name || "محصولات"}
                        </h2>
                        <div className={styles.productsCount}>
                          {filteredProducts.products.length} محصول
                        </div>
                      </div> */}

                          {filteredProducts.products.length === 0 ? (
                            <div className={styles.noSearchResults}>
                              <svg
                                fill="none"
                                width="300"
                                strokeWidth="2.5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 250 200">
                                <path
                                  d="M63 134h91q.8 0 1.5-.2.7.2 1.5.2h52a7 7 0 1 0 0-14h-6a7 7 0 1 1 0-14h19a7 7 0 1 0 0-14h-22a7 7 0 1 0 0-14h-64a7 7 0 1 0 0-14H79a7 7 0 1 0 0 14H39a7 7 0 1 0 0 14h25a7 7 0 1 1 0 14H24a7 7 0 1 0 0 14h39a7 7 0 1 0 0 14m163 0a7 7 0 1 0 0-14 7 7 0 0 0 0 14"
                                  fill="var(--color-dark-blue30)"
                                />
                                <path
                                  d="M167 148h22.4M64 148h21.5zm-12.9 0H58zm143 0h2.9zM98 43.3l11.1 12.5m41-12.5L139 55.8zM124 39v16.8z"
                                  stroke="var(--color-dark-blue)"
                                />
                                <path
                                  d="M92.8 71h62.6l-5.6 8.4 7.5 5.6H90.9l8.4-5.6z"
                                  fill="var(--color-dark-blue10)"
                                />
                                <rect x="89" y="83" width="71" height="75" rx="2" fill="var(--color-white)" />
                                <path
                                  d="M93.6 124V89.7a2.6 2.6 0 0 1 2.6-2.6l61 64a3.4 3.4 0 0 1-3.4 3.5H97a3.4 3.4 0 0 1-3.4-3.4zm0 7.5v-3.9z"
                                  fill="var(--color-dark-blue10)"
                                />
                                <path
                                  d="M90 124.5V86.9c0-1.5 1.3-2.8 2.8-2.8h65q1.7.1 1.8 1.9v68.2a3.7 3.7 0 0 1-3.7 3.7H93.7a3.7 3.7 0 0 1-3.7-3.7v-17.8m0-3.8v-4.2M91.9 84V73c0-1 .7-1.9 1.6-1.9h62.1q1.6.1 1.7 1.9v11"
                                  stroke="var(--color-dark-blue)"
                                />
                                <path
                                  d="M139.5 103.7a15 15 0 1 1-29.9 0M93 71.9l6.5 6.5a1 1 0 0 1-.2 1.6L92 84m64.5-12-6.3 6.4a1 1 0 0 0 .3 1.6l7.5 4"
                                  stroke="var(--color-dark-blue)"
                                />
                              </svg>
                              <span className="title">محصولی با فیلتر های انتخاب شده یافت نشد</span>
                            </div>
                          ) : (
                            <>
                              <div className={styles.productsGrid}>
                                {filteredProducts.products.map((product) => (
                                  <div
                                    className={styles.productCard}
                                    key={product.shortProduct.productId}
                                    onClick={() =>
                                      router.push(
                                        `/user/shop/${product.shortProduct.instagramerId}/product/${product.shortProduct.productId}`
                                      )
                                    }>
                                    <img
                                      title={product.shortProduct.title}
                                      className={styles.productImage}
                                      loading="lazy"
                                      decoding="async"
                                      alt={product.shortProduct.title}
                                      src={baseMediaUrl + product.shortProduct.thumbnailMediaUrl}
                                    />
                                    <div className={styles.likesCounters}>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18 "
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="var(--text-h1)">
                                        <path d="M12 21.4 10.6 20C5.4 15.4 2 12.3 2 8.5 2 5.5 4.4 3 7.5 3A6 6 0 0 1 12 5a6 6 0 0 1 4.5-2c3 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.5 11.5z" />
                                      </svg>
                                      <span>{product.shortProduct.likeCount}</span>
                                    </div>

                                    <div className={styles.productDetails}>
                                      <h1 className={styles.productName} title={product.shortProduct.title}>
                                        {product.shortProduct.title}
                                      </h1>

                                      <div className={styles.productaction}>
                                        <div className={styles.productPriceparent}>
                                          {product.shortProduct.maxPrice - product.shortProduct.maxDiscountPrice !==
                                            0 && (
                                            <div className={styles.priceTop}>
                                              <div className={styles.originalPrice}>
                                                <PriceFormater
                                                  pricetype={product.shortProduct.priceType}
                                                  fee={product.shortProduct.maxPrice}
                                                  className={PriceFormaterClassName.PostPrice}
                                                />
                                              </div>
                                              <span className={styles.discountBadge}>
                                                {Math.round(
                                                  ((product.shortProduct.maxPrice -
                                                    product.shortProduct.maxDiscountPrice) /
                                                    product.shortProduct.maxPrice) *
                                                    100 *
                                                    100
                                                ) / 100}
                                                %
                                              </span>
                                            </div>
                                          )}
                                          <div className={styles.finalPrice}>
                                            {product.shortProduct.availabilityStatus ===
                                            AvailabilityStatus.Available ? (
                                              <PriceFormater
                                                pricetype={product.shortProduct.priceType}
                                                fee={
                                                  product.shortProduct.maxPrice -
                                                    product.shortProduct.maxDiscountPrice !==
                                                  0
                                                    ? product.shortProduct.maxDiscountPrice
                                                    : product.shortProduct.minDiscountPrice
                                                }
                                                className={PriceFormaterClassName.PostPrice}
                                              />
                                            ) : (
                                              <>--</>
                                            )}
                                          </div>
                                        </div>
                                        <div className={styles.productstatus}>
                                          {renderAvailabilityStatus(product.shortProduct.availabilityStatus)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div ref={loaderRef} className={styles.loadMore}>
                                {loadingMore && (
                                  <>
                                    <div className={styles.spinner} />
                                    <span>{t(LanguageKey.loadingmoreproducts)}</span>
                                  </>
                                )}
                                {!loadingMore && !hasMoreProducts && products.products.length > 0 && (
                                  <>{t(LanguageKey.noMoreProducts)}</>
                                )}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {showSearch.loading && <Loading />}
                  {showSearch.noResult && (
                    <div className={styles.noSearchResults}>
                      <svg
                        fill="none"
                        width="300"
                        strokeWidth="2.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 250 200">
                        <path
                          d="M63 134h91q.8 0 1.5-.2.7.2 1.5.2h52a7 7 0 1 0 0-14h-6a7 7 0 1 1 0-14h19a7 7 0 1 0 0-14h-22a7 7 0 1 0 0-14h-64a7 7 0 1 0 0-14H79a7 7 0 1 0 0 14H39a7 7 0 1 0 0 14h25a7 7 0 1 1 0 14H24a7 7 0 1 0 0 14h39a7 7 0 1 0 0 14m163 0a7 7 0 1 0 0-14 7 7 0 0 0 0 14"
                          fill="var(--color-dark-blue30)"
                        />
                        <path
                          d="M167 148h22.4M64 148h21.5zm-12.9 0H58zm143 0h2.9zM98 43.3l11.1 12.5m41-12.5L139 55.8zM124 39v16.8z"
                          stroke="var(--color-dark-blue)"
                        />
                        <path d="M92.8 71h62.6l-5.6 8.4 7.5 5.6H90.9l8.4-5.6z" fill="var(--color-dark-blue10)" />
                        <rect x="89" y="83" width="71" height="75" rx="2" fill="var(--color-white)" />
                        <path
                          d="M93.6 124V89.7a2.6 2.6 0 0 1 2.6-2.6l61 64a3.4 3.4 0 0 1-3.4 3.5H97a3.4 3.4 0 0 1-3.4-3.4zm0 7.5v-3.9z"
                          fill="var(--color-dark-blue10)"
                        />
                        <path
                          d="M90 124.5V86.9c0-1.5 1.3-2.8 2.8-2.8h65q1.7.1 1.8 1.9v68.2a3.7 3.7 0 0 1-3.7 3.7H93.7a3.7 3.7 0 0 1-3.7-3.7v-17.8m0-3.8v-4.2M91.9 84V73c0-1 .7-1.9 1.6-1.9h62.1q1.6.1 1.7 1.9v11"
                          stroke="var(--color-dark-blue)"
                        />
                        <path
                          d="M139.5 103.7a15 15 0 1 1-29.9 0M93 71.9l6.5 6.5a1 1 0 0 1-.2 1.6L92 84m64.5-12-6.3 6.4a1 1 0 0 0 .3 1.6l7.5 4"
                          stroke="var(--color-dark-blue)"
                        />
                      </svg>
                      <span className="title">{t(LanguageKey.Storeproduct_noitemfounded)}</span>
                    </div>
                  )}
                  {showSearch.searchMode && searchQuery && searchResults.length > 0 && (
                    <div className={styles.productsGrid}>
                      {searchResults.map((product) => (
                        <div
                          className={styles.productCard}
                          key={product.shortProduct.productId}
                          onClick={() =>
                            router.push(
                              `/user/shop/${product.shortProduct.instagramerId}/product/${product.shortProduct.productId}`
                            )
                          }>
                          <img
                            title={product.shortProduct.title}
                            className={styles.productImage}
                            loading="lazy"
                            decoding="async"
                            alt={product.shortProduct.title}
                            src={baseMediaUrl + product.shortProduct.thumbnailMediaUrl}
                          />
                          <div className={styles.likesCounters}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18 "
                              height="18"
                              viewBox="0 0 24 24"
                              fill="var(--text-h1)">
                              <path d="M12 21.4 10.6 20C5.4 15.4 2 12.3 2 8.5 2 5.5 4.4 3 7.5 3A6 6 0 0 1 12 5a6 6 0 0 1 4.5-2c3 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.5 11.5z" />
                            </svg>
                            <span>{product.shortProduct.likeCount}</span>
                          </div>

                          <div className={styles.productDetails}>
                            <h1 className={styles.productName} title={product.shortProduct.title}>
                              {product.shortProduct.title}
                            </h1>

                            <div className={styles.productaction}>
                              <div className={styles.productPriceparent}>
                                {product.shortProduct.maxPrice - product.shortProduct.maxDiscountPrice !== 0 && (
                                  <div className={styles.priceTop}>
                                    <div className={styles.originalPrice}>
                                      <PriceFormater
                                        pricetype={product.shortProduct.priceType}
                                        fee={product.shortProduct.maxPrice}
                                        className={PriceFormaterClassName.PostPrice}
                                      />
                                    </div>
                                    <span className={styles.discountBadge}>
                                      {Math.round(
                                        ((product.shortProduct.maxPrice - product.shortProduct.maxDiscountPrice) /
                                          product.shortProduct.maxPrice) *
                                          100 *
                                          100
                                      ) / 100}
                                      %
                                    </span>
                                  </div>
                                )}
                                <div className={styles.finalPrice}>
                                  {product.shortProduct.availabilityStatus === AvailabilityStatus.Available ? (
                                    <PriceFormater
                                      pricetype={product.shortProduct.priceType}
                                      fee={
                                        product.shortProduct.maxPrice - product.shortProduct.maxDiscountPrice !== 0
                                          ? product.shortProduct.maxDiscountPrice
                                          : product.shortProduct.minDiscountPrice
                                      }
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  ) : (
                                    <>--</>
                                  )}
                                </div>
                              </div>
                              <div className={styles.productstatus}>
                                {renderAvailabilityStatus(product.shortProduct.availabilityStatus)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        </>
      )
    );
};

export default ProductsPage;
