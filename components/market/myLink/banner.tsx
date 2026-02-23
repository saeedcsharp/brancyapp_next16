import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef } from "react";
import { IClientBanner } from "../../../models/market/myLink";
import styles from "./banner.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
interface BannerState {
  currentSlide: number;
  isAutoPlay: boolean;
  isDragging: boolean;
  startX: number;
  dragOffset: number;
}

type BannerAction =
  | { type: "SET_CURRENT_SLIDE"; payload: number }
  | { type: "NEXT_SLIDE"; totalSlides: number }
  | { type: "PREV_SLIDE"; totalSlides: number }
  | { type: "TOGGLE_AUTOPLAY" }
  | { type: "START_DRAG"; startX: number }
  | { type: "UPDATE_DRAG"; dragOffset: number }
  | { type: "END_DRAG" };

const bannerReducer = (state: BannerState, action: BannerAction): BannerState => {
  switch (action.type) {
    case "SET_CURRENT_SLIDE":
      return { ...state, currentSlide: action.payload };
    case "NEXT_SLIDE":
      return {
        ...state,
        currentSlide: (state.currentSlide + 1) % action.totalSlides,
      };
    case "PREV_SLIDE":
      return {
        ...state,
        currentSlide: (state.currentSlide - 1 + action.totalSlides) % action.totalSlides,
      };
    case "TOGGLE_AUTOPLAY":
      return { ...state, isAutoPlay: !state.isAutoPlay };
    case "START_DRAG":
      return {
        ...state,
        isDragging: true,
        startX: action.startX,
        dragOffset: 0,
      };
    case "UPDATE_DRAG":
      return { ...state, dragOffset: action.dragOffset };
    case "END_DRAG":
      return { ...state, isDragging: false, dragOffset: 0 };
    default:
      return state;
  }
};

const initialState: BannerState = {
  currentSlide: 0,
  isAutoPlay: true,
  isDragging: false,
  startX: 0,
  dragOffset: 0,
};

