import React, { ChangeEvent, useState } from "react";
import CheckBoxButton from "saeed/components/design/checkBoxButton";
import InputText from "saeed/components/design/inputText";
import RadioButton from "saeed/components/design/radioButton";
import styles from "./step2-cart.module.css";

// Define types
type FilterNames = "filter1" | "filter2" | "filter3" | "filter4" | "filter5" | "filter6";

interface FilterProps {
  title: FilterNames;
  options: React.ReactNode[];
}

const CustomerAds = () => {
  //  return <Soon />;
  // popup
  const [isCartOpen, setCartOpen] = useState(false);

  const toggleCart = () => {
    setCartOpen(!isCartOpen);
  };
  // popup end

  // State hooks
  const [showFilterOption, setShowFilterOption] = useState<Record<FilterNames, boolean>>({
    filter1: false,
    filter2: false,
    filter3: false,
    filter4: false,
    filter5: false,
    filter6: false,
  });

  const [iconRotation, setIconRotation] = useState<Record<FilterNames, number>>({
    filter1: -90,
    filter2: -90,
    filter3: -90,
    filter4: -90,
    filter5: -90,
    filter6: -90,
  });

  const [activeFilterOptions, setActiveFilterOptions] = useState<Record<FilterNames, boolean>>({
    filter1: false,
    filter2: false,
    filter3: false,
    filter4: false,
    filter5: false,
    filter6: false,
  });

  // Handle click on filter section
  const handleFilterSectionClick = (filterName: FilterNames) => {
    setShowFilterOption((prevState) => ({
      ...prevState,
      [filterName]: !prevState[filterName],
    }));
    setIconRotation((prevState) => ({
      ...prevState,
      [filterName]: prevState[filterName] === -90 ? -270 : -90,
    }));
    setActiveFilterOptions((prevState) => ({
      ...prevState,
      [filterName]: !prevState[filterName],
    }));
  };

  // Render filter section - start
  const renderFilterSection = ({ title, options }: FilterProps) => (
    <div className={styles.filtercontent}>
      <div className={styles.filtersection} onClick={() => handleFilterSectionClick(title)}>
        <div className={styles.filterheader}>{title}</div>
        <img
          className={styles.filterheadericon}
          src="/back-forward.svg"
          style={{ transform: `rotate(${iconRotation[title]}deg)` }}
          alt="filter icon"
        />
      </div>
      <div className={`${styles.filteroption} ${activeFilterOptions[title] ? styles.active : ""}`}>
        {options.map((option, index) => (
          <React.Fragment key={index}>{option}</React.Fragment>
        ))}
      </div>
    </div>
  );
  // Render filter section - end

  // filter for mobile - start
  const [isLeftVisible, setIsLeftVisible] = useState(true);

  const toggleLeftVisibility = () => {
    setIsLeftVisible(!isLeftVisible);
  };

  const hideLeft = () => {
    setIsLeftVisible(false);
  };
  // filter for mobile - end
  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    throw new Error("Function not implemented.");
  }

  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  const togglePopup = () => {
    setPopupOpen(!isPopupOpen);
  };

  const handleTabClick = (index: number) => {
    setSelectedTabIndex(index);
  };
  return (
    <>
      <div className={styles.pinContainer}>
        <div className={`${styles.left} ${isLeftVisible ? styles.visible : ""}`}>
          <div className={styles.logo}>
            <svg width="175" height="45" viewBox="0 0 175 45">
              <path d="M31.5 10a8 8 0 0 1-2.2 4.2A12 12 0 0 1 25 17q6 2.1 5 8a11 11 0 0 1-5.5 8.3Q20 36 12.2 36a55 55 0 0 1-7.4-.7l-2.4-.7a3.4 3.4 0 0 1-2.3-4.1L4.6 4.2a3 3 0 0 1 1-1.9 6 6 0 0 1 2-1 23 23 0 0 1 4.8-1l6-.3q7.1 0 10.5 2.4t2.6 7.5Zm-19.1 4.3h4a6 6 0 0 0 3.7-.9 4 4 0 0 0 1.5-2.6 2.4 2.4 0 0 0-.8-2.5 6 6 0 0 0-3.6-.9h-2l-1.7.3ZM20 24.6q.6-3.4-4-3.4h-5L10 28l2 .3h2.3a8 8 0 0 0 3.8-.9 4 4 0 0 0 2-2.9M41.4 35l-1.8.4-2.5.2q-2.8 0-3.9-1t-.6-3.6l3-16.7a6 6 0 0 1 1.2-2.8 10 10 0 0 1 2.7-2.1 19 19 0 0 1 4.9-1.8 25 25 0 0 1 5.5-.7q6.1 0 5.3 4.4l-.6 1.9-.9 1.5-3-.3-3 .4a11 11 0 0 0-3 1zM70 6.9a21 21 0 0 1 5.5.6 10 10 0 0 1 3.9 1.9 7 7 0 0 1 2.1 3.2 10 10 0 0 1 .2 4.6l-2.2 12.6a4 4 0 0 1-1.2 2.4L76 33.8Q72 36 65.5 36a22 22 0 0 1-5.3-.6 10 10 0 0 1-3.7-1.6 6 6 0 0 1-2.2-3 8 8 0 0 1-.2-4 9 9 0 0 1 3.3-6 15 15 0 0 1 7.6-2.5l7.4-.8V17a2 2 0 0 0-1-2.4 9 9 0 0 0-4-.7 20 20 0 0 0-4 .5l-4 1.1a3 3 0 0 1-.9-1.5 5 5 0 0 1-.1-2.2 4 4 0 0 1 1-2.4A7 7 0 0 1 62 8.1a19 19 0 0 1 4-1zM66.8 29l2.1-.2 1.8-.5.8-4.5-4 .3a7 7 0 0 0-2.8.7 2 2 0 0 0-1.3 1.7 2 2 0 0 0 .6 1.8 4 4 0 0 0 2.8.7m44.2 6-1.7.4-2.6.2q-2.7 0-3.8-1t-.6-3.6l2.3-13.3a3 3 0 0 0-.6-2.5 4 4 0 0 0-2.6-.8l-2.1.2-2 .8L93.9 35l-1.8.4-2.5.2q-2.8 0-3.9-1t-.6-3.6l3-17a5 5 0 0 1 1-2.4l2-1.7a19 19 0 0 1 5.2-2.2 25 25 0 0 1 6.5-.8q6.3 0 9.3 2.8t2 7.8zm24.8-20.6a9 9 0 0 0-2.7.5 8 8 0 0 0-2.4 1.3 9 9 0 0 0-2 2.2 9 9 0 0 0-1 3.1q-.6 3.5 1 5.2a6 6 0 0 0 4.6 1.7 10 10 0 0 0 3-.4l2.4-1a5 5 0 0 1 1.3 1.8 4 4 0 0 1 .2 2.2 5 5 0 0 1-2.8 3.6 14 14 0 0 1-6.6 1.3 19 19 0 0 1-6.1-.9 10 10 0 0 1-4.4-2.7 10 10 0 0 1-2.2-4.6 16 16 0 0 1 0-6.2 19 19 0 0 1 2.3-6.5 16 16 0 0 1 4-4.5 17 17 0 0 1 5.3-2.7 20 20 0 0 1 5.9-1q4 0 6 1.5a4 4 0 0 1 1.5 3.8 5 5 0 0 1-.9 2l-1.4 1.6-2.2-.9a9 9 0 0 0-2.8-.4m13.9 13.7a94 94 0 0 1-2.8-19 9 9 0 0 1 2.4-1.4 8 8 0 0 1 3-.5 5 5 0 0 1 3 .8 4 4 0 0 1 1.4 3l.9 7.8q.5 3.8.8 7.7h.3l2-4.1 2-4.7 2-4.8 1.8-4.7 2-.8 2.2-.2a6 6 0 0 1 3.3.8q1.3.8 1 3a28 28 0 0 1-1.7 5.3q-1.2 3.1-3 6.5t-3.6 6.6T163 35a51 51 0 0 1-7.2 8.1q-3.1 2.7-5.8 2.7a5 5 0 0 1-3.5-1.5 5 5 0 0 1-1.2-3.6q2-1.5 4.2-3.5l3.8-3.8a4 4 0 0 1-1.8-1.4 11 11 0 0 1-1.7-3.9Z" />
            </svg>
          </div>

          <div className={styles.sublogo}>Ads Campaign</div>
          <div className={styles.filtersectionheader}>
            <div className={styles.filterheadertitle}>Filters</div>
            <div className={styles.resetfilter}>Reset</div>
          </div>

          <div className={styles.filter}>
            <div className={styles.filtercontent}>
              <div className={styles.filtersection} onClick={() => handleFilterSectionClick("filter1")}>
                <div className={styles.filterheader}>sort by</div>
                <div className={styles.filterstate}>
                  <div className={styles.filterstateactive}></div>
                  <img
                    className={styles.filterheadericon}
                    src="/back-forward.svg"
                    style={{ transform: `rotate(${iconRotation.filter1}deg)` }}
                  />
                </div>
              </div>
              <div className={`${styles.filteroption} ${activeFilterOptions.filter1 ? styles.active : ""}`}>
                <RadioButton
                  name={"all"}
                  id={"all"}
                  checked={true}
                  handleOptionChanged={(e: React.ChangeEvent<HTMLInputElement>) => {
                    throw new Error("Function not implemented.");
                  }}
                  textlabel={"all"}
                  title={"all"}
                />
                <RadioButton
                  name={"only verified"}
                  id={"only-verified"}
                  checked={false}
                  handleOptionChanged={(e: React.ChangeEvent<HTMLInputElement>) => {
                    throw new Error("Function not implemented.");
                  }}
                  textlabel={"only verified"}
                  title={" only verified"}
                />

                <div className={styles.filtersort}>
                  <RadioButton
                    name={"price"}
                    id={"price"}
                    checked={false}
                    handleOptionChanged={(e: React.ChangeEvent<HTMLInputElement>) => {
                      throw new Error("Function not implemented.");
                    }}
                    textlabel={"price"}
                    title={" price"}
                  />
                  <div className={styles.filterupdown}>
                    <div>
                      <svg width="11" height="14" viewBox="0 0 11 14" className={styles.filterup}>
                        <path d="M6.4 13V3.3l3 3a1 1 0 0 0 1.3 0 1 1 0 0 0 0-1.4L6.2.3a1 1 0 0 0-1.4 0L.3 4.9a1 1 0 0 0 0 1.4 1 1 0 0 0 1.3 0l3-3V13a1 1 0 1 0 1.8 0" />
                      </svg>
                    </div>
                    <div>
                      <svg className={styles.filterdown} width="11" height="14" viewBox="0 0 11 14">
                        <path d="M4.6 1v9.7l-3-3a1 1 0 0 0-1.3 0 1 1 0 0 0 0 1.4l4.5 4.6a1 1 0 0 0 1.4 0l4.5-4.6a1 1 0 0 0 0-1.4 1 1 0 0 0-1.3 0l-3 3V1a1 1 0 1 0-1.8 0" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.filtersort}>
                  <RadioButton
                    name={"follower"}
                    id={"follower"}
                    checked={false}
                    handleOptionChanged={(e: React.ChangeEvent<HTMLInputElement>) => {
                      throw new Error("Function not implemented.");
                    }}
                    textlabel={"follower"}
                    title={" follower"}
                  />
                  <div className={styles.filterupdown}>
                    <div>
                      <svg width="11" height="14" viewBox="0 0 11 14" className={styles.filterup}>
                        <path d="M6.4 13V3.3l3 3a1 1 0 0 0 1.3 0 1 1 0 0 0 0-1.4L6.2.3a1 1 0 0 0-1.4 0L.3 4.9a1 1 0 0 0 0 1.4 1 1 0 0 0 1.3 0l3-3V13a1 1 0 1 0 1.8 0" />
                      </svg>
                    </div>
                    <div>
                      <svg className={styles.filterdown} width="11" height="14" viewBox="0 0 11 14">
                        <path d="M4.6 1v9.7l-3-3a1 1 0 0 0-1.3 0 1 1 0 0 0 0 1.4l4.5 4.6a1 1 0 0 0 1.4 0l4.5-4.6a1 1 0 0 0 0-1.4 1 1 0 0 0-1.3 0l-3 3V1a1 1 0 1 0-1.8 0" />
                      </svg>
                    </div>
                  </div>
                </div>

                <RadioButton
                  name={"rating"}
                  id={"rating"}
                  checked={false}
                  handleOptionChanged={(e: React.ChangeEvent<HTMLInputElement>) => {
                    throw new Error("Function not implemented.");
                  }}
                  textlabel={"rating"}
                  title={" rating"}
                />
                <RadioButton
                  name={"reach"}
                  id={"reach"}
                  checked={false}
                  handleOptionChanged={(e: React.ChangeEvent<HTMLInputElement>) => {
                    throw new Error("Function not implemented.");
                  }}
                  textlabel={" reach"}
                  title={" reach"}
                />
                <RadioButton
                  name={"engagement"}
                  id={"engagement"}
                  checked={false}
                  handleOptionChanged={(e: React.ChangeEvent<HTMLInputElement>) => {
                    throw new Error("Function not implemented.");
                  }}
                  textlabel={" engagement"}
                  title={" engagement"}
                />
              </div>
            </div>

            <div className={styles.filtercontent}>
              <div
                className={styles.filtersection}
                style={{ borderTop: "1px solid var(--color-light-blue30)" }}
                onClick={() => handleFilterSectionClick("filter2")}>
                <div className={styles.filterheader}>category</div>
                <div className={styles.filterstate}>
                  <div className={styles.filterstateactive}></div>
                  <img
                    className={styles.filterheadericon}
                    src="/back-forward.svg"
                    style={{ transform: `rotate(${iconRotation.filter2}deg)` }}
                  />
                </div>
              </div>
              <div className={`${styles.filteroption} ${activeFilterOptions.filter2 ? styles.active : ""}`}>
                <div className={styles.filtercategory}>
                  <CheckBoxButton
                    handleToggle={function (): void {
                      throw new Error("Function not implemented.");
                    }}
                    value={false}
                    textlabel={"tech"}
                    title={"Tech"}></CheckBoxButton>
                  <div className={styles.filtercategorycounter}>32</div>
                </div>

                <div className={styles.filtercategory}>
                  <CheckBoxButton
                    handleToggle={function (): void {
                      throw new Error("Function not implemented.");
                    }}
                    value={false}
                    textlabel={"life"}
                    title={"Life"}></CheckBoxButton>
                  <div className={styles.filtercategorycounter}>12</div>
                </div>
                <div className={styles.filtercategory}>
                  <CheckBoxButton
                    handleToggle={function (): void {
                      throw new Error("Function not implemented.");
                    }}
                    value={false}
                    textlabel={"game"}
                    title={"game"}></CheckBoxButton>
                  <div className={styles.filtercategorycounter}>42</div>
                </div>

                <div className={styles.filtercategory}>
                  <CheckBoxButton
                    handleToggle={function (): void {
                      throw new Error("Function not implemented.");
                    }}
                    value={false}
                    textlabel={"fashion"}
                    title={"Fashion"}></CheckBoxButton>
                  <div className={styles.filtercategorycounter}>100</div>
                </div>
              </div>
            </div>

            <div className={styles.filtercontent}>
              <div
                className={styles.filtersection}
                style={{ borderTop: "1px solid var(--color-light-blue30)" }}
                onClick={() => handleFilterSectionClick("filter3")}>
                <div className={styles.filterheader}>price</div>
                <div className={styles.filterstate}>
                  <div className={styles.filterstateactive}></div>
                  <img
                    className={styles.filterheadericon}
                    src="/back-forward.svg"
                    style={{ transform: `rotate(${iconRotation.filter3}deg)` }}
                  />
                </div>
              </div>
              <div className={`${styles.filteroption} ${activeFilterOptions.filter3 ? styles.active : ""}`}>
                <div className={styles.roll}></div>
              </div>
            </div>

            <div className={styles.filtercontent}>
              <div
                className={styles.filtersection}
                style={{ borderTop: "1px solid var(--color-light-blue30)" }}
                onClick={() => handleFilterSectionClick("filter4")}>
                <div className={styles.filterheader}>rating</div>
                <div className={styles.filterstate}>
                  <div className={styles.filterstateactive}></div>
                  <img
                    className={styles.filterheadericon}
                    src="/back-forward.svg"
                    style={{ transform: `rotate(${iconRotation.filter4}deg)` }}
                  />
                </div>
              </div>
              <div className={`${styles.filteroption} ${activeFilterOptions.filter4 ? styles.active : ""}`}>
                <div className={styles.roll}></div>
              </div>
            </div>

            <div className={styles.filtercontent}>
              <div
                className={styles.filtersection}
                style={{ borderTop: "1px solid var(--color-light-blue30)" }}
                onClick={() => handleFilterSectionClick("filter5")}>
                <div className={styles.filterheader}>followers</div>
                <div className={styles.filterstate}>
                  <div className={styles.filterstateactive}></div>
                  <img
                    className={styles.filterheadericon}
                    src="/back-forward.svg"
                    style={{ transform: `rotate(${iconRotation.filter5}deg)` }}
                  />
                </div>{" "}
              </div>
              <div className={`${styles.filteroption} ${activeFilterOptions.filter5 ? styles.active : ""}`}>
                <div className={styles.roll}></div>
              </div>
            </div>

            <div className={styles.filtercontent}>
              <div
                className={styles.filtersection}
                style={{ borderTop: "1px solid var(--color-light-blue30)" }}
                onClick={() => handleFilterSectionClick("filter6")}>
                <div className={styles.filterheader}>hashtags</div>
                <div className={styles.filterstate}>
                  <div className={styles.filterstateactive}></div>
                  <img
                    className={styles.filterheadericon}
                    src="/back-forward.svg"
                    style={{ transform: `rotate(${iconRotation.filter6}deg)` }}
                  />
                </div>
              </div>
              <div className={`${styles.filteroption} ${activeFilterOptions.filter6 ? styles.active : ""}`}>
                <div className={styles.hashtaglist}>
                  <div className={styles.hashtag}>hashtag</div>
                  <div className={styles.hashtag}>hashtag1</div>
                  <div className={styles.hashtag}>hashtag2</div>
                  <div className={styles.hashtag}>hashtag3</div>
                  <div className={styles.hashtag}>hashtag4</div>
                  <div className={styles.hashtag}>hashtag5</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.filterbutton} onClick={hideLeft}>
            <div className="saveButton">show 254 results</div>
          </div>
        </div>
        <div className={styles.maincard}>
          <div className={styles.header}>
            <div className={styles.headerTab}>
              <svg className={styles.logomobile} fill="none" height="25" viewBox="0 0 175 46">
                <path d="M31.5 10a8 8 0 0 1-2.2 4.2A12 12 0 0 1 25 17q6 2.1 5 8-.9 5.7-5.5 8.3T12.2 36a56 56 0 0 1-7.4-.7l-2.4-.7Q-.5 33.4.1 30.5L4.6 4.2a3 3 0 0 1 1-1.9q.7-.6 2-1 2-.7 4.8-1l6-.3q7 0 10.5 2.4t2.6 7.5m-19.1 4.3h4q2.5 0 3.7-.9a4 4 0 0 0 1.5-2.6q.3-1.5-.8-2.5t-3.6-.9l-3.7.3zM20 24.6q.6-3.4-4-3.4h-5L10 28l2 .3h2.3q2.2 0 3.8-.9a4 4 0 0 0 2-2.9M41.4 35a18 18 0 0 1-4.3.6q-2.9 0-3.9-1t-.6-3.6l3-16.7q.1-1.6 1.2-2.8t2.7-2.1q2-1.2 4.9-1.8 2.7-.7 5.5-.7 6 0 5.3 4.4l-.6 1.9-.9 1.5a15 15 0 0 0-9 1zM70 6.9q3 0 5.5.6 2.2.6 3.9 1.9 1.5 1.2 2.1 3.2t.2 4.6l-2.2 12.6q-.3 1.5-1.2 2.4L76 33.8A22 22 0 0 1 65.5 36q-3 0-5.3-.6t-3.7-1.7a6 6 0 0 1-2.2-2.8 8 8 0 0 1-.2-4 9 9 0 0 1 3.3-6q2.7-2.2 7.6-2.7l7.4-.7V17q.5-1.7-1-2.4-1.2-.7-4-.7a25 25 0 0 0-8 1.6 3 3 0 0 1-1-1.6q-.2-1 0-2.1.2-1.5 1-2.4.9-.7 2.5-1.5 1.7-.6 4-.9zM66.8 29l2.1-.2q1.2-.2 1.8-.5l.8-4.5-4.1.3q-1.6 0-2.7.7-1 .6-1.3 1.7a2 2 0 0 0 .6 1.8q.7.7 2.8.7m44.2 6a18 18 0 0 1-4.3.6q-2.7 0-3.8-1t-.6-3.6l2.3-13.3q.3-1.7-.6-2.5-1-.9-2.6-.8l-2.1.2-2 .8L93.9 35a18 18 0 0 1-4.3.6q-2.9 0-3.9-1-1.1-.9-.6-3.6l3-17q.2-1.5 1-2.4.8-1 2-1.7 2.2-1.5 5.2-2.2t6.5-.8q6.3 0 9.3 2.8t2 7.8zm24.8-20.6q-1.4 0-2.7.5t-2.4 1.3a9 9 0 0 0-3 5.3q-.5 3.4 1 5.2a6 6 0 0 0 4.6 1.7q1.7 0 3-.4 1.5-.4 2.4-1 1 .9 1.3 1.8t.2 2.2q-.4 2.2-2.8 3.6-2.5 1.3-6.6 1.3-3.5 0-6.1-.9-2.7-.9-4.4-2.8a10 10 0 0 1-2.2-4.5q-.6-2.6 0-6.2t2.3-6.5a16 16 0 0 1 9.3-7.2q3-1 5.9-1 4 0 6 1.5 1.8 1.5 1.5 3.8-.2 1-.9 2l-1.4 1.6-2.2-.9a9 9 0 0 0-2.8-.4m13.9 13.7a85 85 0 0 1-2.8-19 9 9 0 0 1 5.3-2q2 0 3.1.9 1.2.7 1.4 3l.9 7.8.8 7.7h.3a92 92 0 0 0 4-8.8l3.8-9.5 2-.8q1.2-.3 2.2-.2 2 0 3.3.8t1 3a28 28 0 0 1-1.7 5.3A78 78 0 0 1 162.9 35a51 51 0 0 1-7.2 8.1q-3 2.7-5.8 2.7-2.3 0-3.5-1.5-1.3-1.3-1.2-3.6a56 56 0 0 0 8-7.3q-.9-.3-1.8-1.4t-1.7-3.9"></path>
              </svg>

              <div
                className={styles.sublogomobile}
                style={{
                  top: "42px",
                  left: "15px",
                  fontSize: "var(--font-10)",
                }}>
                Ads Campaign
              </div>

              <div className={styles.pageheaders}>
                <div className={styles.iconboxsearch}>
                  <svg className={styles.icon} viewBox="0 0 20 20">
                    <path d="M8.9 3.4A6 6 0 0 0 4 6.5a6 6 0 0 0-.5 3.7 1 1 0 0 0 1 .8 1 1 0 0 0 .8-1.1 4 4 0 0 1 .4-2.6 5 5 0 0 1 3.3-2 1 1 0 0 0 .5-1.7zm10.8 14.9L16 14.5l-.9-.3a8.6 8.6 0 1 0-.8.8l.2 1 3.8 3.7.7.3.7-.3.1-.1a1 1 0 0 0 0-1.3M8.6 15.2a6.6 6.6 0 1 1 6.6-6.6 6.7 6.7 0 0 1-6.6 6.6" />
                  </svg>
                </div>

                <div className={styles.iconboxnotice}>
                  <svg className={styles.icon} viewBox="0 0 20 20">
                    <path d="M19.1 14.2a4 4 0 0 1-1.3-2.8V8A7.8 7.8 0 1 0 2.2 8v3.4a4 4 0 0 1-1.4 2.8v.1a2 2 0 0 0-.7 2.3 2 2 0 0 0 2 1.6h5.4a2.7 2.7 0 0 0 5.1 0h5.3a2 2 0 0 0 2-1.5 2 2 0 0 0-.8-2.5m-1.3 1.9H2.1v-.2a6 6 0 0 0 2.2-4.5V8a5.7 5.7 0 1 1 11.4 0v3.4a6 6 0 0 0 2.2 4.5Z" />
                  </svg>

                  <div className={styles.reddot}></div>
                </div>
                <div className={styles.iconboxcart} onClick={toggleCart}>
                  <svg className={styles.icon} viewBox="0 0 20 20">
                    <path d="M19 7.4 18.7 6v-.2c-.2-.5-1-4-4.2-5.4A7 7 0 0 0 12 0H7.2L5.3.5l-.7.4A8 8 0 0 0 1.3 6v.2L1 7.4l-1 8.3v.1A4.3 4.3 0 0 0 4.4 20h11.2a4.3 4.3 0 0 0 4.4-4.2Zm-4.5-4.1H5l.9-.7L7.3 2H12l1.6.4 1.2.9zm1 14.7h-11a2 2 0 0 1-2.3-2.1l1-8.3v-.1l.2-.9a2 2 0 0 1 2-1.3h9.1a2 2 0 0 1 1.9 1l.3.4.1.8 1 8.4a2 2 0 0 1-2.2 2M15 7.8v.8a5 5 0 0 1-5 4.9A5 5 0 0 1 6.3 12a5 5 0 0 1-1.5-3.5v-1a1 1 0 0 1 1-1 1 1 0 0 1 .9.4l.3.7v1a3 3 0 0 0 .8 2 3 3 0 0 0 2.1.7 3 3 0 0 0 3-2.8v-.8a1 1 0 0 1 2.1 0" />
                  </svg>

                  <div className={styles.reddot}></div>
                </div>
                <img className={styles.ProfileIcon} alt="instagram profile picture" src={"/no-profile.svg"} />
              </div>
            </div>
            <div className={styles.searchmobile}>
              <div className={styles.searchBar}>
                <InputText
                  className={"serachMenuBar"}
                  placeHolder={"Search"}
                  maxLength={undefined}
                  handleInputChange={handleInputChange}
                  value={""}
                />
                <svg className={styles.iconboxClose} viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="10" fill="var(--color-gray)" />
                  <g fill="none" stroke="var(--color-white)" strokeLinecap="round" strokeWidth="2">
                    <path d="M6 0 0 6" transform="translate(7 7)" />
                    <path d="m0 0 6 6" transform="translate(7 7)" />
                  </g>
                </svg>
              </div>

              <div
                className={styles.filtermobilebtn}
                onClick={toggleLeftVisibility}
                // onClick={handleFilterClick}
              >
                <img loading="lazy" decoding="async" alt="filter" src="/iconbox-filter.svg" style={{ width: "25px" }} />
              </div>
            </div>
            <div className={styles.filtermobile}>
              <div className={styles.filtermobileactive}>
                Verified
                <svg className={styles.filtermobileiconClose} viewBox="4 4 13 12">
                  <g fill="none" strokeLinecap="round" strokeWidth="2">
                    <path d="M6 0 0 6" transform="translate(7 7)" />
                    <path d="m0 0 6 6" transform="translate(7 7)" />
                  </g>
                </svg>
              </div>
              <div className={styles.filtermobileactive}>
                follower{" "}
                <svg className={styles.filtermobileiconClose} viewBox="4 4 13 12">
                  <g fill="none" strokeLinecap="round" strokeWidth="2">
                    <path d="M6 0 0 6" transform="translate(7 7)" />
                    <path d="m0 0 6 6" transform="translate(7 7)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          {/* ___*/}
          {isCartOpen && (
            <div className={styles.cartsummary}>
              <div className={styles.selectedlist}>
                <div className={styles.selectedpage}>
                  <div className={styles.summaryrow}>
                    <div className="instagramprofile">
                      <img
                        className="instagramimage"
                        alt="profile image"
                        src="/no-profile.svg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/no-profile.svg";
                        }}
                      />

                      <div className="instagramprofiledetail">
                        <div className="instagramusername">ahoora.niazi</div>
                        <div className="instagramid">@ahoora.niazi</div>
                      </div>
                    </div>

                    <svg className={styles.delete} viewBox="0 0 21 24">
                      <path d="M20 4h-4.8v-.7A2.7 2.7 0 0 0 12.5.6H7.8a2.7 2.7 0 0 0-2.7 2.7v.8H.2a.8.8 0 0 0 0 1.5h1.1V21A3.6 3.6 0 0 0 5 24.6h10.4A3.6 3.6 0 0 0 19 21V5.6h1A.8.8 0 1 0 20 4M6.7 3.4a1.2 1.2 0 0 1 1.2-1.2h4.7a1.2 1.2 0 0 1 1.2 1.2v.8H6.6ZM17.5 21a2 2 0 0 1-2.1 2.1H5A2 2 0 0 1 2.8 21V5.6h14.7ZM6.7 18.4V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7 1 1 0 0 1-.7-.7m5.6.5-.2-.5V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7z" />
                    </svg>
                  </div>

                  <div
                    className={styles.summaryrow}
                    style={{
                      paddingBottom: "20px",
                      borderBottom: "1px solid var(--color-gray60)",
                    }}>
                    <div className={styles.hourkind}>
                      <svg className={styles.halfday} width="30" height="30" viewBox="0 0 127 126">
                        <text font-size="var(--font-50)" transform="translate(39 82)">
                          12
                        </text>
                        <path d="M7.8 36.5a60 60 0 0 1 28-29L33 4.2a15 15 0 0 0-20.2 1.4l-8 9.2A15 15 0 0 0 6.2 35ZM91.1 7.2a60 60 0 0 1 28.6 28.5L123 33a15 15 0 0 0-1-20.2l-9-8.2a15 15 0 0 0-20.3 1Zm9.5 11.8a57 57 0 0 0-36-13 57.9 57.9 0 0 0-45 94l-10 17a8 8 0 0 0 2 7 6 6 0 0 0 6 2l19-12a56 56 0 0 0 56 0l19 12c2.4 1 5-.2 7-2s1.8-4.5 1-7l-10-18a56.7 56.7 0 0 0-9-80m-36 94a50 50 0 0 1-46-31 49 49 0 0 1 11-54 49 49 0 0 1 54-10 49 49 0 0 1 30 46c0 13.2-4.7 25.7-14 35a49 49 0 0 1-35 14" />
                      </svg>

                      <svg className={styles.fulday} width="30" height="30" viewBox="0 0 127 126">
                        <text font-size="var(--font-50)" transform="translate(35 82)">
                          24
                        </text>
                        <path d="M7.8 36.5a60 60 0 0 1 28-29L33 4.2a15 15 0 0 0-20.2 1.4l-8 9.2A15 15 0 0 0 6.2 35ZM91.1 7.2a60 60 0 0 1 28.6 28.5L123 33a15 15 0 0 0-1-20.2l-9-8.2a15 15 0 0 0-20.3 1Zm9.5 11.8a57 57 0 0 0-36-13 57.9 57.9 0 0 0-45 94l-10 17a8 8 0 0 0 2 7 6 6 0 0 0 6 2l19-12a56 56 0 0 0 56 0l19 12c2.4 1 5-.2 7-2s1.8-4.5 1-7l-10-18a56.7 56.7 0 0 0-9-80m-36 94a50 50 0 0 1-46-31 49 49 0 0 1 11-54 49 49 0 0 1 54-10 49 49 0 0 1 30 46c0 13.2-4.7 25.7-14 35a49 49 0 0 1-35 14" />
                      </svg>
                    </div>
                    <div className={styles.price}>23.222.000</div>
                  </div>
                </div>
              </div>
              <div className={styles.bottom}>
                <div className={styles.alert}>
                  <svg className={styles.alertsvg} width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8 16a8 8 0 1 1 8-8 8 8 0 0 1-8 8m-1.6-4.9-.3.1-.1.4a.4.4 0 0 0 .4.4h3.2a.5.5 0 0 0 0-.9L9 11V7H6.4a.5.5 0 0 0 0 .9L7 8v3zM7 4v2h2V4H8Z" />
                  </svg>

                  <div className={styles.alerttext}>
                    To create a campaign, your cart must contain at least <strong>5</strong> items
                  </div>
                </div>
                <div className="disableButton">Need 2 item to continue</div>
                <div className="saveButton">continue</div>
              </div>
            </div>
          )}

          {/* ___*/}

          <div className={styles.wrap}>
            <div className={styles.card} onClick={togglePopup}>
              <div className={styles.profile}>
                <img className={styles.profileimage} alt="instagram profile picture" src="/no-profile.svg"></img>

                <div className={styles.name}>ahoora niazi</div>
                <div className={styles.username}>@ahoora.niazi</div>
              </div>
              <div className={styles.dataparent}>
                <div
                  className={styles.data}
                  style={{
                    borderBottom: "1px solid var(--color-gray30)",
                  }}>
                  <div className={styles.section}>
                    <div
                      className={styles.number}
                      style={{
                        color: "var(--color-dark-blue)",
                      }}>
                      567k
                    </div>
                    follower
                  </div>

                  <div
                    className={styles.section}
                    style={{
                      borderLeft: "1px solid var(--color-gray30)",
                    }}>
                    <div
                      className={styles.number}
                      style={{
                        color: "var(--color-light-yellow)",
                      }}>
                      567k
                    </div>
                    rating
                  </div>
                </div>
                <div
                  className={styles.data}
                  style={{
                    borderBottom: "1px solid var(--color-gray30)",
                  }}>
                  <div className={styles.section}>
                    <div
                      className={styles.number}
                      style={{
                        color: "var(--color-purple)",
                      }}>
                      567
                    </div>
                    reach
                  </div>

                  <div
                    className={styles.section}
                    style={{
                      borderLeft: "1px solid var(--color-gray30)",
                    }}>
                    <div
                      className={styles.number}
                      style={{
                        color: "var(--color-light-green)",
                      }}>
                      567
                    </div>
                    engage
                  </div>
                </div>
              </div>
              <div className={styles.pagecategory}>
                <div className={styles.tagcategory}>entertaiment</div>
                <div className={styles.tagcategory}>life style</div>
                <div className={styles.tagcategory}>life style</div>
              </div>
              <div className={styles.pricefee}>
                <div className={styles.halfday}>1.800.000</div>-<div className={styles.fullday}>3.200.000</div>
              </div>
            </div>
            {/* ___card popup___*/}
            {isPopupOpen && (
              <div className="dialogBg">
                <div className={styles.popup}>
                  <div className={styles.popuptabparent}>
                    {["user profile", "Terms & Conditions", "bussiness hours", "reviews", "posts"].map((tab, index) => (
                      <div
                        key={index}
                        className={styles.popuptab}
                        style={{
                          color: selectedTabIndex === index ? "var(--color-dark-blue)" : undefined,
                          borderBottom: selectedTabIndex === index ? "3px solid var(--color-dark-blue)" : undefined,
                        }}
                        onClick={() => handleTabClick(index)}>
                        {tab}
                      </div>
                    ))}
                  </div>
                  <div className={styles.popupcontent}>
                    {selectedTabIndex === 0 && (
                      <div className={styles.popupsection}>
                        <div className={styles.popupprofile}>
                          <div className="instagramprofile">
                            <img
                              className="instagramimage"
                              alt="profile image"
                              src="/no-profile.svg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/no-profile.svg";
                              }}
                            />

                            <div className="instagramprofiledetail">
                              <div className="instagramusername">ahoora.niazi</div>
                              <div className="instagramid">@ahoora.niazi</div>
                            </div>
                          </div>
                          <div className={styles.instagrambio}>
                            Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus,
                            facilisis massa a, see more
                          </div>
                        </div>
                        <div className={styles.popupdataparent}>
                          <div className={styles.data}>
                            <div className={styles.section}>
                              <div
                                className={styles.number}
                                style={{
                                  color: "var(--color-dark-blue)",
                                }}>
                                567k
                              </div>
                              follower
                            </div>

                            <div className={styles.line}></div>
                            <div className={styles.section}>
                              <div
                                className={styles.number}
                                style={{
                                  color: "var(--color-light-blue)",
                                }}>
                                1570
                              </div>
                              Following
                            </div>
                            <div className={styles.line}></div>
                            <div className={styles.section}>
                              <div
                                className={styles.number}
                                style={{
                                  color: "var(--text-h1)",
                                }}>
                                127
                              </div>
                              post
                            </div>
                          </div>

                          <div className={styles.data}>
                            <div className={styles.section}>
                              <div
                                className={styles.number}
                                style={{
                                  color: "var(--color-light-yellow)",
                                }}>
                                4.5 / 5
                              </div>
                              rating
                            </div>
                            <div className={styles.line}></div>

                            <div className={styles.section}>
                              <div
                                className={styles.number}
                                style={{
                                  color: "var(--color-purple)",
                                }}>
                                567
                              </div>
                              reach
                            </div>
                            <div className={styles.line}></div>
                            <div className={styles.section}>
                              <div
                                className={styles.number}
                                style={{
                                  color: "var(--color-light-green)",
                                }}>
                                567
                              </div>
                              engage
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedTabIndex === 1 && <div>Terms & Conditions Content</div>}
                    {selectedTabIndex === 2 && <div>Bussiness Hours Content</div>}
                    {selectedTabIndex === 3 && <div>Reviews Content</div>}
                    {selectedTabIndex === 4 && <div>Posts Content</div>}
                  </div>
                  <div className="ButtonContainer">
                    <div className="cancelButton" onClick={togglePopup}>
                      Close
                    </div>
                    <div className="saveButton">Add to Cart</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerAds;
