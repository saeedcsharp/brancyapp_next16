import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import NotShopper from "brancy/components/notOk/notShopper";
import { packageStatus } from "brancy/helper/loadingStatus";
import { calculateSummary } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { IProduct_Candidate } from "brancy/models/store/IProduct";
import styles from "./selectProduct.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const SelectProduct = () => {
  //  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<IProduct_Candidate[]>();
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [productFilter, setProductFilter] = useState(true);
  const [selectAllFilter, setSelectAllFilter] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  async function fetchData(includeProduct: boolean) {
    try {
      const res = await clientFetchApi<boolean, IProduct_Candidate[]>("shopper" + "" + "/Product/GetProductCandidates", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "includeProduct", value: includeProduct + "" }], onUploadProgress: undefined });
      if (res.succeeded) {
        const container = userRef.current;
        if (container) {
          container.scrollTop = 0;
        }
        setSelectedPosts([]);
        setSelectAllFilter(false);
        setProducts(res.value);
        setLoading(false);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function getMoreData() {
    try {
      const res = await clientFetchApi<boolean, IProduct_Candidate[]>("shopper" + "" + "/Product/GetProductCandidates", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "includeProduct", value: "true" },
          {
            key: "nextMaxCreatedTime",
            value: products![products!.length - 1].createdTime.toString(),
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setProducts((prev) => [...prev!, ...res.value]);
        setHasMore(false);
        if (selectAllFilter) {
          setSelectedPosts((prev) => [...prev, ...res.value.filter((x) => !x.productId).map((x) => x.postId)]);
        }
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleSelectPost(postId: number, productId: number | null) {
    if (productId) return;
    setSelectedPosts((prev) => (prev.find((x) => x === postId) ? prev.filter((x) => x !== postId) : [...prev, postId]));
  }
  function handleSelectAllPosts() {
    var postIds = products!.filter((x) => !x.productId).map((x) => x.postId);
    if (selectedPosts.length === 0 || postIds.length !== selectedPosts.length) {
      setSelectAllFilter(true);
      setSelectedPosts(postIds);
      console.log("selecttttttttt");
    } else if (selectedPosts.length > 0 && postIds.length === selectedPosts.length) {
      console.log("unselecttttttttt");
      setSelectAllFilter(false);
      setSelectedPosts([]);
    }
  }
  function handleScroll() {
    if (hasMore || loading) return;
    const container = userRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      setHasMore(true);
      getMoreData();
    }
  }
  async function handleSaveCandidateProduct() {
    try {
      const res = await clientFetchApi<{ postIds: number[] }, boolean>("shopper" + "" + "/Product/CreateProducts", { methodType: MethodType.post, session: session, data: { postIds: selectedPosts }, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        router.push("/store/products");
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      const container = userRef.current;
      if (container) {
        container.scrollTop -= 100;
      }
    }
  }
  function handleFilterProduct() {
    setLoading(true);
    var filter = !productFilter;
    setProductFilter(filter);
    fetchData(filter);
  }
  const toggleModal = (e: MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  };
  useEffect(() => {
    if (!session || session?.user.currentIndex === -1) return;
    fetchData(true);
  }, [session]);
  if (!session?.user.isShopper) return <NotShopper />;
  // if (!session?.user.hasPackage) return <NotBasePackage />;
  if (session?.user.currentIndex === -1) router.push("/user");
  if (!session || !packageStatus(session)) router.push("/upgrade");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.Storeproduct_addnewproduct)}</title>
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
        <main className="fullScreenPupup_bg">
          {isModalOpen && (
            <div className={styles.modal}>
              <div className={styles.modalmenu} onClick={handleFilterProduct}>
                <svg className={styles.modalicon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                  <path
                    opacity=".4"
                    d="M15 9c0-.83.67-1.5 1.5-1.5h15a1.5 1.5 0 0 1 0 3h-15A1.5 1.5 0 0 1 15 9m0 9c0-.83.67-1.5 1.5-1.5h15a1.5 1.5 0 1 1 0 3h-15A1.5 1.5 0 0 1 15 18m0 9c0-.83.67-1.5 1.5-1.5h15a1.5 1.5 0 1 1 0 3h-15A1.5 1.5 0 0 1 15 27"
                    fill="var(--color-gray)"
                  />
                  <path
                    d="M11.76 5.47a1 1 0 0 0 .24-.63 1 1 0 0 0-.3-.61 1 1 0 0 0-.64-.23 1 1 0 0 0-.62.28L6.12 8.86 4.54 7.32a1 1 0 0 0-.64-.26 1 1 0 0 0-.64.26.9.9 0 0 0-.2.95q.08.15.2.29l2.25 2.18a1 1 0 0 0 .66.26 1 1 0 0 0 .64-.28zm0 20a1 1 0 0 0 .24-.63 1 1 0 0 0-.3-.61 1 1 0 0 0-.64-.23 1 1 0 0 0-.62.28l-4.32 4.58-1.58-1.54a1 1 0 0 0-.64-.26 1 1 0 0 0-.64.26.9.9 0 0 0-.2.95q.08.15.2.29l2.25 2.18a1 1 0 0 0 .66.26 1 1 0 0 0 .64-.28z"
                    fill="var(--color-gray)"
                  />
                </svg>

                <div className={styles.modaltext}>{t(LanguageKey.ShowUnprocessedItemsOnly)}</div>
              </div>

              <div className={styles.modalmenu} onClick={handleSelectAllPosts}>
                <svg className={styles.modalicon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                  <path
                    opacity=".3"
                    d="M9.54 2h-.08l-3.85.13a4 4 0 0 0-2.43 1.05A4 4 0 0 0 2.13 5.6C2 6.6 2 7.86 2 9.46v.08l.13 3.85a4 4 0 0 0 1.05 2.43c.63.63 1.43.91 2.43 1.05.99.13 2.25.13 3.85.13h.08l3.85-.13a4 4 0 0 0 2.43-1.05 4 4 0 0 0 1.05-2.43c.13-.99.13-2.25.13-3.85v-.08l-.13-3.85a4 4 0 0 0-1.05-2.43 4 4 0 0 0-2.43-1.05C12.4 2 11.14 2 9.54 2m0 17h-.08l-3.85.13a4 4 0 0 0-2.43 1.05 4 4 0 0 0-1.05 2.43C2 23.6 2 24.86 2 26.46v.08l.13 3.85a4 4 0 0 0 1.05 2.43c.63.63 1.43.91 2.43 1.05.99.13 2.25.13 3.85.13h.08l3.85-.13a4 4 0 0 0 2.43-1.05 4 4 0 0 0 1.05-2.43c.13-.99.13-2.25.13-3.85v-.08l-.13-3.85a4 4 0 0 0-1.05-2.43 4 4 0 0 0-2.43-1.05C12.4 19 11.14 19 9.54 19m17-17h-.08l-3.85.13a4 4 0 0 0-2.43 1.05 4 4 0 0 0-1.05 2.43C19 6.6 19 7.86 19 9.46v.08l.13 3.85a4 4 0 0 0 1.05 2.43 4 4 0 0 0 2.43 1.05c.99.13 2.25.13 3.85.13h.08l3.85-.13a4 4 0 0 0 2.43-1.05 4 4 0 0 0 1.05-2.43c.13-.99.13-2.25.13-3.85v-.08l-.13-3.85a4 4 0 0 0-1.05-2.43 4 4 0 0 0-2.43-1.05C29.4 2 28.14 2 26.54 2m0 17h-.08l-3.85.13a4 4 0 0 0-2.43 1.05 4 4 0 0 0-1.05 2.43c-.13.99-.13 2.25-.13 3.85v.08l.13 3.85a4 4 0 0 0 1.05 2.43 4 4 0 0 0 2.43 1.05c.99.13 2.25.13 3.85.13h.08l3.85-.13a4 4 0 0 0 2.43-1.05 4 4 0 0 0 1.05-2.43c.13-.99.13-2.25.13-3.85v-.08l-.13-3.85a4 4 0 0 0-1.05-2.43 4 4 0 0 0-2.43-1.05C29.4 19 28.14 19 26.54 19"
                    fill="var(--color-gray)"
                  />
                  <path
                    d="M13.76 7.47a1 1 0 0 0 .24-.63 1 1 0 0 0-.3-.61 1 1 0 0 0-.64-.23 1 1 0 0 0-.62.28l-4.32 4.58-1.58-1.54a1 1 0 0 0-.64-.26 1 1 0 0 0-.64.26.9.9 0 0 0-.2.95q.08.15.2.29l2.25 2.18a1 1 0 0 0 .66.26 1 1 0 0 0 .64-.28zm0 17a1 1 0 0 0 .24-.63 1 1 0 0 0-.3-.61 1 1 0 0 0-.64-.23 1 1 0 0 0-.62.28l-4.32 4.58-1.58-1.54a1 1 0 0 0-.64-.26 1 1 0 0 0-.64.26.9.9 0 0 0-.2.95q.08.15.2.29l2.25 2.18a1 1 0 0 0 .66.26 1 1 0 0 0 .64-.28zm17-17a1 1 0 0 0 .24-.63 1 1 0 0 0-.3-.61 1 1 0 0 0-.64-.23 1 1 0 0 0-.62.28l-4.32 4.58-1.58-1.54a1 1 0 0 0-.64-.26 1 1 0 0 0-.64.26.9.9 0 0 0-.2.95q.08.15.2.29l2.25 2.18a1 1 0 0 0 .66.26 1 1 0 0 0 .64-.28zm0 17a1 1 0 0 0 .24-.63 1 1 0 0 0-.3-.61 1 1 0 0 0-.64-.23 1 1 0 0 0-.62.28l-4.32 4.58-1.58-1.54a1 1 0 0 0-.64-.26 1 1 0 0 0-.64.26.9.9 0 0 0-.2.95q.08.15.2.29l2.25 2.18a1 1 0 0 0 .66.26 1 1 0 0 0 .64-.28z"
                    fill="var(--color-gray)"
                  />
                </svg>
                <div className={styles.modaltext}>{t(LanguageKey.selectall)}</div>
              </div>
            </div>
          )}
          <div onClick={() => setIsModalOpen(false)} className="fullScreenPupup_header">
            <div className={styles.titlecontainer}>
              {t(LanguageKey.SelectProduct)} <br></br>
              {!loading && (
                <div className={styles.subtitlecontainer}>
                  {t(LanguageKey.SelectedPosts)} <strong>{selectedPosts.length}</strong>
                </div>
              )}
            </div>
            {!loading && (
              <>
                <div className={styles.titleCard}>
                  <svg
                    className={styles.headerbtndiscard}
                    onClick={(e) => toggleModal(e)}
                    width="40px"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 36 36">
                    <path
                      opacity=".3"
                      d="m18.08 3 7.7.26c2 .28 3.6.84 4.86 2.1 1.26 1.25 1.83 2.85 2.1 4.87.26 1.96.26 4.48.26 7.69v.16l-.26 7.7c-.27 2-.84 3.6-2.1 4.86-1.25 1.26-2.85 1.83-4.87 2.1-1.96.26-4.48.26-7.69.26h-.16c-3.21 0-5.73 0-7.7-.26-2-.27-3.6-.84-4.86-2.1-1.26-1.25-1.82-2.85-2.1-4.87C3 23.81 3 21.3 3 18.08v-.16l.26-7.7c.28-2 .84-3.6 2.1-4.86C6.6 4.1 8.2 3.54 10.23 3.26 12.19 3 14.7 3 17.92 3z"
                      fill="var(--color-ffffff)"
                    />
                    <path
                      d="M9 22.17c0-.46.36-.84.8-.84h5.8q.33.01.57.25a.85.85 0 0 1 0 1.18.8.8 0 0 1-.57.24H9.8a.8.8 0 0 1-.57-.24 1 1 0 0 1-.23-.6m10.6-8.33c0-.46.36-.83.8-.83h5.8q.33 0 .57.24a.85.85 0 0 1 0 1.18.8.8 0 0 1-.57.25h-5.8a.8.8 0 0 1-.57-.25 1 1 0 0 1-.23-.59"
                      opacity=".4"
                      fill="var(--color-ffffff)"
                    />
                    <path
                      d="M9 14c0-.44.36-.8.8-.8h3.4a.8.8 0 0 1 0 1.6H9.8A.8.8 0 0 1 9 14m13 8a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 0 1.6h-3.4a.8.8 0 0 1-.8-.8"
                      fill="var(--color-ffffff)"
                    />
                    <path
                      d="M15.58 11h.04l.9.02q.38.02.72.15a2.1 2.1 0 0 1 1.34 1.92q.03.36.02.9v.03q0 .53-.02.9 0 .38-.15.72a2.1 2.1 0 0 1-1.91 1.34q-.37.03-.9.02h-.04q-.53 0-.9-.02a2.13 2.13 0 0 1-2.06-2.06q-.03-.37-.02-.9v-.04q0-.53.02-.9 0-.37.15-.72a2.1 2.1 0 0 1 1.92-1.33q.36-.03.89-.03m4.8 8h.04q.53 0 .9.02.37 0 .72.15a2.1 2.1 0 0 1 1.34 1.92q.03.36.02.89v.04q0 .52-.02.9 0 .37-.15.72a2.1 2.1 0 0 1-1.91 1.34q-.38.02-.9.02h-.04q-.53 0-.9-.02a2.13 2.13 0 0 1-2.06-2.07q-.03-.36-.02-.9v-.03q0-.53.02-.9 0-.37.15-.72a2.1 2.1 0 0 1 1.92-1.34q.36-.03.89-.02"
                      fill="var(--color-ffffff)"
                    />
                  </svg>

                  <Link href={"/store/products"} className={styles.headerbtndiscard}>
                    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                      <path
                        opacity=".3"
                        d="m18.086 2.625 7.882.27c2.065.279 3.703.86 4.99 2.146s1.869 2.926 2.146 4.991c.271 2.015.271 4.596.271 7.882v.172l-.27 7.882c-.278 2.065-.86 3.703-2.146 4.99s-2.926 1.869-4.991 2.146c-2.015.271-4.596.271-7.882.271h-.172c-3.286 0-5.867 0-7.882-.27-2.065-.278-3.703-.86-4.99-2.146s-1.868-2.926-2.146-4.991c-.271-2.015-.271-4.596-.271-7.882v-.172l.27-7.882c.279-2.065.86-3.703 2.146-4.99s2.926-1.868 4.991-2.146c2.015-.271 4.596-.271 7.882-.271z"
                        fill="var(--color-ffffff)"
                      />
                      <path
                        d="M23.303 12.696a1.5 1.5 0 0 1 0 2.121L20.121 18l3.182 3.182a1.5 1.5 0 0 1-2.121 2.121L18 20.121l-3.182 3.182a1.5 1.5 0 0 1-2.121-2.122L15.879 18l-3.182-3.182a1.5 1.5 0 0 1 2.121-2.121L18 15.878l3.182-3.182a1.5 1.5 0 0 1 2.121 0"
                        fill="var(--color-ffffff)"
                      />
                    </svg>
                  </Link>
                  <div onClick={handleSaveCandidateProduct} className={styles.headerbtnsave}>
                    {t(LanguageKey.save)}
                  </div>
                </div>
              </>
            )}
          </div>
          <div ref={userRef} onScroll={handleScroll} className="fullScreenPupup_content">
            <div onClick={() => setIsModalOpen(false)} className={styles.frameContainer}>
              {loading && <Loading />}
              {!loading &&
                products &&
                products!.map(
                  (v) =>
                    (!v.productId || productFilter) && (
                      <div
                        key={v.postId}
                        onClick={() => handleSelectPost(v.postId, v.productId)}
                        className={`${styles.post} ${v.productId && styles.product} `}>
                        {!v.isCandidate && <div className={styles.cardbackground} />}

                        {v.isCandidate && (
                          <div className={styles.candidate}>
                            <div className={styles.candidatefilter}>
                              <img className={styles.candidateicon} alt="candidate" src="/tickff.svg" />
                            </div>
                          </div>
                        )}
                        {selectedPosts.find((x) => x === v.postId) && (
                          <div className={styles.selectedPost}>
                            <div className={styles.candidatefilter}>
                              <img className={styles.candidateicon} alt="candidate" src="/tickff.svg" />
                            </div>
                          </div>
                        )}
                        <div className={styles.postinfo}>
                          <img
                            className={styles.postimage}
                            src={basePictureUrl + v.thumbnailMediaUrl}
                            alt="post picture"
                          />

                          <div className={styles.engagmentinfo}>
                            <div className={styles.counter}>
                              <img className={styles.icon} alt="like" src="/icon-like.svg" />
                              {calculateSummary(v.likeCount)}
                            </div>
                            <div className={styles.counter}>
                              <img className={styles.icon} alt="save" src="/icon-view.svg" />
                              {calculateSummary(v.viewCount)}
                            </div>
                            <div className={styles.counter}>
                              <img className={styles.icon} alt="comment" src="/icon-comment.svg" />
                              {calculateSummary(v.commentCount)}
                            </div>
                            <div className={styles.counter}>
                              <img className={styles.icon} alt="share" src="/icon-send.svg" />
                              {calculateSummary(v.shareCount)}
                            </div>
                          </div>
                          <div className={styles.postid}>{v.productTempId ? "#" + v.productTempId : v.postTempId}</div>
                        </div>
                      </div>
                    )
                )}
            </div>
            {hasMore && <DotLoaders />}
          </div>
        </main>
      </>
    )
  );
};

export default SelectProduct;
