import RingLoader from "brancy/components/design/loader/ringLoder";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { DateObject } from "react-multi-date-picker";
import { parseImageMetadata } from "./GeneratedImageModal";
import styles from "./List.module.css";
import { IGetMedia, PendingGeneration } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import Loading from "brancy/components/notOk/loading";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
function formatCreatedTime(timestamp: number) {
  const t = initialzedTime();
  const d = new DateObject({
    date: timestamp * 1000,
    calendar: t.calendar,
    locale: t.locale,
  });
  return d.format("YYYY/MM/DD HH:mm:ss");
}
type ImageListProps = {
  images: IGetMedia[];
  loading: boolean;
  isLoadingMore: boolean;
  setSelectedImage: (image: IGetMedia) => void;
  openImageCreator: () => void;
  pendingGenerations: PendingGeneration[];
};
export default function ImageList({
  images,
  loading,
  isLoadingMore,
  setSelectedImage,
  openImageCreator,
  pendingGenerations,
}: ImageListProps) {
  const { t } = useTranslation();
  const pendingImages = pendingGenerations.filter((item) => item.mediaType === "image");
  return (
    <section aria-label={t("Generated images")}>
      {/* <div className={styles.libraryHeading}>
        <div>
          <h2>{t("Image library")}</h2>
          <p>{t("{count} creations loaded", { count: images.length })}</p>
        </div>
      </div> */}

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
                  {/* <time>{formatCreatedTime(image.createdTime)}</time> */}
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
                  src={getClientMediaBaseUrl() + image.imageUrl}
                  alt={image.prompt || t("Generated image")}
                />

                <div className={styles.imageInfo}>
                  <div className={styles.imageTitle}>{image.prompt || t("Untitled generation")}</div>
                  <div className={styles.imageMetaLine}>
                    <span className={styles.creatorKey}>{image.creatorKey}</span>
                    <span className={styles.version}>{image.version}</span>
                    {/* <time>{formatCreatedTime(image.createdTime)}</time> */}
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
