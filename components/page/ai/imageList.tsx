import RingLoader from "brancy/components/design/loader/ringLoder";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import initialzedTime from "brancy/helper/manageTimer";
import { DateObject } from "react-multi-date-picker";
import { parseImageMetadata } from "./generatedImageModal";
import styles from "./imageList.module.css";
import { IGetImage } from "brancy/models/interfaces";
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
  images: IGetImage[];
  loading: boolean;
  isLoadingMore: boolean;
  setSelectedImage: (image: IGetImage) => void;
  openImageCreator: () => void;
};
export default function ImageList({
  images,
  loading,
  isLoadingMore,
  setSelectedImage,
  openImageCreator,
}: ImageListProps) {
  return (
    <section className={styles.library} aria-label="Generated images">
      <div className={styles.libraryHeading}>
        <div>
          <h2>Image library</h2>
          <p>{images.length} creations loaded</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <RingLoader width={42} height={42} />
        </div>
      ) : images.length > 0 ? (
        <div className={styles.imageGrid}>
          {images.map((image) => {
            const metadata = image.metadata ? parseImageMetadata(image.metadata) : null;
            return (
              <article className={styles.imageCard} key={image.id}>
                <button className={styles.imagePreview} type="button" onClick={() => setSelectedImage(image)}>
                  <img src={getClientMediaBaseUrl() + image.imageUrl} alt={image.prompt || "Generated image"} />
                  <span>View details</span>
                </button>
                <div className={styles.imageInfo}>
                  <div className={styles.imageMetaLine}>
                    <span>{image.creatorKey}</span>
                    <time>{formatCreatedTime(image.createdTime)}</time>
                  </div>
                  <h3>{image.prompt || "Untitled generation"}</h3>
                  <p>{image.version}</p>
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
          <span aria-hidden="true">▧</span>
          <h2>No images yet</h2>
          <p>Your successful image generations will appear here.</p>
          <button type="button" onClick={openImageCreator}>
            Create your first image
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
