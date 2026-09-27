import DotLoaders from "brancy/components/design/loader/dotLoaders";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Loading from "brancy/components/notOk/loading";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { IGetMedia, PendingGeneration } from "brancy/models/interfaces";
import { DateObject } from "react-multi-date-picker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./MediaLibrary.module.css";
import { AIIcon } from "brancy/components/design/textEditor/icons";
import AIWithPrompt from "brancy/components/design/ai/AIWithPrompt";
type MediaFilter = "all" | "image" | "video";
type MediaLibraryProps = {
  images: IGetMedia[];
  videos: IGetMedia[];
  loading: boolean;
  isLoadingMore: boolean;
  isLoadingMoreVideos: boolean;
  setSelectedImage: (image: IGetMedia) => void;
  setSelectedVideo: (video: IGetMedia) => void;
  pendingGenerations: PendingGeneration[];
};
type MediaItem = {
  media: IGetMedia;
  type: "image" | "video";
};
const mediaFilterOptions = [
  { id: 0, label: "All" },
  { id: 1, label: "Images" },
  { id: 2, label: "Videos" },
];
function formatCreatedTime(timestamp: number): string {
  const time = initialzedTime();
  return new DateObject({
    date: timestamp * 1000,
    calendar: time.calendar,
    locale: time.locale,
  }).format("YYYY/MM/DD - HH:mm");
}
export default function MediaLibrary({
  images,
  videos,
  loading,
  isLoadingMore,
  isLoadingMoreVideos,
  setSelectedImage,
  setSelectedVideo,
  pendingGenerations,
}: MediaLibraryProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<MediaFilter>("all");
  const pendingMedia = pendingGenerations
    .filter((pending) => filter === "all" || pending.mediaType === filter)
    .map((pending) => ({ pending }));
  const mediaItems: MediaItem[] = [
    ...(filter === "video" ? [] : images.map((media) => ({ media, type: "image" as const }))),
    ...(filter === "image" ? [] : videos.map((media) => ({ media, type: "video" as const }))),
  ].sort((first, second) => second.media.createdTime - first.media.createdTime);
  const hasMedia = mediaItems.length > 0 || pendingMedia.length > 0;
  const filterValue = filter === "all" ? 0 : filter === "image" ? 1 : 2;
  return (
    <>
      <div className="headerparent">
        <div className="title">History </div>
        <div style={{ maxWidth: "50%", width: "100%" }}>
          <DragDrop
            data={mediaFilterOptions.map((option) => (
              <div id={String(option.id)} key={option.id}>
                {t(option.label)}
              </div>
            ))}
            item={filterValue}
            handleOptionSelect={(value) => {
              const selectedValue = Number(value);
              setFilter(selectedValue === 1 ? "image" : selectedValue === 2 ? "video" : "all");
            }}
          />
        </div>
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
        </div>
      ) : hasMedia ? (
        <div className={styles.Medialist}>
          {pendingMedia.map(({ pending }) => (
            <article className={styles.imageCard} key={pending.clientContext}>
              <div
                className={`${styles.imagePreview} ${styles.pendingPreview}`}
                aria-label={t(pending.mediaType === "video" ? "Generating video" : "Generating image")}>
                {/* <RingLoader width={36} height={36} /> */}

                <AIWithPrompt
                  aiLoading
                  handleAIPromptSubmit={function (prompt: string): void {
                    throw new Error("Function not implemented.");
                  }}
                  tags={[]}
                />
              </div>
              <div className={styles.instagramprofiledetail}>
                <div className={styles.imageTitle}>{pending.prompt || t("Untitled generation")}</div>
                <span className={styles.version}>{t("In progress")} </span>
                <span className={styles.version}>{t("Waiting for the result")}</span>
              </div>
            </article>
          ))}
          {mediaItems.map(({ media, type }) => (
            <article
              className={styles.imageCard}
              key={`${type}-${media.id}`}
              onClick={() => (type === "image" ? setSelectedImage(media) : setSelectedVideo(media))}>
              <img
                className={styles.imagePreview}
                src={getClientMediaBaseUrl() + (type === "image" ? media.thumbnailUrl : media.imageUrl)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/cover.svg";
                }}
              />
              <div className={styles.instagramprofiledetail}>
                <div className={styles.imageTitle}>{media.prompt || t("Untitled generation")}</div>
                <div className={styles.version}>
                  <div className="translate"> #{media.id}</div>
                  <div className="IDgray">{t(type === "image" ? "Image" : "Video")}</div>
                </div>
                <time className={styles.version} dateTime={new Date(media.createdTime * 1000).toISOString()}>
                  {formatCreatedTime(media.createdTime)}
                </time>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyLibrary}>
          <h2>{t(filter === "video" ? "No videos yet" : filter === "image" ? "No images yet" : "No media yet")}</h2>
          <p>
            {t(
              filter === "video"
                ? "Your successful video generations will appear here."
                : filter === "image"
                  ? "Your successful image generations will appear here."
                  : "Your successful image and video generations will appear here.",
            )}
          </p>
        </div>
      )}
      {(isLoadingMore || isLoadingMoreVideos) && (
        <div className={styles.loadMore}>
          <DotLoaders />
        </div>
      )}
    </>
  );
}
