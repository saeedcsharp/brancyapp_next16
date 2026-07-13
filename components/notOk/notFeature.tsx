import { useRouter } from "next/navigation";
import styles from "./notFeature.module.css";
import { useTranslation } from "react-i18next";

interface NotFeatureProps {
  onClose: () => void;
}

export default function NotFeature({ onClose }: NotFeatureProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const handleUpgrade = () => {
    onClose();
    router.push("/upgrade");
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>🔒</span>
      </div>
      <h3 className={styles.title}>{t("featureNotAvailable")}</h3>
      <p className={styles.description}>{t("featureNotAvailableDesc")}</p>
      <div className={styles.actions}>
        <button className={"cancelButton"} onClick={onClose}>
          {t("close")}
        </button>
        <button className={"saveButton"} onClick={handleUpgrade}>
          {t("upgrade")}
        </button>
      </div>
    </div>
  );
}
