import Head from "next/head";
import { MouseEvent, useEffect, useState } from "react";
import { calculateSummary } from "brancy/helper/numberFormater";
import { IAdvertiseSummary, ICardAdvertiser } from "brancy/models/customerAds/customerAd";
import styles from "brancy/components/customerAds/customerAds.module.css";

function Content(props: {
  showCard: (e: MouseEvent, adId: number) => void;
  selectedAdsId: number[];
  handleAddToCard: (ad: IAdvertiseSummary) => void;
  advertisers: ICardAdvertiser[];
}) {
  const [selectedAdsId, setSelectedAdsId] = useState<number[]>(props.selectedAdsId);
  const [refresh, setRefresh] = useState(false);
  const [pageTitle, setPageTitle] = useState("Bran.cy ▸ Advertiser Pages");

  const handleAddTocard = (adId: number) => {
    let newAdIds = [...selectedAdsId];
    let newAd = props.advertisers.find((x) => x.asvertiseId === adId);
    if (newAdIds.find((x) => x === adId)) return;
    newAdIds.push(adId);
    setSelectedAdsId(newAdIds);
    setRefresh(!refresh);
    if (newAd) {
      props.handleAddToCard(newAd);
    }
  };

  useEffect(() => {
    setSelectedAdsId(props.selectedAdsId);
  }, [props.selectedAdsId]);

  useEffect(() => {
    if (selectedAdsId.length > 0) {
      setPageTitle("✅ 1 Item Added to Cart");

      const timer = setTimeout(() => {
        setPageTitle("Bran.cy ▸ Advertiser Pages");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [selectedAdsId]);

  return (
    <>
      <title>{pageTitle}</title>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Advertiser Pages List</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className={styles.wrap}>
        {props.advertisers.map((v) => (
          <div key={v.asvertiseId} className={styles.card}>
            <div
              onClick={(e: MouseEvent) => {
                props.showCard(e, v.asvertiseId);
              }}
              className={styles.profile}>
              <img
                loading="lazy"
                decoding="async"
                className={styles.profileimage}
                alt="instagram profile picture"
                src="/no-profile.svg"></img>

              <div className={styles.name}>{v.fullName}</div>
              <div className={styles.username}>{v.username}</div>
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
                    {calculateSummary(v.follower)}
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
                    {calculateSummary(v.rating)}
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
                    {calculateSummary(v.reach)}
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
                    {calculateSummary(v.engage)}
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
            {/*
            <<<<<<<<<<<<backup>>>>>>>>>>>>
            <div
              onClick={() => handleAddTocard(v.asvertiseId)}
              className={`${styles.pricefee} ${
                selectedAdsId.find((x) => x === v.asvertiseId) && `fadeDiv`
              }`}>
              {selectedAdsId.find((x) => x === v.asvertiseId)
                ? "Added"
                : "Add to Cart"}
            </div>
     */}
            <div
              onClick={(e: MouseEvent) => {
                props.showCard(e, v.asvertiseId);
              }}
              className={`${styles.pricefee} ${selectedAdsId.find((x) => x === v.asvertiseId) && `fadeDiv`}`}>
              {selectedAdsId.find((x) => x === v.asvertiseId) ? "Added" : "Add to Cart"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Content;