const Banner = memo(({ data }: { data: IClientBanner }) => {
  const [state, dispatch] = useReducer(bannerReducer, initialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isUnmountedRef = useRef(false);
  const componentId = useId();

  const totalSlides = data.banners.length;
  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (state.isAutoPlay && totalSlides > 1 && !isUnmountedRef.current) {
      intervalRef.current = setInterval(() => {
        if (!isUnmountedRef.current) {
          dispatch({ type: "NEXT_SLIDE", totalSlides });
        }
      }, 10000);
    }
  }, [state.isAutoPlay, totalSlides]);

  const nextSlide = useCallback(() => {
    dispatch({ type: "NEXT_SLIDE", totalSlides });
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    dispatch({ type: "PREV_SLIDE", totalSlides });
  }, [totalSlides]);

  const handleDotClick = useCallback((index: number) => {
    dispatch({ type: "SET_CURRENT_SLIDE", payload: index });
  }, []);

  const handlePlayStopClick = useCallback(() => {
    dispatch({ type: "TOGGLE_AUTOPLAY" });
    if (state.isAutoPlay) {
      stopAutoPlay();
    }
  }, [state.isAutoPlay, stopAutoPlay]);
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (totalSlides <= 1) return;
      dispatch({ type: "START_DRAG", startX: e.clientX });
    },
    [totalSlides]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!state.isDragging || totalSlides <= 1) return;
      const diff = e.clientX - state.startX;
      dispatch({ type: "UPDATE_DRAG", dragOffset: diff });
    },
    [state.isDragging, state.startX, totalSlides]
  );

  const handleMouseUp = useCallback(() => {
    if (!state.isDragging || totalSlides <= 1) return;
    const threshold = 50;
    if (Math.abs(state.dragOffset) > threshold) {
      if (state.dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    dispatch({ type: "END_DRAG" });
  }, [state.isDragging, state.dragOffset, totalSlides, prevSlide, nextSlide]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (totalSlides <= 1) return;
      dispatch({ type: "START_DRAG", startX: e.touches[0].clientX });
    },
    [totalSlides]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!state.isDragging || totalSlides <= 1) return;
      const diff = e.touches[0].clientX - state.startX;
      dispatch({ type: "UPDATE_DRAG", dragOffset: diff });
    },
    [state.isDragging, state.startX, totalSlides]
  );

  const handleTouchEnd = useCallback(() => {
    if (!state.isDragging || totalSlides <= 1) return;
    const threshold = 50;
    if (Math.abs(state.dragOffset) > threshold) {
      if (state.dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    dispatch({ type: "END_DRAG" });
  }, [state.isDragging, state.dragOffset, totalSlides, prevSlide, nextSlide]);
  const slideStyle = useMemo(
    () => ({
      transform: `translateX(${
        -state.currentSlide * 100 +
        (state.isDragging ? (state.dragOffset / (sliderRef.current?.offsetWidth || 1)) * 100 : 0)
      }%)`,
      transition: state.isDragging ? "none" : "transform 0.3s ease-in-out",
    }),
    [state.currentSlide, state.isDragging, state.dragOffset]
  );

  const bannerImageSrc = data.banners.map((banner) => `${baseMediaUrl}${banner.url}`);
  const profileImageSrc = `${baseMediaUrl}${data.profile.profileUrl}`;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (totalSlides <= 1) return;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          prevSlide();
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          nextSlide();
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          handlePlayStopClick();
          break;
        case "Escape":
          e.preventDefault();
          if (state.isAutoPlay) {
            dispatch({ type: "TOGGLE_AUTOPLAY" });
            stopAutoPlay();
          }
          break;
        case "Home":
          e.preventDefault();
          dispatch({ type: "SET_CURRENT_SLIDE", payload: 0 });
          break;
        case "End":
          e.preventDefault();
          dispatch({ type: "SET_CURRENT_SLIDE", payload: totalSlides - 1 });
          break;
      }
    },
    [totalSlides, prevSlide, nextSlide, handlePlayStopClick, state.isAutoPlay, stopAutoPlay]
  );

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      stopAutoPlay();
    };
  }, [stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("keydown", handleKeyDown);
      return () => slider.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown]);

  useLayoutEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.focus();
    }
  }, []);
  return (
    <div className={`${styles.banner} translate`} role="region" aria-label="Image carousel">
      <div
        className={styles.slideContainer}
        ref={sliderRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`Image carousel with ${totalSlides} slides`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        <div className={styles.slidesWrapper} style={slideStyle}>
          {data.banners.map((banner, index) => (
            <div
              key={`${componentId}-slide-${index}`}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalSlides}`}>
              <img
                className={styles.bannerimage}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                alt={`Banner image ${index + 1}: ${data.profile.fullName}`}
                src={bannerImageSrc[index]}
                width="1440"
                height="400"
              />
              <div className={styles.mask} />
            </div>
          ))}
        </div>
        {totalSlides > 1 && (
          <button
            className={styles.playStopButton}
            onClick={handlePlayStopClick}
            aria-label={state.isAutoPlay ? "Pause slideshow" : "Play slideshow"}
            title={state.isAutoPlay ? "Pause slideshow" : "Play slideshow"}>
            {state.isAutoPlay ? (
              <svg width="18px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 7c0-1.41 0-2.12.44-2.56S5.59 4 7 4s2.12 0 2.56.44S10 5.59 10 7v10c0 1.41 0 2.12-.44 2.56S8.41 20 7 20s-2.12 0-2.56-.44S4 18.41 4 17zm10 0c0-1.41 0-2.12.44-2.56S15.59 4 17 4s2.12 0 2.56.44S20 5.59 20 7v10c0 1.41 0 2.12-.44 2.56S18.41 20 17 20s-2.12 0-2.56-.44S14 18.41 14 17z"
                  fill="var(--text-h1)"
                  strokeWidth="1.5"
                />
              </svg>
            ) : (
              <svg width="18px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path
                  d="M18.9 12.8c-.4 1.4-2 2.3-5.4 4.2-3.2 1.9-4.8 2.8-6.1 2.4q-.8-.2-1.4-.8c-1-1-1-2.9-1-6.6s0-5.6 1-6.6q.6-.6 1.4-.8c1.3-.4 2.9.5 6.1 2.4 3.4 1.9 5 2.8 5.4 4.2q.2.7 0 1.6Z"
                  fill="var(--text-h1)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}
        {totalSlides > 1 && (
          <div className={styles.pagination} role="group" aria-label="Slide navigation">
            {data.banners.map((_, index) => (
              <button
                key={`${componentId}-dot-${index}`}
                className={`${styles.paginationDot} ${index === state.currentSlide ? styles.paginationDotActive : ""}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === state.currentSlide ? "true" : "false"}
                title={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.instagramprofile}>
        <img
          className={styles.profileimage}
          loading="lazy"
          decoding="async"
          alt={`${data.profile.fullName} profile picture`}
          src={profileImageSrc}
          width="60"
          height="60"
        />
        <div className={styles.instagramprofiledetail}>
          <div className={styles.instaid} title={`Full name: ${data.profile.fullName}`}>
            {data.profile.fullName}
          </div>
          <div className={styles.instausername} title={`Username: @${data.profile.username}`}>
            @{data.profile.username}
          </div>
          {data.caption && (
            <div className={styles.instausername} title={data.caption.caption}>
              {data.caption.caption}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
Banner.displayName = "Banner";
export default Banner;
