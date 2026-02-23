import React, {
  CSSProperties,
  ReactNode,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useTransition,
} from "react";
import styles from "brancy/components/design/slider/slider.module.css";

//#region Types & Interfaces
interface SliderProps {
  children: ReactNode[];
  slidesPerView?: number;
  spaceBetween?: number;
  navigation?: boolean;
  pagination?: {
    clickable?: boolean;
    dynamicBullets?: boolean;
    renderBullet?: (index: number, className: string) => string;
  };
  className?: string;
  style?: CSSProperties;
  onSlideChange?: (index: number) => void;
  onReachEnd?: () => void; // فراخوانی برای درخواست داده‌های بیشتر
  isLoading?: boolean; // نمایش loading در pagination
  itemsPerSlide?: number; // تعداد آیتم‌ها در هر اسلاید (برای گروه‌بندی خودکار)
}

interface SliderSlideProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface SliderState {
  currentIndex: number;
  slideSize: number;
  isRTL: boolean;
  isDragging: boolean;
  currentTranslateOffset: number;
  animatingDirection: "prev" | "next" | null;
}

type SliderAction =
  | { type: "SET_CURRENT_INDEX"; payload: number }
  | { type: "SET_SLIDE_SIZE"; payload: number }
  | { type: "SET_IS_RTL"; payload: boolean }
  | { type: "SET_IS_DRAGGING"; payload: boolean }
  | { type: "SET_TRANSLATE_OFFSET"; payload: number }
  | { type: "RESET_TRANSLATE_OFFSET" }
  | { type: "SET_ANIMATING_DIRECTION"; payload: "prev" | "next" | null };
//#endregion

//#region SliderSlide Component
export const SliderSlide: React.FC<SliderSlideProps> = memo(({ children, className = "", style }) => {
  return (
    <div className={`${styles.sliderSlide} ${className}`} style={style}>
      {children}
    </div>
  );
});
SliderSlide.displayName = "SliderSlide";
//#endregion

//#region Reducer
const sliderReducer = (state: SliderState, action: SliderAction): SliderState => {
  switch (action.type) {
    case "SET_CURRENT_INDEX":
      return { ...state, currentIndex: action.payload };
    case "SET_SLIDE_SIZE":
      return { ...state, slideSize: action.payload };
    case "SET_IS_RTL":
      return { ...state, isRTL: action.payload };
    case "SET_IS_DRAGGING":
      return { ...state, isDragging: action.payload };
    case "SET_TRANSLATE_OFFSET":
      return { ...state, currentTranslateOffset: action.payload };
    case "RESET_TRANSLATE_OFFSET":
      return { ...state, currentTranslateOffset: 0 };
    case "SET_ANIMATING_DIRECTION":
      return { ...state, animatingDirection: action.payload };
    default:
      return state;
  }
};
//#endregion

//#region Memoized Sub-Components
const NavigationButton = memo<{
  direction: "prev" | "next";
  isRTL: boolean;
  canNavigate: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isAnimating?: boolean;
}>(({ direction, isRTL, canNavigate, onClick, onKeyDown, isAnimating }) => {
  const isPrev = direction === "prev";
  const buttonClass = `${styles.navigationButton} ${
    isRTL
      ? isPrev
        ? styles.navigationNext
        : styles.navigationPrev
      : isPrev
      ? styles.navigationPrev
      : styles.navigationNext
  } ${!canNavigate ? styles.navigationDisabled : ""} ${isAnimating ? styles.navigationAnimating : ""}`;
  // Workaround: some build/type systems may not expose generated CSS module typings
  // for compound selectors. Use a safe any-cast when referencing navigationAnimating.
  const buttonClassSafe = `${styles.navigationButton} ${
    isRTL
      ? isPrev
        ? styles.navigationNext
        : styles.navigationPrev
      : isPrev
      ? styles.navigationPrev
      : styles.navigationNext
  } ${!canNavigate ? styles.navigationDisabled : ""} ${isAnimating ? (styles as any).navigationAnimating : ""}`;

  return (
    <button
      className={buttonClassSafe}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={!canNavigate}
      aria-label={`${isPrev ? "Previous" : "Next"} slide`}
      type="button">
      <svg width="21" height="21" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
        {isPrev ? (
          <path
            fill="var(--text-h1)"
            d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
          />
        ) : (
          <path
            fill="var(--text-h1)"
            d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"
          />
        )}
      </svg>
    </button>
  );
});
NavigationButton.displayName = "NavigationButton";

