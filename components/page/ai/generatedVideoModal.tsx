import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { DownloadImage } from "brancy/helper/DownloadImage";
import { IGetMedia } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import { parseImageMetadata } from "./generatedImageModal";
import styles from "./mediaCreator.module.css";

interface GeneratedVideoModalProps {
  video: IGetMedia;
  onClose: () => void;
}

const DEFAULT_VIDEO_THUMBNAIL = "/cover-video.svg";

export default function GeneratedVideoModal({ video, onClose }: GeneratedVideoModalProps) {
  const { t } = useTranslation();
  const videoUrl = video.videoUrl ? getClientMediaBaseUrl() + video.videoUrl : null;
  const videoFileName = video.videoUrl?.split("/").pop()?.split("?")[0] || `generated-video-${video.id}.mp4`;
  const previewImageUrl = video.imageUrl?.trim() ? getClientMediaBaseUrl() + video.imageUrl : DEFAULT_VIDEO_THUMBNAIL;
  const metadataItems = video.metadata ? parseImageMetadata(video.metadata, t) : null;

  return (
    <article className={styles.resultModal}>
      <header className={styles.resultHeader}>
        <div>
          <span className={styles.resultEyebrow}>{t("AI video ready")}</span>
          <h2 id="modal-title">{t("Generated video")}</h2>
        </div>
        <button className={styles.resultClose} type="button" aria-label={t("Close")} onClick={onClose}>
          ×
        </button>
      </header>

      <div className={styles.resultContent}>
        <div className={styles.resultPreview}>
          {videoUrl ? (
            <video controls preload="metadata" src={videoUrl} poster={previewImageUrl}>
              {t("Your browser does not support video playback.")}
            </video>
          ) : (
            <img src={previewImageUrl} alt={video.prompt || t("Generated AI video preview")} />
          )}
        </div>

        <div className={styles.resultDetails}>
          <section className={styles.resultSection}>
            <span>{t("Prompt")}</span>
            <p>{video.prompt || t("Not available")}</p>
          </section>

          {video.metadata && (
            <section className={styles.resultSection}>
              <span>{t("Metadata")}</span>
              {metadataItems?.length ? (
                <dl className={styles.metadataGrid}>
                  {metadataItems.map((item) => (
                    <div key={item.key}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>{video.metadata}</p>
              )}
            </section>
          )}

          <dl className={styles.resultGrid}>
            <div>
              <dt>{t("Creator")}</dt>
              <dd>{video.creatorKey}</dd>
            </div>
            <div>
              <dt>{t("Version")}</dt>
              <dd>{video.version}</dd>
            </div>
            <div>
              <dt>{t("Status")}</dt>
              <dd>{video.status}</dd>
            </div>
            <div>
              <dt>{t("Video ID")}</dt>
              <dd>{video.id}</dd>
            </div>
            {video.jobId && (
              <div className={styles.resultWideDetail}>
                <dt>{t("Job ID")}</dt>
                <dd>{video.jobId}</dd>
              </div>
            )}
          </dl>

          <button
            className={styles.resultAction}
            type="button"
            disabled={!videoUrl}
            onClick={() => {
              if (!videoUrl) return;
              DownloadImage(videoUrl, videoFileName);
            }}>
            {t("Download video")}
          </button>
        </div>
      </div>
    </article>
  );
}
