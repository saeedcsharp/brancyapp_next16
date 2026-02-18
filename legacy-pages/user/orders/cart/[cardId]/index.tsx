import { t } from "i18next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useTransition } from "react";

import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/api";
import {
  IAddress,
  ICompleteProduct,
  ILogistic,
  InputTypeAddress,
  IShortShop,
  ISubProduct,
  IUpdateUserAddress,
} from "saeed/models/userPanel/orders";
import { ColorStr } from "saeed/models/userPanel/shop";

import IncrementStepper from "saeed/components/design/incrementStepper";
import Loading from "saeed/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";
import CardAddress from "saeed/components/userPanel/orders/card_adddress";
import Addresses from "saeed/components/userPanel/orders/popups/addresses";
import CreateAddresses from "saeed/components/userPanel/orders/popups/createAddress";
import UpdateAddresses from "saeed/components/userPanel/orders/popups/updateAddress";
import findSystemLanguage from "saeed/helper/findSystemLanguage";

import styles from "./cardId.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

// Interface for grouped shop data
interface IGroupedShop {
  instagramerId: number;
  shopInfo: IShortShop;
  products: ICompleteProduct[];
  totalPrice: number;
  totalDiscount: number;
}

// State management types
interface CartState {
  stores: ICompleteProduct[];
  expandedStores: number[];
  deletedProducts: { sub: ISubProduct; productId: number }[];
  undoTimeouts: Record<number, NodeJS.Timeout>;
  timers: Record<number, number>;
  addCartLoading: number | null;
  addresses: IAddress[];
  copiedAddresses: IAddress[];
  inputTypeAddress: InputTypeAddress | null;
  prevAddressId: number | null;
  deletedAddress: IAddress | null;
  logisticPrice: ILogistic[];
  selectedLogisticId: number | null;
  isMobile: boolean;
  hoveredOrder: number | null;
  loading: boolean;
  loadingCard: boolean;
  showAddress: boolean;
  showAddresses: boolean;
  showCreateAddress: InputTypeAddress | null;
  showUpdateAddress: IAddress | null;
  showSetting: number | null;
}

