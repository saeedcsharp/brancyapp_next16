import { ChangeEvent, MouseEvent, useState } from "react";
import CheckBoxButton from "../design/checkBoxButton";
import InputText from "../design/inputText";
import styles from "./searchBar.module.css";
import SearchContent from "./searchContent";

const SearchBar = (prop: { removeMask: (e: MouseEvent) => void }) => {
  const [filterList, setFilterList] = useState([
    { value: "All", checked: false },
    { value: "Caption", checked: false },
    { value: "Stores", checked: false },
    { value: "Campaings", checked: false },
    { value: "Hashtags", checked: false },
    { value: "Products", checked: false },
  ]);
  const [contentList, setContentList] = useState();
  const [filter, setFilter] = useState("/iconbox-filter.svg");
  const [showPopup, setShowPopup] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleOnChange = (id: string) => {
    setFilterList((prevList) =>
      prevList.map((item) => (item.value === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleFilterIcon = () => {
    setFilter((prevFilter) =>
      prevFilter === "/iconbox-filter.svg" ? "/iconbox-filterselected.svg" : "/iconbox-filter.svg"
    );
    setShowPopup((prevShowPopup) => !prevShowPopup);
  };

  const toggleFilterPopup = () => {
    toggleFilterIcon(); // Toggle the filter icon state
  };

  //Api based on filterList and input box
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.currentTarget.value);
    //Api based on filterList and input box
    //Fill contentList by response (setContentList(response)
  };

  return (
    <div
      id="searchBar5"
      className={styles.searchBar1}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
      // style={{ display: "none" }}
    >
      <div className={styles.searchBar}>
        <InputText
          className={"serachMenuBar"}
          placeHolder={"Search"}
          maxLength={undefined}
          handleInputChange={handleInputChange}
          value={inputText}
        />

        <svg onClick={prop.removeMask} id="closeSearch" className={styles.iconboxClose} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="10" fill="var(--color-gray)" />
          <g fill="none" stroke="var(--color-white)" strokeLinecap="round" strokeWidth="2">
            <path d="M6 0 0 6" transform="translate(7 7)" />
            <path d="m0 0 6 6" transform="translate(7 7)" />
          </g>
        </svg>
      </div>
      <div className={styles.filterback}>
        <div
          className={`${styles.filter} ${filter === "/iconbox-filterselected.svg" ? styles.activeFilter : ""}`}
          onClick={toggleFilterPopup} // Add click handler to the filter div
        >
          <img className={styles.icon} alt="filter" src={filter} />
        </div>
      </div>
      <SearchContent data={contentList} />
      {showPopup && (
        <div className={`${styles.popup} ${styles[showPopup ? "showPopup" : "unShowPopup"]}`}>
          {filterList.map((item, index) => (
            <div key={index}>
              <CheckBoxButton
                handleToggle={() => handleOnChange(item.value)}
                value={item.checked}
                textlabel={item.value}
                title={"Toggle filter"}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
