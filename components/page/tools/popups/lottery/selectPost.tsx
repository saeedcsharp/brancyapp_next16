import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { useSession } from "next-auth/react";
import router from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import styles from "./selectPost.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { IShortPostInfo } from "brancy/models/interfaces";
const basePictureUrl = getClientMediaBaseUrl();
const SelectPost = (props: {
  removeMask: () => void;
  saveSelectPost: (post: IShortPostInfo) => void;
  backToNormalPicker: () => void;
  title?: string;
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<IShortPostInfo[]>([]);
  const [nextTime, setNextTime] = useState(0);
  const [selectedPost, setSelectedPost] = useState<IShortPostInfo | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const mountedRef = useRef(false);

  const { containerRef, isLoadingMore } = useInfiniteScroll<IShortPostInfo>({
    hasMore,
    isLoading: loading,
    enabled: !failed,
    fetchMore: async () => {
      let result;
      try {
        result = await clientFetchApi<string, IShortPostInfo[]>("/api/post/GetPostCards", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            {
              key: "nextTimeUnix",
              value: nextTime.toString(),
            },
          ],
          onUploadProgress: undefined,
        });
      } catch (error) {
        setFailed(true);
        notify(ResponseType.Unexpected, NotifType.Error);
        throw error;
      }
      if (!result.succeeded) {
        notify(result.info.responseType, NotifType.Error);
        setFailed(true);
        throw new Error("Unable to load post cards");
      }
      return result.value;
    },
    onDataFetched: (newData, hasMoreData) => {
      if (newData.length > 0) {
        setPost((prev) => Array.from(new Map([...prev, ...newData].map((item) => [item.postId, item])).values()));
        setNextTime(newData[newData.length - 1].createdTime);
      }
      setHasMore(hasMoreData);
    },
    getItemId: (item) => item.postId,
    currentData: post,
    useContainerScroll: true,
  });

  const getPost = useCallback(async () => {
    try {
      const res = await clientFetchApi<string, IShortPostInfo[]>("/api/post/GetPostCards", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (!mountedRef.current) return;
      if (res.succeeded) {
        setPost(Array.from(new Map(res.value.map((item) => [item.postId, item])).values()));
        setHasMore(res.value.length > 0);
        if (res.value.length > 0) {
          setNextTime(res.value[res.value.length - 1].createdTime);
        }
      } else {
        setFailed(true);
        notify(res.info.responseType, NotifType.Error);
      }
    } catch {
      if (mountedRef.current) {
        setFailed(true);
        internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [session]);
  function handleSave(post: IShortPostInfo | null) {
    if (post !== null && selectedPost) {
      props.saveSelectPost(post);
    }
  }
  useEffect(() => {
    mountedRef.current = true;
    if (session) void getPost();
    return () => {
      mountedRef.current = false;
    };
  }, [getPost, session]);

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <div id="modal-title" className="title">{props.title ?? t(LanguageKey.pageLottery_SelectaPost)}</div>
          <div ref={containerRef} className={styles.thumbnailsContainer}>
            {post.length === 0 && !failed && <div className="explain">{t(LanguageKey.noresult)}</div>}
            {post.map((v) => (
              <button
                type="button"
                aria-label={`${t(LanguageKey.pageLottery_SelectaPost)} #${v.postId}`}
                aria-pressed={selectedPost?.postId === v.postId}
                onClick={() => setSelectedPost(v)}
                key={v.postId}
                className={styles.thumbnailMask}>
                <img
                  className={`${styles.thumbnailImage} ${selectedPost?.postId === v.postId ? styles.selectedPost : ""}`}
                  src={basePictureUrl + v.thumbnailMediaUrl}
                  alt={`#${v.postId}`}
                  loading="lazy"
                />
              </button>
            ))}
            {isLoadingMore && <DotLoaders />}
          </div>
          {failed && (
            <button
              type="button"
              className="cancelButton"
              onClick={() => {
                setLoading(true);
                setFailed(false);
                setHasMore(false);
                setSelectedPost(null);
                void getPost();
              }}>
              {t(LanguageKey.AIFlow_retry)}
            </button>
          )}
          <div className="ButtonContainer">
            <button onClick={props.backToNormalPicker} className="cancelButton">
              {t(LanguageKey.cancel)}
            </button>
            <button
              type="button"
              disabled={!selectedPost}
              onClick={() => handleSave(selectedPost)}
              className={selectedPost ? "saveButton" : "disableButton"}>
              {t(LanguageKey.select)}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default SelectPost;