type CartAction =
  | { type: "SET_STORES"; payload: ICompleteProduct[] }
  | { type: "SET_EXPANDED_STORES"; payload: number[] }
  | { type: "TOGGLE_STORE"; payload: number }
  | { type: "ADD_DELETED_PRODUCT"; payload: { sub: ISubProduct; productId: number } }
  | { type: "REMOVE_DELETED_PRODUCT"; payload: number }
  | { type: "SET_UNDO_TIMEOUT"; payload: { id: number; timeout: NodeJS.Timeout } }
  | { type: "CLEAR_UNDO_TIMEOUT"; payload: number }
  | { type: "SET_TIMER"; payload: { id: number; time: number } }
  | { type: "UPDATE_TIMERS" }
  | { type: "SET_ADD_CART_LOADING"; payload: number | null }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; subProductId: number; quantity: number } }
  | { type: "REMOVE_PRODUCT"; payload: { productId: number; subProductId: number } }
  | { type: "RESTORE_PRODUCT"; payload: { productId: number; sub: ISubProduct } }
  | { type: "SET_ADDRESSES"; payload: IAddress[] }
  | { type: "SET_COPIED_ADDRESSES"; payload: IAddress[] }
  | { type: "SET_INPUT_TYPE_ADDRESS"; payload: InputTypeAddress | null }
  | { type: "SET_PREV_ADDRESS_ID"; payload: number | null }
  | { type: "SET_DELETED_ADDRESS"; payload: IAddress | null }
  | { type: "SET_LOGISTIC_PRICE"; payload: ILogistic[] }
  | { type: "SET_SELECTED_LOGISTIC_ID"; payload: number | null }
  | { type: "UPDATE_DEFAULT_ADDRESS"; payload: number }
  | { type: "SET_IS_MOBILE"; payload: boolean }
  | { type: "SET_HOVERED_ORDER"; payload: number | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOADING_CARD"; payload: boolean }
  | { type: "SET_SHOW_ADDRESS"; payload: boolean }
  | { type: "SET_SHOW_ADDRESSES"; payload: boolean }
  | { type: "SET_SHOW_CREATE_ADDRESS"; payload: InputTypeAddress | null }
  | { type: "SET_SHOW_UPDATE_ADDRESS"; payload: IAddress | null }
  | { type: "SET_SHOW_SETTING"; payload: number | null };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_STORES":
      return { ...state, stores: action.payload };

    case "SET_EXPANDED_STORES":
      return { ...state, expandedStores: action.payload };

    case "TOGGLE_STORE":
      return {
        ...state,
        expandedStores: state.expandedStores.includes(action.payload)
          ? state.expandedStores.filter((id) => id !== action.payload)
          : [...state.expandedStores, action.payload],
      };

    case "ADD_DELETED_PRODUCT":
      return {
        ...state,
        deletedProducts: [...state.deletedProducts, action.payload],
      };

    case "REMOVE_DELETED_PRODUCT":
      return {
        ...state,
        deletedProducts: state.deletedProducts.filter((p) => p.sub.subProductId !== action.payload),
      };

    case "SET_UNDO_TIMEOUT":
      return {
        ...state,
        undoTimeouts: { ...state.undoTimeouts, [action.payload.id]: action.payload.timeout },
      };

    case "CLEAR_UNDO_TIMEOUT":
      const { [action.payload]: _, ...restTimeouts } = state.undoTimeouts;
      const { [action.payload]: __, ...restTimers } = state.timers;
      return {
        ...state,
        undoTimeouts: restTimeouts,
        timers: restTimers,
      };

    case "SET_TIMER":
      return {
        ...state,
        timers: { ...state.timers, [action.payload.id]: action.payload.time },
      };

    case "UPDATE_TIMERS":
      const newTimers = { ...state.timers };
      Object.keys(newTimers).forEach((key) => {
        const numericKey = Number(key);
        if (newTimers[numericKey] > 0) {
          newTimers[numericKey] -= 1;
        }
      });
      return { ...state, timers: newTimers };

    case "SET_ADD_CART_LOADING":
      return { ...state, addCartLoading: action.payload };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        stores: state.stores.map((product) =>
          product.shortProduct.productId !== action.payload.productId
            ? product
            : {
                ...product,
                subProducts: product.subProducts.map((sub) =>
                  sub.subProductId !== action.payload.subProductId
                    ? sub
                    : { ...sub, cardCount: action.payload.quantity }
                ),
              }
        ),
      };

    case "REMOVE_PRODUCT":
      return {
        ...state,
        stores: state.stores
          .map((product) =>
            product.shortProduct.productId !== action.payload.productId
              ? product
              : {
                  ...product,
                  subProducts: product.subProducts.filter((sub) => sub.subProductId !== action.payload.subProductId),
                }
          )
          .filter((product) => product.subProducts.length > 0),
      };

    case "RESTORE_PRODUCT":
      return {
        ...state,
        stores: state.stores.map((product) =>
          product.shortProduct.productId !== action.payload.productId
            ? product
            : {
                ...product,
                subProducts: [...product.subProducts, action.payload.sub],
              }
        ),
      };

    case "SET_ADDRESSES":
      return { ...state, addresses: action.payload };

    case "SET_COPIED_ADDRESSES":
      return { ...state, copiedAddresses: action.payload };

    case "SET_INPUT_TYPE_ADDRESS":
      return { ...state, inputTypeAddress: action.payload };

    case "SET_PREV_ADDRESS_ID":
      return { ...state, prevAddressId: action.payload };

    case "SET_DELETED_ADDRESS":
      return { ...state, deletedAddress: action.payload };

    case "SET_LOGISTIC_PRICE":
      return { ...state, logisticPrice: action.payload };

    case "SET_SELECTED_LOGISTIC_ID":
      return { ...state, selectedLogisticId: action.payload };

    case "UPDATE_DEFAULT_ADDRESS":
      const prevDefault = state.addresses.find((addr) => addr.isDefault);
      return {
        ...state,
        prevAddressId: prevDefault?.id || null,
        addresses: state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === action.payload,
        })),
      };

    case "SET_IS_MOBILE":
      return { ...state, isMobile: action.payload };

    case "SET_HOVERED_ORDER":
      return { ...state, hoveredOrder: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_LOADING_CARD":
      return { ...state, loadingCard: action.payload };

    case "SET_SHOW_ADDRESS":
      return { ...state, showAddress: action.payload };

    case "SET_SHOW_ADDRESSES":
      return { ...state, showAddresses: action.payload };

    case "SET_SHOW_CREATE_ADDRESS":
      return { ...state, showCreateAddress: action.payload };

    case "SET_SHOW_UPDATE_ADDRESS":
      return { ...state, showUpdateAddress: action.payload };

    case "SET_SHOW_SETTING":
      return { ...state, showSetting: action.payload };

    default:
      return state;
  }
};

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const OrdersCart = () => {
  const router = useRouter();
  const { cardId } = router.query;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => router.push("/"),
  });

  const componentId = useId();
  const [isPending, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Initial state for useReducer
  const initialState: CartState = {
    stores: [],
    expandedStores: [],
    deletedProducts: [],
    undoTimeouts: {},
    timers: {},
    addCartLoading: null,
    addresses: [],
    copiedAddresses: [],
    inputTypeAddress: null,
    prevAddressId: null,
    deletedAddress: null,
    logisticPrice: [],
    selectedLogisticId: null,
    isMobile: false,
    hoveredOrder: null,
    loading: true,
    loadingCard: false,
    showAddress: false,
    showAddresses: false,
    showCreateAddress: null,
    showUpdateAddress: null,
    showSetting: null,
  };

  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Memoized calculations with better performance
  const totalPrice = useMemo(() => {
    return state.stores.reduce(
      (total: number, product: ICompleteProduct) =>
        total + product.subProducts.reduce((sum: number, sub: ISubProduct) => sum + sub.mainPrice * sub.cardCount, 0),
      0
    );
  }, [state.stores]);

  const totalDiscount = useMemo(() => {
    return state.stores.reduce(
      (total: number, product: ICompleteProduct) =>
        total +
        product.subProducts.reduce(
          (sum: number, sub: ISubProduct) => sum + (sub.mainPrice - sub.price) * sub.cardCount,
          0
        ),
      0
    );
  }, [state.stores]);

  // Memoized grouped shops with optimized performance
  const groupedShops = useMemo((): IGroupedShop[] => {
    const shopMap = new Map<number, IGroupedShop>();

    state.stores.forEach((product: ICompleteProduct) => {
      const instagramerId = product.shortProduct.instagramerId;

      if (!shopMap.has(instagramerId)) {
        const shopInfo: IShortShop = product.shortShop || {
          lastUpdate: 0,
          instagramerId: instagramerId,
          username: `Shop ${instagramerId}`,
          fullName: null,
          productCount: 0,
          followerCount: 0,
          bannerUrl: "",
          priceType: product.shortProduct.priceType,
          profileUrl: product.shortProduct.thumbnailMediaUrl,
        };

        shopMap.set(instagramerId, {
          instagramerId,
          shopInfo,
          products: [],
          totalPrice: 0,
          totalDiscount: 0,
        });
      }

      const shopGroup = shopMap.get(instagramerId)!;
      shopGroup.products.push(product);

      product.subProducts.forEach((sub: ISubProduct) => {
        shopGroup.totalPrice += sub.price * sub.cardCount;
        shopGroup.totalDiscount += (sub.mainPrice - sub.price) * sub.cardCount;
      });
    });

    return Array.from(shopMap.values());
  }, [state.stores]);

  // Enhanced keyboard navigation handler
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          if (state.showUpdateAddress) {
            dispatch({ type: "SET_SHOW_UPDATE_ADDRESS", payload: null });
            dispatch({ type: "SET_SHOW_ADDRESSES", payload: true });
          } else if (state.showCreateAddress) {
            dispatch({ type: "SET_SHOW_CREATE_ADDRESS", payload: null });
          } else if (state.showAddresses) {
            dispatch({ type: "SET_ADDRESSES", payload: structuredClone(state.copiedAddresses) });
            dispatch({ type: "SET_SHOW_ADDRESSES", payload: false });
            dispatch({ type: "SET_SHOW_SETTING", payload: null });
            dispatch({ type: "SET_DELETED_ADDRESS", payload: null });
          }
          break;
        case "Enter":
          if (state.showAddress && state.stores.length > 0) {
            const continueButton = document.querySelector(".saveButton") as HTMLButtonElement;
            continueButton?.click();
          }
          break;
      }
    },
    [
      state.showUpdateAddress,
      state.showCreateAddress,
      state.showAddresses,
      state.copiedAddresses,
      state.showAddress,
      state.stores.length,
    ]
  );

  // Optimized callbacks with proper cleanup
  const toggleStore = useCallback((storeId: number) => {
    dispatch({ type: "TOGGLE_STORE", payload: storeId });
  }, []);

  const deleteProduct = useCallback(
    async (productId: number, subProductId: number) => {
      const product = state.stores.find((p: ICompleteProduct) => p.productId === productId);
      const subProduct = product?.subProducts.find((x: ISubProduct) => x.subProductId === subProductId);

      if (!subProduct) return;

      dispatch({ type: "ADD_DELETED_PRODUCT", payload: { productId, sub: subProduct } });
      dispatch({ type: "REMOVE_PRODUCT", payload: { productId, subProductId } });
      dispatch({ type: "SET_TIMER", payload: { id: subProductId, time: 5 } });

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const timeout = setTimeout(async () => {
        try {
          const res = await clientFetchApi<boolean, boolean>("/api/shop/AddCard", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "instagramerId", value: cardId!.toString() },
            { key: "productId", value: productId.toString() },
            { key: "subProductId", value: subProductId.toString() },
            { key: "count", value: "0" },
          ], onUploadProgress: undefined });

          if (res.succeeded) {
            dispatch({ type: "REMOVE_DELETED_PRODUCT", payload: subProductId });
          } else {
            notify(res.info.responseType, NotifType.Warning);
          }
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            notify(ResponseType.Unexpected, NotifType.Error);
          }
        }
      }, 5000);

      timeoutRefs.current.set(subProductId, timeout);
      dispatch({ type: "SET_UNDO_TIMEOUT", payload: { id: subProductId, timeout } });
    },
    [state.stores, session, cardId]
  );

  const undoDelete = useCallback(
    (productId: number, subProductId: number) => {
      const deletedProduct = state.deletedProducts.find(
        (p) => p.sub.subProductId === subProductId && p.productId === productId
      );

      if (deletedProduct) {
        dispatch({ type: "RESTORE_PRODUCT", payload: { productId, sub: deletedProduct.sub } });
        dispatch({ type: "REMOVE_DELETED_PRODUCT", payload: subProductId });

        const timeout = timeoutRefs.current.get(subProductId);
        if (timeout) {
          clearTimeout(timeout);
          timeoutRefs.current.delete(subProductId);
        }
        dispatch({ type: "CLEAR_UNDO_TIMEOUT", payload: subProductId });
      }
    },
    [state.deletedProducts]
  );

  const updateQuantity = useCallback(
    async (productId: number, subProductId: number, newQuantity: number) => {
      if (newQuantity < 1) {
        deleteProduct(productId, subProductId);
        return;
      }

      startTransition(async () => {
        try {
          dispatch({ type: "SET_ADD_CART_LOADING", payload: subProductId });

          const res = await clientFetchApi<boolean, boolean>("/api/shop/AddCard", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "instagramerId", value: cardId!.toString() },
            { key: "productId", value: productId.toString() },
            { key: "subProductId", value: subProductId.toString() },
            { key: "count", value: newQuantity.toString() },
          ], onUploadProgress: undefined });

          if (res.succeeded) {
            dispatch({ type: "UPDATE_QUANTITY", payload: { productId, subProductId, quantity: newQuantity } });
          } else {
            notify(res.info.responseType, NotifType.Warning);
          }
        } catch (error) {
          notify(ResponseType.Unexpected, NotifType.Error);
        } finally {
          dispatch({ type: "SET_ADD_CART_LOADING", payload: null });
        }
      });
    },
    [session, cardId, deleteProduct, startTransition]
  );
  // API functions with improved error handling and abort control
  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await clientFetchApi<boolean, ICompleteProduct[]>("/api/shop/GetInstagramerCard", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "instagramerId", value: cardId?.toString() },
          { key: "language", value: findSystemLanguage().toString() },
        ], onUploadProgress: undefined });

      if (res.succeeded) {
        const filteredProducts = res.value.map((product: ICompleteProduct) => ({
          ...product,
          subProducts: product.subProducts.filter((sub: ISubProduct) => sub.cardCount > 0),
        }));

        dispatch({ type: "SET_STORES", payload: filteredProducts });

        const uniqueInstagramerIds = [
          ...new Set(res.value.map((store: ICompleteProduct) => store.shortProduct.instagramerId)),
        ];
        dispatch({ type: "SET_EXPANDED_STORES", payload: uniqueInstagramerIds });
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [session, cardId]);

  const getLogisticPrice = useCallback(
    async (addressId: number) => {
      try {
        const res = await clientFetchApi<boolean, ILogistic[]>("/api/shop/GetLogesticPrice", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "instagramerId", value: cardId as string },
            { key: "addressId", value: addressId.toString() },
            { key: "language", value: findSystemLanguage().toString() },
          ], onUploadProgress: undefined });

        if (res.succeeded) {
          dispatch({ type: "SET_LOGISTIC_PRICE", payload: res.value });
          if (res.value.length > 0) {
            dispatch({ type: "SET_SELECTED_LOGISTIC_ID", payload: res.value[0].id });
          }
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, cardId]
  );

  const fetchAddresses = useCallback(async () => {
    if (state.addresses.length > 0) {
      dispatch({ type: "SET_SHOW_ADDRESS", payload: true });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await clientFetchApi<boolean, IAddress[]>("/api/address/GetAddresses", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        if (res.value.length > 0) {
          const defaultAddress = res.value.find((x: IAddress) => x.isDefault);
          if (defaultAddress) {
            await getLogisticPrice(defaultAddress.id);
          }
        }
        dispatch({ type: "SET_ADDRESSES", payload: res.value });
        dispatch({ type: "SET_SHOW_ADDRESS", payload: true });
        await handleGetAddressInputType();
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [state.addresses.length, session, getLogisticPrice]);

  const handleGetAddressInputType = useCallback(async () => {
    try {
      const res = await clientFetchApi<boolean, InputTypeAddress>("/api/address/GetAddressInputType", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        dispatch({ type: "SET_INPUT_TYPE_ADDRESS", payload: res.value });
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session]);

  const handleUpdateUserAddress = useCallback(
    (newAddress: IAddress, fromUpdateAddress?: boolean) => {
      const updatedAddresses = state.addresses.map((address: IAddress) => ({
        ...address,
        isDefault: fromUpdateAddress === undefined ? false : address.isDefault,
      }));

      const index = updatedAddresses.findIndex((address: IAddress) => address.id === newAddress.id);
      if (index !== -1 && fromUpdateAddress === undefined) {
        updatedAddresses[index] = { ...newAddress, isDefault: true };
      } else if (index === -1) {
        updatedAddresses.push({ ...newAddress, isDefault: true });
      }

      dispatch({ type: "SET_ADDRESSES", payload: updatedAddresses });

      if (!fromUpdateAddress) {
        dispatch({ type: "SET_SHOW_CREATE_ADDRESS", payload: null });
      } else {
        dispatch({ type: "SET_SHOW_UPDATE_ADDRESS", payload: null });
        dispatch({ type: "SET_SHOW_ADDRESS", payload: true });
      }
    },
    [state.addresses]
  );

  const handleSelectLogistic = useCallback(
    (id: number) => {
      const updatedLogistics = state.logisticPrice.map((x: ILogistic) =>
        x.id !== id ? { ...x, selectedId: null } : { ...x, selectedId: id }
      );
      dispatch({ type: "SET_LOGISTIC_PRICE", payload: updatedLogistics });
    },
    [state.logisticPrice]
  );

  const handleUpdateDefaultAddress = useCallback(async () => {
    dispatch({ type: "SET_LOADING_CARD", payload: true });
    dispatch({ type: "SET_SHOW_ADDRESSES", payload: false });

    const address = state.addresses.find((addresses: IAddress) => addresses.isDefault);
    if (!address) return;

    const updatedAddress: IUpdateUserAddress = {
      addressId: address.id,
      note: address.note,
      receiver: address.receiver,
      subject: address.subject,
    };

    try {
      const res = await clientFetchApi<boolean, IUpdateUserAddress>("/api/address/UpdateUserAddress", { methodType: MethodType.post, session: session, data: updatedAddress, queries: undefined, onUploadProgress: undefined });

      if (res.succeeded) {
        dispatch({ type: "SET_PREV_ADDRESS_ID", payload: null });
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
      dispatch({ type: "SET_LOADING_CARD", payload: false });
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [state.addresses, session]);

  const handleDeleteAddress = useCallback(
    (address: IAddress) => {
      if (address.isDefault) {
        internalNotify(InternalResponseType.AutoGeneralOff, NotifType.Info);
        return;
      }
      dispatch({ type: "SET_DELETED_ADDRESS", payload: address });
      const filteredAddresses = state.addresses.filter((x: IAddress) => x !== address);
      dispatch({ type: "SET_ADDRESSES", payload: filteredAddresses });
    },
    [state.addresses]
  );

  // Effects with proper cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "UPDATE_TIMERS" });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      dispatch({ type: "SET_IS_MOBILE", payload: window.innerWidth <= 1100 });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!session || !cardId) return;
    fetchData();
  }, [session, cardId, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  // Early return for authentication
  if (session && session.user.currentIndex > -1) {
    router.push("/");
    return null;
  }

  return (
    session?.user.currentIndex === -1 && (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.Storeproduct_incart)}</title>
          <meta
            name="description"
            content="Manage your cart and orders efficiently with Bran.cy - Your trusted shopping companion"
          />
          <meta name="keywords" content="cart, orders, shopping, products, checkout, Brancy, e-commerce" />
          <meta name="robots" content="index, follow" />
          <meta name="theme-color" content="#1976d2" />
          <link rel="canonical" href={`https://www.Brancy.app/user/orders/cart/${cardId}`} />
          <meta property="og:title" content={`Shopping Cart - ${t(LanguageKey.Storeproduct_incart)}`} />
          <meta property="og:description" content="Manage your cart and orders efficiently with Bran.cy" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`https://www.Brancy.app/user/orders/cart/${cardId}`} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`Shopping Cart - ${t(LanguageKey.Storeproduct_incart)}`} />
          <meta name="twitter:description" content="Manage your cart and orders efficiently with Bran.cy" />
          <link rel="preload" href="/no-profile.svg" as="image" />
          <link rel="preload" href="/delete.svg" as="image" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org/",
                "@type": "WebPage",
                name: "Shopping Cart",
                description: "Manage your cart and orders efficiently",
                url: `https://www.Brancy.app/user/orders/cart/${cardId}`,
                mainEntity: {
                  "@type": "ShoppingCart",
                  itemListElement: state.stores.map((product, index) => ({
                    "@type": "Product",
                    position: index + 1,
                    name: product.shortProduct.title,
                    image: basePictureUrl + product.shortProduct.thumbnailMediaUrl,
                    offers: {
                      "@type": "Offer",
                      priceCurrency: "USD",
                      price: product.subProducts[0]?.price || 0,
                      availability: "https://schema.org/InStock",
                    },
                  })),
                },
              }),
            }}
          />
        </Head>

        <main className={styles.pinContainer} role="main" aria-label="Shopping cart">
          {state.loading && <Loading />}

          {!state.loading && !state.showAddress && (
            <>
              <div className={styles.cart}>
                {state.stores.length > 0 ? (
                  <div className={styles.products} role="region" aria-label="Products in cart">
                    {groupedShops.map((shop) => (
                      <article
                        key={shop.instagramerId}
                        className={styles.cartlist}
                        style={{
                          opacity: state.hoveredOrder === shop.instagramerId ? 0.9 : 1,
                          transform: state.hoveredOrder === shop.instagramerId ? "scale(1.02)" : "scale(1)",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onMouseEnter={() => dispatch({ type: "SET_HOVERED_ORDER", payload: shop.instagramerId })}
                        onMouseLeave={() => dispatch({ type: "SET_HOVERED_ORDER", payload: null })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            toggleStore(shop.instagramerId);
                          }
                        }}>
                        <header className="frameParent" style={{ height: "40px" }}>
                          <div className="instagramprofile">
                            <span
                              className={styles.productcounter}
                              aria-label={`${shop.products.reduce(
                                (sum, product) =>
                                  sum +
                                  product.subProducts.reduce((subSum, subProduct) => subSum + subProduct.cardCount, 0),
                                0
                              )} items in this shop`}>
                              {shop.products.reduce(
                                (sum, product) =>
                                  sum +
                                  product.subProducts.reduce((subSum, subProduct) => subSum + subProduct.cardCount, 0),
                                0
                              )}
                              X
                            </span>
                            <img
                              loading="lazy"
                              decoding="async"
                              style={{ width: "24px", height: "24px" }}
                              className="instagramimage"
                              alt={`${shop.shopInfo.username} profile`}
                              src={basePictureUrl + shop.shopInfo.profileUrl}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/no-profile.svg";
                              }}
                            />
                            <div className="instagramprofiledetail" style={{ gap: "0" }}>
                              <h3 className={styles.storename}>{shop.shopInfo.username}</h3>
                              {shop.shopInfo.fullName && shop.shopInfo.fullName.length && (
                                <div className="instagramid">{shop.shopInfo.fullName}</div>
                              )}
                            </div>
                          </div>
                          <div className={styles.totalpriceandshowbtn}>
                            <PriceFormater
                              pricetype={shop.shopInfo.priceType}
                              fee={shop.totalPrice}
                              className={PriceFormaterClassName.PostPrice}
                            />
                            <button
                              onClick={() => toggleStore(shop.instagramerId)}
                              className={`${styles.showbtn} ${
                                !state.expandedStores.includes(shop.instagramerId) ? styles.collapsed : ""
                              }`}
                              aria-expanded={state.expandedStores.includes(shop.instagramerId)}
                              aria-label="Toggle store products visibility"
                              type="button">
                              <svg width="21" height="21" viewBox="0 0 22 22" fill="none">
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
                            </button>
                          </div>
                        </header>

                        <div
                          className={`${styles.productlist} ${
                            !state.expandedStores.includes(shop.instagramerId) ? styles.collapsed : ""
                          }`}
                          role="list"
                          aria-label="Products in this shop">
                          {shop.products.map((product) =>
                            product.subProducts.map((sub) => (
                              <div key={sub.subProductId} className={styles.product} role="listitem">
                                <div className={styles.left}>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/user/shop/${product.shortProduct.instagramerId}/product/${product.productId}?subProductId=${sub.subProductId}`
                                      );
                                    }}
                                    className={styles.productimage}
                                    aria-label={`View ${product.shortProduct.title} details`}
                                    type="button">
                                    <img
                                      className={styles.productimage}
                                      loading="lazy"
                                      decoding="async"
                                      src={basePictureUrl + product.shortProduct.thumbnailMediaUrl}
                                      alt={product.shortProduct.title}
                                    />
                                  </button>
                                  <div className={styles.nameandvariation}>
                                    <h4 className={styles.productname}>{product.shortProduct.title}</h4>
                                    <div className={styles.variationlist}>
                                      {product.isColorVariation && (
                                        <div className={styles.variation}>
                                          <span className={styles.variationname}>{t(LanguageKey.color)}</span>
                                          <div className={styles.variationvalue}>
                                            <div
                                              className={styles.tagcolor}
                                              style={{ backgroundColor: ColorStr[sub.colorId!] }}
                                              aria-label={`Color: ${ColorStr[sub.colorId!]}`}
                                            />
                                          </div>
                                        </div>
                                      )}
                                      {sub.variations.map((variation, variationIndex) => (
                                        <div key={variationIndex} className={styles.variation}>
                                          <span className={styles.variationname}>
                                            {product.variations[variationIndex]}:
                                          </span>
                                          <span className={styles.variationvalue}>{variation}</span>
                                        </div>
                                      ))}
                                      {sub.customVariation && (
                                        <div key={`custom-${sub.subProductId}`} className={styles.variation}>
                                          <span className={styles.variationname}>{product.customVariation}</span>
                                          <span className={styles.variationvalue}>{sub.customVariation}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.right}>
                                  <div
                                    className="headerandinput"
                                    style={{
                                      alignItems: "flex-end",
                                      gap: "3px",
                                      minWidth: "max-content",
                                      width: "max-content",
                                    }}>
                                    <div
                                      className={`${styles.productaction} translate ${
                                        state.addCartLoading === sub.subProductId && "fadeDiv"
                                      }`}>
                                      <button
                                        onClick={() => deleteProduct(product.productId, sub.subProductId)}
                                        aria-label="Remove product from cart"
                                        type="button"
                                        style={{
                                          background: "none",
                                          border: "none",
                                          cursor: "pointer",
                                          width: "24px",
                                          height: "24px",
                                        }}>
                                        <img src="/delete.svg" alt="Remove product from cart" />
                                      </button>
                                      <IncrementStepper
                                        id={`${componentId}-quantity-${product.productId}-${sub.subProductId}`}
                                        data={sub.cardCount}
                                        increment={() => {
                                          const newQuantity = sub.cardCount + 1;
                                          if (newQuantity <= sub.stock) {
                                            updateQuantity(
                                              product.shortProduct.productId,
                                              sub.subProductId,
                                              newQuantity
                                            );
                                          }
                                        }}
                                        decrement={() => {
                                          const newQuantity = sub.cardCount - 1;
                                          updateQuantity(product.shortProduct.productId, sub.subProductId, newQuantity);
                                        }}
                                      />
                                    </div>
                                    <div className={styles.productQuantity}>
                                      <span>{t(LanguageKey.Storeproduct_stock)}:</span>
                                      <span
                                        className={`${styles.productQuantitycounter} ${
                                          sub.stock <= 3
                                            ? styles.lowStock
                                            : sub.stock <= 9
                                            ? styles.mediumStock
                                            : styles.highStock
                                        }`}>
                                        {sub.stock}
                                      </span>
                                    </div>
                                  </div>

                                  <div className={styles.pricesectionparent}>
                                    {sub.mainPrice - sub.price > 0 && (
                                      <PriceFormater
                                        pricetype={sub.priceType}
                                        fee={sub.mainPrice}
                                        className={PriceFormaterClassName.PostPrice}
                                        style={{
                                          textDecoration: "line-through",
                                          opacity: 0.4,
                                        }}
                                      />
                                    )}
                                    <PriceFormater
                                      pricetype={sub.priceType}
                                      fee={sub.price}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {state.isMobile && (
                          <footer className={styles.ordersummary}>
                            <div className={styles.summarycontent}>
                              <div className={styles.pricerow}>
                                <span>{t(LanguageKey.navbar_totalOrders)}</span>
                                <PriceFormater
                                  pricetype={shop.shopInfo.priceType}
                                  fee={totalPrice}
                                  className={PriceFormaterClassName.PostPrice}
                                />
                              </div>

                              <div className={styles.discountrow}>
                                <span>{t(LanguageKey.product_Discount)}</span>
                                <PriceFormater
                                  pricetype={shop.shopInfo.priceType}
                                  fee={totalDiscount}
                                  className={PriceFormaterClassName.PostPrice}
                                />
                              </div>

                              <div className={styles.summarytotalprice}>
                                <span>{t(LanguageKey.total)}</span>
                                <PriceFormater
                                  pricetype={shop.shopInfo.priceType}
                                  fee={totalPrice - totalDiscount}
                                  className={PriceFormaterClassName.PostPrice}
                                />
                              </div>
                            </div>
                            <button
                              style={{ borderRadius: "var(--br25)", height: "40px" }}
                              className="saveButton"
                              onClick={fetchAddresses}
                              type="button">
                              {t(LanguageKey.Continue)}
                            </button>
                          </footer>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptycart} role="region" aria-label="Empty cart">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="150px"
                      fill="var(--color-gray)"
                      viewBox="0 0 36 36"
                      role="img"
                      aria-label="Empty cart icon">
                      <path d="M35.53 24.44a1.5 1.5 0 0 1 0 2.12L32.1 30l3.44 3.44a1.5 1.5 0 1 1-2.12 2.12l-3.44-3.44-3.44 3.44a1.5 1.5 0 0 1-2.12-2.12L27.85 30l-3.44-3.44a1.5 1.5 0 0 1 2.12-2.12l3.44 3.44 3.44-3.44a1.5 1.5 0 0 1 2.12 0M23.84 4.02a1.5 1.5 0 0 0-2.68 1.34l2.85 5.7h3.36zm-8.24-.7a1.5 1.5 0 0 1 .78 1.97l-5.25 12a1.5 1.5 0 0 1-2.76-1.2l5.26-12a1.5 1.5 0 0 1 1.97-.78M13.88 18.2c0-.62.5-1.13 1.12-1.13h6a1.13 1.13 0 0 1 0 2.25h-6a1.13 1.13 0 0 1-1.12-1.12" />
                      <path
                        opacity=".4"
                        d="m31.47 11.08-1.14-.02H5.67l-1.14.02q-.5.03-1.03.23a2.65 2.65 0 0 0-1.62 2.63 6 6 0 0 0 .17 1.24l.22.96a1.9 1.9 0 0 0 1.03 1.28c.55.27.91.75 1 1.28l1.05 6.1.51 2.78a7 7 0 0 0 2.21 3.84 6.3 6.3 0 0 0 3.38 1.24c1.27.15 2.88.15 4.88.15h3.34q2.39.02 4.06-.07L26.46 30l-2.73-2.73a2.5 2.5 0 0 1 3.54-3.54L30 26.46l.42-.41.22-1.25 1.05-6.1c.1-.53.46-1.01 1.01-1.28a1.9 1.9 0 0 0 1.03-1.28l.22-.97q.15-.6.17-1.23c.01-.45-.05-.97-.32-1.46a2.7 2.7 0 0 0-1.3-1.17c-.35-.15-.7-.2-1.03-.23"
                      />
                    </svg>

                    <h2 className="title">{t(LanguageKey.Storeproduct_yourcartisempty)}</h2>
                    <p className="explain">{t(LanguageKey.Storeproduct_noitemfounded)}</p>
                    <button
                      style={{ maxWidth: "300px" }}
                      className="saveButton"
                      onClick={() => router.push("/user/shop")}
                      type="button">
                      {t(LanguageKey.Startshoping)}
                    </button>
                  </div>
                )}

                {state.deletedProducts.map((deletedProduct) => (
                  <div key={deletedProduct.sub.subProductId} className={styles.undoPopupparent} role="alert">
                    <div className={styles.undoPopup}>
                      <div
                        className={styles.timerRing}
                        style={{
                          background: `conic-gradient(var(--color-dark-blue) ${
                            (state.timers[deletedProduct.sub.subProductId] / 5) * 360
                          }deg, var(--color-gray30) 0deg)`,
                        }}
                        aria-label={`${state.timers[deletedProduct.sub.subProductId]} seconds remaining`}>
                        {state.timers[deletedProduct.sub.subProductId]}s
                      </div>
                      <span>{t(LanguageKey.product_productdeleted)}</span>
                      <button
                        onClick={() => undoDelete(deletedProduct.productId, deletedProduct.sub.subProductId)}
                        type="button"
                        aria-label="Undo delete">
                        {t(LanguageKey.undo)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!state.isMobile && state.stores.length > 0 && (
                <aside className={styles.summary} role="complementary" aria-label="Order summary">
                  <div
                    className={styles.ordersummary}
                    onMouseEnter={() => dispatch({ type: "SET_HOVERED_ORDER", payload: parseInt(cardId! as string) })}
                    onMouseLeave={() => dispatch({ type: "SET_HOVERED_ORDER", payload: null })}>
                    <div className={styles.summarycontent}>
                      <div className={styles.pricerow}>
                        <span>
                          {state.stores.reduce(
                            (sum, product) =>
                              sum +
                              product.subProducts.reduce((subSum, subProduct) => subSum + subProduct.cardCount, 0),
                            0
                          )}{" "}
                          {t(LanguageKey.Storeorder_ITEM)}{" "}
                          {state.stores[0]?.shortShop?.fullName || state.stores[0]?.shortProduct?.username}
                        </span>
                      </div>
                      <div className={styles.pricerow}>
                        <span>{t(LanguageKey.navbar_totalOrders)}</span>
                        <PriceFormater
                          pricetype={state.stores[0].shortProduct.priceType}
                          fee={totalPrice}
                          className={PriceFormaterClassName.PostPrice}
                        />
                      </div>

                      <div className={styles.discountrow}>
                        <span>{t(LanguageKey.product_Discount)}</span>
                        <PriceFormater
                          pricetype={state.stores[0].shortProduct.priceType}
                          fee={totalDiscount}
                          className={PriceFormaterClassName.PostPrice}
                        />
                      </div>

                      <div className={styles.summarytotalprice}>
                        <span>{t(LanguageKey.total)}</span>
                        <PriceFormater
                          pricetype={state.stores[0].shortProduct.priceType}
                          fee={totalPrice - totalDiscount}
                          className={PriceFormaterClassName.PostPrice}
                        />
                      </div>
                    </div>
                    <button
                      style={{ borderRadius: "var(--br25)", height: "40px" }}
                      className="saveButton"
                      onClick={fetchAddresses}
                      type="button">
                      {t(LanguageKey.Continue)}
                    </button>
                  </div>
                </aside>
              )}
            </>
          )}

          {!state.loading && state.showAddress && (
            <CardAddress
              inputTypeAddress={state.inputTypeAddress}
              products={state.stores}
              addresses={state.addresses}
              loadingCard={state.loadingCard}
              setShowAddress={(show: boolean) => dispatch({ type: "SET_SHOW_ADDRESS", payload: show })}
              logisticPrice={state.logisticPrice}
              selectedLogisticId={state.selectedLogisticId}
              handleShowAddresses={(showAddress: boolean) => {
                const deepCopy = structuredClone(state.addresses);
                dispatch({ type: "SET_COPIED_ADDRESSES", payload: deepCopy });
                dispatch({ type: "SET_SHOW_ADDRESSES", payload: showAddress });
              }}
              handleShowCreateAddress={(inputType: InputTypeAddress) => {
                dispatch({ type: "SET_SHOW_CREATE_ADDRESS", payload: inputType });
              }}
              handleSelectLogistic={(id: number) => dispatch({ type: "SET_SELECTED_LOGISTIC_ID", payload: id })}
            />
          )}
        </main>
        {state.showAddresses && (
          <Addresses
            removeMask={() => {
              dispatch({ type: "SET_ADDRESSES", payload: structuredClone(state.copiedAddresses) });
              dispatch({ type: "SET_SHOW_ADDRESSES", payload: false });
              dispatch({ type: "SET_SHOW_SETTING", payload: null });
              dispatch({ type: "SET_DELETED_ADDRESS", payload: null });
            }}
            addresses={state.addresses}
            handleChangeDefaultAddress={(addressId: number) => {
              dispatch({ type: "UPDATE_DEFAULT_ADDRESS", payload: addressId });
            }}
            handleUpdateDefaultAddress={handleUpdateDefaultAddress}
            handleAddAddress={() => {
              dispatch({ type: "SET_SHOW_CREATE_ADDRESS", payload: state.inputTypeAddress });
              dispatch({ type: "SET_SHOW_ADDRESSES", payload: false });
            }}
            handleShowUpdateAddress={(address: IAddress) => {
              dispatch({ type: "SET_SHOW_SETTING", payload: null });
              dispatch({ type: "SET_SHOW_UPDATE_ADDRESS", payload: address });
            }}
            handleShowSetting={(id: number | null) => {
              if (state.showSetting === id) dispatch({ type: "SET_SHOW_SETTING", payload: null });
              else dispatch({ type: "SET_SHOW_SETTING", payload: id });
            }}
            handleDeletetAddress={handleDeleteAddress}
            showSetting={state.showSetting}
          />
        )}

        {state.showCreateAddress !== null && (
          <CreateAddresses
            removeMask={() => dispatch({ type: "SET_SHOW_CREATE_ADDRESS", payload: null })}
            inputTypeAddress={state.showCreateAddress}
            updateUserAddress={handleUpdateUserAddress}
          />
        )}

        {state.showUpdateAddress && (
          <UpdateAddresses
            address={state.showUpdateAddress}
            removeMask={() => {
              dispatch({ type: "SET_SHOW_UPDATE_ADDRESS", payload: null });
              dispatch({ type: "SET_SHOW_ADDRESSES", payload: true });
            }}
            updateUserAddress={handleUpdateUserAddress}
          />
        )}
      </>
    )
  );
};

export default OrdersCart;
