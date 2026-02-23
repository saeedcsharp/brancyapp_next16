import { useEffect, useRef, useState } from "react";
import styles from "brancy/components/headerTitle/headerTitle.module.css";

interface HeaderTitleProps {
  indexItem: number;
  titles: string[];
  handleSelectIndexItem: (indexItem: number) => void;
  style?: React.CSSProperties;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ indexItem, titles, handleSelectIndexItem, style }) => {
  const [headerId, setHeaderId] = useState(indexItem);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedElement = document.querySelector(`.${styles.filter}[data-index="${headerId}"]`) as HTMLElement;
    if (selectedElement && loaderRef.current && selectedElement.parentElement) {
      loaderRef.current.style.width = `${selectedElement.clientWidth}px`;
      loaderRef.current.style.left = `${
        selectedElement.getBoundingClientRect().left - selectedElement.parentElement.getBoundingClientRect().left
      }px`;
    }
  }, [headerId]);

  const handleSelectHeader = (index: number) => {
    setHeaderId(index);
    handleSelectIndexItem(index);
  };
  useEffect(() => {
    setHeaderId(indexItem);
  }, [indexItem]);
  return (
    <div className={styles.headermenu}>
      <div className={styles.header} style={style}>
        <div ref={loaderRef} className={styles.loader} />
        {titles.map((title, index) => (
          <div key={index} className={styles.filter} onClick={() => handleSelectHeader(index)} data-index={index}>
            <div className={index === headerId ? styles.title1 : styles.title2}>{title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeaderTitle;
