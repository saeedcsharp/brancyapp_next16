import styles from "./videoList.module.css";

export default function VideoList({ openVideoCreator }: { openVideoCreator: () => void }) {
  return (
    <section className={styles.videoLibrary}>
      <div>
        <span aria-hidden="true">▶</span>
        <h2>Video studio</h2>
        <p>Create a new AI video. Your video library will appear here when history is available.</p>
      </div>
      <button type="button" onClick={openVideoCreator}>
        Create video
      </button>
    </section>
  );
}
