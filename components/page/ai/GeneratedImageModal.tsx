import { IGetImage } from "brancy/models/interfaces";
import styles from "./ImageCreator.module.css";

interface GeneratedImageModalProps {
  image: IGetImage;
  onClose: () => void;
}

export default function GeneratedImageModal({ image, onClose }: GeneratedImageModalProps) {
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
          <img src={image.imageUrl} alt={image.prompt || "Generated AI image"} />
        </div>

        <div className={styles.resultDetails}>
          <section className={styles.resultSection}>
            <span>Prompt</span>
            <p>{image.prompt || "—"}</p>
          </section>

          {image.metadata && (
            <section className={styles.resultSection}>
              <span>Metadata</span>
              <p>{image.metadata}</p>
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

          <a className={styles.resultAction} href={image.imageUrl} target="_blank" rel="noreferrer">
            Open full image
          </a>
        </div>
      </div>
    </article>
  );
}