const PaginationBullet = memo<{
  index: number;
  isActive: boolean;
  isClickable: boolean;
  bulletId: string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  renderBullet?: (index: number, className: string) => string;
}>(({ index, isActive, isClickable, bulletId, onClick, onKeyDown, renderBullet }) => {
  const bulletClass = `${styles.paginationBullet} ${isActive ? styles.paginationBulletActive : ""}`;

  if (renderBullet) {
    const bulletHtml = renderBullet(index, bulletClass);
    return (
      <span
        key={bulletId}
        className={bulletClass}
        onClick={onClick}
        onKeyDown={onKeyDown}
        role="tab"
        tabIndex={isClickable ? (isActive ? 0 : -1) : -1}
        aria-label={`Go to slide ${index + 1}`}
        aria-selected={isActive}
        dangerouslySetInnerHTML={{ __html: bulletHtml }}
      />
    );
  }

  return (
    <span
      key={bulletId}
      className={bulletClass}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="tab"
      tabIndex={isClickable ? (isActive ? 0 : -1) : -1}
      aria-label={`Go to slide ${index + 1}`}
      aria-selected={isActive}>
      {index + 1}
    </span>
  );
});
PaginationBullet.displayName = "PaginationBullet";
//#endregion
//#region Main Slider Component
const Slider: React.FC<SliderProps> = ({
  children,
  slidesPerView = 1,
  spaceBetween = 10,
  navigation = true,
  pagination = {
    clickable: true,
    dynamicBullets: true,
    renderBullet: (index, className) => `<span class="${className}">${index + 1}</span>`,
  },
  className = "",
  onSlideChange,
  onReachEnd,
  isLoading = false,
  itemsPerSlide,
}) => {
  const sliderId = useId();

  //#region Refs
  const sliderRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const dragStartIndexRef = useRef(0);
  const lastCalledIndexRef = useRef<number>(-1);
  const dragHandlersRef = useRef<{
    handleMove: ((clientX: number) => void) | null;
    handleEnd: (() => void) | null;
  }>({ handleMove: null, handleEnd: null });
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  //#endregion

  //#region State with Reducer
  const [state, dispatch] = useReducer(sliderReducer, {
    currentIndex: 0,
    slideSize: 0,
    isRTL: false,
    isDragging: false,
    currentTranslateOffset: 0,
    animatingDirection: null,
  });

  const { currentIndex, slideSize, isRTL, isDragging, currentTranslateOffset, animatingDirection } = state;
  const [isPending, startTransition] = useTransition();
  const deferredIndex = useDeferredValue(currentIndex);
  //#endregion

  //#region Computed Values
  const slides = useMemo(() => {
    const childrenArray = React.Children.toArray(children);

    // اگر itemsPerSlide تنظیم شده باشد، children را گروه‌بندی می‌کنیم
    if (itemsPerSlide && itemsPerSlide > 1) {
      const grouped: ReactNode[] = [];
      for (let i = 0; i < childrenArray.length; i += itemsPerSlide) {
        const group = childrenArray.slice(i, i + itemsPerSlide);
        grouped.push(
          <div
            key={`group-${i}`}
            style={{
              display: "flex",
              flexDirection: "column",

              gap: "10px",
              width: "100%",
              //         justifyContent: "space-between",
              // height: "100%",
            }}>
            {group}
          </div>
        );
      }
      return grouped;
    }

    return childrenArray;
  }, [children, itemsPerSlide]);
  const totalSlides = slides.length;
  const maxIndex = useMemo(() => Math.max(0, totalSlides - slidesPerView), [totalSlides, slidesPerView]);

  const visibleSlideIndices = useMemo(() => {
    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(totalSlides - 1, currentIndex + slidesPerView + 1);
    const indices = new Set<number>();
    for (let i = start; i <= end; i++) {
      indices.add(i);
    }
    return indices;
  }, [currentIndex, slidesPerView, totalSlides]);

  const currentTranslate = useMemo(
    () => -(currentIndex * (slideSize + spaceBetween)),
    [currentIndex, slideSize, spaceBetween]
  );

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;
  //#endregion

  //#region Styles
  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      transform: `translateX(${currentTranslate + currentTranslateOffset}px)`,
      transition: isDragging ? "none" : "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: isDragging ? "grabbing" : "default",
      willChange: isDragging ? "transform" : "auto",
    }),
    [currentTranslate, currentTranslateOffset, isDragging]
  );

  const slideStyle = useMemo<CSSProperties>(
    () => ({
      minWidth: `${slideSize}px`,
      marginRight: `${spaceBetween}px`,
    }),
    [slideSize, spaceBetween]
  );
  //#endregion

  //#region Effects
  useEffect(() => {
    const htmlDir = document.documentElement.getAttribute("dir");
    dispatch({ type: "SET_IS_RTL", payload: htmlDir === "rtl" });
  }, []);

  const updateSlideSize = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      if (sliderRef.current) {
        const containerSize = sliderRef.current.offsetWidth;
        dispatch({ type: "SET_SLIDE_SIZE", payload: containerSize / slidesPerView });
      }
    });
  }, [slidesPerView]);

  useLayoutEffect(() => {
    updateSlideSize();
    if (!sliderRef.current) return;

    const currentSlider = sliderRef.current;
    resizeObserverRef.current = new ResizeObserver(updateSlideSize);
    resizeObserverRef.current.observe(currentSlider);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [updateSlideSize]);

  useEffect(() => {
    if (!onReachEnd) return;

    // فراخوانی در 2 صفحه مانده به آخر
    if (currentIndex >= maxIndex - 2 && currentIndex < maxIndex && lastCalledIndexRef.current < maxIndex - 2) {
      lastCalledIndexRef.current = currentIndex;
      onReachEnd();
    }

    // فراخوانی در آخرین صفحه
    if (currentIndex === maxIndex && lastCalledIndexRef.current < maxIndex) {
      lastCalledIndexRef.current = currentIndex;
      onReachEnd();
    }

    // Reset هنگام برگشت به عقب
    if (currentIndex < maxIndex - 2) {
      lastCalledIndexRef.current = -1;
    }
  }, [currentIndex, maxIndex, onReachEnd]);
  //#endregion

  //#region Navigation Handlers
  const triggerNavigationAnimation = useCallback((direction: "prev" | "next") => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    dispatch({ type: "SET_ANIMATING_DIRECTION", payload: direction });
    animationTimeoutRef.current = setTimeout(() => {
      dispatch({ type: "SET_ANIMATING_DIRECTION", payload: null });
    }, 200);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, maxIndex));
      if (clampedIndex !== currentIndex) {
        startTransition(() => {
          dispatch({ type: "SET_CURRENT_INDEX", payload: clampedIndex });
          onSlideChange?.(clampedIndex);
        });
      }
    },
    [currentIndex, maxIndex, onSlideChange, startTransition]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { key } = e;
      e.preventDefault();

      switch (key) {
        case "ArrowLeft":
          // ArrowLeft همیشه به prev می‌رود
          if (currentIndex > 0) {
            triggerNavigationAnimation("prev");
            goToSlide(currentIndex - 1);
          }
          break;
        case "ArrowRight":
          // ArrowRight همیشه به next می‌رود
          if (currentIndex < maxIndex) {
            triggerNavigationAnimation("next");
            goToSlide(currentIndex + 1);
          }
          break;
        case "Home":
          goToSlide(0);
          break;
        case "End":
          goToSlide(maxIndex);
          break;
        case "PageUp":
          goToSlide(Math.max(0, currentIndex - slidesPerView));
          break;
        case "PageDown":
          goToSlide(Math.min(maxIndex, currentIndex + slidesPerView));
          break;
        case "Escape":
          sliderRef.current?.blur();
          break;
        default:
          return;
      }
    },
    [currentIndex, maxIndex, goToSlide, slidesPerView, triggerNavigationAnimation]
  );
  //#endregion

  //#region Pagination Render
  const paginationBullets = useMemo(() => {
    if (!pagination) return [];
    const totalPages = maxIndex + 1;

    if (pagination.dynamicBullets && totalPages > 7) {
      const visibleCount = 5;
      const sideCount = 2;

      let start = Math.max(0, deferredIndex - sideCount);
      let end = Math.min(totalPages - 1, deferredIndex + sideCount);
      if (end - start < visibleCount - 1) {
        if (start === 0) {
          end = Math.min(totalPages - 1, start + visibleCount - 1);
        } else if (end === totalPages - 1) {
          start = Math.max(0, end - visibleCount + 1);
        }
      }

      return Array.from({ length: end - start + 1 }, (_, i) => ({
        index: start + i,
        isActive: start + i === currentIndex,
      }));
    }

    return Array.from({ length: totalPages }, (_, i) => ({
      index: i,
      isActive: i === currentIndex,
    }));
  }, [pagination, maxIndex, currentIndex, deferredIndex]);

  const handleBulletInteraction = useCallback(
    (index: number, isKeyboard: boolean = false) => {
      if (pagination?.clickable) goToSlide(index);
    },
    [pagination, goToSlide]
  );

  const handleBulletKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (!pagination?.clickable) return;

      const { key } = e;
      e.preventDefault();

      switch (key) {
        case "Enter":
        case " ":
          goToSlide(index);
          break;
        case "ArrowLeft":
          e.stopPropagation();
          // ArrowLeft همیشه به عقب می‌رود
          index > 0 && goToSlide(index - 1);
          break;
        case "ArrowRight":
          e.stopPropagation();
          // ArrowRight همیشه به جلو می‌رود
          index < maxIndex && goToSlide(index + 1);
          break;
      }
    },
    [pagination, goToSlide, maxIndex]
  );

  const renderPagination = useMemo(() => {
    if (!pagination || paginationBullets.length === 0) return null;

    return (
      <div className={styles.paginationContainer} role="tablist" aria-label="Slide navigation">
        {paginationBullets.map(({ index, isActive }) => (
          <PaginationBullet
            key={`${sliderId}-bullet-${index}`}
            index={index}
            isActive={isActive}
            isClickable={pagination.clickable ?? false}
            bulletId={`${sliderId}-bullet-${index}`}
            onClick={() => handleBulletInteraction(index)}
            onKeyDown={handleBulletKeyDown(index)}
            renderBullet={pagination.renderBullet}
          />
        ))}
        {isLoading && (
          <span className={styles.paginationLoader} aria-label="Loading more slides">
            <svg className={styles.loaderRing} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle className={styles.loaderCircle} cx="12" cy="12" r="10" />
            </svg>
          </span>
        )}
      </div>
    );
  }, [pagination, paginationBullets, sliderId, handleBulletInteraction, handleBulletKeyDown, isLoading]);
  //#endregion

  //#region Navigation Button Handlers
  const handleNavigationClick = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev" && canGoPrev) {
        goToSlide(currentIndex - 1);
      } else if (direction === "next" && canGoNext) {
        goToSlide(currentIndex + 1);
      }
    },
    [canGoPrev, canGoNext, currentIndex, goToSlide]
  );

  const handleNavigationKeyDown = useCallback(
    (direction: "prev" | "next") => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleNavigationClick(direction);
      }
    },
    [handleNavigationClick]
  );
  //#endregion

  //#region Drag & Swipe Handlers
  const handleDragStart = useCallback(
    (clientX: number) => {
      dispatch({ type: "SET_IS_DRAGGING", payload: true });
      startXRef.current = clientX;
      dispatch({ type: "RESET_TRANSLATE_OFFSET" });
      dragStartIndexRef.current = currentIndex;
    },
    [currentIndex]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      const diff = clientX - startXRef.current;
      const offset = diff;

      const maxOffset = slideSize + spaceBetween;
      const currentDragIndex = dragStartIndexRef.current;

      if (currentDragIndex === 0 && offset > 0) {
        dispatch({ type: "SET_TRANSLATE_OFFSET", payload: Math.min(offset * 0.3, maxOffset * 0.3) });
      } else if (currentDragIndex === maxIndex && offset < 0) {
        dispatch({ type: "SET_TRANSLATE_OFFSET", payload: Math.max(offset * 0.3, -maxOffset * 0.3) });
      } else {
        dispatch({ type: "SET_TRANSLATE_OFFSET", payload: offset });
      }
    },
    [slideSize, spaceBetween, maxIndex]
  );

  const handleDragEnd = useCallback(() => {
    dispatch({ type: "SET_IS_DRAGGING", payload: false });

    const threshold = (slideSize + spaceBetween) * 0.2;
    const offset = currentTranslateOffset;
    const startIndex = dragStartIndexRef.current;

    if (Math.abs(offset) > threshold) {
      if (offset > 0 && startIndex > 0) {
        triggerNavigationAnimation("prev");
        goToSlide(startIndex - 1);
      } else if (offset < 0 && startIndex < maxIndex) {
        triggerNavigationAnimation("next");
        goToSlide(startIndex + 1);
      }
    }

    dispatch({ type: "RESET_TRANSLATE_OFFSET" });
  }, [currentTranslateOffset, maxIndex, slideSize, spaceBetween, goToSlide, triggerNavigationAnimation]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX);
    },
    [handleDragStart]
  );

  useEffect(() => {
    dragHandlersRef.current.handleMove = handleDragMove;
    dragHandlersRef.current.handleEnd = handleDragEnd;
  }, [handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      dragHandlersRef.current.handleMove?.(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      dragHandlersRef.current.handleEnd?.();
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        dragHandlersRef.current.handleMove?.(e.touches[0].clientX);
      }
    };

    const handleGlobalTouchEnd = () => {
      dragHandlersRef.current.handleEnd?.();
    };

    document.addEventListener("mousemove", handleGlobalMouseMove, { passive: false });
    document.addEventListener("mouseup", handleGlobalMouseUp, { passive: true });
    document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
    document.addEventListener("touchend", handleGlobalTouchEnd, { passive: true });
    document.addEventListener("touchcancel", handleGlobalTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
      document.removeEventListener("touchcancel", handleGlobalTouchEnd);
    };
  }, [isDragging]);
  //#endregion

  //#region Render
  return (
    <section
      className={`${styles.slider} ${className} `}
      ref={sliderRef}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Image slider"
      aria-roledescription="carousel"
      aria-live={isDragging ? "off" : "polite"}
      aria-atomic="false"
      aria-busy={isPending}
      tabIndex={0}>
      <div
        className={styles.sliderWrapper}
        style={wrapperStyle}
        role="group"
        aria-label={`Slide ${currentIndex + 1} of ${totalSlides}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}>
        {slides.map((slide, index) => {
          const isVisible = visibleSlideIndices.has(index);
          const isCurrent = index === currentIndex;
          return (
            <div
              key={`${sliderId}-slide-${index}`}
              className={styles.sliderSlide}
              style={slideStyle}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalSlides}`}
              aria-hidden={!isCurrent}
              {...(!isCurrent && { inert: "" as any })}>
              {isVisible ? slide : <div className={styles.slidePlaceholder} aria-hidden="true" />}
            </div>
          );
        })}
      </div>
      <div className={styles.sliderOverlay}>
        {/* Navigation Buttons */}
        {navigation && totalSlides > slidesPerView && (
          <>
            <NavigationButton
              direction="prev"
              isRTL={isRTL}
              canNavigate={canGoPrev}
              onClick={() => handleNavigationClick("prev")}
              onKeyDown={handleNavigationKeyDown("prev")}
              isAnimating={animatingDirection === "prev"}
            />
            {renderPagination}
            <NavigationButton
              direction="next"
              isRTL={isRTL}
              canNavigate={canGoNext}
              onClick={() => handleNavigationClick("next")}
              onKeyDown={handleNavigationKeyDown("next")}
              isAnimating={animatingDirection === "next"}
            />
          </>
        )}
      </div>
    </section>
  );
  //#endregion
};
//#endregion

export default memo(Slider);
