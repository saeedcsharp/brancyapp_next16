import { useSession } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DotLoaders from "saeed/components/design/loader/dotLoaders";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/api";
import { IShortPostInfo } from "saeed/models/page/tools/tools";
import styles from "./selectPost.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const SelectPost = (props: {
  removeMask: () => void;
  saveSelectPost: (post: IShortPostInfo) => void;
  backToNormalPicker: () => void;
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

  const { containerRef, isLoadingMore } = useInfiniteScroll<IShortPostInfo>({
    hasMore,
    fetchMore: async () => {
      try {
        const result = await clientFetchApi<string, IShortPostInfo[]>("/api/post/GetPostCards", { methodType: MethodType.get, session: session, data: null, queries: [
            {
              key: "nextTimeUnix",
              value: nextTime.toString(),
            },
          ], onUploadProgress: undefined });
        return result.succeeded ? result.value : [];
      } catch (error) {
        console.log("error from loader:", error);
        return [];
      }
    },
    onDataFetched: (newData, hasMoreData) => {
      if (newData.length > 0) {
        setPost((prev) => [...prev, ...newData]);
        setNextTime(newData[newData.length - 1].createdTime);
        setHasMore(hasMoreData);
      }
    },
    getItemId: (item) => item.postId,
    currentData: post,
    useContainerScroll: true,
  });

  async function getPost() {
    try {
      var res = await clientFetchApi<string, IShortPostInfo[]>("/api/post/GetPostCards", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        setPost(res.value);
        if (res.value.length > 0) {
          setNextTime(res.value[res.value.length - 1].createdTime);
          setHasMore(true);
        }
        setLoading(false);
      } else {
        notify(res.info.responseType, NotifType.Error);
      }
    } catch (error) {
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    }
  }
  function handleSave(post: IShortPostInfo | null) {
    if (post !== null && selectedPost) {
      props.saveSelectPost(post);
    }
  }
  useEffect(() => {
    getPost();
  }, []);

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          <div className="title">{t(LanguageKey.pageLottery_SelectaPost)}</div>
          <div className={styles.thumbnailsContainer}>
            <div
              ref={containerRef}
              style={{
                height: 500,
                overflow: "auto",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}>
              {post.map((v) => (
                <div
                  onClick={() =>
                    setSelectedPost({
                      postId: v.postId,
                      thumbnailMediaUrl: v.thumbnailMediaUrl,
                      createdTime: v.createdTime,
                    })
                  }
                  key={v.postId}
                  className={styles.thumbnailMask}>
                  <img
                    className={`${styles.thumbnailImage} ${
                      selectedPost?.postId === v.postId ? styles.selectedPost : ""
                    }`}
                    src={basePictureUrl + v.thumbnailMediaUrl}
                  />
                </div>
              ))}
              {isLoadingMore && <DotLoaders />}
            </div>
          </div>
          <div className="ButtonContainer">
            <button onClick={props.backToNormalPicker} className="cancelButton">
              {t(LanguageKey.cancel)}
            </button>
            <button onClick={() => handleSave(selectedPost)} className={selectedPost ? "saveButton" : "disableButton"}>
              {t(LanguageKey.select)}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default SelectPost;
