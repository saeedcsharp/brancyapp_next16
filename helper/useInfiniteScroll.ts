import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions<T = any> {
  /**
   * آیا داده‌های بیشتری برای بارگذاری وجود دارد؟
   */
  hasMore: boolean;

  /**
   * تابعی که برای واکشی داده‌های جدید فراخوانی می‌شود
   * باید آرایه‌ای از داده‌های جدید را برگرداند
   */
  fetchMore: () => Promise<T[]>;

  /**
   * تابع callback که بعد از واکشی موفق داده‌ها فراخوانی می‌شود
   * @param newData - داده‌های جدید واکشی شده
   * @param hasMore - آیا داده‌های بیشتری وجود دارد؟
   */
  onDataFetched: (newData: T[], hasMore: boolean) => void;

  /**
   * تابع برای استخراج unique identifier از هر آیتم
   * برای جلوگیری از duplicate ها
   */
  getItemId: (item: T) => string | number;

  /**
   * داده‌های فعلی که در component وجود دارد
   * برای بررسی duplicates
   */
  currentData: T[];

  /**
   * آیا در حال حاضر در حال بارگذاری است؟ (اختیاری)
   */
  isLoading?: boolean;

  /**
   * فاصله از انتهای صفحه (به پیکسل) که باید بارگذاری شروع شود
   * پیش‌فرض: 200
   */
  threshold?: number;

  /**
   * آیا باید بعد از render اولیه بررسی کند که آیا نیاز به بارگذاری خودکار هست؟
   * (برای مانیتورهای بزرگ که محتوا کل صفحه را پر نمی‌کند)
   * پیش‌فرض: true
   */
  enableAutoLoad?: boolean;

  /**
   * تاخیر (به میلی‌ثانیه) قبل از بررسی خودکار بارگذاری
   * پیش‌فرض: 300
   */
  autoLoadDelay?: number;

  /**
   * آیا infinite scroll فعال است؟
   * پیش‌فرض: true
   */
  enabled?: boolean;

  /**
   * تاخیر قبل از هر درخواست واکشی (به میلی‌ثانیه)
   * پیش‌فرض: 500
   */
  fetchDelay?: number;

  /**
   * حداقل تعداد آیتم‌هایی که اگر واکشی شد، hasMore را true نگه دارد
   * پیش‌فرض: 1
   */
  minItemsForMore?: number;

  /**
   * آیا scroll معکوس است؟ (برای chat با flex-direction: column-reverse)
   * اگر true باشد، وقتی scrollTop نزدیک به صفر شد، بارگذاری می‌کند
   * پیش‌فرض: false
   */
  reverseScroll?: boolean;

  /**
   * آیا باید از container scroll به جای window scroll استفاده کند؟
   * پیش‌فرض: false (استفاده از window scroll)
   */
  useContainerScroll?: boolean;

  /**
   * ref خارجی به container (اختیاری)
   * اگر مشخص نشود، یک ref داخلی ایجاد می‌شود
   */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

interface UseInfiniteScrollReturn {
  /**
   * ref که باید به container اصلی متصل شود
   */
  containerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * آیا در حال بارگذاری داده‌های بیشتر است؟
   */
  isLoadingMore: boolean;
}

/**
 * Custom hook برای پیاده‌سازی inline infinite scroll با مدیریت خودکار duplicate prevention
 *
 * @example
 * ```tsx
 * const { containerRef, isLoadingMore } = useInfiniteScroll({
 *   hasMore,
 *   fetchMore: async () => {
 *     const result = await GetServerResult(...);
 *     return result.value || [];
 *   },
 *   onDataFetched: (newData, hasMore) => {
 *     setData(prev => [...prev, ...newData]);
 *     setHasMore(hasMore);
 *   },
 *   getItemId: (item) => item.id,
 *   currentData: data,
 * });
 *
 * return (
 *   <div ref={containerRef}>
 *     {data.map(item => <Item key={item.id} {...item} />)}
 *     {isLoadingMore && <Loader />}
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll<T = any>(options: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn {
  const {
    hasMore,
    fetchMore,
    onDataFetched,
    getItemId,
    currentData,
    isLoading = false,
    threshold = 200,
    enableAutoLoad = true,
    autoLoadDelay = 300,
    enabled = true,
    fetchDelay = 500,
    minItemsForMore = 1,
    reverseScroll = false,
    useContainerScroll = false,
    containerRef: externalContainerRef,
  } = options;

  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingRef = useRef(false);

  // استفاده از ref برای نگه‌داری آخرین نسخه currentData بدون ایجاد مجدد callback
  const currentDataRef = useRef(currentData);
  currentDataRef.current = currentData;

  // تابع اصلی بارگذاری که state را مدیریت می‌کند
  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !enabled) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      // تاخیر قبل از درخواست
      if (fetchDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, fetchDelay));
      }

      // واکشی داده‌های جدید
      const newData = await fetchMore();

      // بررسی موفقیت‌آمیز بودن درخواست
      if (!newData || !Array.isArray(newData)) {
        console.warn("Invalid response from fetchMore:", newData);
        return;
      }

      // اگر هیچ داده جدیدی نیامد، هیچ کاری نکن - داده‌های موجود را حفظ کن
      if (newData.length === 0) {
        console.log("No new data fetched, keeping existing data intact");
        return;
      }

      // فیلتر کردن آیتم‌های تکراری با استفاده از آخرین نسخه currentData
      const existingIds = new Set(currentDataRef.current.map(getItemId));
      const uniqueNewData = newData.filter((item) => !existingIds.has(getItemId(item)));

      // اگر همه داده‌ها تکراری بودند، هیچ کاری نکن
      if (uniqueNewData.length === 0) {
        console.log("All fetched items were duplicates, skipping update");
        return;
      }

      // تعیین اینکه آیا داده‌های بیشتری وجود دارد
      const hasMoreData = uniqueNewData.length >= minItemsForMore;

      // فقط اگر داده جدید و منحصر به فرد داریم، callback را فراخوانی کن
      onDataFetched(uniqueNewData, hasMoreData);
    } catch (error) {
      console.error("Error in useInfiniteScroll:", error);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, fetchMore, onDataFetched, getItemId, enabled, fetchDelay, minItemsForMore]);

  // بررسی اینکه آیا نیاز به بارگذاری خودکار هست (وقتی scrollbar وجود ندارد)
  const checkAndLoadMore = useCallback(() => {
    if (!containerRef.current || isLoadingRef.current || !hasMore || !enabled) return;

    if (useContainerScroll) {
      const container = containerRef.current;
      const hasScrollbar = container.scrollHeight > container.clientHeight;

      // اگر scrollbar وجود ندارد، خودکار بارگذاری کن
      if (!hasScrollbar) {
        handleLoadMore();
      }
    } else {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // اگر محتوا کوتاه‌تر از صفحه است، خودکار بارگذاری کن
      if (scrollHeight <= clientHeight + 100) {
        handleLoadMore();
      }
    }
  }, [hasMore, handleLoadMore, enabled, useContainerScroll]);

  // مدیریت scroll event
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (!containerRef.current || isLoadingRef.current) return;

      if (useContainerScroll) {
        // استفاده از scroll container
        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        if (reverseScroll) {
          // برای chat با flex-direction: column-reverse
          // scrollTop منفی است - هرچه به بالا برویم منفی‌تر می‌شود
          // حداکثر اسکرول بالا = -(scrollHeight - clientHeight)
          const maxScrollTop = -(scrollHeight - clientHeight);
          const distanceFromTop = Math.abs(scrollTop - maxScrollTop);

          // فقط اگر نزدیک به بالای محتوا رسیدیم (کمتر از threshold)
          if (distanceFromTop < threshold && hasMore) {
            handleLoadMore();
          }
        } else {
          // scroll عادی - وقتی به انتهای container رسید
          if (scrollHeight - scrollTop - clientHeight < threshold && hasMore) {
            handleLoadMore();
          }
        }
      } else {
        // استفاده از window scroll
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        // وقتی کاربر به threshold پیکسل از انتهای صفحه رسید، داده‌های جدید را بارگذاری کن
        if (scrollHeight - scrollTop - clientHeight < threshold && hasMore) {
          handleLoadMore();
        }
      }
    };

    if (useContainerScroll && containerRef.current) {
      const container = containerRef.current;
      container.addEventListener("scroll", handleScroll, {
        passive: true,
      } as any);
      return () => container.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, threshold, handleLoadMore, enabled, useContainerScroll, reverseScroll]);

  // بعد از render، چک کن که آیا نیاز به بارگذاری خودکار هست
  useEffect(() => {
    if (!enableAutoLoad || !enabled || isLoading) return;

    // با تاخیر کوتاه تا DOM به‌روز شود
    const timer = setTimeout(() => {
      checkAndLoadMore();
    }, autoLoadDelay);

    return () => clearTimeout(timer);
  }, [enableAutoLoad, checkAndLoadMore, isLoading, autoLoadDelay, enabled]);

  return {
    containerRef,
    isLoadingMore: isLoadingMore || isLoading,
  };
}
