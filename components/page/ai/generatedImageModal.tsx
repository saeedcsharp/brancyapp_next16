import { IGetImage } from "brancy/models/interfaces";
import styles from "./ImageCreator.module.css";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { DownloadImage } from "brancy/helper/DownloadImage";

interface GeneratedImageModalProps {
  image: IGetImage;
  onClose: () => void;
}

export interface MetadataItem {
  key: string;
  label: string;
  value: string;
}

function formatMetadataLabel(key: string): string {
  const label = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatMetadataValue(value: unknown): string {
  if (value === null) return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function parseImageMetadata(metadata: string): MetadataItem[] | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    return Object.entries(parsed).map(([key, value]) => ({
      key,
      label: formatMetadataLabel(key),
      value: formatMetadataValue(value),
    }));
  } catch {
    return null;
  }
}

export default function GeneratedImageModal({ image, onClose }: GeneratedImageModalProps) {
  const imageUrl = getClientMediaBaseUrl() + image.imageUrl;
  const imageFileName = image.imageUrl.split("/").pop()?.split("?")[0] || `generated-image-${image.id}.png`;
  const metadataItems = image.metadata ? parseImageMetadata(image.metadata) : null;

  return (
    <article className={styles.resultModal}>
      <header className={styles.resultHeader}>
        <div>
          <span className={styles.resultEyebrow}>AI image ready</span>
          <h2 id="modal-title">Generated image</h2>
        </div>
        <button className={styles.resultClose} type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </header>

      <div className={styles.resultContent}>
        <div className={styles.resultPreview}>
          <img src={imageUrl} alt={image.prompt || "Generated AI image"} />
        </div>

        <div className={styles.resultDetails}>
          <section className={styles.resultSection}>
            <span>Prompt</span>
            <p>{image.prompt || "—"}</p>
          </section>

          {image.metadata && (
            <section className={styles.resultSection}>
              <span>Metadata</span>
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
              <dt>Creator</dt>
              <dd>{image.creatorKey}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{image.version}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{image.status}</dd>
            </div>
            <div>
              <dt>Image ID</dt>
              <dd>{image.id}</dd>
            </div>
            {image.jobId && (
              <div className={styles.resultWideDetail}>
                <dt>Job ID</dt>
                <dd>{image.jobId}</dd>
              </div>
            )}
          </dl>

          <button className={styles.resultAction} type="button" onClick={() => DownloadImage(imageUrl, imageFileName)}>
            Download image
          </button>
        </div>
      </div>
    </article>
  );
}
