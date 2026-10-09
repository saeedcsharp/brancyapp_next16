import DotLoaders from "brancy/components/design/loader/dotLoaders";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Loading from "brancy/components/notOk/loading";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { IGetMedia, PendingGeneration, PendingMediaType } from "brancy/models/interfaces";
import { DateObject } from "react-multi-date-picker";
import { useTranslation } from "react-i18next";
import styles from "./MediaLibrary.module.css";
import { AIIcon } from "brancy/components/design/textEditor/icons";
import AIWithPrompt from "brancy/components/design/ai/AIWithPrompt";
import type { RefObject } from "react";
type MediaLibraryProps = {
  filter: PendingMediaType;
  onFilterChange: (filter: PendingMediaType) => void;
  images: IGetMedia[];
  videos: IGetMedia[];
  loading: boolean;
  isLoadingMore: boolean;
  isLoadingMoreVideos: boolean;
  setSelectedImage: (image: IGetMedia) => void;
  setSelectedVideo: (video: IGetMedia) => void;
  pendingGenerations: PendingGeneration[];
  containerRef: RefObject<HTMLDivElement | null>;
};
type MediaItem = {
  media: IGetMedia;
  type: "image" | "video";
};
const mediaFilterOptions = [
  { id: 0, label: "Images" },
  { id: 1, label: "Videos" },
];
function getCreatedDate(timestamp: number): Date | null {
  if (!Number.isFinite(timestamp)) return null;
  const date = new Date(timestamp * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatCreatedTime(date: Date): string {
  const time = initialzedTime();
  return new DateObject({
    date,
    calendar: time.calendar,
    locale: time.locale,
  }).format("YYYY/MM/DD - HH:mm");
}
export default function MediaLibrary({
  filter,
  onFilterChange,
  images,
  videos,
  loading,
  isLoadingMore,
  isLoadingMoreVideos,
  setSelectedImage,
  setSelectedVideo,
  pendingGenerations,
  containerRef,
}: MediaLibraryProps) {
  const { t } = useTranslation();
  const pendingMedia = pendingGenerations
    .filter((pending) => pending.mediaType === filter)
    .map((pending) => ({ pending }));
  const mediaItems: MediaItem[] = (filter === "image" ? images : videos)
    .map((media) => ({ media, type: filter }))
    .sort((first, second) => second.media.createdTime - first.media.createdTime);
  const hasMedia = mediaItems.length > 0 || pendingMedia.length > 0;
  const filterValue = filter === "image" ? 0 : 1;
  return (
    <>
      <div className="headerparent">
        <div className="title">{t("pageTools_popup_history")} </div>
        <div style={{ maxWidth: "50%", width: "100%" }}>
          <DragDrop
            data={mediaFilterOptions.map((option) => (
              <div id={String(option.id)} key={option.id}>
                {t(option.label)}
              </div>
            ))}
            item={filterValue}
            handleOptionSelect={(value) => onFilterChange(Number(value) === 1 ? "video" : "image")}
          />
        </div>
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
        </div>
      ) : hasMedia ? (
        <div className={styles.Medialist} ref={containerRef}>
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
          {mediaItems.map(({ media, type }) => {
            const createdDate = getCreatedDate(media.createdTime);
            return (
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
                    <div className="IDgray">{t(type === "image" ? "photo" : "video")}</div>
                  </div>
                  {createdDate ? (
                    <time className={styles.version} dateTime={createdDate.toISOString()}>
                      {formatCreatedTime(createdDate)}
                    </time>
                  ) : (
                    <span className={styles.version}>{t("Not available")}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyLibrary}>
          <h2>{t(filter === "video" ? "No videos yet" : "No images yet")}</h2>
          <p>
            {t(
              filter === "video"
                ? "Your successful video generations will appear here."
                : "Your successful image generations will appear here.",
            )}
          </p>
        </div>
      )}
      {(filter === "image" ? isLoadingMore : isLoadingMoreVideos) && (
        <div className={styles.loadMore}>
          <DotLoaders />
        </div>
      )}
    </>
  );
}
