import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import { TopTileType } from "../../models/homeIndex/enum";
import { IDemographicInsight, IInstagramerHomeTileItem } from "../../models/homeIndex/home";
import styles from "./pageDetail.module.css";
const PageDetail = (props: { data: IDemographicInsight; items: IInstagramerHomeTileItem[] | [] }) => {
  const { t } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  // Sample gender data
  const genderData = {
    male: props.data?.followerGender?.find((g) => g.type === 0)?.count || 0,
    female: props.data?.followerGender?.find((g) => g.type === 1)?.count || 0,
    unknown: props.data?.followerGender?.find((g) => g.type === 2)?.count || 0,
  };
  // Age data from props - doubled with interpolated values
  const ageData =
    props.data?.followerAge?.length > 0
      ? (() => {
          const sortedAges = props.data.followerAge.sort((a, b) => a.from - b.from);
          const expandedData: Record<string, number> = {};

          sortedAges.forEach((ageGroup, index) => {
            // Add original data
            const rangeKey = `${ageGroup.from}-${ageGroup.to}`;
            expandedData[rangeKey] = ageGroup.count;

            // Add interpolated data between current and next item
            if (index < sortedAges.length - 1) {
              const currentCount = ageGroup.count;
              const nextCount = sortedAges[index + 1].count;
              const avgCount = Math.round((currentCount + nextCount) / 2);

              // Create intermediate range
              const midFrom = ageGroup.to;
              const midTo = sortedAges[index + 1].from;
              const midRangeKey = `${midFrom}-${midTo}`;
              expandedData[midRangeKey] = avgCount;
            }
          });

          return expandedData;
        })()
      : {
          "10-12": 0,
          "12-14": 0,
          "14-16": 0,
          "16-18": 0,
          "18-20": 0,
          "20-22": 0,
          "22-24": 0,
          "24-26": 0,
          "26-28": 0,
          "28-30": 0,
          "30-32": 0,
          "32-34": 0,
          "34-36": 0,
          "36-38": 0,
          "38-40": 0,
          "40-42": 0,
          "42-44": 0,
          "44-46": 0,
          "46-48": 0,
          "48-50": 0,
          "50-52": 0,
          "52-54": 0,
          "54-56": 0,
          "56-58": 0,
          "58-60": 0,
          "60-62": 0,
          "62-64": 0,
          "64-66": 0,
          "66-68": 0,
          "68-70": 0,
          "70+": 0,
        };

  // Location data from props - combining countries and cities
  const locationData = (() => {
    const locations: Array<{
      country: string;
      city: string;
      count: number;
      countryCode: string;
    }> = [];
    // Add countries
    if (props.data?.followerCountry?.length > 0) {
      props.data.followerCountry.forEach((country) => {
        locations.push({
          country: country.name,
          city: country.name, // For countries, use name as city display
          count: country.count,
          countryCode: country.code.toLowerCase(),
        });
      });
    }

    // Add cities (if you want to show cities separately, uncomment this)
    // if (props.data?.followerCity?.length > 0) {
    //   props.data.followerCity.forEach(city => {
    //     locations.push({
    //       country: "Unknown", // You might need to map city to country
    //       city: city.name,
    //       count: city.count,
    //       countryCode: "unknown" // You might need to determine this
    //     });
    //   });
    // }

    // Fallback data if no real data exists

    // Sort by count (highest first) and return top 5
    return locations.sort((a, b) => b.count - a.count).slice(0, 5);
  })();

  // Calculate total and percentages for gender
  const total = genderData.male + genderData.female + genderData.unknown;
  const malePercentage = total ? (genderData.male / total) * 100 : 0;
  const femalePercentage = total ? (genderData.female / total) * 100 : 0;
  const unknownPercentage = total ? (genderData.unknown / total) * 100 : 0;

  // Calculate total and percentages for age
  const ageTotal = Object.values(ageData).reduce((sum, value) => sum + value, 0);
  const agePercentages = Object.entries(ageData).map(([range, count]) => ({
    range,
    count,
    percentage: (count / ageTotal) * 100,
  }));

  // Calculate total and percentages for location
  const locationTotal = props.data?.followerCountry?.reduce((sum, location) => sum + location.count, 0);
  // Calculate total and percentages for city location
  const locationCityTotal = props.data?.followerCity?.reduce((sum, location) => sum + location.count, 0);
  const locationPercentages = props.data?.followerCountry?.map((location) => ({
    ...location,
    percentage: (location.count / locationTotal) * 100,
  }));
  const locationCityPercentages = props.data?.followerCity?.map((location) => ({
    ...location,
    percentage: (location.count / locationCityTotal) * 100,
  }));

  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };

  const handleAgeBarClick = (range: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveTooltip(activeTooltip === range ? null : range);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveTooltip(null);
    };

    if (activeTooltip) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [activeTooltip]);
  const activeFollowers = useMemo(
    () => props.data?.followerGender?.reduce((acc, curr) => acc + curr.count, 0).toLocaleString() || "0",
    [props.data?.followerGender],
  );
  const newFollowers = useMemo(
    () => props.items.find((x) => x.topTileType === TopTileType.NewFollowers)?.value?.toLocaleString() || "0",
    [props.items],
  );
  return (
    <div className={`${styles.tooBigCard} ${isHidden ? styles.toobigcardclose : ""} tooBigCard`}>
      <div className={styles.contactBox}>
        <div className={styles.headersection} onClick={handleCircleClick}>
          <div className={styles.backdropfade} />
          <img style={{ height: "50px" }} src="/home-follower.svg" title="↕ Resize the Card" />
          <div className={styles.headerandinput}>
            <span className="title">{newFollowers === "0" ? "0" : newFollowers + "+"}</span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.pageStatistics_NewFollowers)}
              <br />
              <span>({t(LanguageKey.home_Last24H)})</span>
            </span>
          </div>
          <div className={styles.headerandinput}>
            <span className="title">{activeFollowers}</span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.pageStatistics_ActiveFollowers)}
            </span>
          </div>
          {/* <div className={styles.headerandinput}>
            <span className="title">99999</span>
            <span className="explain">
              {t(LanguageKey.pageStatistics_Impression)}
            </span>
          </div> */}
        </div>
        <div className={`${styles.frameContainer} ${isHidden ? "" : styles.show}`}>
          <section className={styles.pageDetailSection}>
            <div className="title2" style={{ textAlign: "center" }}>
              {t(LanguageKey.AudienceGender)}
            </div>
            <div className="explain">
              {t(LanguageKey.AudienceGenderStats, {
                female: genderData.female.toLocaleString(),
                male: genderData.male.toLocaleString(),
                unknown: genderData.unknown.toLocaleString(),
              })}
            </div>
            <div className={total === 0 ? styles.GenderDataEmpty : styles.GenderData}>
              <div className={`${styles.genderBar} ${styles.barMale}`} style={{ width: `${malePercentage}%` }}>
                <div className={styles.genderLabelMale}>
                  <svg fill="none" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 24">
                    <path
                      d="m16.1 15-1.4 3.5q-.7 2-1.1 2.2-1 .6-2 0-.3-.4-1-2.2L9 15.1q-.6-1.3-.5-1.6 0-1 .9-1.4.4-.2 1.7-.2H14q1.3 0 1.6.2 1 .4 1 1.4 0 .4-.6 1.6M9.8 5.8a2.8 2.8 0 1 0 5.6 0 2.8 2.8 0 0 0-5.6 0"
                      stroke="var(--color-light-blue)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {Math.round(malePercentage)}%
                </div>
              </div>
              <div className={`${styles.genderBar} ${styles.barFemale}`} style={{ width: `${femalePercentage}%` }}>
                <div className={styles.genderLabelFemale}>
                  <svg fill="none" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M15.5 17.9 14 14.4q-.8-1.8-1.2-2.1-1-.7-2 0-.5.3-1.3 2.1L8 17.9q-.6 1.1-.6 1.6.1 1 1 1.4l1.8.1h3.1l1.8-.1q1-.5 1-1.4 0-.5-.6-1.6M8.8 5.8c0 1.5 1.3 2.8 3 2.8s3-1.3 3-2.8c0-1.6-1.4-2.8-3-2.8s-3 1.2-3 2.8"
                      stroke="var(--color-light-red)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {Math.round(femalePercentage)}%
                </div>
              </div>
              <div className={`${styles.genderBar} ${styles.barUnknown}`} style={{ width: `${unknownPercentage}%` }}>
                <div className={styles.genderLabelUnknown}>{Math.round(unknownPercentage)}%</div>
              </div>
            </div>
          </section>

          <section className={styles.pageDetailSection}>
            <div className="title2">{t(LanguageKey.AudienceAge)}</div>
            <div className="explain">
              {(() => {
                // Find the age range with highest percentage
                const maxAgeGroup = agePercentages.reduce((max, current) =>
                  current.percentage > max.percentage ? current : max,
                );

                // Determine age category
                const getAgeCategory = (range: string) => {
                  const startAge = parseInt(range.split("-")[0]);
                  if (startAge < 25) return "young";
                  if (startAge < 45) return "middle-aged";
                  return "older";
                };

                const category = getAgeCategory(maxAgeGroup.range);
                const categoryText =
                  category === "young"
                    ? t(LanguageKey.AgeCategoryYoung)
                    : category === "middle-aged"
                      ? t(LanguageKey.AgeCategoryMiddleAged)
                      : t(LanguageKey.AgeCategoryOlder);

                return t(LanguageKey.AudienceAgeStats, {
                  ageRange: maxAgeGroup.range,
                  percentage: Math.round(maxAgeGroup.percentage),
                  ageCategory: categoryText,
                });
              })()}
            </div>
            <div className="headerandinput">
              <div className={styles.AgeData}>
                {agePercentages.map(({ range, count, percentage }) => (
                  <div key={range} className={styles.ageGroup}>
                    <div className={styles.ageLabel}>
                      {/* <span className={styles.ageRange}>{range}</span> */}
                      {/* <span className={styles.ageCount}>{count}</span> */}
                      {/* <div className={styles.agePercentage}>{Math.round(percentage)}%</div> */}
                    </div>
                    <div className={styles.ageBarContainer}>
                      <div
                        className={styles.ageBar}
                        style={{
                          height: `${Math.min(
                            Math.max((percentage / Math.max(...agePercentages.map((p) => p.percentage))) * 87, 5),
                            80,
                          )}px`,
                          width: "12px",
                          backgroundColor: `hsl(${250 + percentage * 3}, 70%, 60%)`,
                        }}
                        onClick={(event) => handleAgeBarClick(range, event)}
                        title={`${range} ● ${count} ● ${Math.round(percentage)}%`}>
                        <div className={`${styles.ageTooltip} ${activeTooltip === range ? styles.show : ""}`}>
                          <div>
                            {" "}
                            {t(LanguageKey.AudienceAge)}: {range}
                          </div>
                          <div>
                            {t(LanguageKey.Storeorder_quantityorder)}: {count.toLocaleString()}
                          </div>
                          <div> {Math.round(percentage)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <span className={styles.ageRangeparent}>
                {props.data?.followerAge?.length > 0 ? (
                  // (() => {
                  //   const sortedAges = props.data.followerAge.sort((a, b) => a.from - b.from);
                  //   const labels: JSX.Element[] = [];

                  //   sortedAges.forEach((ageGroup, index) => {
                  //     // Add original label
                  //     labels.push(
                  //       <span key={`original-${index}`}>{index === 0 ? `-${ageGroup.from}` : ageGroup.from}</span>
                  //     );

                  //     // Add interpolated label between current and next item
                  //     if (index < sortedAges.length - 1) {
                  //       const midFrom = ageGroup.to;
                  //       labels.push(<span key={`interpolated-${index}`}>{midFrom}</span>);
                  //     }
                  //   });

                  //   // Add final label
                  //   const lastAge = sortedAges[sortedAges.length - 1];
                  //   if (lastAge.to >= 70) {
                  //     labels.push(<span key="final">{lastAge.to}+</span>);
                  //   } else {
                  //     labels.push(<span key="final">{lastAge.to}</span>);
                  //   }

                  //   return labels;
                  // })()
                  <>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                    <span>40</span>
                    <span>45</span>
                    <span>50</span>
                    <span>55</span>
                    <span>60</span>
                    <span>65</span>
                    <span>70+</span>
                  </>
                ) : (
                  <>
                    <span>-10</span>
                    <span>15</span>
                    <span>20</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                    <span>40</span>
                    <span>45</span>
                    <span>50</span>
                    <span>55</span>
                    <span>60</span>
                    <span>65</span>
                    <span>70+</span>
                  </>
                )}
              </span>
            </div>
          </section>

          <section className={styles.pageDetailSection}>
            <div className="headerandinput">
              <div className="title2">{t(LanguageKey.AudienceLocation)}</div>

              <div className="explain">
                {(() => {
                  if (
                    !locationPercentages ||
                    locationPercentages.length === 0 ||
                    !locationCityPercentages ||
                    locationCityPercentages.length === 0
                  ) {
                    return 0;
                  }

                  const maxCountry = locationPercentages.reduce((max, current) =>
                    current.count > max.count ? current : max,
                  );
                  const maxCity = locationCityPercentages.reduce((max, current) =>
                    current.count > max.count ? current : max,
                  );

                  return t(LanguageKey.AudienceLocationStats, {
                    country: maxCountry?.name,
                    countryCount: maxCountry?.count,
                    city: maxCity?.name,
                    cityCount: maxCity?.count,
                  });
                })()}
              </div>
            </div>
            <div className={styles.locationData}>
              {locationPercentages
                ?.sort((a, b) => b.percentage - a.percentage)
                .map((location, index) => (
                  <div key={index} className={`${styles.locationInfo} translate`}>
                    <img
                      className={styles.locationflag}
                      style={{ width: "30px", height: "30px" }}
                      title={location.name}
                      src={`https://flagcdn.com/${location.code.toLowerCase()}.svg`}
                      onError={(e) => {
                        e.currentTarget.src = "/min-circle.svg";
                      }}
                    />

                    <div className={styles.locationDetails}>
                      <span className={styles.percentage}>{location.percentage.toFixed(2)}%</span>
                      <span className={styles.city}>{location.name}</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className={styles.locationData}>
              {locationCityPercentages
                ?.sort((a, b) => b.percentage - a.percentage)
                .map((location, index) => (
                  <div key={index} className={`${styles.locationInfo} translate`}>
                    <div className={styles.locationDetails}>
                      <span className={styles.percentage}>{location.percentage.toFixed(2)}%</span>
                      <span className={styles.city}>{location.name}</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PageDetail;
