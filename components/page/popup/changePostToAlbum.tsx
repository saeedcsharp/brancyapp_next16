import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../i18n";
interface ChangePostToAlbumPopupProps {
  handleVerifyDeleteReels: () => void;
  handleCanselDeleteReels: () => void;
}

export default function ChangePostToAlbum({
  handleVerifyDeleteReels,
  handleCanselDeleteReels,
}: ChangePostToAlbumPopupProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="headerandinput" role="group">
        <div className="header" role="heading">
          <h2 id="quick-reply-title">changePostToAlbum</h2>
          <p>Do you want to delete reels</p>
        </div>
      </div>

      <div className="ButtonContainer" role="group">
        <button className={"saveButton"} onClick={handleVerifyDeleteReels} aria-label="Save quick reply settings">
          {t(LanguageKey.save)}
        </button>
        <button className="cancelButton" onClick={handleCanselDeleteReels} aria-label="Cancel quick reply settings">
          {t(LanguageKey.cancel)}
        </button>
      </div>
    </>
  );
}
