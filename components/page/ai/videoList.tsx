import RingLoader from "brancy/components/design/loader/ringLoder";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { DateObject } from "react-multi-date-picker";
import { useTranslation } from "react-i18next";
import { parseImageMetadata } from "./generatedImageModal";
import styles from "./imageList.module.css";
import { IGetMedia, PendingGeneration } from "brancy/models/interfaces";

function formatCreatedTime(timestamp: number) {
  const t = initialzedTime();
  const d = new DateObject({
    date: timestamp * 1000,
    calendar: t.calendar,
    locale: t.locale,
  });
  return d.format("YYYY/MM/DD HH:mm:ss");
}

type VideoListProps = {
  videos: IGetMedia[];
  loading: boolean;
  isLoadingMore: boolean;
  setSelectedVideo: (video: IGetMedia) => void;
  openVideoCreator: () => void;
  pendingGenerations: PendingGeneration[];
};

const DEFAULT_VIDEO_THUMBNAIL = "/cover-video.svg";

export default function VideoList({
  videos,
  loading,
  isLoadingMore,
  setSelectedVideo,
  openVideoCreator,
  pendingGenerations,
}: VideoListProps) {
  const { t } = useTranslation();
  const pendingVideos = pendingGenerations.filter((item) => item.mediaType === "video");
  return (
    <section className={styles.library} aria-label={t("Generated videos")}>
      <div className={styles.libraryHeading}>
        <div>
          <h2>{t("Video library")}</h2>
          <p>{t("{count} creations loaded", { count: videos.length })}</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <RingLoader width={42} height={42} />
        </div>
      ) : videos.length > 0 || pendingVideos.length > 0 ? (
        <div className={styles.imageGrid}>
          {pendingVideos.map((pending) => (
            <article className={styles.imageCard} key={pending.clientContext}>
              <div className={`${styles.imagePreview} ${styles.pendingPreview}`} aria-label={t("Generating video")}>
                <RingLoader width={42} height={42} />
                <span>{t("Generating video")}</span>
              </div>
              <div className={styles.imageInfo}>
                <div className={styles.imageMetaLine}>
                  <span>{t("In progress")}</span>
                  <time>{t("Just now")}</time>
                </div>
                <h3>{pending.prompt || t("Untitled generation")}</h3>
                <p>{t("Waiting for the result")}</p>
              </div>
            </article>
          ))}
          {videos.map((video) => {
            const metadata = video.metadata ? parseImageMetadata(video.metadata, t) : null;
            const previewUrl = video.imageUrl?.trim()
              ? getClientMediaBaseUrl() + video.imageUrl
              : DEFAULT_VIDEO_THUMBNAIL;
            return (
              <article className={styles.imageCard} key={video.id}>
                <button className={styles.imagePreview} type="button" onClick={() => setSelectedVideo(video)}>
                  <img src={previewUrl} alt={video.prompt || t("Generated video")} />
                  <span>{t("View details")}</span>
                </button>
                <div className={styles.imageInfo}>
                  <div className={styles.imageMetaLine}>
                    <span>{video.creatorKey}</span>
                    <time>{formatCreatedTime(video.createdTime)}</time>
                  </div>
                  <h3>{video.prompt || t("Untitled generation")}</h3>
                  <p>{video.version}</p>
                  {metadata?.length ? (
                    <dl className={styles.cardMetadata}>
                      {metadata.slice(0, 3).map((item) => (
                        <div key={item.key}>
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyLibrary}>
          <span aria-hidden="true">▶</span>
          <h2>{t("No videos yet")}</h2>
          <p>{t("Your successful video generations will appear here.")}</p>
          <button type="button" onClick={openVideoCreator}>
            {t("Create your first video")}
          </button>
        </div>
      )}
      {isLoadingMore && (
        <div className={styles.loadMore}>
          <RingLoader width={30} height={30} />
        </div>
      )}
    </section>
  );
}
