import { IGetMedia } from "brancy/models/interfaces";
import styles from "./Modal_Generated.module.css";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { DownloadImage } from "brancy/helper/DownloadImage";
import { PromptCodeBlock } from "./generatedMediaHelpers";
import { useTranslation } from "react-i18next";
import { formatGeneratedMediaTime, parseGeneratedMediaMetadata } from "./generatedMediaHelpers";
interface GeneratedImageModalProps {
  image: IGetMedia;
}

export default function GeneratedImageModal({ image }: GeneratedImageModalProps) {
  const { t } = useTranslation();
  const imageUrl = getClientMediaBaseUrl() + image.imageUrl;
  const imageFileName = image.imageUrl.split("/").pop()?.split("?")[0] || `generated-image-${image.id}.png`;
  const metadataItems = image.metadata ? parseGeneratedMediaMetadata(image.metadata, t) : null;
  const copyPrompt = async () => {
    if (!image.prompt || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(image.prompt);
  };

  return (
    <article className={styles.resultModal}>
      <div className={styles.resultContent}>
        <div className="headerandinput" style={{ gap: "20px" }}>
          <div className={styles.resultPreview}>
            <img src={imageUrl} alt={image.prompt || t("Generated AI image")} />
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
            <PromptCodeBlock prompt={image.prompt || t("Not available")} />

            {/* <section className={styles.resultSection}>
              <p></p>
            </section> */}
          </div>
        </div>

        <div className={styles.resultDetails}>
          {image.metadata && (
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
                <p>{image.metadata}</p>
              )}
            </section>
          )}

          <dl className={styles.resultGrid}>
            <div>
              <dt>{t("Creator")}</dt>
              <dd>{image.creatorKey}</dd>
            </div>
            <div>
              <dt>{t("Version")}</dt>
              <dd>{image.version}</dd>
            </div>
            <div>
              <dt>{t("Status")}</dt>
              <dd>{image.status}</dd>
            </div>
            <div>
              <dt>{t("image ID")}</dt>
              <dd>{image.id}</dd>
            </div>

            <div>
              <dt>{t("Created Time")}</dt>
              <dd>{formatGeneratedMediaTime(image.createdTime)}</dd>
            </div>

            {image.jobId && (
              <div className={styles.resultWideDetail}>
                <dt>{t("Job ID")}</dt>
                <dd>{image.jobId}</dd>
              </div>
            )}
          </dl>

          <button className="cancelButton" type="button" onClick={() => DownloadImage(imageUrl, imageFileName)}>
            {t("Download image")}
          </button>
        </div>
      </div>
    </article>
  );
}
