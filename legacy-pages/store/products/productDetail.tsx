import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "saeed/components/design/modal";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotBasePackage from "saeed/components/notOk/notBasePackage";
import NotShopper from "saeed/components/notOk/notShopper";
import InstanceProductDetail from "saeed/components/store/products/productDetail/instanceProduct/instanceProductDetail";
import NotInstanceProductDetail from "saeed/components/store/products/productDetail/notInstanceProduct/notInstanceProductDetal";
import DeleteProduct from "saeed/components/store/products/productDetail/notInstanceProduct/popups/deleteProduct";
import { packageStatus } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { IDetailsPost } from "saeed/models/page/post/posts";
import {
  IMaxSize,
  IProduct_FullProduct,
  IProduct_ShortProduct,
  ITempIdAndNonProductCount,
} from "saeed/models/store/IProduct";
import styles from "./productDetail.module.css";
const ProductDetail = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { query } = router;
  const { t } = useTranslation();

  // Consolidate multiple useState hooks into a single state object
  const [state, setState] = useState({
    loadingStatus: {
      notShopper: false,
      loading: true,
      notBasePackage: false,
      notFeature: false,
      notPassword: false,
      notBusiness: false,
      ok: false,
    },
    fullproduct: undefined as IProduct_FullProduct | undefined,
    shortProduct: undefined as IProduct_ShortProduct | undefined,
    postInfo: undefined as IDetailsPost | undefined,
    firstLoad: true,
    lastTempId: 0,
    deactiveBackTemp: false,
    deactiveNextTemp: false,
    showDeleteProduct: false,
    maxSize: undefined as IMaxSize | undefined,
  });

  const getFullProductAndPostInfo = useCallback(
    async (productId: number, postId: number) => {
      try {
        const [res1, res2] = await Promise.all([
          GetServerResult<boolean, IProduct_FullProduct>(
            MethodType.get,
            session,
            "shopper" + "" + "/Product/GetFullProduct",
            null,
            [
              { key: "language", value: "1" },
              { key: "productId", value: productId.toString() },
            ]
          ),
          GetServerResult<boolean, IDetailsPost>(
            MethodType.get,
            session,
            "Instagramer" + "" + "/Post/GetPostInfo",
            null,
            [{ key: "postId", value: postId.toString() }]
          ),
        ]);

        if (res1.succeeded && res2.succeeded) {
          setState((prev) => ({
            ...prev,
            fullproduct: res1.value,
            postInfo: res2.value,
          }));
        } else {
          notify(res1.info.responseType, NotifType.Warning);
        }
        setState((prev) => ({
          ...prev,
          loadingStatus: {
            notShopper: false,
            notBusiness: false,
            loading: false,
            notBasePackage: false,
            notFeature: false,
            notPassword: false,
            ok: true,
          },
          firstLoad: false,
        }));
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session]
  );
  const getPostInfo = useCallback(
    async (postId: number) => {
      try {
        const res = await GetServerResult<boolean, IDetailsPost>(
          MethodType.get,
          session,
          "Instagramer/Post/GetPostInfo",
          null,
          [{ key: "postId", value: postId.toString() }]
        );
        if (res.succeeded) {
          console.log("setPostInfo", res);
          setState((prev) => ({
            ...prev,
            postInfo: res.value,
          }));
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
        setState((prev) => ({
          ...prev,
          loadingStatus: {
            notShopper: false,
            notBusiness: false,
            loading: false,
            notBasePackage: false,
            notFeature: false,
            notPassword: false,
            ok: true,
          },
          firstLoad: false,
        }));
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session]
  );
  const getShortProduct = useCallback(async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        GetServerResult<boolean, IProduct_ShortProduct>(
          MethodType.get,
          session,
          "shopper/Product/GetProductByTempId",
          null,
          [{ key: "tempId", value: query.tempId as string }]
        ),
        GetServerResult<boolean, ITempIdAndNonProductCount>(
          MethodType.get,
          session,
          "shopper/Product/GetLastTempIdAndNonProductsCount"
        ),
        GetServerResult<boolean, IMaxSize>(MethodType.get, session, "Shopper/Product/GetMaxSize"),
      ]);

      if (res1.succeeded && res2.succeeded) {
        setState((prev) => ({
          ...prev,
          lastTempId: res2.value.lastTempId,
          shortProduct: res1.value,
          maxSize: res3.value,
        }));
        if (res1.value.productInId) getFullProductAndPostInfo(res1.value.productId, res1.value.postId);
        else getPostInfo(res1.value.postId);
      } else {
        notify(res1.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, query.tempId, getFullProductAndPostInfo, getPostInfo]);
  const fetchData = useCallback(async () => {
    console.log("ggggggggggg");
    if (!session?.user.isShopper)
      setState((prev) => ({
        ...prev,
        loadingStatus: {
          notShopper: true,
          loading: false,
          notBasePackage: false,
          notFeature: false,
          notPassword: false,
          notBusiness: false,
          ok: false,
        },
      }));
    // else if (!session?.user.hasPackage)
    //   setState((prev) => ({
    //     ...prev,
    //     loadingStatus: {
    //       notShopper: false,
    //       loading: false,
    //       notBasePackage: true,
    //       notFeature: false,
    //       notPassword: false,
    //       notBusiness: false,
    //       ok: false,
    //     },
    //   }));
    else getShortProduct();
  }, [session, getShortProduct]);
  const handleNextProduct = useCallback(
    async (tempId: number) => {
      try {
        const res = await GetServerResult<boolean, IProduct_ShortProduct>(
          MethodType.get,
          session,
          "shopper" + "" + "/Product/GetNextProduct",
          null,
          [
            {
              key: "productId",
              value: state.shortProduct!.productId.toString(),
            },
          ]
        );
        if (res.succeeded) {
          router.push(`/store/products/productDetail?tempId=${res.value.tempId}`);
          setState((prev) => ({
            ...prev,
            shortProduct: res.value,
            loadingStatus: {
              notShopper: false,
              notBusiness: false,
              loading: true,
              notBasePackage: false,
              notFeature: false,
              notPassword: false,
              ok: false,
            },
          }));
          if (res.value.productInId) getFullProductAndPostInfo(res.value.productId, res.value.postId);
          else getPostInfo(res.value.postId);
        } else if (res.info.responseType === ResponseType.NotFoundAnyNextProduct) {
          setState((prev) => ({
            ...prev,
            deactiveNextTemp: true,
          }));
          notify(res.info.responseType, NotifType.Warning);
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, state.shortProduct, state.lastTempId, getFullProductAndPostInfo, getPostInfo]
  );
  const handlePreviousProduct = useCallback(
    async (tempId: number) => {
      try {
        const res = await GetServerResult<boolean, IProduct_ShortProduct>(
          MethodType.get,
          session,
          "shopper" + "" + "/Product/GetPreviousProduct",
          null,
          [
            {
              key: "productId",
              value: state.shortProduct!.productId.toString(),
            },
          ]
        );
        if (res.succeeded) {
          router.push(`/store/products/productDetail?tempId=${res.value.tempId}`);
          setState((prev) => ({
            ...prev,
            shortProduct: res.value,
            loadingStatus: {
              notShopper: false,
              notBusiness: false,
              loading: true,
              notBasePackage: false,
              notFeature: false,
              notPassword: false,
              ok: false,
            },
          }));
          if (tempId === 1)
            setState((prev) => ({
              ...prev,
              deactiveBackTemp: true,
            }));
          if (res.value.productInId) getFullProductAndPostInfo(res.value.productId, res.value.postId);
          else getPostInfo(res.value.postId);
        } else if (res.info.responseType === ResponseType.NotFoundAnyPreviousProduct) {
          notify(res.info.responseType, NotifType.Warning);
          setState((prev) => ({
            ...prev,
            deactiveBackTemp: true,
          }));
          return;
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, state.shortProduct, getFullProductAndPostInfo, getPostInfo]
  );
  useEffect(() => {
    if (!session || session!.user.currentIndex === -1) return;
    if (router.isReady && session) {
      if (query.tempId === undefined || query.tempId === "") {
        router.push("/store/products");
      }
      fetchData();
    }
  }, [router.isReady, session, query.tempId, fetchData]);

  const memoizedDeleteHandler = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDeleteProduct: false,
    }));
  }, []);

  // Simplify loading status checks
  const isLoading = state.loadingStatus.loading;
  const isNotShopper = state.loadingStatus.notShopper;
  const isNotBasePackage = state.loadingStatus.notBasePackage;
  const isOk = state.loadingStatus.ok;

  // Simplify product detail checks
  const hasProductInId = state.shortProduct?.productInId !== null;
  const canShowDelete = isOk && !hasProductInId && state.shortProduct;
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  if (!session || !query.tempId) {
    return null;
  }
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <main className="fullScreenPupup_bg">
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.product_productspecifications)}</title>
          <meta name="description" content="Advanced Instagram post management tool" />
          <meta name="theme-color" content="#2977ff"></meta>
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
          {/* Add other meta tags as needed */}
        </Head>
        {/* head for SEO */}
        <div className="fullScreenPupup_header">
          <div className={`${styles.Toggle} translate`}>
            <img
              className={`${styles.Togglebtn} ${state.deactiveBackTemp && "fadeDiv"}`}
              src="/back-white.svg"
              title="Previous Product"
              alt="Previous product navigation button"
              role="button"
              aria-label="Go to previous product"
              onClick={() => {
                // تغییر ID به پست قبلی
                if (state.deactiveBackTemp) return;
                const previousProductId = Number(query.tempId) - 1;
                if (previousProductId > 0) {
                  setState((prev) => ({
                    ...prev,
                    deactiveNextTemp: false,
                  }));
                  handlePreviousProduct(previousProductId);
                }
              }}
            />
            {t(LanguageKey.navbar_Post)} #{query.tempId}
            <img
              className={`${styles.Togglebtn} ${
                state.lastTempId === (Number(query.tempId) || state.deactiveNextTemp) && "fadeDiv"
              }`}
              src="/next-white.svg"
              title="Next Product"
              alt="Next product navigation button"
              role="button"
              aria-label="Go to next product"
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  deactiveBackTemp: false,
                }));
                if (state.lastTempId === Number(query.tempId) || state.deactiveNextTemp) return;
                const nextProductId = Number(query.tempId) + 1;
                handleNextProduct(nextProductId);
              }}
            />
          </div>
          <div className={styles.titleCard}>
            {canShowDelete && (
              <img
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showDeleteProduct: true,
                  }))
                }
                className={styles.headermenudelete}
                style={{ width: "40px" }}
                src="/delete-white.svg"
                title="Delete Product"
                alt="Delete product button"
                role="button"
                aria-label="Delete this product"
              />
            )}

            <div
              className={styles.headermenucancel}
              onClick={() => {
                router.push("/store/products");
              }}
              title="cancel"
              role="button"
              aria-label="cancel">
              {t(LanguageKey.cancel)}
            </div>
          </div>
        </div>
        <div className={styles.productedit}>
          {isLoading && <Loading />}
          {isNotShopper && <NotShopper />}
          {isNotBasePackage && <NotBasePackage />}
          {isOk &&
            state.postInfo &&
            (hasProductInId ? (
              <InstanceProductDetail
                fullProduct={state.fullproduct!}
                maxSize={state.maxSize!}
                shortProduct={state.shortProduct!}
                postInfo={state.postInfo!}
              />
            ) : (
              <NotInstanceProductDetail
                productId={state.shortProduct!.productId}
                maxSize={state.maxSize!}
                shortProduct={state.shortProduct!}
                postInfo={state.postInfo!}
              />
            ))}
        </div>
        {state.showDeleteProduct && (
          <Modal
            closePopup={memoizedDeleteHandler}
            classNamePopup={"popupSendFile"}
            showContent={state.showDeleteProduct}>
            <DeleteProduct productId={state.shortProduct!.productId} removeMask={memoizedDeleteHandler} />
          </Modal>
        )}
      </main>
    )
  );
};

export default ProductDetail;
