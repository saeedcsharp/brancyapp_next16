import { useRouter } from "next/navigation";
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
    <>
      <div></div>
      <div className="headerandinput" style={{ alignItems: "center" }}>
        <img style={{ width: "30%" }} src="/lock.svg" />
        <div className="title" style={{ textAlign: "center" }}>
          {t("featureNotAvailable")}
        </div>
        <div className="explain" style={{ textAlign: "center" }}>
          {t("featureNotAvailableDesc")}
        </div>
      </div>
      <div className="ButtonContainer">
        <button className={"cancelButton"} onClick={onClose}>
          {t("close")}
        </button>
        <button className={"saveButton"} onClick={handleUpgrade}>
          {t("upgrade")}
        </button>
      </div>
    </>
  );
}
