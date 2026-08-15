import RingLoader from "brancy/components/design/loader/ringLoder";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { DateObject } from "react-multi-date-picker";
import { useTranslation } from "react-i18next";
import styles from "./List.module.css";
import { IGetMedia, PendingGeneration } from "brancy/models/interfaces";
import Loading from "brancy/components/notOk/loading";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
import { parseImageMetadata } from "./generatedImageModal";

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
    <section aria-label={t("Video library")}>
      {/* <div className={styles.libraryHeading}>
        <div>
          <h2>{t("Video library")}</h2>
          <p>{t("{count} creations loaded", { count: videos.length })}</p>
        </div>
      </div> */}

      {loading ? (
        <div className={styles.loadingContainer}>
          {" "}
          <Loading />
        </div>
      ) : videos.length > 0 || pendingVideos.length > 0 ? (
        <div className={styles.imageGrid}>
          {/* pending image card */}
          {pendingVideos.map((pending) => (
            <article className={styles.imageCard} key={pending.clientContext}>
              <div className={`${styles.imagePreview} ${styles.pendingPreview}`} aria-label={t("Generating video")}>
                <RingLoader width={42} height={42} />
                <span>{t("Generating video")}</span>
              </div>
              <div className={styles.imageInfo}>
                <div className={styles.imageTitle}>{pending.prompt || t("Untitled generation")}</div>
                <div className={styles.imageMetaLine}>
                  <span className={styles.creatorKey}>{t("In progress")}</span>
                  <span className={styles.version}>{t("Waiting for the result")}</span>
                  {/* <time>{formatCreatedTime(image.createdTime)}</time> */}
                </div>
              </div>
            </article>
          ))}
          {/* created image card */}
          {videos.map((video) => {
            const metadata = video.metadata ? parseImageMetadata(video.metadata, t) : null;
            return (
              <article className={styles.imageCard} key={video.id} onClick={() => setSelectedVideo(video)}>
                <img
                  className={styles.imagePreview}
                  src={getClientMediaBaseUrl() + video.imageUrl}
                  alt={video.prompt || t("Generated video")}
                />

                <div className={styles.imageInfo}>
                  <div className={styles.imageTitle}>{video.prompt || t("Untitled generation")}</div>
                  <div className={styles.imageMetaLine}>
                    <span className={styles.creatorKey}>{video.creatorKey}</span>
                    <span className={styles.version}>{video.version}</span>
                    {/* <time>{formatCreatedTime(video.createdTime)}</time> */}
                  </div>

                  {/* {metadata?.length ? (
                    <dl className={styles.cardMetadata}>
                      {metadata.slice(0, 3).map((item) => (
                        <div key={item.key}>
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null} */}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyLibrary}>
          <h2>{t("No images yet")}</h2>
          <p>{t("Your successful image generations will appear here.")}</p>
        </div>
      )}
      {isLoadingMore && (
        <div className={styles.loadMore}>
          <DotLoaders />
        </div>
      )}
    </section>
  );
}
