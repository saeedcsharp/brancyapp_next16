import styles from "./searchPage.module.css";
const SearchPage = () => {
  return (
    <>
      <div className={styles.search2}>
        <img className={styles.bgIcon} src="/bg.svg" />
        <div className={styles.hashtag1hashtag2}>
          <div className={styles.shoes}>#shoes</div>
        </div>

        <div className={styles.hashtag1hashtag238}>
          <div className={styles.shoes}>#shoes</div>
        </div>
        <div className={styles.header}>
          <div className={styles.iconClose}>
            <img className={styles.closeIcon} src="/close.svg" />
            <div className={styles.iconCloseChild} />
          </div>
          <div className={styles.hashtags}>Hashtags</div>
          <div className={styles.stores}>Stores</div>
          <div className={styles.persons}>Persons</div>
          <div className={styles.captions}>Captions</div>
          <div className={styles.campaigns}>Campaigns</div>
        </div>
        <div className={styles.button}>
          <div className={styles.button1}>Go to Hashtag Manager</div>
        </div>
        <div className={styles.bulletBlue} />
        <div className={styles.bulletBlue1} />
        <div className={styles.trendHashtags}>Trend Hashtags</div>
        <div className={styles.otherHashtags}>Other Hashtags</div>
        <div className={styles.lineTitleside1} />
        <div className={styles.lineTitleside2} />
        <div className={styles.inputSearch}>
          <div className={styles.rectangleParent}>
            <div className={styles.groupChild} />
            <div className={styles.groupItem} />
            <div className={styles.frame} />
          </div>
          <img className={styles.path1803Icon} src="/path-1803.svg" />
          <div className={styles.typingWrapper}>
            <div className={styles.typing}>Raima|</div>
          </div>
          <img className={styles.frameIcon} src="/frame.svg" />
        </div>
      </div>
    </>
  );
};

export default SearchPage;
