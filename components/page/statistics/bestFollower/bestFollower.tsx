import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Slider, { SliderSlide } from "saeed/components/design/slider/slider";
import Loading from "saeed/components/notOk/loading";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/api";
import { IBestFollowers } from "saeed/models/page/statistics/statisticsContent/GraphIngageBoxes/bestFollower";
import styles from "./bestFollower.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const FollowerCard = memo(
  ({ follower, onImageClick }: { follower: IBestFollowers; onImageClick: (url: string, username: string) => void }) => {
    const imageUrl = basePictureUrl + follower.profileUrl;
    return (
      <div className="headerparent">
        <div className="instagramprofile">
          <img
            className="instagramimage"
            style={{ cursor: "pointer" }}
            title="◰ resize the picture"
            alt="instagram profile picture"
            src={imageUrl}
            onClick={() => onImageClick(imageUrl, follower.username)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/no-profile.svg";
            }}
          />
          <div className="instagramprofiledetail">
            <div
              style={{ cursor: "pointer" }}
              className="instagramusername"
              title={`@${follower.username}`}
              onClick={() => navigator.clipboard.writeText(`@${follower.username}`)}>
              @{follower.username}
            </div>
            <div className="instagramid" title={follower.fullName}>
              {follower.fullName}
            </div>
          </div>
        </div>
        <div className={styles.counter} title="ℹ️ Total Reach count">
          {Math.floor(follower.count).toLocaleString()}
        </div>
      </div>
    );
  }
);
FollowerCard.displayName = "FollowerCard";
const ImagePopup = memo(
  ({ imageUrl, onClose, username }: { imageUrl: string; onClose: () => void; username: string }) => (
    <>
      <div className={styles.popupContent}>
        <div className="headerparent" style={{ paddingInline: "10px" }}>
          <img className={styles.closebtn} onClick={onClose} src="/close-box.svg" alt="Close" title="close" />
          <div className="instagramusername">@{username}</div>
        </div>
        <img
          loading="lazy"
          decoding="async"
          className={styles.profileimagebig}
          src={imageUrl}
          alt="Popup profile"
          title="profile picture"
        />
      </div>
    </>
  )
);
ImagePopup.displayName = "ImagePopup";
const BestFollowers = (props: { largSizeForIngage: () => void }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const [bestFollower, setBestFollowers] = useState<IBestFollowers[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");
  const [popupUsername, setPopupUsername] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [currentBatch, setCurrentBatch] = useState(1);
  const bigcardRef = useRef<HTMLDivElement>(null);
  const MAX_BATCHES = 10; // Maximum number of batches (10 batches * 50 items = 500 items max)
  const ITEMS_PER_BATCH = 50; // Items to load per batch
  useEffect(() => {
    if (session && !LoginStatus(session)) {
      router.push("/");
    }
  }, [session, router]);
  useEffect(() => {
    if (!isDataLoaded && !isFetchingRef.current) {
      setLoadingStatus(false);
    }
  }, [isDataLoaded]);
  const handleImageClick = useCallback((imageUrl: string, username: string) => {
    setPopupImage(imageUrl);
    setPopupUsername(username);
    setShowPopup(true);
  }, []);
  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setPopupImage("");
    setPopupUsername("");
  }, []);
  const handleClickOnIcon = useCallback(() => {
    props.largSizeForIngage();
    setIsExpanded(true);
    setIsCollapsed(false);
    setDisplayLimit(ITEMS_PER_BATCH);
    setCurrentBatch(1);
  }, [props.largSizeForIngage]);
  const handleFrameParentClick = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setIsExpanded(false);
      setDisplayLimit(5);
    } else {
      setIsCollapsed(true);
      setIsExpanded(false);
    }
    handleClosePopup();
  }, [isCollapsed, handleClosePopup]);
  const fetchData = useCallback(async () => {
    if (!session || !LoginStatus(session) || !RoleAccess(session, PartnerRole.PageView)) {
      return;
    }
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    try {
      setLoadingStatus(true);
      const res = await clientFetchApi<string, IBestFollowers[]>("/api/statistics/GetBestFollowers", { methodType: MethodType.get, session: session, data: null, queries: [], onUploadProgress: undefined });
      if (res.succeeded) {
        const sortedFollowers = [...res.value].sort((a, b) => b.count - a.count);
        setBestFollowers(sortedFollowers);
        setError(null);
        setIsDataLoaded(true);
      } else {
        setError("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching best followers:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoadingStatus(false);
      isFetchingRef.current = false;
    }
  }, [session]);
  useEffect(() => {
    if (session && LoginStatus(session) && RoleAccess(session, PartnerRole.PageView) && !isDataLoaded) {
      fetchData();
    }
  }, [session, fetchData, isDataLoaded]);
  const handleReachEnd = useCallback(() => {
    if (isExpanded && displayLimit < bestFollower.length && currentBatch < MAX_BATCHES) {
      const nextBatch = currentBatch + 1;
      setCurrentBatch(nextBatch);
      setDisplayLimit(Math.min(nextBatch * ITEMS_PER_BATCH, bestFollower.length));
    }
  }, [isExpanded, displayLimit, bestFollower.length, currentBatch]);
  const renderFollowerContent = () => {
    if (isCollapsed) return null;
    if (loadingStatus) return <Loading />;
    if (error) return <div className="error-message">{error}</div>;
    if (bestFollower.length === 0) {
      return <div className="empty-state">{t(LanguageKey.pageStatistics_EmptyList)}</div>;
    }
    if (!isExpanded) {
      return (
        <div className={styles.all}>
          {!loadingStatus && <div className="explain">{t(LanguageKey.pageStatistics_YourBestFollowersExplain)}</div>}
          <div className={styles.bestFollowerContainer}>
            {bestFollower.slice(0, 5).map((follower, index) => (
              <FollowerCard key={follower.username || index} follower={follower} onImageClick={handleImageClick} />
            ))}
          </div>
          <div
            title="↕ Load more List"
            className="cancelButton"
            style={{ width: "50%" }}
            onClick={() => handleClickOnIcon()}>
            {t(LanguageKey.Showmore)}
          </div>
        </div>
      );
    }
    return (
      <>
        <div className="explain">{t(LanguageKey.pageStatistics_YourBestFollowersExplain)}</div>
        <Slider
          itemsPerSlide={11}
          onReachEnd={handleReachEnd}
          isLoading={currentBatch < MAX_BATCHES && displayLimit < bestFollower.length}>
          {bestFollower.slice(0, displayLimit).map((follower, index) => (
            <SliderSlide key={follower.username || index}>
              <FollowerCard follower={follower} onImageClick={handleImageClick} />
            </SliderSlide>
          ))}
        </Slider>
      </>
    );
  };
  return (
    <>
      <div
        ref={bigcardRef}
        className={`bigcard ${isCollapsed ? styles.collapsed : isExpanded ? styles.expanded : styles.normal}`}>
        {showPopup && <ImagePopup imageUrl={popupImage} username={popupUsername} onClose={handleClosePopup} />}
        <div className="headerandinput">
          <div
            onClick={handleFrameParentClick}
            className="frameParent"
            title="↕ Resize the Card"
            style={
              isCollapsed
                ? { padding: "12px", transition: "var(--transition3)" }
                : { padding: "0px", transition: "var(--transition3)" }
            }>
            <div className="headerChild" style={{ cursor: "pointer" }}>
              <div className="circle"></div>
              <div className="Title">{t(LanguageKey.pageStatistics_YourBestFollowers)}</div>
            </div>
          </div>
        </div>
        {renderFollowerContent()}
      </div>
    </>
  );
};
export default memo(BestFollowers);
