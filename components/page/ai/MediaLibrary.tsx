import AIWithPrompt from "brancy/components/design/ai/AIWithPrompt";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
import Loading from "brancy/components/notOk/loading";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { IGetMedia, PendingGeneration, PendingMediaType } from "brancy/models/interfaces";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import styles from "./MediaLibrary.module.css";
type MediaLibraryProps = {
  filter: PendingMediaType;
  onFilterChange: (filter: PendingMediaType) => void;
  images: IGetMedia[];
  videos: IGetMedia[];
  audios: IGetMedia[];
  loading: boolean;
  isLoadingMore: boolean;
  isLoadingMoreVideos: boolean;
  isLoadingMoreAudios: boolean;
  setSelectedImage: (image: IGetMedia) => void;
  setSelectedVideo: (video: IGetMedia) => void;
  setSelectedAudio: (audio: IGetMedia) => void;
  pendingGenerations: PendingGeneration[];
  containerRef: RefObject<HTMLDivElement | null>;
  hideFilters?: boolean;
};
type MediaItem = {
  media: IGetMedia;
  type: PendingMediaType;
};
const mediaFilterOptions = [
  { id: 0, label: "Images" },
  { id: 1, label: "Videos" },
  { id: 2, label: "Voices" },
];
const filterById: PendingMediaType[] = ["image", "video", "audio"];
const emptyTitle: Record<PendingMediaType, string> = {
  image: "No images yet",
  video: "No videos yet",
  audio: "No voices yet",
};
const emptyDescription: Record<PendingMediaType, string> = {
  image: "Your successful image generations will appear here.",
  video: "Your successful video generations will appear here.",
  audio: "Your successful voice generations will appear here.",
};
const generatingLabel: Record<PendingMediaType, string> = {
  image: "Generating image",
  video: "Generating video",
  audio: "Generating voice",
};
const typeLabel: Record<PendingMediaType, string> = { image: "photo", video: "video", audio: "voice" };
function AudioCardIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke="var(--text-h2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
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
  audios,
  loading,
  isLoadingMore,
  isLoadingMoreVideos,
  isLoadingMoreAudios,
  setSelectedImage,
  setSelectedVideo,
  setSelectedAudio,
  pendingGenerations,
  containerRef,
  hideFilters = false,
}: MediaLibraryProps) {
  const { t } = useTranslation();
  const pendingMedia = pendingGenerations
    .filter((pending) => pending.mediaType === filter)
    .map((pending) => ({ pending }));
  const mediaItems: MediaItem[] = (filter === "image" ? images : filter === "video" ? videos : audios)
    .map((media) => ({ media, type: filter }))
    .sort((first, second) => second.media.createdTime - first.media.createdTime);
  const hasMedia = mediaItems.length > 0 || pendingMedia.length > 0;
  const filterValue = filterById.indexOf(filter);
  const loadingMore =
    filter === "image" ? isLoadingMore : filter === "video" ? isLoadingMoreVideos : isLoadingMoreAudios;
  return (
    <>
      <div className="headerparent">
        <div className="title">{t("pageTools_popup_history")} </div>
        {!hideFilters && (
          <div style={{ maxWidth: "50%", width: "100%" }}>
            <DragDrop
              data={mediaFilterOptions.map((option) => (
                <div id={String(option.id)} key={option.id}>
                  {t(option.label)}
                </div>
              ))}
              item={filterValue}
              handleOptionSelect={(value) => onFilterChange(filterById[Number(value)] ?? "image")}
            />
          </div>
        )}
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
                aria-label={t(generatingLabel[pending.mediaType])}>
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
                onClick={() =>
                  type === "image"
                    ? setSelectedImage(media)
                    : type === "video"
                      ? setSelectedVideo(media)
                      : setSelectedAudio(media)
                }>
                {type === "audio" ? (
                  <div className={styles.imagePreview}>
                    <AudioCardIcon />
                  </div>
                ) : (
                  <img
                    className={styles.imagePreview}
                    src={getClientMediaBaseUrl() + (type === "image" ? media.thumbnailUrl : media.imageUrl)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/cover.svg";
                    }}
                  />
                )}
                <div className={styles.instagramprofiledetail}>
                  <div className={styles.imageTitle}>{media.prompt || t("Untitled generation")}</div>
                  <div className={styles.version}>
                    <div className="translate"> #{media.id}</div>
                    <div className="IDgray">{t(typeLabel[type])}</div>
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
          <h2>{t(emptyTitle[filter])}</h2>
          <p>{t(emptyDescription[filter])}</p>
        </div>
      )}
      {loadingMore && (
        <div className={styles.loadMore}>
          <DotLoaders />
        </div>
      )}
    </>
  );
}
