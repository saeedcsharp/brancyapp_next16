import { ChangeEvent, useState } from "react";
import {
  CategoryType,
  FilterNames,
  ICategory,
  ISideBar,
  SortBy,
  SortByNum,
  SortUp,
} from "brancy/models/customerAds/customerAd";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import RadioButton from "brancy/components/design/radioButton";
import FollowerSlider from "brancy/components/design/sliders/followerSlider";
import PriceSlider from "brancy/components/design/sliders/priceSlider";
import RatingSlider from "brancy/components/design/sliders/ratingSlider";
import styles from "./customerAds.module.css";

function SideBar(props: {
  handleApplyFilter: (info: ISideBar) => void;
  handleLeftVisible: (isVisible: boolean) => void;
  isLeftVisible: boolean;
  totalCount: number;
}) {
  const [iconRotation, setIconRotation] = useState<Record<FilterNames, number>>({
    filter1: -90,
    filter2: -90,
    filter3: -90,
    filter4: -90,
    filter5: -90,
    filter6: -90,
  });
  const [priceUpDown, setPriceUpDown] = useState<SortUp>(SortUp.UpToDown);
  const [followerUpDown, setFollowerUpDown] = useState<SortUp>(SortUp.UpToDown);
  const [activeFilterOptions, setActiveFilterOptions] = useState<Record<FilterNames, boolean>>({
    filter1: false,
    filter2: false,
    filter3: false,
    filter4: false,
    filter5: false,
    filter6: false,
  });

  const [sortby, setSortby] = useState<SortBy>(SortBy.All);
  const [category, setCategory] = useState<ICategory>({
    fashion: false,
    game: false,
    life: false,
    teck: false,
  });
  const [sideBarInfo, setSideBarInfo] = useState<ISideBar>({
    category: {
      fashion: false,
      game: false,
      life: false,
      teck: false,
    },
    followers: {
      max: 1000,
      min: 0,
    },
    price: { max: 1000, min: 0 },
    rating: { max: 100, min: 0 },
    sortBy: SortByNum.All,
  });
  const [reftesh, setReftesh] = useState(false);
  const [price, setPrice] = useState<{ max: number; min: number }>({
    max: 2000,
    min: 0,
  });
  const [follower, setFollower] = useState<{ max: number; min: number }>({
    max: 1000000,
    min: 0,
  });
  const [rating, setRating] = useState<{ max: number; min: number }>({
    max: 5,
    min: 0,
  });
  const [priceFilterNotif, setPriceFilterNotif] = useState<boolean>(false);
  const [rateFilterNotif, setRateFilterNotif] = useState<boolean>(false);
  const [followerFilterNotif, setFollowerFilterNotif] = useState<boolean>(false);
  const [categoryFilterNotif, setCategoryFilterNotif] = useState<boolean>(false);
  const [sortbyFilterNotif, setSortbyFilterNotif] = useState<boolean>(false);

  const handleFilterSectionClick = (filterName: FilterNames) => {
    setIconRotation((prevState) => ({
      ...prevState,
      [filterName]: prevState[filterName] === -90 ? -270 : -90,
    }));
    setActiveFilterOptions((prevState) => ({
      ...prevState,
      [filterName]: !prevState[filterName],
    }));
  };
  const handleFollowerUpDown = (value: SortUp) => {
    if (sortby !== SortBy.Follower) return;
    sideBarInfo.sortBy = value === SortUp.DownToUp ? SortByNum.FollowerDownToUp : SortByNum.FollowerUpToDown;
    setFollowerUpDown(value);
    props.handleApplyFilter(sideBarInfo);
  };
  const handlePriceUpDown = (value: SortUp) => {
    if (sortby !== SortBy.Price) return;
    sideBarInfo.sortBy = value === SortUp.DownToUp ? SortByNum.PriceDownToUp : SortByNum.PriceUpToDown;
    setPriceUpDown(value);
    props.handleApplyFilter(sideBarInfo);
  };
  const handleChangeRadioButton = (e: ChangeEvent<HTMLInputElement>) => {
    var newSideBarInfo = sideBarInfo;
    switch (e.currentTarget.id) {
      case SortBy.All:
        setSortby(SortBy.All);
        newSideBarInfo.sortBy = SortByNum.All;
        break;
      case SortBy.Engagement:
        setSortby(SortBy.Engagement);
        newSideBarInfo.sortBy = SortByNum.Engagement;
        break;
      case SortBy.Follower:
        setSortby(SortBy.Follower);
        newSideBarInfo.sortBy =
          followerUpDown === SortUp.UpToDown ? SortByNum.FollowerUpToDown : SortByNum.FollowerDownToUp;
        break;
      case SortBy.OnlyVerified:
        setSortby(SortBy.OnlyVerified);
        newSideBarInfo.sortBy = SortByNum.OnlyVerified;
        break;
      case SortBy.Price:
        setSortby(SortBy.Price);
        newSideBarInfo.sortBy = priceUpDown === SortUp.UpToDown ? SortByNum.PriceUpToDown : SortByNum.PriceDownToUp;
        break;
      case SortBy.Rating:
        setSortby(SortBy.Rating);
        newSideBarInfo.sortBy = SortByNum.Rating;
        break;
      case SortBy.Reach:
        setSortby(SortBy.Reach);
        newSideBarInfo.sortBy = SortByNum.Reach;
        break;
    }
    setSideBarInfo(newSideBarInfo);
    setSortbyFilterNotif(newSideBarInfo.sortBy !== SortByNum.All);
    props.handleApplyFilter(sideBarInfo);
  };
  const handleSelectCategory = (value: CategoryType) => {
    var newSideBarInfo = sideBarInfo;
    let newCategory = category;
    switch (value) {
      case CategoryType.Tech:
        newCategory.teck = !newCategory.teck;
        newSideBarInfo.category.teck = newCategory.teck;
        break;
      case CategoryType.Fashion:
        newCategory.fashion = !newCategory.fashion;
        newSideBarInfo.category.fashion = newCategory.fashion;
        break;
      case CategoryType.Game:
        newCategory.game = !newCategory.game;
        newSideBarInfo.category.game = newCategory.game;
        break;
      case CategoryType.Life:
        newCategory.life = !newCategory.life;
        newSideBarInfo.category.life = newCategory.life;
        break;
    }
    setSideBarInfo(newSideBarInfo);
    props.handleApplyFilter(newSideBarInfo);
    setCategory(newCategory);
    if (newCategory.fashion || newCategory.game || newCategory.life || newCategory.teck) {
      setCategoryFilterNotif(true);
    } else setCategoryFilterNotif(false);
    setReftesh(!reftesh);
  };
  const handleChangePrice = (minValue: number, maxValue: number) => {
    if (minValue === 0 && maxValue === 2000) setPriceFilterNotif(false);
    else setPriceFilterNotif(true);
    var newSideBarInfo = sideBarInfo;
    newSideBarInfo.price.max = maxValue;
    newSideBarInfo.price.min = minValue;
    setSideBarInfo(newSideBarInfo);
    props.handleApplyFilter(newSideBarInfo);
  };
  const handleChangeRate = (minValue: number, maxValue: number) => {
    if (minValue === 0 && maxValue === 5) setRateFilterNotif(false);
    else setRateFilterNotif(true);
    var newSideBarInfo = sideBarInfo;
    newSideBarInfo.rating.max = maxValue;
    newSideBarInfo.rating.min = minValue;
    setSideBarInfo(newSideBarInfo);
    props.handleApplyFilter(newSideBarInfo);
  };
  const handleChangeFollower = (minValue: number, maxValue: number) => {
    if (minValue === 0 && maxValue === 1000000) setFollowerFilterNotif(false);
    else setFollowerFilterNotif(true);
    var newSideBarInfo = sideBarInfo;
    newSideBarInfo.followers.max = maxValue;
    newSideBarInfo.followers.min = minValue;
    setSideBarInfo(newSideBarInfo);
    props.handleApplyFilter(newSideBarInfo);
  };
  const handleReset = () => {
    var newSideBarInfo = {
      sortBy: SortByNum.All,
      category: {
        fashion: false,
        game: false,
        life: false,
        teck: false,
      },
      followers: {
        max: 1000000,
        min: 0,
      },
      price: {
        max: 2000,
        min: 0,
      },
      rating: {
        max: 5,
        min: 0,
      },
    };
    setSortby(SortBy.All);
    setCategory({
      fashion: false,
      game: false,
      life: false,
      teck: false,
    });
    setPrice({
      max: 2000,
      min: 0,
    });
    setFollower({
      max: 1000000,
      min: 0,
    });
    setRating({
      max: 5,
      min: 0,
    });
    setSideBarInfo(newSideBarInfo);
    setSortbyFilterNotif(false);
    setCategoryFilterNotif(false);
    setPriceFilterNotif(false);
    setRateFilterNotif(false);
    setFollowerFilterNotif(false);
    props.handleApplyFilter(newSideBarInfo);
  };
  return (
    <div className={`${styles.left} ${props.isLeftVisible ? styles.visible : ""}`}>
      <div className={styles.logo}>
        <svg width="175" height="45" viewBox="0 0 175 45">
          <path d="M31.5 10a8 8 0 0 1-2.2 4.2A12 12 0 0 1 25 17q6 2.1 5 8a11 11 0 0 1-5.5 8.3Q20 36 12.2 36a55 55 0 0 1-7.4-.7l-2.4-.7a3.4 3.4 0 0 1-2.3-4.1L4.6 4.2a3 3 0 0 1 1-1.9 6 6 0 0 1 2-1 23 23 0 0 1 4.8-1l6-.3q7.1 0 10.5 2.4t2.6 7.5Zm-19.1 4.3h4a6 6 0 0 0 3.7-.9 4 4 0 0 0 1.5-2.6 2.4 2.4 0 0 0-.8-2.5 6 6 0 0 0-3.6-.9h-2l-1.7.3ZM20 24.6q.6-3.4-4-3.4h-5L10 28l2 .3h2.3a8 8 0 0 0 3.8-.9 4 4 0 0 0 2-2.9M41.4 35l-1.8.4-2.5.2q-2.8 0-3.9-1t-.6-3.6l3-16.7a6 6 0 0 1 1.2-2.8 10 10 0 0 1 2.7-2.1 19 19 0 0 1 4.9-1.8 25 25 0 0 1 5.5-.7q6.1 0 5.3 4.4l-.6 1.9-.9 1.5-3-.3-3 .4a11 11 0 0 0-3 1zM70 6.9a21 21 0 0 1 5.5.6 10 10 0 0 1 3.9 1.9 7 7 0 0 1 2.1 3.2 10 10 0 0 1 .2 4.6l-2.2 12.6a4 4 0 0 1-1.2 2.4L76 33.8Q72 36 65.5 36a22 22 0 0 1-5.3-.6 10 10 0 0 1-3.7-1.6 6 6 0 0 1-2.2-3 8 8 0 0 1-.2-4 9 9 0 0 1 3.3-6 15 15 0 0 1 7.6-2.5l7.4-.8V17a2 2 0 0 0-1-2.4 9 9 0 0 0-4-.7 20 20 0 0 0-4 .5l-4 1.1a3 3 0 0 1-.9-1.5 5 5 0 0 1-.1-2.2 4 4 0 0 1 1-2.4A7 7 0 0 1 62 8.1a19 19 0 0 1 4-1zM66.8 29l2.1-.2 1.8-.5.8-4.5-4 .3a7 7 0 0 0-2.8.7 2 2 0 0 0-1.3 1.7 2 2 0 0 0 .6 1.8 4 4 0 0 0 2.8.7m44.2 6-1.7.4-2.6.2q-2.7 0-3.8-1t-.6-3.6l2.3-13.3a3 3 0 0 0-.6-2.5 4 4 0 0 0-2.6-.8l-2.1.2-2 .8L93.9 35l-1.8.4-2.5.2q-2.8 0-3.9-1t-.6-3.6l3-17a5 5 0 0 1 1-2.4l2-1.7a19 19 0 0 1 5.2-2.2 25 25 0 0 1 6.5-.8q6.3 0 9.3 2.8t2 7.8zm24.8-20.6a9 9 0 0 0-2.7.5 8 8 0 0 0-2.4 1.3 9 9 0 0 0-2 2.2 9 9 0 0 0-1 3.1q-.6 3.5 1 5.2a6 6 0 0 0 4.6 1.7 10 10 0 0 0 3-.4l2.4-1a5 5 0 0 1 1.3 1.8 4 4 0 0 1 .2 2.2 5 5 0 0 1-2.8 3.6 14 14 0 0 1-6.6 1.3 19 19 0 0 1-6.1-.9 10 10 0 0 1-4.4-2.7 10 10 0 0 1-2.2-4.6 16 16 0 0 1 0-6.2 19 19 0 0 1 2.3-6.5 16 16 0 0 1 4-4.5 17 17 0 0 1 5.3-2.7 20 20 0 0 1 5.9-1q4 0 6 1.5a4 4 0 0 1 1.5 3.8 5 5 0 0 1-.9 2l-1.4 1.6-2.2-.9a9 9 0 0 0-2.8-.4m13.9 13.7a94 94 0 0 1-2.8-19 9 9 0 0 1 2.4-1.4 8 8 0 0 1 3-.5 5 5 0 0 1 3 .8 4 4 0 0 1 1.4 3l.9 7.8q.5 3.8.8 7.7h.3l2-4.1 2-4.7 2-4.8 1.8-4.7 2-.8 2.2-.2a6 6 0 0 1 3.3.8q1.3.8 1 3a28 28 0 0 1-1.7 5.3q-1.2 3.1-3 6.5t-3.6 6.6T163 35a51 51 0 0 1-7.2 8.1q-3.1 2.7-5.8 2.7a5 5 0 0 1-3.5-1.5 5 5 0 0 1-1.2-3.6q2-1.5 4.2-3.5l3.8-3.8a4 4 0 0 1-1.8-1.4 11 11 0 0 1-1.7-3.9Z" />
        </svg>
      </div>

      <div className={styles.sublogo}>Ads Campaign</div>
      <div className={styles.filtersectionheader}>
        <div className={styles.filterheadertitle}>
          Filters <span>({props.totalCount})</span>
        </div>
        {(sortbyFilterNotif || categoryFilterNotif || priceFilterNotif || rateFilterNotif || followerFilterNotif) && (
          <div onClick={handleReset} className={styles.resetfilter}>
            Reset
          </div>
        )}
      </div>

      <div className={styles.filter}>
        <div className={styles.filtercontent}>
          <div className={styles.filtersection} onClick={() => handleFilterSectionClick("filter1")}>
            <div className={styles.filterheader}>sort by</div>
            <div className={styles.filterstate}>
              {sortbyFilterNotif && <div className={styles.filterstateactive} />}
              <img
                className={styles.filterheadericon}
                src="/back-forward.svg"
                style={{ transform: `rotate(${iconRotation.filter1}deg)` }}
              />
            </div>
          </div>
          <div className={`${styles.filteroption} ${activeFilterOptions.filter1 ? styles.active : ""}`}>
            <RadioButton
              name={"sortby"}
              id={"all"}
              checked={sortby === SortBy.All}
              handleOptionChanged={handleChangeRadioButton}
              textlabel={"all"}
              title={"all"}
            />
            <RadioButton
              name={"sortby"}
              id={"only_verified"}
              checked={sortby === SortBy.OnlyVerified}
              handleOptionChanged={handleChangeRadioButton}
              textlabel={" only verified"}
              title={" only verified"}
            />

            <div className={styles.filtersort}>
              <RadioButton
                name={"sortby"}
                id={"price"}
                checked={sortby === SortBy.Price}
                handleOptionChanged={handleChangeRadioButton}
                textlabel={" price"}
                title={" price"}
              />
              <div className={`${styles.filterupdown} ${sortby !== SortBy.Price && "fadeDiv"}`}>
                <div onClick={() => handlePriceUpDown(SortUp.DownToUp)}>
                  <svg
                    width="11"
                    height="14"
                    viewBox="0 0 11 14"
                    className={`${styles.filterup} ${priceUpDown === SortUp.DownToUp && styles.filterSelect}`}>
                    <path d="M6.4 13V3.3l3 3a1 1 0 0 0 1.3 0 1 1 0 0 0 0-1.4L6.2.3a1 1 0 0 0-1.4 0L.3 4.9a1 1 0 0 0 0 1.4 1 1 0 0 0 1.3 0l3-3V13a1 1 0 1 0 1.8 0" />
                  </svg>
                </div>
                <div onClick={() => handlePriceUpDown(SortUp.UpToDown)}>
                  <svg
                    className={`${styles.filterdown} ${priceUpDown === SortUp.UpToDown && styles.filterSelect}`}
                    width="11"
                    height="14"
                    viewBox="0 0 11 14">
                    <path d="M4.6 1v9.7l-3-3a1 1 0 0 0-1.3 0 1 1 0 0 0 0 1.4l4.5 4.6a1 1 0 0 0 1.4 0l4.5-4.6a1 1 0 0 0 0-1.4 1 1 0 0 0-1.3 0l-3 3V1a1 1 0 1 0-1.8 0" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.filtersort}>
              <RadioButton
                name={"sortby"}
                id={"follower"}
                checked={sortby === SortBy.Follower}
                handleOptionChanged={handleChangeRadioButton}
                textlabel={" follower"}
                title={" follower"}
              />
              <div className={`${styles.filterupdown} ${sortby !== SortBy.Follower && "fadeDiv"}`}>
                <div onClick={() => handleFollowerUpDown(SortUp.DownToUp)}>
                  <svg
                    width="11"
                    height="14"
                    viewBox="0 0 11 14"
                    className={`${styles.filterup} ${followerUpDown === SortUp.DownToUp && styles.filterSelect}`}>
                    <path d="M6.4 13V3.3l3 3a1 1 0 0 0 1.3 0 1 1 0 0 0 0-1.4L6.2.3a1 1 0 0 0-1.4 0L.3 4.9a1 1 0 0 0 0 1.4 1 1 0 0 0 1.3 0l3-3V13a1 1 0 1 0 1.8 0" />
                  </svg>
                </div>
                <div onClick={() => handleFollowerUpDown(SortUp.UpToDown)}>
                  <svg
                    className={`${styles.filterdown} ${followerUpDown === SortUp.UpToDown && styles.filterSelect}`}
                    width="11"
                    height="14"
                    viewBox="0 0 11 14">
                    <path d="M4.6 1v9.7l-3-3a1 1 0 0 0-1.3 0 1 1 0 0 0 0 1.4l4.5 4.6a1 1 0 0 0 1.4 0l4.5-4.6a1 1 0 0 0 0-1.4 1 1 0 0 0-1.3 0l-3 3V1a1 1 0 1 0-1.8 0" />
                  </svg>
                </div>
              </div>
            </div>

            <RadioButton
              name={"sortby"}
              id={"rating"}
              checked={sortby === SortBy.Rating}
              handleOptionChanged={handleChangeRadioButton}
              textlabel={" rating"}
              title={" rating"}
            />
            <RadioButton
              name={"sortby"}
              id={"reach"}
              checked={sortby === SortBy.Reach}
              handleOptionChanged={handleChangeRadioButton}
              textlabel={" reach"}
              title={" reach"}
            />
            <RadioButton
              name={"sortby"}
              id={"engagement"}
              checked={sortby === SortBy.Engagement}
              handleOptionChanged={handleChangeRadioButton}
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
              {categoryFilterNotif && <div className={styles.filterstateactive} />}
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
                handleToggle={() => handleSelectCategory(CategoryType.Tech)}
                value={category.teck}
                textlabel={"tech"}
                title={"  tech"}
              />
              <div className={styles.filtercategorycounter}>32</div>
            </div>

            <div className={styles.filtercategory}>
              <CheckBoxButton
                handleToggle={() => handleSelectCategory(CategoryType.Life)}
                value={category.life}
                textlabel={"life"}
                title={" life"}
              />
              <div className={styles.filtercategorycounter}>12</div>
            </div>
            <div className={styles.filtercategory}>
              <CheckBoxButton
                handleToggle={() => handleSelectCategory(CategoryType.Game)}
                value={category.game}
                textlabel={"game"}
                title={" game"}
              />
              <div className={styles.filtercategorycounter}>42</div>
            </div>

            <div className={styles.filtercategory}>
              <CheckBoxButton
                handleToggle={() => handleSelectCategory(CategoryType.Fashion)}
                value={category.fashion}
                textlabel={"fashion"}
                title={" fashion"}
              />
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
              {priceFilterNotif && <div className={styles.filterstateactive} />}
              <img
                className={styles.filterheadericon}
                src="/back-forward.svg"
                style={{ transform: `rotate(${iconRotation.filter3}deg)` }}
              />
            </div>
          </div>
          <div className={`${styles.filteroption} ${activeFilterOptions.filter3 ? styles.active : ""}`}>
            <div className={styles.roll}>
              <PriceSlider handleChangePrice={handleChangePrice} price={price} />
            </div>
          </div>
        </div>

        <div className={styles.filtercontent}>
          <div
            className={styles.filtersection}
            style={{ borderTop: "1px solid var(--color-light-blue30)" }}
            onClick={() => handleFilterSectionClick("filter4")}>
            <div className={styles.filterheader}>rating</div>
            <div className={styles.filterstate}>
              {rateFilterNotif && <div className={styles.filterstateactive} />}
              <img
                className={styles.filterheadericon}
                src="/back-forward.svg"
                style={{ transform: `rotate(${iconRotation.filter4}deg)` }}
              />
            </div>
          </div>
          <div className={`${styles.filteroption} ${activeFilterOptions.filter4 ? styles.active : ""}`}>
            <div className={styles.roll}>
              <RatingSlider handleChangeRate={handleChangeRate} rating={rating} />
            </div>
          </div>
        </div>

        <div className={styles.filtercontent}>
          <div
            className={styles.filtersection}
            style={{ borderTop: "1px solid var(--color-light-blue30)" }}
            onClick={() => handleFilterSectionClick("filter5")}>
            <div className={styles.filterheader}>followers</div>
            <div className={styles.filterstate}>
              {followerFilterNotif && <div className={styles.filterstateactive} />}
              <img
                className={styles.filterheadericon}
                src="/back-forward.svg"
                style={{ transform: `rotate(${iconRotation.filter5}deg)` }}
              />
            </div>
          </div>
          <div className={`${styles.filteroption} ${activeFilterOptions.filter5 ? styles.active : ""}`}>
            <div className={styles.roll}>
              <FollowerSlider handleChangePrice={handleChangeFollower} follower={follower} />
            </div>
          </div>
        </div>

        {/* <div className={styles.filtercontent}>
          <div
            className={styles.filtersection}
            style={{ borderTop: "1px solid var(--color-light-blue30)" }}
            onClick={() => handleFilterSectionClick("filter6")}
          >
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
          <div
            className={`${styles.filteroption} ${
              activeFilterOptions.filter6 ? styles.active : ""
            }`}
          >
            <div className={styles.hashtaglist}>
              <div className={styles.hashtag}>hashtag</div>
              <div className={styles.hashtag}>hashtag1</div>
              <div className={styles.hashtag}>hashtag2</div>
              <div className={styles.hashtag}>hashtag3</div>
              <div className={styles.hashtag}>hashtag4</div>
              <div className={styles.hashtag}>hashtag5</div>
            </div>
          </div>
        </div> */}
      </div>
      <div className={styles.filterbutton} onClick={() => props.handleLeftVisible(false)}>
        <div className="saveButton">{props.totalCount} results</div>
      </div>
    </div>
  );
}

export default SideBar;
