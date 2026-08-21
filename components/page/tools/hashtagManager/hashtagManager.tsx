import { KeyboardEvent, MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import Hashtags from "brancy/components/page/tools/hashtagManager/hashtaglist/hashtags";
import TrendHashtags from "brancy/components/page/tools/hashtagManager/trendhashtag/trendHashtags";
import { LanguageKey } from "brancy/i18n";
import { IHashtag } from "brancy/models/interfaces";
import styles from "./hashtagManager.module.css";
interface HashtagManagerProps {
  data: IHashtag | null;
  displayNewList: (e: MouseEvent) => void;
  onCopyHashtags: (hashtags: string[]) => void;
  onDeleteClick: (listId: number, listName: string, hashtags: string[]) => void;
  onEditClick: (listId: number, listName: string, hashtags: string[]) => void;
}
const HashtagManager = ({ data, displayNewList, onCopyHashtags, onDeleteClick, onEditClick }: HashtagManagerProps) => {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [isHidden, setIsHidden] = useState(false);

  const toggleManager = () => {
    setIsHidden((previousValue) => !previousValue);
  };

  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleManager();
    }
  };

  return (
    <section
      className={`tooBigCard ${styles.hashtagManager}`}
      style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}
      aria-labelledby="hashtagManagerTitle">
      <header
        className="headerChild"
        onClick={toggleManager}
        onKeyDown={handleHeaderKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={!isHidden}
        aria-controls="hashtagManagerContent">
        <div className="circle" aria-hidden="true"></div>
        <h2 className="Title" id="hashtagManagerTitle">
          {t(LanguageKey.page4_menu_hashtag_management)}
        </h2>
      </header>
      <div id="hashtagManagerContent" className={styles.managerContent} hidden={isHidden}>
        <ToggleButton
          options={[
            { label: t(LanguageKey.pageTools_TrendHashtags), id: ToggleOrder.FirstToggle },
            { label: t(LanguageKey.pageTools_hashtagList), id: ToggleOrder.SecondToggle },
          ]}
          onChange={setSelectedView}
          selectedValue={selectedView}
          ariaLabel={t(LanguageKey.page4_menu_hashtag_management)}
        />
        {selectedView === ToggleOrder.FirstToggle ? (
          <TrendHashtags />
        ) : (
          <Hashtags
            data={data}
            displayNewList={displayNewList}
            onCopyHashtags={onCopyHashtags}
            onDeleteClick={onDeleteClick}
            onEditClick={onEditClick}
          />
        )}
      </div>
    </section>
  );
};
export default HashtagManager;
