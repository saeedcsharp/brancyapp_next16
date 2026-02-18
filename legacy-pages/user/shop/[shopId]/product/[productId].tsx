// React & Next.js Core
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";

// Third-party Libraries
import { DateObject } from "react-multi-date-picker";

// Internal Components
import CountdownTimer from "saeed/components/design/counterDown/counterDownForShop";
import IncrementStepper from "saeed/components/design/incrementStepper";
import Loading from "saeed/components/notOk/loading";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import SignIn, { RedirectType, SignInType } from "saeed/components/signIn/signIn";
import SignInPage1 from "saeed/components/signIn/signInPage1";
import PriceHistory from "saeed/components/userPanel/shop/popups/priceHistory";
import ReportProduct from "saeed/components/userPanel/shop/popups/reportProduct";

// Helper Functions
import { handleCopyLink } from "saeed/helper/copyLink";
import findSystemLanguage from "saeed/helper/findSystemLanguage";
import formatTimeAgo from "saeed/helper/formatTimeAgo";
import initialzedTime from "saeed/helper/manageTimer";
import { handleDecompress } from "saeed/helper/pako";

// Internationalization
import { LanguageKey } from "saeed/i18n";

// Models & Types
import { MethodType } from "saeed/helper/api";
import { IComment } from "saeed/models/messages/IMessage";
import { AvailabilityStatus } from "saeed/models/store/enum";
import {
  ColorStr,
  IAddToCard,
  IFullProduct,
  IFullShop,
  IProduct,
  IProductCard,
  ISelectedProduct,
  IShortShop,
  ISubProduct,
  IVariationComparison,
} from "saeed/models/userPanel/shop";

// Styles
import Modal from "saeed/components/design/modal";
import styles from "./product.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

// Constants
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const baseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL;

// Types and Interfaces
interface ProductState {
  product: IFullProduct | undefined;
  media: string;
  medias: string[];
  loading: boolean;
  loadingQuery: boolean;
  selectedProduct: ISelectedProduct;
  showProduct: ISubProduct | null;
  selectedVars: IVariationComparison[];
  activeLeftTab: string;
  activeRightTab: string;
  addCard: IAddToCard[];
  comments: { comments: IComment[]; users: string[] };
  hashtags: string[];
  similarProducts: IProductCard[];
  shop: IShortShop | null;
  constantVar: IVariationComparison[];
  diffrentVar: IVariationComparison[];
  constColor: number | null;
  diffColor: number[];
  constCustom: string | null;
  diffCustom: string[];
}

interface UIState {
  isDragging: boolean;
  dragStartX: number;
  scrollLeft: number;
  shakeStepper: boolean;
  isMaxCartReached: boolean;
  showPriceHistory: boolean;
  showReportProduct: boolean;
  showSignIn: boolean;
  signInType: SignInType;
  preUserToken: string;
}

type ProductAction =
  | { type: "SET_PRODUCT"; payload: IFullProduct }
  | { type: "SET_MEDIA"; payload: string }
  | { type: "SET_MEDIAS"; payload: string[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOADING_QUERY"; payload: boolean }
  | { type: "SET_SELECTED_PRODUCT"; payload: Partial<ISelectedProduct> }
  | { type: "SET_SHOW_PRODUCT"; payload: ISubProduct | null }
  | { type: "SET_SELECTED_VARS"; payload: IVariationComparison[] }
  | { type: "SET_ACTIVE_LEFT_TAB"; payload: string }
  | { type: "SET_ACTIVE_RIGHT_TAB"; payload: string }
  | { type: "SET_ADD_CARD"; payload: IAddToCard[] }
  | { type: "SET_COMMENTS"; payload: { comments: IComment[]; users: string[] } }
  | { type: "SET_HASHTAGS"; payload: string[] }
  | { type: "SET_SIMILAR_PRODUCTS"; payload: IProductCard[] }
  | { type: "SET_SHOP"; payload: IShortShop | null }
  | { type: "SET_CONSTANT_VAR"; payload: IVariationComparison[] }
  | { type: "SET_DIFFRENT_VAR"; payload: IVariationComparison[] }
  | { type: "SET_CONST_COLOR"; payload: number | null }
  | { type: "SET_DIFF_COLOR"; payload: number[] }
  | { type: "SET_CONST_CUSTOM"; payload: string | null }
  | { type: "SET_DIFF_CUSTOM"; payload: string[] }
  | { type: "UPDATE_PRODUCT_FAVORITE"; payload: boolean }
  | {
      type: "UPDATE_ADD_CARD_ITEM";
      payload: { subProductId: number; stock: number };
    }
  | { type: "REMOVE_ADD_CARD_ITEM"; payload: number }
  | { type: "ADD_ADD_CARD_ITEM"; payload: IAddToCard }
  | { type: "CLEAR_ADD_CARD" };

type UIAction =
  | { type: "SET_DRAGGING"; payload: boolean }
  | { type: "SET_DRAG_START_X"; payload: number }
  | { type: "SET_SCROLL_LEFT"; payload: number }
  | { type: "SET_SHAKE_STEPPER"; payload: boolean }
  | { type: "SET_MAX_CART_REACHED"; payload: boolean }
  | { type: "SET_SHOW_PRICE_HISTORY"; payload: boolean }
  | { type: "SET_SHOW_REPORT_PRODUCT"; payload: boolean }
  | { type: "SET_SHOW_SIGN_IN"; payload: boolean }
  | { type: "SET_SIGN_IN_TYPE"; payload: SignInType }
  | { type: "SET_PRE_USER_TOKEN"; payload: string };

// Reducers
const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case "SET_PRODUCT":
      return { ...state, product: action.payload };
    case "SET_MEDIA":
      return { ...state, media: action.payload };
    case "SET_MEDIAS":
      return { ...state, medias: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_LOADING_QUERY":
      return { ...state, loadingQuery: action.payload };
    case "SET_SELECTED_PRODUCT":
      return {
        ...state,
        selectedProduct: { ...state.selectedProduct, ...action.payload },
      };
    case "SET_SHOW_PRODUCT":
      return { ...state, showProduct: action.payload };
    case "SET_SELECTED_VARS":
      return { ...state, selectedVars: action.payload };
    case "SET_ACTIVE_LEFT_TAB":
      return { ...state, activeLeftTab: action.payload };
    case "SET_ACTIVE_RIGHT_TAB":
      return { ...state, activeRightTab: action.payload };
    case "SET_ADD_CARD":
      return { ...state, addCard: action.payload };
    case "SET_COMMENTS":
      return { ...state, comments: action.payload };
    case "SET_HASHTAGS":
      return { ...state, hashtags: action.payload };
    case "SET_SIMILAR_PRODUCTS":
      return { ...state, similarProducts: action.payload };
    case "SET_SHOP":
      return { ...state, shop: action.payload };
    case "SET_CONSTANT_VAR":
      return { ...state, constantVar: action.payload };
    case "SET_DIFFRENT_VAR":
      return { ...state, diffrentVar: action.payload };
    case "SET_CONST_COLOR":
      return { ...state, constColor: action.payload };
    case "SET_DIFF_COLOR":
      return { ...state, diffColor: action.payload };
    case "SET_CONST_CUSTOM":
      return { ...state, constCustom: action.payload };
    case "SET_DIFF_CUSTOM":
      return { ...state, diffCustom: action.payload };
    case "UPDATE_PRODUCT_FAVORITE":
      return state.product
        ? {
            ...state,
            product: { ...state.product, isFavorite: action.payload },
          }
        : state;
    case "UPDATE_ADD_CARD_ITEM":
      return {
        ...state,
        addCard: state.addCard.map((item) =>
          item.subProductId === action.payload.subProductId ? { ...item, stock: action.payload.stock } : item,
        ),
      };
    case "REMOVE_ADD_CARD_ITEM":
      return {
        ...state,
        addCard: state.addCard.filter((item) => item.subProductId !== action.payload),
      };
    case "ADD_ADD_CARD_ITEM":
      return {
        ...state,
        addCard: [...state.addCard, action.payload],
      };
    case "CLEAR_ADD_CARD":
      return { ...state, addCard: [] };
    default:
      return state;
  }
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "SET_DRAGGING":
      return { ...state, isDragging: action.payload };
    case "SET_DRAG_START_X":
      return { ...state, dragStartX: action.payload };
    case "SET_SCROLL_LEFT":
      return { ...state, scrollLeft: action.payload };
    case "SET_SHAKE_STEPPER":
      return { ...state, shakeStepper: action.payload };
    case "SET_MAX_CART_REACHED":
      return { ...state, isMaxCartReached: action.payload };
    case "SET_SHOW_PRICE_HISTORY":
      return { ...state, showPriceHistory: action.payload };
    case "SET_SHOW_REPORT_PRODUCT":
      return { ...state, showReportProduct: action.payload };
    case "SET_SHOW_SIGN_IN":
      return { ...state, showSignIn: action.payload };
    case "SET_SIGN_IN_TYPE":
      return { ...state, signInType: action.payload };
    case "SET_PRE_USER_TOKEN":
      return { ...state, preUserToken: action.payload };
    default:
      return state;
  }
};

