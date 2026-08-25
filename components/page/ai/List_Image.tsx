import DotLoaders from "brancy/components/design/loader/dotLoaders";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Loading from "brancy/components/notOk/loading";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { IGetMedia, PendingGeneration } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import { parseImageMetadata } from "./generatedImageModal";
import styles from "./List.module.css";
type ImageListProps = {
  images: IGetMedia[];
  loading: boolean;
  isLoadingMore: boolean;
  setSelectedImage: (image: IGetMedia) => void;
  pendingGenerations: PendingGeneration[];
};
export default function ImageList({
  images,
  loading,
  isLoadingMore,
  setSelectedImage,
  pendingGenerations,
}: ImageListProps) {
  const { t } = useTranslation();
  const pendingImages = pendingGenerations.filter((item) => item.mediaType === "image");
  return (
    <section aria-label={t("Generated images")}>
      {loading ? (
        <div className={styles.loadingContainer}>
          {" "}
          <Loading />
        </div>
      ) : images.length > 0 || pendingImages.length > 0 ? (
        <div className={styles.imageGrid}>
          {/* pending image card */}
          {pendingImages.map((pending) => (
            <article className={styles.imageCard} key={pending.clientContext}>
              <div className={`${styles.imagePreview} ${styles.pendingPreview}`} aria-label={t("Generating image")}>
                <RingLoader width={42} height={42} />
                <span>{t("Generating image")}</span>
              </div>
              <div className={styles.imageInfo}>
                <div className={styles.imageTitle}>{pending.prompt || t("Untitled generation")}</div>
                <div className={styles.imageMetaLine}>
                  <span className={styles.creatorKey}>{t("In progress")}</span>
                  <span className={styles.version}>{t("Waiting for the result")}</span>
                </div>
              </div>
            </article>
          ))}
          {/* created image card */}
          {images.map((image) => {
            const metadata = image.metadata ? parseImageMetadata(image.metadata, t) : null;
            return (
              <article className={styles.imageCard} key={image.id} onClick={() => setSelectedImage(image)}>
                <img
                  className={styles.imagePreview}
                  src={getClientMediaBaseUrl() + image.thumbnailUrl}
                  alt={image.prompt || t("Generated image")}
                />

                <div className={styles.imageInfo}>
                  <div className={styles.imageTitle}>{image.prompt || t("Untitled generation")}</div>
                  <div className={styles.imageMetaLine}>
                    <span className={styles.creatorKey}>{image.creatorKey}</span>
                    <span className={styles.version}>{image.version}</span>
                  </div>
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
