import styles from "./contentCreatorHeader.module.css";
type ContentCreatorHeaderProps = {
  activeTab: "image" | "video";
  setActiveTab: (tab: "image" | "video") => void;
  openImageCreator: () => void;
  openVideoCreator: () => void;
};
export default function ContentCreatorHeader({
  activeTab,
  setActiveTab,
  openImageCreator,
  openVideoCreator,
}: ContentCreatorHeaderProps) {
  return (
    <>
      <header className={styles.aiHeader}>
        <div>
          <span className={styles.eyebrow}>AI media studio</span>
          <h1>Your creations</h1>
          <p>Browse previous generations or start a new creative project.</p>
        </div>
        <button
          className={styles.createButton}
          type="button"
          onClick={activeTab === "image" ? openImageCreator : openVideoCreator}>
          <span aria-hidden="true">+</span>
          Create {activeTab === "image" ? "image" : "video"}
        </button>
      </header>
      <div className={styles.mediaTabs} role="tablist" aria-label="Media type">
        <button
          className={activeTab === "image" ? styles.mediaTabActive : styles.mediaTab}
          type="button"
          role="tab"
          aria-selected={activeTab === "image"}
          onClick={() => setActiveTab("image")}>
          <span className={styles.tabIcon} aria-hidden="true">
            ▧
          </span>
          <span>
            <strong>Images</strong>
            <small>Generated artwork and visuals</small>
          </span>
        </button>
        <button
          className={activeTab === "video" ? styles.mediaTabActive : styles.mediaTab}
          type="button"
          role="tab"
          aria-selected={activeTab === "video"}
          onClick={() => setActiveTab("video")}>
          <span className={styles.tabIcon} aria-hidden="true">
            ▶
          </span>
          <span>
            <strong>Videos</strong>
            <small>AI motion and clips</small>
          </span>
        </button>
      </div>
    </>
  );
}
