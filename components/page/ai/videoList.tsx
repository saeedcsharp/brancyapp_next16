import styles from "./videoList.module.css";
import { useTranslation } from "react-i18next";
export default function VideoList({ openVideoCreator }: { openVideoCreator: () => void }) {
  const { t } = useTranslation();
  return (
    <section className={styles.videoLibrary}>
      <div>
        <span aria-hidden="true">▶</span>
        <h2>{t("Video studio")}</h2>
        <p>{t("Create a new AI video. Your video library will appear here when history is available.")}</p>
      </div>
      <button type="button" onClick={openVideoCreator}>
        {t("Create video")}
      </button>
    </section>
  );
}
