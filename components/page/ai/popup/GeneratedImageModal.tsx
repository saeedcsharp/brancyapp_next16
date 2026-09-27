import { IGetMedia } from "brancy/models/interfaces";
import styles from "./Modal_Generated.module.css";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { DownloadImage } from "brancy/helper/DownloadImage";
import { DateObject } from "react-multi-date-picker";
import { useTranslation } from "react-i18next";
import initialzedTime from "brancy/helper/manageTimer";
interface GeneratedImageModalProps {
  image: IGetMedia;
  onClose: () => void;
}

export interface MetadataItem {
  key: string;
  label: string;
  value: string;
}
function formatCreatedTime(timestamp: number) {
  const t = initialzedTime();
  const d = new DateObject({
    date: timestamp * 1000,
    calendar: t.calendar,
    locale: t.locale,
  });
  return d.format("YYYY/MM/DD HH:mm:ss");
}
function formatMetadataLabel(key: string): string {
  const label = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatMetadataValue(value: unknown, translate: (key: string) => string): string {
  if (value === null) return translate("Not available");
  if (typeof value === "boolean") return value ? translate("Yes") : translate("No");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function parseImageMetadata(
  metadata: string,
  translate: (key: string) => string = (key) => key,
): MetadataItem[] | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    return Object.entries(parsed).map(([key, value]) => ({
      key,
      label: formatMetadataLabel(key),
      value: formatMetadataValue(value, translate),
    }));
  } catch {
    return null;
  }
}

export default function GeneratedImageModal({ image, onClose }: GeneratedImageModalProps) {
  const { t } = useTranslation();
  const imageUrl = getClientMediaBaseUrl() + image.imageUrl;
  const imageFileName = image.imageUrl.split("/").pop()?.split("?")[0] || `generated-image-${image.id}.png`;
  const metadataItems = image.metadata ? parseImageMetadata(image.metadata, t) : null;
  const copyPrompt = async () => {
    if (!image.prompt || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(image.prompt);
  };

  return (
    <article className={styles.resultModal}>
      {/* <header className={styles.resultHeader}>
        <div>
          <span className={styles.resultEyebrow}>{t("AI image ready")}</span>
          <h2 id="modal-title">{t("Generated image")}</h2>
        </div>
        <button className={styles.resultClose} type="button" aria-label={t("Close")} onClick={onClose}>
          ×
        </button>
      </header> */}
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
            <span className={styles.promptSection}>{image.prompt || t("Not available")}</span>
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
              <dt>{t("image ID")}</dt>
              <dd>{image.id}</dd>
            </div>

            <div>
              <dt>{t("Created Time")}</dt>
              <dd>{formatCreatedTime(image.createdTime)}</dd>
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
