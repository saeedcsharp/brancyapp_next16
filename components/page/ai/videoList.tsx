import RingLoader from "brancy/components/design/loader/ringLoder";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { DateObject } from "react-multi-date-picker";
import { useTranslation } from "react-i18next";
import { parseImageMetadata } from "./generatedImageModal";
import styles from "./imageList.module.css";
import { IGetMedia } from "brancy/models/interfaces";

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
  openVideoCreator: () => void;
};

export default function VideoList({ videos, loading, isLoadingMore, openVideoCreator }: VideoListProps) {
  const { t } = useTranslation();
  return (
    <section className={styles.library} aria-label="Generated videos">
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
      ) : videos.length > 0 ? (
        <div className={styles.imageGrid}>
          {videos.map((video) => {
            const metadata = video.metadata ? parseImageMetadata(video.metadata) : null;
            return (
              <article className={styles.imageCard} key={video.id}>
                <div className={styles.imagePreview}>
                  <video controls preload="metadata" src={getClientMediaBaseUrl() + video.videoUrl}>
                    {t("Your browser does not support video playback.")}
                  </video>
                </div>
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