export default function Product() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { shopId, productId } = router.query;

  // Initialize reducers
  const [productState, productDispatch] = useReducer(productReducer, {
    product: undefined,
    media: "",
    medias: [],
    loading: true,
    loadingQuery: false,
    selectedProduct: {
      colorId: null,
      customVariation: null,
      constVariation: [] as string[],
      selectedVariation: [] as IVariationComparison[],
    },
    showProduct: null,
    selectedVars: [],
    activeLeftTab: "Description",
    activeRightTab: "Comments",
    addCard: [],
    comments: { comments: [], users: [] },
    hashtags: [],
    similarProducts: [],
    shop: null,
    constantVar: [],
    diffrentVar: [],
    constColor: null,
    diffColor: [],
    constCustom: null,
    diffCustom: [],
  });

  const [uiState, uiDispatch] = useReducer(uiReducer, {
    isDragging: false,
    dragStartX: 0,
    scrollLeft: 0,
    shakeStepper: false,
    isMaxCartReached: false,
    showPriceHistory: false,
    showReportProduct: false,
    showSignIn: false,
    signInType: SignInType.Phonenumber,
    preUserToken: "",
  });

  // Keep only essential useState for refs and complex state
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Destructure state for easier access
  const {
    product,
    media,
    medias,
    loading,
    loadingQuery,
    selectedProduct,
    showProduct,
    selectedVars,
    activeLeftTab,
    activeRightTab,
    addCard,
    comments,
    hashtags,
    similarProducts,
    shop,
    constantVar,
    diffrentVar,
    constColor,
    diffColor,
    constCustom,
    diffCustom,
  } = productState;

  const {
    isDragging,
    dragStartX,
    scrollLeft,
    shakeStepper,
    isMaxCartReached,
    showPriceHistory,
    showReportProduct,
    showSignIn,
    signInType,
    preUserToken,
  } = uiState;

  const handleShowVerification = useCallback((preUserToken: string) => {
    uiDispatch({ type: "SET_PRE_USER_TOKEN", payload: preUserToken });
    uiDispatch({
      type: "SET_SIGN_IN_TYPE",
      payload: SignInType.VerificaionCode,
    });
    uiDispatch({ type: "SET_SHOW_SIGN_IN", payload: true });
  }, []);

  const removeMask = useCallback(() => {
    uiDispatch({ type: "SET_SHOW_SIGN_IN", payload: false });
  }, []);
  // Memoized handlers for better performance
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    uiDispatch({ type: "SET_DRAGGING", payload: true });
    uiDispatch({
      type: "SET_DRAG_START_X",
      payload: e.pageX - (thumbnailContainerRef.current?.offsetLeft || 0),
    });
    uiDispatch({
      type: "SET_SCROLL_LEFT",
      payload: thumbnailContainerRef.current?.scrollLeft || 0,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !thumbnailContainerRef.current) return;
      const x = e.pageX - thumbnailContainerRef.current.offsetLeft;
      const walk = x - dragStartX;
      thumbnailContainerRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, dragStartX, scrollLeft],
  );

  const handleMouseUp = useCallback(() => {
    uiDispatch({ type: "SET_DRAGGING", payload: false });
  }, []);

  const handleImgDragStart = useCallback((e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault();
  }, []);

  //----------------------------------------------------//

  // Memoized functions for performance optimization
  const getColorIdStatus = useCallback(
    (subProducts: ISubProduct[]) => {
      if (product?.isColorVariation === false) {
        productDispatch({ type: "SET_CONST_COLOR", payload: null });
        productDispatch({ type: "SET_DIFF_COLOR", payload: [] });
        return;
      }
      const unique = Array.from(new Set(subProducts.map((p) => p.colorId)));
      if (unique.length === 1) {
        productDispatch({
          type: "SET_SELECTED_PRODUCT",
          payload: { colorId: unique[0] },
        });
        productDispatch({ type: "SET_CONST_COLOR", payload: unique[0] });
      } else {
        productDispatch({
          type: "SET_DIFF_COLOR",
          payload: unique.filter((id): id is number => id !== null),
        });
      }
    },
    [product?.isColorVariation],
  );

  const getCustomVariationStatus = useCallback(
    (subProducts: ISubProduct[]) => {
      if (product?.customVariation === null) {
        productDispatch({ type: "SET_CONST_CUSTOM", payload: null });
        productDispatch({ type: "SET_DIFF_CUSTOM", payload: [] });
        return;
      }
      const unique = Array.from(new Set(subProducts.map((p) => p.customVariation)));
      if (unique.length === 1) {
        productDispatch({
          type: "SET_SELECTED_PRODUCT",
          payload: { customVariation: unique[0] },
        });
        productDispatch({ type: "SET_CONST_CUSTOM", payload: unique[0] });
      } else {
        productDispatch({
          type: "SET_DIFF_CUSTOM",
          payload: unique.filter((item): item is string => item !== null),
        });
      }
    },
    [product?.customVariation],
  );

  const compareVariations = useCallback((subProducts: ISubProduct[]) => {
    const variationLength = Math.max(...subProducts.map((p) => p.variations.length));
    const same: IVariationComparison[] = [];
    const different: IVariationComparison[] = [];

    for (let i = 0; i < variationLength; i++) {
      const valuesAtIndex = subProducts.map((p) => p.variations[i]);
      const firstValue = valuesAtIndex[0];
      const allEqual = valuesAtIndex.every((v) => v === firstValue);

      const entry = { key: i, value: firstValue ?? "" };
      if (allEqual) {
        same.push(entry);
      } else {
        different.push({ key: i, value: JSON.stringify(valuesAtIndex) });
      }
    }

    productDispatch({ type: "SET_CONSTANT_VAR", payload: same });
    productDispatch({ type: "SET_DIFFRENT_VAR", payload: different });
    productDispatch({
      type: "SET_SELECTED_PRODUCT",
      payload: { constVariation: same.map((x) => x.value) },
    });
  }, []);

  const handleSelectVariation = useCallback(
    (subProduct: IVariationComparison) => {
      const filteredVariations = selectedVars.filter((x) => x.key !== subProduct.key);
      const newSelectedVars = [...filteredVariations, subProduct];

      productDispatch({ type: "SET_SELECTED_VARS", payload: newSelectedVars });
      productDispatch({
        type: "SET_SELECTED_PRODUCT",
        payload: { selectedVariation: newSelectedVars },
      });
    },
    [selectedVars],
  );

  const handleIncrement = useCallback(
    (subProduct: ISubProduct): void => {
      const card = addCard.find((x) => x.subProductId === subProduct.subProductId);
      const totalStock = addCard.reduce((total, item) => total + item.stock, 0);
      if (!card) return;

      if (totalStock + 1 > product!.maxInEachCard) {
        internalNotify(InternalResponseType.MaxInEachCard, NotifType.Warning);
        uiDispatch({ type: "SET_SHAKE_STEPPER", payload: true });
        uiDispatch({ type: "SET_MAX_CART_REACHED", payload: true });
        setTimeout(() => uiDispatch({ type: "SET_SHAKE_STEPPER", payload: false }), 500);
        return;
      } else {
        uiDispatch({ type: "SET_MAX_CART_REACHED", payload: false });
      }

      if (card.stock + 1 > subProduct.stock) {
        internalNotify(InternalResponseType.ExceedStockCard, NotifType.Warning);
        uiDispatch({ type: "SET_SHAKE_STEPPER", payload: true });
        setTimeout(() => uiDispatch({ type: "SET_SHAKE_STEPPER", payload: false }), 500);
        return;
      }

      productDispatch({
        type: "UPDATE_ADD_CARD_ITEM",
        payload: {
          subProductId: subProduct.subProductId,
          stock: card.stock + 1,
        },
      });
    },
    [addCard, product],
  );

  const handleDecrement = useCallback(
    (subProduct: ISubProduct): void => {
      const card = addCard.find((x) => x.subProductId === subProduct.subProductId);
      if (!card) return;

      uiDispatch({ type: "SET_MAX_CART_REACHED", payload: false });

      if (card.stock === 1) {
        productDispatch({
          type: "REMOVE_ADD_CARD_ITEM",
          payload: subProduct.subProductId,
        });
      } else {
        productDispatch({
          type: "UPDATE_ADD_CARD_ITEM",
          payload: {
            subProductId: subProduct.subProductId,
            stock: card.stock - 1,
          },
        });
      }
    },
    [addCard],
  );

  const handleInitialedSelectedProduct = useCallback(
    (product: IFullProduct) => {
      if (!router.query.subProductId) {
        const cheapestSubProduct = [...product.subProducts].sort((a, b) => a.price - b.price)[0];
        if (cheapestSubProduct) {
          productDispatch({
            type: "SET_SHOW_PRODUCT",
            payload: cheapestSubProduct,
          });
          productDispatch({
            type: "SET_SELECTED_PRODUCT",
            payload: {
              colorId: cheapestSubProduct.colorId,
              customVariation: cheapestSubProduct.customVariation,
              selectedVariation: cheapestSubProduct.variations.map((value, index) => ({
                key: index,
                value: value,
              })),
            },
          });
          productDispatch({
            type: "SET_SELECTED_VARS",
            payload: cheapestSubProduct.variations.map((value, index) => ({
              key: index,
              value: value,
            })),
          });
        }
      } else {
        productDispatch({ type: "SET_LOADING_QUERY", payload: true });
        const subId = router.query.subProductId.toString();
        const foundSubProduct = product.subProducts.find((sub) => sub.subProductId.toString() === subId);
        if (foundSubProduct) {
          productDispatch({
            type: "SET_SHOW_PRODUCT",
            payload: foundSubProduct,
          });
          productDispatch({
            type: "SET_SELECTED_PRODUCT",
            payload: {
              colorId: foundSubProduct.colorId,
              customVariation: foundSubProduct.customVariation,
              selectedVariation: foundSubProduct.variations.map((value, index) => ({
                key: index,
                value: value,
              })),
            },
          });
          productDispatch({
            type: "SET_SELECTED_VARS",
            payload: foundSubProduct.variations.map((value, index) => ({
              key: index,
              value: value,
            })),
          });
        }
        productDispatch({ type: "SET_LOADING_QUERY", payload: false });
      }
    },
    [router.query.subProductId],
  );

  // Memoized helper functions
  const getCartSectionClass = useMemo(() => {
    const hasItemsInCart = addCard.some((item) => item.stock > 0);
    return hasItemsInCart ? styles.inCartSection : styles.addToCartSection;
  }, [addCard]);

  const getDiscountTooltip = useMemo(() => {
    if (!showProduct || showProduct.mainPrice - showProduct.price <= 0) {
      return "";
    }
    const mockHours = 5;
    const mockMinutes = 23;
    const mockSeconds = 45;
    return `${mockHours}h ${mockMinutes}m ${mockSeconds}s remaining`;
  }, [showProduct]);

  const renderAvailabilityStatus = useCallback(
    (status: AvailabilityStatus) => {
      switch (status) {
        case AvailabilityStatus.Available:
          return (
            <div className={styles.status_child}>
              <img
                height="22"
                alt={t("product_Available")}
                title={t("product_Available")}
                src="/product_Available.svg"
              />
            </div>
          );
        case AvailabilityStatus.Restocking:
          return (
            <div className={styles.status_child}>
              <img
                height="22"
                alt={t("product_supplying")}
                title={t("product_supplying")}
                src="/product_supplying.svg"
              />
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
            </div>
          );
        default:
          return <span>-</span>;
      }
    },
    [t],
  );

  const fetchSimilarProducts = useCallback(
    async (categoryId: number) => {
      try {
        if (!session || !shopId || !productId) return;
        const res = await clientFetchApi<boolean, IProduct>("/api/shop/getshopproducts", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "instagramerId", value: shopId.toString() },
            { key: "categoryId", value: categoryId.toString() },
          ],
          onUploadProgress: undefined,
        });

        if (res.succeeded) {
          const filteredProducts = res.value.products.filter((x) => x.shortProduct.productId !== Number(productId));
          if (filteredProducts.length > 0) {
            productDispatch({
              type: "SET_SIMILAR_PRODUCTS",
              payload: filteredProducts,
            });
          }
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, shopId, productId],
  );

  const fetchShop = useCallback(
    async (instagramerId: number) => {
      if (!session) return;
      try {
        const res = await clientFetchApi<boolean, IFullShop>("/api/shop/getfullshop", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [{ key: "instagramerId", value: instagramerId.toString() }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          productDispatch({ type: "SET_SHOP", payload: res.value.shortShop });
        }
      } catch {
        // ignore error
      }
    },
    [session],
  );

  const fetchData = useCallback(async () => {
    if (!shopId || !productId || !session) return;
    productDispatch({ type: "SET_LOADING", payload: true });

    try {
      const [res, commentRes, hashtagRes] = await Promise.all([
        clientFetchApi<boolean, IFullProduct>("/api/shop/getfullproduct", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "instagramerId", value: shopId.toString() },
            { key: "productId", value: productId.toString() },
            { key: "language", value: findSystemLanguage().toString() },
          ],
          onUploadProgress: undefined,
        }),
        (async () => {
          try {
            return await clientFetchApi<boolean, IComment[]>("/api/shop/GetProductComments", {
              methodType: MethodType.get,
              session: session,
              data: null,
              queries: [
                { key: "instagramerId", value: shopId.toString() },
                { key: "productId", value: productId.toString() },
              ],
              onUploadProgress: undefined,
            });
          } catch {
            return { succeeded: false, value: [] } as any;
          }
        })(),
        (async () => {
          try {
            return await clientFetchApi<boolean, string[]>("/api/shop/getproducthashtags", {
              methodType: MethodType.get,
              session: session,
              data: null,
              queries: [
                { key: "instagramerId", value: shopId.toString() },
                { key: "productId", value: productId.toString() },
              ],
              onUploadProgress: undefined,
            });
          } catch {
            return { succeeded: false, value: [] } as any;
          }
        })(),
      ]);

      if (res.succeeded) {
        fetchSimilarProducts(res.value.shortProduct.categoryId);
        productDispatch({
          type: "SET_ADD_CARD",
          payload: res.value.subProducts.map((x) => ({
            price: x.price,
            stock: x.cardCount,
            subProductId: x.subProductId,
          })),
        });

        productDispatch({ type: "SET_PRODUCT", payload: res.value });
        productDispatch({
          type: "SET_MEDIA",
          payload: res.value.thumbnailMediaUrl,
        });
        productDispatch({
          type: "SET_MEDIAS",
          payload: [res.value.thumbnailMediaUrl, ...res.value.medias],
        });

        compareVariations(res.value.subProducts);
        getColorIdStatus(res.value.subProducts);
        getCustomVariationStatus(res.value.subProducts);
        handleInitialedSelectedProduct(res.value);
        productDispatch({ type: "SET_LOADING", payload: false });

        fetchShop(res.value.shortProduct.instagramerId);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }

      if (commentRes.succeeded) {
        productDispatch({ type: "SET_COMMENTS", payload: commentRes.value });
      }

      if (hashtagRes.succeeded) {
        productDispatch({ type: "SET_HASHTAGS", payload: hashtagRes.value });
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      productDispatch({ type: "SET_LOADING_QUERY", payload: false });
    }
  }, [
    shopId,
    productId,
    session,
    fetchSimilarProducts,
    compareVariations,
    getColorIdStatus,
    getCustomVariationStatus,
    handleInitialedSelectedProduct,
    fetchShop,
  ]);
  const handleSaveProduct = useCallback(async () => {
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/shop/UpdateFavoriteProduct", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          { key: "instagramerId", value: shopId?.toString() },
          { key: "productId", value: product!.productId.toString() },
          { key: "isFavorite", value: (!product!.isFavorite).toString() },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        productDispatch({
          type: "UPDATE_PRODUCT_FAVORITE",
          payload: !product?.isFavorite,
        });
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, shopId, product]);

  const checkSelectVarWithSubProduct = useCallback(() => {
    let variations = [
      ...new Set([...selectedProduct.selectedVariation.map((x) => x.value), ...selectedProduct.constVariation]),
    ];
    if (loadingQuery) variations = [];

    for (let sub of product!.subProducts) {
      if (
        sub.colorId === selectedProduct.colorId &&
        sub.customVariation === selectedProduct.customVariation &&
        sub.variations.length === variations.length
      ) {
        const sorted1 = [...variations].sort();
        const sorted2 = [...sub.variations].sort();
        if (sorted1.every((value, index) => value === sorted2[index])) {
          productDispatch({ type: "SET_SHOW_PRODUCT", payload: sub });
          return;
        } else {
          productDispatch({ type: "SET_SHOW_PRODUCT", payload: null });
        }
      } else {
        productDispatch({ type: "SET_SHOW_PRODUCT", payload: null });
      }
    }
  }, [selectedProduct, loadingQuery, product]);

  const handleCalculateDiscountRemainingTime = useCallback(() => {
    const pro = product?.subProducts.find((x) => x.subProductId === showProduct?.subProductId);
    if (!pro) return 0;
    if (pro.remainingDiscountTime === null) return 0;
    else return pro.remainingDiscountTime * 1000;
  }, [product, showProduct]);

  const handleSaveCard = useCallback(async (): Promise<void> => {
    if (!session || !shopId || !productId || addCard.length === 0) {
      return;
    }
    const totalStock = addCard.filter((x) => x.stock > 0);

    const promises = totalStock
      .filter((x) => x.stock > 0)
      .map(async (a) => {
        const res = await clientFetchApi<boolean, boolean>("/api/shop/addCard", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "instagramerId", value: shopId.toString() },
            { key: "productId", value: productId.toString() },
            { key: "subProductId", value: a.subProductId.toString() },
            { key: "count", value: a.stock.toString() },
          ],
          onUploadProgress: undefined,
        });
        if (!res.succeeded) {
          notify(res.info.responseType, NotifType.Warning);
          return;
        }
      });
    try {
      await Promise.all(promises);
      productDispatch({ type: "CLEAR_ADD_CARD" });
      router.push(`/user/orders/cart/${shopId}`);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, shopId, productId, addCard, router]);

  // Memoized calculations for better performance
  const mediaUrls = useMemo(() => {
    if (!product) return [];
    return [product.thumbnailMediaUrl, ...product.medias];
  }, [product]);

  const totalCartItems = useMemo(() => {
    return addCard.reduce((total, item) => total + item.stock, 0);
  }, [addCard]);

  const totalCartPrice = useMemo(() => {
    return addCard.reduce((total, item) => total + item.price * item.stock, 0);
  }, [addCard]);

  const shouldShowProductMeta = useMemo(() => {
    return (
      (product && product.subProducts?.length > 0 && product.isColorVariation && constColor) ||
      (product && product.subProducts?.length > 0 && product.customVariation && constCustom) ||
      constantVar.length > 0
    );
  }, [product, constColor, constCustom, constantVar]);

  const shouldShowProductVariation = useMemo(() => {
    return (
      (product && product.subProducts?.length > 0 && product.isColorVariation && diffColor.length > 0) ||
      (product && product.subProducts?.length > 0 && product.customVariation && diffCustom.length > 0) ||
      diffrentVar.length > 0
    );
  }, [product, diffColor, diffCustom, diffrentVar]);

  // Memoized event handlers for better performance
  const handleCopyProductLink = useCallback(() => {
    handleCopyLink(baseUrl + `/user/shop/${shopId}/product/${product?.productId}`);
  }, [baseUrl, shopId, product?.productId]);

  const handleViewInstagramPost = useCallback(() => {
    router.replace(product?.shortProduct.instagramUrl || "");
  }, [router, product?.shortProduct.instagramUrl]);

  const handleMediaSelect = useCallback((mediaUrl: string) => {
    productDispatch({ type: "SET_MEDIA", payload: mediaUrl });
  }, []);

  const thumbnailContainerStyle = useMemo(
    () => ({
      cursor: isDragging ? "grabbing" : ("grab" as const),
      overflowX: "auto" as const,
      userSelect: "none" as const,
    }),
    [isDragging],
  );

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!session || hasFetched.current) return;
    fetchData();
    hasFetched.current = true;
  }, [session]);
  if (session && session.user.currentIndex > -1) router.push("/");

  // useEffect(() => {
  //   if (loadinQuery) return;
  //   if (!session || !router.query.subProductId || !product) return;
  //   const subId = router.query.subProductId.toString();
  //   const foundSubProduct = product.subProducts.find(
  //     (sub) => sub.subProductId.toString() === subId
  //   );
  //   console.log("foundSubProduct", foundSubProduct);
  //   if (foundSubProduct) {
  //     setLoadingQuery(true);
  //     setShowProduct(foundSubProduct);
  //     setSelectedProduct((prev) => ({
  //       ...prev,
  //       colorId: foundSubProduct.colorId,
  //       customVariation: foundSubProduct.customVariation,
  //       constVariation: foundSubProduct.variations,
  //       selectedVariation: foundSubProduct.variations.map((value, index) => ({
  //         key: index,
  //         value: value,
  //       })),
  //     }));
  //     setSelectedVars(
  //       foundSubProduct.variations.map((value, index) => ({
  //         key: index,
  //         value: value,
  //       }))
  //     );
  //     setLoadingQuery(false);
  //   }
  // }, [router.query.subProductId, session]);
  const getColorName = useCallback(
    (colorId: number) => {
      switch (colorId) {
        case 1:
          return t(LanguageKey.Orange);
        case 2:
          return t(LanguageKey.Purple);
        case 3:
          return t(LanguageKey.Green);
        case 4:
          return t(LanguageKey.White);
        case 5:
          return t(LanguageKey.DarkGray);
        case 6:
          return t(LanguageKey.Blue);
        case 7:
          return t(LanguageKey.LightGray);
        case 8:
          return t(LanguageKey.Brown);
        case 9:
          return t(LanguageKey.Red);
        case 10:
          return t(LanguageKey.Pink);
        case 11:
          return t(LanguageKey.Yellow);
        case 12:
          return t(LanguageKey.Silver);
        case 13:
          return t(LanguageKey.Black);
        default:
          return "";
      }
    },
    [t],
  );

  const getAvailableOptions = useCallback(
    (type: "color" | "custom" | "variation", key?: number): number[] | string[] => {
      if (!product) return [];
      let filtered = product.subProducts.filter((sp) => sp.stock > 0);

      if (type !== "color" && selectedProduct.colorId !== null) {
        filtered = filtered.filter((sp) => sp.colorId === selectedProduct.colorId);
      }
      if (type !== "custom" && product.customVariation && selectedProduct.customVariation !== null) {
        filtered = filtered.filter((sp) => sp.customVariation === selectedProduct.customVariation);
      }
      if (type === "variation" && typeof key === "number") {
        selectedVars.forEach((v) => {
          if (v.key !== key) {
            filtered = filtered.filter((sp) => sp.variations[v.key] === v.value);
          }
        });
      } else if (type !== "variation") {
        selectedVars.forEach((v) => {
          filtered = filtered.filter((sp) => sp.variations[v.key] === v.value);
        });
      }

      if (type === "color") {
        return Array.from(new Set(filtered.map((sp) => sp.colorId))).filter((id): id is number => id !== null);
      }
      if (type === "custom") {
        return Array.from(new Set(filtered.map((sp) => sp.customVariation))).filter((v): v is string => v !== null);
      }
      if (type === "variation" && typeof key === "number") {
        return Array.from(new Set(filtered.map((sp) => sp.variations[key]))).filter((v): v is string => v !== null);
      }
      return [];
    },
    [product, selectedProduct.colorId, selectedProduct.customVariation, selectedVars],
  );

  const handleUpdateFavorite = useCallback(async () => {
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/shop/UpdateFavoriteProduct", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          { key: "instagramerId", value: shopId?.toString() || "" },
          { key: "productId", value: product?.productId.toString() || "" },
          { key: "isFavorite", value: (!product?.isFavorite).toString() },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        productDispatch({
          type: "UPDATE_PRODUCT_FAVORITE",
          payload: !product?.isFavorite,
        });
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, shopId, product]);

  // Effects with proper dependencies
  useEffect(() => {
    if (loading || loadingQuery) return;
    checkSelectVarWithSubProduct();
  }, [selectedProduct, loading, loadingQuery, checkSelectVarWithSubProduct]);

  useEffect(() => {
    if (!session || hasFetched.current) return;
    fetchData();
    hasFetched.current = true;
  }, [session, fetchData]);

  useEffect(() => {
    if (session && session.user.currentIndex > -1) router.push("/");
  }, [session, router]);

  // Auto-deselect unavailable selections with proper memoization
  useEffect(() => {
    if (!product) return;

    const availableColors = getAvailableOptions("color") as number[];
    const availableCustoms = getAvailableOptions("custom") as string[];

    if (selectedProduct.colorId !== null && !availableColors.includes(selectedProduct.colorId)) {
      productDispatch({
        type: "SET_SELECTED_PRODUCT",
        payload: { colorId: null },
      });
    }

    if (
      product.customVariation &&
      selectedProduct.customVariation !== null &&
      !availableCustoms.includes(selectedProduct.customVariation)
    ) {
      productDispatch({
        type: "SET_SELECTED_PRODUCT",
        payload: { customVariation: null },
      });
    }

    if (selectedVars.length > 0) {
      const filteredVars = selectedVars.filter((v) =>
        (getAvailableOptions("variation", v.key) as string[]).includes(v.value),
      );
      if (filteredVars.length !== selectedVars.length) {
        productDispatch({ type: "SET_SELECTED_VARS", payload: filteredVars });
        productDispatch({
          type: "SET_SELECTED_PRODUCT",
          payload: { selectedVariation: filteredVars },
        });
      }
    }
  }, [selectedProduct, selectedVars, product, getAvailableOptions]);
  if (status === "loading") {
    return null; // یا می‌توانی یک لودینگ ساده نمایش بدهی
  }
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
      session &&
      session.user.currentIndex === -1 &&
      (loading ? (
        <Loading />
      ) : (
        <>
          <Head>
            <meta name="theme-color"></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
            <title>Bran.cy ▸ {product!.shortProduct.title}</title>
            <meta name="description" content="Advanced Instagram post management tool" />
            <meta
              name="keywords"
              content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
            />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://www.Brancy.app/page/posts" />
            {/* Add other meta tags as needed */}
          </Head>
          <main className={styles.productContainer}>
            <header className={`${styles.header} translate`}>
              <div className="headerparent" title={t(LanguageKey.BacktoProductList)}>
                <div
                  className="instagramprofile"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (shop?.instagramerId) {
                      router.push(`/user/shop/${shop.instagramerId}`);
                    }
                  }}>
                  <svg className={styles.BacktoProductList} width="45" height="45" viewBox="0 0 22 22" fill="none">
                    <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                    <path
                      fill="var(--text-h1)"
                      d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5 -1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                    />
                  </svg>
                  <div className="instagramprofiledetail">
                    <div className="instagramusername">{t(LanguageKey.BacktoProductList)}</div>
                    <div className="instagramid">{shop?.username}</div>
                  </div>
                </div>
              </div>
              {/* <div className="headerparent">
              <div
                className="instagramprofile"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (shop?.instagramerId) {
                    router.push(`/user/shop/${shop.instagramerId}`);
                  }
                }}>
                <img
                  className="instagramimage"
                  loading="lazy"
                  decoding="async"
                  title="ℹ️ store profile"
                  src={baseMediaUrl + (shop?.profileUrl || "")}
                />
                <div className="instagramprofiledetail">
                  <div className="instagramusername">{shop?.username}</div>
                  <div className="instagramid">{shop?.fullName}</div>
                </div>
              </div>
            </div> */}
            </header>

            <main className={styles.mainContent}>
              <div className={styles.optioncontainermobile}>
                <div className={styles.actionButtons} title="product rate">
                  <svg className={styles.optionsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39 38">
                    <path
                      d="M18 1a1.6 1.6 0 0 1 3 0l5 10.7q.2.6.8.8l10.7 5c1.3.6 1.3 2.4 0 3l-10.7 5q-.6.2-.8.8L21 37a1.6 1.6 0 0 1-3 0l-5-10.8q-.3-.6-.8-.8l-10.8-5a1.6 1.6 0 0 1 0-3l10.8-5q.5-.2.8-.8z"
                      fill="var(--color-light-yellow)"
                    />
                  </svg>

                  <span>--</span>
                </div>
                <div
                  onClick={handleUpdateFavorite}
                  className={styles.actionButtons}
                  style={product?.isFavorite ? { border: "1px solid var(--color-dark-blue)" } : {}}
                  title="product save">
                  <svg className={styles.optionsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 35">
                    <path
                      opacity=".4"
                      d="M28.5 18.4v-3C28.5 4.2 26.8 2.3 17 2.3s-11.5 2-11.5 13v3c0 8.3 0 11.4 1.2 12.7q.7.6 1.6.6c1.4 0 3-1.3 4.5-2.7 1.5-1.3 3.1-2.7 4.2-2.7s2.7 1.4 4.2 2.7c1.6 1.4 3.1 2.7 4.5 2.7q1 0 1.6-.6c1.2-1.3 1.2-4.4 1.2-12.6"
                    />
                    <rect x="11" y="11" width="12" height="3" rx="1.5" />
                  </svg>
                </div>
                <div
                  onClick={() =>
                    uiDispatch({
                      type: "SET_SHOW_PRICE_HISTORY",
                      payload: true,
                    })
                  }
                  className={styles.actionButtons}
                  title="Price History">
                  <svg className={styles.optionsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 36">
                    <path
                      d="M18.9 3.4c-11.4 0-15.4 4-15.4 15.4s4 15.4 15.4 15.4 15.3-4 15.3-15.4S30.2 3.4 19 3.4"
                      opacity=".4"
                    />
                    <path d="M25 21.5a1.5 1.5 0 0 1 3 0v4a1.5 1.5 0 0 1-3 0zm-7-10a1.5 1.5 0 0 1 3 0v14a1.5 1.5 0 0 1-3 0zm-7 5a1.5 1.5 0 0 1 3 0v9a1.5 1.5 0 0 1-3 0z" />
                  </svg>
                </div>
                <div onClick={handleCopyProductLink} className={styles.actionButtons} title="product share">
                  <svg className={styles.optionsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                    <path d="M26.25 2.25a6 6 0 1 0 0 12 6 6 0 0 0 0-12m-18 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12m19.5 10.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12" />
                    <path
                      opacity=".4"
                      d="M20.06 8.25c-4.06 0-7.58 2.22-9.39 5.47l-2.62-1.45A13.7 13.7 0 0 1 22 5.4l-.42 2.97q-.74-.1-1.53-.1m10.7 10.5c0-2.5-.89-4.77-2.35-6.57l2.32-1.9a13.3 13.3 0 0 1 1.37 14.88l-2.63-1.44a10.3 10.3 0 0 0 1.28-4.98M9.7 21.35a10.66 10.66 0 0 0 13.66 7.38l.92 2.86q-2 .64-4.22.65c-6.37 0-11.74-4.3-13.26-10.14z"
                    />
                  </svg>
                </div>
                <div onClick={handleViewInstagramPost} className={styles.actionButtons} title="View instagram post">
                  <svg className={styles.optionsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path
                      opacity=".4"
                      d="M3 16c0 9.8 3.3 13 13 13 9.8 0 13-3.2 13-13 0-9.7-3.2-13-13-13C6.3 3 3 6.3 3 16"
                    />
                    <path d="M16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10m7-1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                  </svg>
                </div>
                <div
                  onClick={() =>
                    uiDispatch({
                      type: "SET_SHOW_REPORT_PRODUCT",
                      payload: true,
                    })
                  }
                  className={styles.actionButtons}
                  title="report">
                  <svg className={styles.optionsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                    <path
                      opacity=".4"
                      d="m29.44 14.69-.32-.57C24.49 6.02 21.6 3 18.5 3S12.51 6.01 7.88 14.12l-.32.57c-1.67 2.87-5.12 8.85-4.48 12.41.75 4.22 5.17 4.9 15.42 4.9s14.67-.68 15.42-4.9c.64-3.56-2.81-9.54-4.48-12.41"
                    />
                    <path d="M17 12.5a1.5 1.5 0 0 1 3 0v6a1.5 1.5 0 0 1-3 0zm0 11a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" />
                  </svg>
                </div>
              </div>
              <section className={styles.imageSection}>
                <div className={styles.productmainImage}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.mainImage}
                    src={baseMediaUrl + media}
                    alt={media}
                  />

                  <div className={styles.mobileGallery}>
                    <div className={styles.mobileGalleryScroll}>
                      {medias.map((image, index) => (
                        <div
                          key={index}
                          className={`${styles.galleryItem} ${media === image ? styles.galleryItem : ""}`}
                          onClick={() => handleMediaSelect(image)}>
                          <img
                            loading="lazy"
                            decoding="async"
                            src={baseMediaUrl + image}
                            alt={`Gallery image ${index + 1}`}
                            className={styles.galleryImage}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className={styles.thumbnailContainer}
                  ref={thumbnailContainerRef}
                  style={thumbnailContainerStyle}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseUp}
                  onMouseUp={handleMouseUp}>
                  {medias.map((media, index) => (
                    <img
                      loading="lazy"
                      decoding="async"
                      className={styles.thumbnail}
                      key={index}
                      src={baseMediaUrl + media}
                      onClick={() => handleMediaSelect(media)}
                      alt={`Product thumbnail ${index + 1}`}
                      draggable={false}
                      onDragStart={handleImgDragStart}
                    />
                  ))}
                </div>
              </section>

              <section className={styles.productInfo}>
                <div className={styles.optioncontainer}>
                  <div className={styles.actionButtons} title="product rate">
                    <svg
                      className={styles.optionsvg}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 39 38">
                      <path
                        d="M18 1a1.6 1.6 0 0 1 3 0l5 10.7q.2.6.8.8l10.7 5c1.3.6 1.3 2.4 0 3l-10.7 5q-.6.2-.8.8L21 37a1.6 1.6 0 0 1-3 0l-5-10.8q-.3-.6-.8-.8l-10.8-5a1.6 1.6 0 0 1 0-3l10.8-5q.5-.2.8-.8z"
                        fill="var(--color-light-yellow)"
                      />
                    </svg>

                    <span>--</span>
                  </div>
                  <div
                    onClick={handleUpdateFavorite}
                    className={styles.actionButtons}
                    style={product?.isFavorite ? { border: "1px solid var(--color-dark-blue)" } : {}}
                    title="product save">
                    <svg
                      className={styles.optionsvg}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 34 35">
                      <path
                        opacity=".4"
                        d="M28.5 18.4v-3C28.5 4.2 26.8 2.3 17 2.3s-11.5 2-11.5 13v3c0 8.3 0 11.4 1.2 12.7q.7.6 1.6.6c1.4 0 3-1.3 4.5-2.7 1.5-1.3 3.1-2.7 4.2-2.7s2.7 1.4 4.2 2.7c1.6 1.4 3.1 2.7 4.5 2.7q1 0 1.6-.6c1.2-1.3 1.2-4.4 1.2-12.6"
                      />
                      <rect x="11" y="11" width="12" height="3" rx="1.5" />
                    </svg>
                  </div>
                  <div
                    onClick={() =>
                      uiDispatch({
                        type: "SET_SHOW_PRICE_HISTORY",
                        payload: true,
                      })
                    }
                    className={styles.actionButtons}
                    title="Price History">
                    <svg
                      className={styles.optionsvg}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 37 36">
                      <path
                        d="M18.9 3.4c-11.4 0-15.4 4-15.4 15.4s4 15.4 15.4 15.4 15.3-4 15.3-15.4S30.2 3.4 19 3.4"
                        opacity=".4"
                      />
                      <path d="M25 21.5a1.5 1.5 0 0 1 3 0v4a1.5 1.5 0 0 1-3 0zm-7-10a1.5 1.5 0 0 1 3 0v14a1.5 1.5 0 0 1-3 0zm-7 5a1.5 1.5 0 0 1 3 0v9a1.5 1.5 0 0 1-3 0z" />
                    </svg>
                  </div>
                  <div
                    onClick={() => {
                      handleCopyLink(baseUrl + `/user/shop/${shopId}/product/${product!.productId}`);
                    }}
                    className={styles.actionButtons}
                    title="product share">
                    <svg
                      className={styles.optionsvg}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36">
                      <path d="M26.25 2.25a6 6 0 1 0 0 12 6 6 0 0 0 0-12m-18 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12m19.5 10.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12" />
                      <path
                        opacity=".4"
                        d="M20.06 8.25c-4.06 0-7.58 2.22-9.39 5.47l-2.62-1.45A13.7 13.7 0 0 1 22 5.4l-.42 2.97q-.74-.1-1.53-.1m10.7 10.5c0-2.5-.89-4.77-2.35-6.57l2.32-1.9a13.3 13.3 0 0 1 1.37 14.88l-2.63-1.44a10.3 10.3 0 0 0 1.28-4.98M9.7 21.35a10.66 10.66 0 0 0 13.66 7.38l.92 2.86q-2 .64-4.22.65c-6.37 0-11.74-4.3-13.26-10.14z"
                      />
                    </svg>
                  </div>
                  <div
                    onClick={() => router.replace(product!.shortProduct.instagramUrl)}
                    className={styles.actionButtons}
                    title="View instagram post">
                    <svg
                      className={styles.optionsvg}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32">
                      <path
                        opacity=".4"
                        d="M3 16c0 9.8 3.3 13 13 13 9.8 0 13-3.2 13-13 0-9.7-3.2-13-13-13C6.3 3 3 6.3 3 16"
                      />
                      <path d="M16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10m7-1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                    </svg>
                  </div>
                  <div
                    onClick={() =>
                      uiDispatch({
                        type: "SET_SHOW_REPORT_PRODUCT",
                        payload: true,
                      })
                    }
                    className={styles.actionButtons}
                    title="report">
                    <svg
                      className={styles.optionsvg}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36">
                      <path
                        opacity=".4"
                        d="m29.44 14.69-.32-.57C24.49 6.02 21.6 3 18.5 3S12.51 6.01 7.88 14.12l-.32.57c-1.67 2.87-5.12 8.85-4.48 12.41.75 4.22 5.17 4.9 15.42 4.9s14.67-.68 15.42-4.9c.64-3.56-2.81-9.54-4.48-12.41"
                      />
                      <path d="M17 12.5a1.5 1.5 0 0 1 3 0v6a1.5 1.5 0 0 1-3 0zm0 11a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" />
                    </svg>
                  </div>
                </div>
                <div className={styles.productDetailSection}>
                  <div className="headerandinput">
                    <h1 className={styles.productTitle}>{product!.shortProduct.title}</h1>
                    <div className="explain">
                      {new DateObject({
                        date: product!.shortProduct.lastUpdate * 1000,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY/MM/DD HH:mm ")}
                    </div>
                  </div>
                  {/* Only show productMeta if it has content */}
                  {shouldShowProductMeta && (
                    <div className={styles.productMeta}>
                      {product && product.subProducts?.length > 0 && product.isColorVariation && constColor && (
                        <div className={styles.metaItem}>
                          <span>{t(LanguageKey.color)}</span>
                          <span>{constColor}</span>
                        </div>
                      )}
                      {product && product.subProducts?.length > 0 && product.customVariation && constCustom && (
                        <div className={styles.metaItem}>
                          <span>{product.customVariation}</span>
                          <span>{constCustom}</span>
                        </div>
                      )}
                      {constantVar.length > 0 &&
                        constantVar.map((x, i) => (
                          <div key={i} className={styles.metaItem}>
                            <span>{product!.variations[x.key]}</span>
                            <span>{x.value}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Only show productVariation if it has content */}
                  {shouldShowProductVariation && (
                    <div className={styles.productVariation}>
                      {/* Color */}
                      {product!.subProducts.length > 0 && product!.isColorVariation && diffColor.length > 0 && (
                        <div className={styles.productVariationItem}>
                          <h2>{t(LanguageKey.color)}</h2>
                          <div className={styles.VariationOptions}>
                            {diffColor.map((sub, i) => {
                              const available = (getAvailableOptions("color") as number[]).includes(sub);
                              return (
                                <button
                                  className={`${styles.VariationOptionsButton} ${
                                    selectedProduct.colorId === sub && available ? styles.selected : ""
                                  } ${!available ? styles.unavailable : ""}`}
                                  key={i}
                                  // Always allow selection, even if unavailable
                                  onClick={() => {
                                    productDispatch({
                                      type: "SET_SELECTED_PRODUCT",
                                      payload: {
                                        colorId: selectedProduct.colorId === sub ? null : sub,
                                      },
                                    });
                                  }}>
                                  <div
                                    className={styles.colorCircle}
                                    style={{
                                      backgroundColor: ColorStr[sub],
                                    }}></div>
                                  {getColorName(sub)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Custom */}
                      {product!.subProducts.length > 0 && product!.customVariation && diffCustom.length > 0 && (
                        <div className={styles.productVariationItem}>
                          <h2>{product?.customVariation}</h2>
                          <div className={styles.VariationOptions}>
                            {diffCustom.map((custom, i) => {
                              const available = (getAvailableOptions("custom") as string[]).includes(custom);
                              return (
                                <button
                                  key={i}
                                  className={`${styles.VariationOptionsButton} ${
                                    selectedProduct.customVariation === custom && available ? styles.selected : ""
                                  } ${!available ? styles.unavailable : ""}`}
                                  // Always allow selection, even if unavailable
                                  onClick={() => {
                                    productDispatch({
                                      type: "SET_SELECTED_PRODUCT",
                                      payload: {
                                        customVariation: selectedProduct.customVariation === custom ? null : custom,
                                      },
                                    });
                                  }}>
                                  {custom}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Other variations */}
                      {diffrentVar.length > 0 &&
                        diffrentVar.map((x, i) => (
                          <div key={i} className={styles.productVariationItem}>
                            <h2>{product!.variations[x.key]}</h2>
                            <div className={styles.VariationOptions}>
                              {[...new Set(JSON.parse(x.value) as string[])].map((v, j) => {
                                const available = (getAvailableOptions("variation", x.key) as string[]).includes(v);
                                return (
                                  <button
                                    key={j}
                                    className={`${styles.VariationOptionsButton} ${
                                      selectedVars.some((item) => item.key === x.key && item.value === v) && available
                                        ? styles.selected
                                        : ""
                                    } ${!available ? styles.unavailable : ""}`}
                                    // Always allow selection, even if unavailable
                                    onClick={() => {
                                      if (selectedVars.some((item) => item.key === x.key && item.value === v)) {
                                        const filteredVars = selectedVars.filter(
                                          (item) => !(item.key === x.key && item.value === v),
                                        );
                                        productDispatch({
                                          type: "SET_SELECTED_VARS",
                                          payload: filteredVars,
                                        });
                                        productDispatch({
                                          type: "SET_SELECTED_PRODUCT",
                                          payload: {
                                            selectedVariation: filteredVars,
                                          },
                                        });
                                      } else {
                                        handleSelectVariation({
                                          key: x.key,
                                          value: v,
                                        });
                                      }
                                    }}>
                                    {v}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {/* ----------------price section----------------
              <div className={`${styles.addToCartSection} translate`}>
                <div className={styles.leftcontent}>
                  <div className={styles.stock}>
                    <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path
                        d="m3.8 6.7 2 .6 4.6 11.2m1.8.7 8-3.2m-7.9 3.7q0-1.2-1.4-1.3A1.3 1.3 0 0 0 11 21q1.2 0 1.3-1.3m4.6-4.8-2.7 1q-1.4.5-2.1-1l-.6-1.7q-.5-1.5.9-2.1l2.6-1q1.6-.5 2.2 1l.6 1.6q.4 1.6-.9 2.2M14.1 8l-2.7 1q-1.4.5-2.1-1l-.6-1.7q-.5-1.5.9-2.1l2.7-1q1.4-.5 2.1 1l.6 1.6q.5 1.5-.9 2.2"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <strong>+50</strong>
                    <span>{t(LanguageKey.Storeproduct_stock)}</span>
                  </div>
                  <div className={styles.productPriceandDiscount}>
                    <div className={styles.discountdateremaining}>
                      <span>12%</span>  <span>05</span>:<span>21</span>:<span>22</span>:<span>11</span>
                    </div>
                  </div>
                </div>
                <div className={styles.rightcontent}>
                  <div className="headerandinput" style={{ gap: "0px", minWidth: "max-content" }}>
                    <div className={styles.rowproductprice}>1,200,000,000</div>
                    <div className={styles.finalproductprice}>90,000,000</div>
                  </div>
                  <button className={styles.addtocart}>{t(LanguageKey.addtocart)}</button>
                </div>
              </div>
              */}

                <div className={`${getCartSectionClass} translate`}>
                  {showProduct && (
                    <>
                      {showProduct && (
                        <div className={styles.leftcontent}>
                          {showProduct.cardCount !== undefined && (
                            <div className={styles.stock}>
                              <svg
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24">
                                <path
                                  d="m3.8 6.7 2 .6 4.6 11.2m1.8.7 8-3.2m-7.9 3.7q0-1.2-1.4-1.3A1.3 1.3 0 0 0 11 21q1.2 0 1.3-1.3m4.6-4.8-2.7 1q-1.4.5-2.1-1l-.6-1.7q-.5-1.5.9-2.1l2.6-1q1.6-.5 2.2 1l.6 1.6q.4 1.6-.9 2.2M14.1 8l-2.7 1q-1.4.5-2.1-1l-.6-1.7q-.5-1.5.9-2.1l2.7-1q1.4-.5 2.1 1l.6 1.6q.5 1.5-.9 2.2"
                                  stroke="#fff"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <strong>+{showProduct.stock}</strong>

                              <span>{t(LanguageKey.Storeproduct_stock)}</span>

                              {showProduct.cardCount > 0 && (
                                <>
                                  <span className={styles.cardCount}>
                                    (<strong>{showProduct.cardCount}</strong> {t(LanguageKey.incartcount)} )
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                          <div className={styles.productPriceandDiscount}>
                            {showProduct.mainPrice - showProduct.price > 0 && (
                              <div className={styles.discountandremaining}>
                                <span className={styles.discountBadge}>
                                  {Math.round(
                                    ((showProduct.mainPrice - showProduct.price) / showProduct.mainPrice) * 100,
                                  )}
                                  %
                                </span>

                                {addCard.some(
                                  (item) => item.subProductId === showProduct.subProductId && item.stock > 0,
                                ) &&
                                  showProduct.remainingDiscountTime && (
                                    <span className={styles.discountoverall} data-tooltip={getDiscountTooltip}>
                                      <svg
                                        fill="none"
                                        width="15"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 15 21">
                                        <path
                                          d="M14.7 8.3q-.4-.8-1.2-.8H9.3V1.7q0-1.2-1-1.6-.8-.3-1.5.6L1.1 11a2 2 0 0 0 0 1.8q.3.8 1.1.8h4.2v5.8q0 1.2 1 1.6l.4.1q.6 0 1-.7L14.7 10a2 2 0 0 0 0-1.8"
                                          fill="#fff"
                                        />
                                      </svg>
                                    </span>
                                  )}

                                {(addCard.every((item) => item.subProductId !== showProduct.subProductId) ||
                                  addCard.some(
                                    (item) => item.subProductId === showProduct.subProductId && item.stock === 0,
                                  )) &&
                                  showProduct.remainingDiscountTime && (
                                    // <div className={styles.discountdateremaining}>
                                    <CountdownTimer targetTimestamp={handleCalculateDiscountRemainingTime()} />
                                    // </div>
                                  )}
                              </div>
                            )}

                            {addCard.some(
                              (item) => item.subProductId === showProduct.subProductId && item.stock > 0,
                            ) && (
                              <div className={styles.pricesection}>
                                {showProduct.mainPrice - showProduct.price > 0 && (
                                  <span className={styles.rowproductprice}>
                                    <PriceFormater
                                      pricetype={showProduct.priceType}
                                      fee={
                                        showProduct.mainPrice *
                                        (addCard.find((item) => item.subProductId === showProduct.subProductId)
                                          ?.stock || 1)
                                      }
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </span>
                                )}
                                <span className={styles.finalproductprice}>
                                  <PriceFormater
                                    pricetype={showProduct.priceType}
                                    fee={addCard.reduce((t, i) => t + i.price * i.stock, 0)}
                                    className={PriceFormaterClassName.PostPrice}
                                  />
                                  {/* {addCard
                                    .reduce((t, i) => t + i.price * i.stock, 0)
                                    .toFixed(2)} */}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* <div className={styles.SelectedProductDetails}>
                          {showProduct.subProductId && (
                          <div className={styles.metaItem}>
                            <span>Product Code:</span>
                            <span>{showProduct.subProductId}</span>
                          </div>
                        )}
                           {showProduct.price !== undefined && (
                          <div className={styles.metaItem}>
                            <span>Price:</span>
                            <span>${showProduct.price}</span>
                          </div>
                        )}
                        </div> */}
                        </div>
                      )}
                      <>
                        {addCard.some((item) => item.subProductId === showProduct.subProductId && item.stock > 0) ? (
                          <div className={styles.rightcontentafter}>
                            <div
                              className={`${styles.rightcontentafter} ${styles.IncrementStepper} ${
                                shakeStepper ? styles.shake : ""
                              }`}>
                              <IncrementStepper
                                data={
                                  addCard.find((item) => item.subProductId === showProduct.subProductId)?.stock || 0
                                }
                                increment={() => handleIncrement(showProduct)}
                                decrement={() => handleDecrement(showProduct)}
                                id={"subProductId"}
                              />
                              {isMaxCartReached && <span className={styles.maxCartWarning}>{t(LanguageKey.max)}</span>}
                            </div>
                            <button onClick={handleSaveCard} className={styles.addtocart}>
                              <svg
                                height="50"
                                width="50"
                                stroke="var(--color-dark-blue)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 42 42">
                                <path d="M35 6.7c-9.6-.7-21.4 8.2-22.6 18.1q0 1.4.8 2.3l2.4 2.4a3 3 0 0 0 2.3 1C28 29 36.6 17.3 36 7.7q0-1-1-1" />
                                <path
                                  opacity=".5"
                                  d="m29 24.8-.6 7.8q0 1-1 1.6l-4.3 2.1a2 2 0 0 1-2.5-1l-2-5M18.1 14l-7.8.5q-1.1 0-1.6 1l-2.2 4.2a2 2 0 0 0 1 2.5l5 2M13 33c-.4 3.2-4 2.6-6.5 3 .4-2.5-.2-6.1 3-6.6m14.2-14.7a2.8 2.8 0 1 1 4 4 2.8 2.8 0 0 1-4-4"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className={styles.rightcontent}>
                            <div
                              className="headerandinput"
                              style={{
                                width: "auto",
                                minWidth: "max-content",
                                gap: "0px",
                              }}>
                              {showProduct.mainPrice - showProduct.price > 0 && (
                                <span className={styles.rowproductprice}>
                                  <PriceFormater
                                    pricetype={showProduct.priceType}
                                    fee={showProduct.mainPrice}
                                    className={PriceFormaterClassName.PostPrice}
                                  />
                                </span>
                              )}
                              <span className={styles.finalproductprice}>
                                <PriceFormater
                                  pricetype={showProduct.priceType}
                                  fee={showProduct.price}
                                  className={PriceFormaterClassName.PostPrice}
                                />
                              </span>
                            </div>
                            <button
                              className={styles.addtocart}
                              onClick={() => {
                                const totalStock = addCard.reduce((total, item) => total + item.stock, 0);
                                if (totalStock + 1 > product!.maxInEachCard) {
                                  internalNotify(InternalResponseType.MaxInEachCard, NotifType.Warning);
                                  return;
                                }
                                const addedproduct = addCard.find(
                                  (item) => item.subProductId === showProduct.subProductId,
                                );
                                if (addedproduct)
                                  productDispatch({
                                    type: "UPDATE_ADD_CARD_ITEM",
                                    payload: {
                                      subProductId: showProduct.subProductId,
                                      stock: addedproduct.stock + 1,
                                    },
                                  });
                                else
                                  productDispatch({
                                    type: "ADD_ADD_CARD_ITEM",
                                    payload: {
                                      stock: 1,
                                      subProductId: showProduct.subProductId,
                                      price: showProduct.price,
                                    },
                                  });
                              }}>
                              {t(LanguageKey.addtocart)}
                            </button>
                          </div>
                        )}
                      </>
                    </>
                  )}

                  {/* ----------------حالت سلکت نشدن ---------------- */}

                  {!showProduct && (
                    <>
                      <div className={styles.rightcontent}>
                        <div className="headerandinput" style={{ width: "auto", minWidth: "max-content" }}>
                          <div className={styles.cardCount}>
                            <svg fill="none" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                              <path
                                d="M33 7.5a1.5 1.5 0 1 1 0 3h-.2l-.8 7.3q-.1 3-1.8 5-1.9 1.5-5 1.6l-14.8 1.2.1-1.7v-1l-4-15.4z"
                                fill="#fff"
                              />
                              <path
                                d="M3 1.5a1.5 1.5 0 1 0 0 3h1.5q1.1 0 1.5 1.2L10.5 23q0 .7-.3 1.2l-1 1.3H9a4.5 4.5 0 1 0 4.2 6h8a4.5 4.5 0 1 0 0-3h-8q-.3-1-1.1-1.8l.5-.6a4 4 0 0 0 .8-3.9L8.9 5a5 5 0 0 0-4.4-3.4zM24 30a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m-13.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"
                                fill="#fff"
                              />
                            </svg>
                            <span>{addCard.reduce((total, item) => total + item.stock, 0)}</span>
                            {t(LanguageKey.incartcount)}
                          </div>

                          {/* <div className={styles.finalproductprice}>
                            <PriceFormater
                              pricetype={PriceType.Dollar}
                              fee={addCard.reduce(
                                (t, i) => t + i.price * i.stock,
                                0
                              )}
                              className={PriceFormaterClassName.PostPrice}
                            />
                          </div> */}
                        </div>
                        {addCard.length > 0 && (
                          <span onClick={handleSaveCard} className={styles.addtocart}>
                            {
                              <svg
                                height="50"
                                width="50"
                                stroke="var(--color-dark-blue)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 42 42">
                                <path d="M35 6.7c-9.6-.7-21.4 8.2-22.6 18.1q0 1.4.8 2.3l2.4 2.4a3 3 0 0 0 2.3 1C28 29 36.6 17.3 36 7.7q0-1-1-1" />
                                <path
                                  opacity=".5"
                                  d="m29 24.8-.6 7.8q0 1-1 1.6l-4.3 2.1a2 2 0 0 1-2.5-1l-2-5M18.1 14l-7.8.5q-1.1 0-1.6 1l-2.2 4.2a2 2 0 0 0 1 2.5l5 2M13 33c-.4 3.2-4 2.6-6.5 3 .4-2.5-.2-6.1 3-6.6m14.2-14.7a2.8 2.8 0 1 1 4 4 2.8 2.8 0 0 1-4-4"
                                />
                              </svg>
                            }
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {/* <div className={styles.stockInfoparent}>
                 <div className={styles.stockInfo}>
                  <span>{addCard.reduce((total, item) => total + item.stock, 0)}</span>
                  <span>In stock</span>
                </div>
                <div className={styles.stockInfo}>
                  <span>{addCard.reduce((t, i) => t + i.price * i.stock, 0)}</span>
                  <span>Total price</span>
                </div>
              </div> */}
                {/* ----------------price section---------------- */}
              </section>
            </main>
            {/*  ------------------ product data --------------------  */}

            <section className={styles.tabContentWrapper}>
              <div className={styles.leftTab}>
                <header className={styles.tabs}>
                  {[
                    {
                      key: "Description",
                      label: t(LanguageKey.SettingGeneral_Description),
                    },
                    // Only show Table tab when the conditions are met
                    ...(product?.description &&
                    handleDecompress(
                      (
                        JSON.parse(product.description) as {
                          description: string;
                          sizeTable: string;
                        }
                      ).sizeTable,
                    )
                      ? [
                          {
                            key: "Table",
                            label: t(LanguageKey.product_PreviewTable),
                          },
                        ]
                      : []),
                    {
                      key: "Specifications",
                      label: t(LanguageKey.pageLottery_Specifications),
                    },
                    {
                      key: "Hashtags",
                      label: t(LanguageKey.pageTools_hashtags),
                    },
                  ].map((tab) => {
                    let tabClass = "";
                    let indicatorClass = "";
                    if (tab.key === "Description") {
                      tabClass = styles.tabDescription;
                      indicatorClass = styles.tabDescription;
                    } else if (tab.key === "Specifications") {
                      tabClass = styles.tabSpecifications;
                      indicatorClass = styles.tabSpecifications;
                    } else if (tab.key === "Hashtags") {
                      tabClass = styles.tabHashtags;
                      indicatorClass = styles.tabHashtags;
                    } else if (tab.key === "Table") {
                      tabClass = styles.tabTable;
                      indicatorClass = styles.tabTable;
                    }
                    return (
                      <div
                        key={tab.key}
                        className={`${styles.tab} ${activeLeftTab === tab.key ? styles.active : ""} ${
                          activeLeftTab === tab.key ? tabClass : ""
                        }`}
                        onClick={() =>
                          productDispatch({
                            type: "SET_ACTIVE_LEFT_TAB",
                            payload: tab.key,
                          })
                        }>
                        <div className={`${styles.tabIndicatorWrapper}`}>
                          {activeLeftTab === tab.key && <div className={`${styles.tabIndicator} ${indicatorClass}`} />}
                        </div>
                        {tab.label}
                      </div>
                    );
                  })}
                </header>

                <div className={styles.tabContent}>
                  {/* ----------------- description----------------- */}
                  {activeLeftTab === "Description" && (
                    <div className={styles.contentSection}>
                      <div className={styles.descriptionContent}>
                        <h4 className="title">{t(LanguageKey.product_productDescription)}</h4>

                        {product?.description && JSON.parse(product?.description).description ? (
                          <div
                            className={styles.formattedText}
                            dangerouslySetInnerHTML={{
                              __html: JSON.parse(product?.description).description,
                            }}
                          />
                        ) : (
                          <span className={styles.emptycontent}>{t(LanguageKey.Nodescriptionavailable)}</span>
                        )}
                      </div>

                      <div className={styles.descriptionContent}>
                        <h4 className="title">{t(LanguageKey.product_instagramcaption)}</h4>
                        {product?.shortProduct?.caption ? (
                          <div className={styles.formattedText}>{product.shortProduct.caption}</div>
                        ) : (
                          <span className={styles.emptycontent}>{t(LanguageKey.Nodescriptionavailable)}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* ----------------- Specifications----------------- */}
                  {activeLeftTab === "Specifications" && (
                    <div className={styles.contentSection}>
                      {product!.specifications &&
                      Array.isArray(product!.specifications) &&
                      product!.specifications.length > 0 ? (
                        product!.specifications.map((spec, idx) => (
                          <div key={idx} className={styles.specItem}>
                            <span className={styles.specKey}>{spec.key}:</span>
                            <span className={styles.specValue}>{spec.value}</span>
                          </div>
                        ))
                      ) : (
                        <span className={styles.emptycontent}>{t(LanguageKey.NoSpecificationsavailable)}</span>
                      )}
                    </div>
                  )}
                  {/* ----------------- Hashtags----------------- */}
                  {activeLeftTab === "Hashtags" && (
                    <div className={styles.contentSection}>
                      <div className={styles.hashtagListItem}>
                        {hashtags.map((h, i) => (
                          <div
                            key={i}
                            className={`${styles.tagHashtag} ${/[\u0600-\u06FF]/.test(h) ? styles.rtlTag : ""}`}>
                            <img className={styles.hashtagicon} title="ℹ️ hashtag" alt="#" src={"/icon-hashtag.svg"} />
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* ----------------- Table ----------------- */}
                  {activeLeftTab === "Table" &&
                    product?.description &&
                    handleDecompress(
                      (
                        JSON.parse(product.description) as {
                          description: string;
                          sizeTable: string;
                        }
                      ).sizeTable,
                    ) && (
                      <div
                        className={styles.tablePreview}
                        dangerouslySetInnerHTML={{
                          __html: handleDecompress(JSON.parse(product.description).sizeTable)!,
                        }}
                      />
                    )}
                </div>
              </div>
              <div className={styles.rightTab}>
                <header className={styles.tabs}>
                  {[
                    { key: "Comments", label: t(LanguageKey.comments) },
                    {
                      key: "Reviews",
                      label: t(LanguageKey.marketPropertiesReviews),
                    },
                    // { key: "Q&A", label: t(LanguageKey.QandA) },
                    // do not delete this line
                    {
                      key: "Similar Products",
                      label: t(LanguageKey.SimilarProducts),
                    },
                  ].map((tab) => {
                    let tabClass = "";
                    let indicatorClass = "";
                    if (tab.key.startsWith("Comments")) {
                      tabClass = styles.tabComments;
                      indicatorClass = styles.tabComments;
                    } else if (tab.key.startsWith("Reviews")) {
                      tabClass = styles.tabReviews;
                      indicatorClass = styles.tabReviews;
                    } else if (tab.key.startsWith("Similar")) {
                      tabClass = styles.tabSimilar;
                      indicatorClass = styles.tabSimilar;
                    } else if (tab.key === "Q&A") {
                      tabClass = styles.tabQA;
                      indicatorClass = styles.tabQA;
                    }
                    return (
                      <div
                        key={tab.key}
                        className={`${styles.tab} ${activeRightTab === tab.key ? styles.active : ""} ${
                          activeRightTab === tab.key ? tabClass : ""
                        }`}
                        onClick={() =>
                          productDispatch({
                            type: "SET_ACTIVE_RIGHT_TAB",
                            payload: tab.key,
                          })
                        }>
                        <div className={styles.tabIndicatorWrapper}>
                          {activeRightTab === tab.key && <div className={`${styles.tabIndicator} ${indicatorClass}`} />}
                        </div>
                        {tab.label}
                      </div>
                    );
                  })}
                </header>

                <div className={styles.tabContent}>
                  {/* ----------------- Comments----------------- */}
                  {activeRightTab.startsWith("Comments") && !loading && (
                    <div className={styles.commentsListWrapper}>
                      {comments.comments.map((comment, index) => (
                        <div key={index} className={styles.commentCard}>
                          <div className="headerandinput">
                            <div className={`headerparent translate`}>
                              <div className="instagramprofile">
                                <img
                                  src={baseMediaUrl + comment.profileUrl}
                                  alt={comment.username}
                                  className="instagramimage"
                                />
                                <div className="instagramprofiledetail" style={{ maxWidth: "250px" }}>
                                  <div className="instagramusername">{comment.username}</div>
                                  <div className="instagramid" style={{ fontWeight: "400" }}>
                                    <span>
                                      {new DateObject({
                                        date: comment.createdTime / 1000,
                                        calendar: initialzedTime().calendar,
                                        locale: initialzedTime().locale,
                                      }).format("YYYY/MM/DD - HH:mm")}{" "}
                                    </span>
                                    • <span>{formatTimeAgo(comment.createdTime / 1000)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className={styles.commentLike}>
                                {comment.likeCount > 0 && (
                                  <>
                                    {comment.likeCount}
                                    <img
                                      style={{ width: "16px", height: "16px" }}
                                      title="ℹ️ like count"
                                      src="/icon-like.svg"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                            <div
                              className={styles.commentText}
                              style={{
                                direction: /^[\u0600-\u06FF]/.test(comment.text) ? "rtl" : "ltr",
                                textAlign: /^[\u0600-\u06FF]/.test(comment.text) ? "right" : "left",
                              }}>
                              {comment.text}
                            </div>
                          </div>
                          {comment.replys &&
                            comment.replys.map((reply, idx) => (
                              <div key={idx} className={styles.commentCard}>
                                <div className="headerandinput">
                                  <div className={`headerparent translate`}>
                                    <div className="instagramprofile">
                                      <img
                                        src={baseMediaUrl + reply.profileUrl}
                                        alt={reply.username}
                                        className="instagramimage"
                                      />
                                      <div className="instagramprofiledetail" style={{ maxWidth: "250px" }}>
                                        <div className="instagramusername">{reply.username}</div>
                                        <div className="instagramid">
                                          <span>
                                            {new DateObject({
                                              date: reply.createdTime / 1000,
                                              calendar: initialzedTime().calendar,
                                              locale: initialzedTime().locale,
                                            }).format("YYYY/MM/DD - HH:mm")}{" "}
                                          </span>
                                          • <span>{formatTimeAgo(comment.createdTime / 1000)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={styles.commentText}
                                    style={{
                                      direction: /^[\u0600-\u06FF]/.test(reply.text) ? "rtl" : "ltr",
                                      textAlign: /^[\u0600-\u06FF]/.test(reply.text) ? "right" : "left",
                                    }}>
                                    {reply.text}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* ----------------- Reviews----------------- */}
                  {activeRightTab.startsWith("Reviews") && (
                    <div className={styles.contentSection}>
                      <div className="soon" style={{ height: "200px" }}></div>
                    </div>
                  )}
                  {/* ----------------- Similar----------------- */}
                  {activeRightTab.startsWith("Similar") && similarProducts.length > 0 && (
                    <div className={styles.productSection}>
                      {similarProducts.map((product) => (
                        <div
                          className={styles.productCard}
                          key={product.shortProduct.productId}
                          onClick={() =>
                            router.push(
                              `/user/shop/${product.shortProduct.instagramerId}/product/${product.shortProduct.productId}`,
                            )
                          }>
                          <div className={styles.productImageparent}>
                            <img
                              className={styles.productImage}
                              title={product.shortProduct.title}
                              loading="lazy"
                              decoding="async"
                              alt={product.shortProduct.title}
                              src={baseMediaUrl + product.shortProduct.thumbnailMediaUrl}
                            />
                            <div className={styles.likesCounters}>
                              <img
                                style={{
                                  cursor: "pointer",
                                  width: "16px",
                                  height: "16px",
                                }}
                                title="ℹ️ like count"
                                alt="like count"
                                src="/icon-isLiked.svg"
                              />
                              <span>{product.shortProduct.likeCount}</span>
                            </div>
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
                                          100,
                                      ) / 100}
                                      %
                                    </span>
                                  </div>
                                )}
                                <div className={styles.finalPrice}>
                                  <PriceFormater
                                    pricetype={product.shortProduct.priceType}
                                    // اگر تخفیف وجود داشت، قیمت تخفیف خورده را نمایش بده، در غیر این صورت کمترین قیمت را
                                    fee={
                                      product.shortProduct.maxPrice - product.shortProduct.maxDiscountPrice !== 0
                                        ? product.shortProduct.maxDiscountPrice
                                        : product.shortProduct.minDiscountPrice
                                    }
                                    className={PriceFormaterClassName.PostPrice}
                                  />
                                </div>
                              </div>

                              {renderAvailabilityStatus(product.shortProduct.availabilityStatus)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* ----------------- Similar----------------- */}
                  {activeRightTab === "Q&A" && (
                    <div className={styles.contentSection}>
                      <p>This section shows Q&amp;A.</p>
                      {/* Add Q&A layout here */}
                    </div>
                  )}
                </div>
              </div>
            </section>
            <Modal
              closePopup={() =>
                uiDispatch({
                  type: "SET_SHOW_PRICE_HISTORY",
                  payload: false,
                })
              }
              classNamePopup={"popup"}
              style={{
                maxWidth: "700px",
                width: "100%",
                justifyContent: "flex-start",
              }}
              showContent={showPriceHistory}>
              <PriceHistory
                removeMask={() =>
                  uiDispatch({
                    type: "SET_SHOW_PRICE_HISTORY",
                    payload: false,
                  })
                }
                instagramerId={(shopId as string) || ""}
                productId={(productId as string) || ""}
              />
            </Modal>
            <Modal
              closePopup={() =>
                uiDispatch({
                  type: "SET_SHOW_REPORT_PRODUCT",
                  payload: false,
                })
              }
              classNamePopup={"popup"}
              showContent={showReportProduct}>
              <ReportProduct
                removeMask={() =>
                  uiDispatch({
                    type: "SET_SHOW_REPORT_PRODUCT",
                    payload: false,
                  })
                }
                productId={(productId as string) || ""}
                instagramerId={(shopId as string) || ""}
              />
            </Modal>
          </main>
        </>
      ))
    );
}
