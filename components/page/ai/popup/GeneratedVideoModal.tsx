import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import styles from "./Modal_Generated.module.css";
import { DownloadImage } from "brancy/helper/DownloadImage";
import { IGetMedia } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import { PromptCodeBlock } from "./generatedMediaHelpers";
import { formatGeneratedMediaTime, parseGeneratedMediaMetadata } from "./generatedMediaHelpers";
interface GeneratedVideoModalProps {
  video: IGetMedia;
}

const DEFAULT_VIDEO_THUMBNAIL = "/cover-video.svg";

export default function GeneratedVideoModal({ video }: GeneratedVideoModalProps) {
  const { t } = useTranslation();
  const videoUrl = video.videoUrl ? getClientMediaBaseUrl() + video.videoUrl : null;
  const videoFileName = video.videoUrl?.split("/").pop()?.split("?")[0] || `generated-video-${video.id}.mp4`;
  const previewImageUrl = video.imageUrl?.trim() ? getClientMediaBaseUrl() + video.imageUrl : DEFAULT_VIDEO_THUMBNAIL;
  const metadataItems = video.metadata ? parseGeneratedMediaMetadata(video.metadata, t) : null;
  const copyPrompt = async () => {
    if (!video.prompt || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(video.prompt);
  };

  return (
    <article className={styles.resultModal}>
      <div className={styles.resultContent}>
        <div className="headerandinput" style={{ gap: "20px" }}>
          <div className={styles.resultPreview}>
            {videoUrl ? (
              <video controls preload="metadata" src={videoUrl} poster={previewImageUrl}>
                {t("Your browser does not support video playback.")}
              </video>
            ) : (
              <img src={previewImageUrl} alt={video.prompt || t("Generated AI video preview")} />
            )}
          </div>
          <div className="headerandinput">
            <div className="headerparent">
              <span className="headertext">{t("Prompt")}</span>
              <button
                type="button"
                aria-label={t("Copy prompt")}
                title={t("Copy prompt")}
                onClick={copyPrompt}
                style={{ padding: 0, border: 0, cursor: "pointer", background: "transparent" }}>
                <img width="22px" height="22px" src="/copy.svg" alt="" />
              </button>
            </div>
            <PromptCodeBlock prompt={video.prompt || t("Not available")} />
            {/* <section className={styles.resultSection}>
              <p></p>
            </section> */}
          </div>
        </div>

        <div className={styles.resultDetails}>
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
            <div>
              <dt>{t("Created Time")}</dt>
              <dd>{formatGeneratedMediaTime(video.createdTime)}</dd>
            </div>

            {video.jobId && (
              <div className={styles.resultWideDetail}>
                <dt>{t("Job ID")}</dt>
                <dd>{video.jobId}</dd>
              </div>
            )}
          </dl>

          <button
            className="cancelButton"
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
