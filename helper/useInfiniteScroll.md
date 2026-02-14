# useInfiniteScroll Hook

Custom React Hook برای پیاده‌سازی آسان Inline Infinite Scroll با مدیریت خودکار duplicate prevention و error handling.

## ویژگی‌ها

✅ **مدیریت خودکار Duplicate Prevention**: فیلتر کردن خودکار آیتم‌های تکراری
✅ **بدون وابستگی به پکیج خارجی**: پیاده‌سازی خالص با React
✅ **Error Handling پیشرفته**: مدیریت خطاها با fallback mechanism
✅ **پشتیبانی از مانیتورهای بزرگ**: بارگذاری خودکار وقتی محتوا کل صفحه را پر نمی‌کند
✅ **TypeScript Support کامل**: با استفاده از Generics برای type safety
✅ **عملکرد بهینه**: Passive event listeners برای بهبود performance
✅ **قابل تنظیم و سفارشی‌سازی**: کنترل کامل بر threshold، delay و سایر تنظیمات

## نحوه استفاده

### مثال ساده (Posts)

```tsx
import { useState, useReducer } from "react";
import { useSession } from "next-auth/react";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { GetServerResult, MethodType } from "saeed/models/IResult";

function PostContent() {
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(postReducer, initialState);
  const { posts, hasMore, nextTime, loadingStatus } = state;

  const normalizePost = (post: IPostContent): IPostContent => ({
    ...post,
    likeCount: post.likeCount ?? 0,
    viewCount: post.viewCount ?? 0,
    commentCount: post.commentCount ?? 0,
    shareCount: post.shareCount ?? 0,
  });

  const { containerRef, isLoadingMore } = useInfiniteScroll<IPostContent>({
    hasMore,
    fetchMore: async () => {
      if (nextTime <= 0) return [];

      const result = await GetServerResult<string, IPostContent[]>(
        MethodType.get,
        session,
        "Instagramer/Post/GetPostByScrollingDown",
        null,
        [{ key: "createdTime", value: nextTime.toString() }]
      );

      if (!result.succeeded || !result.value || !Array.isArray(result.value)) {
        return [];
      }

      return result.value.map(normalizePost);
    },
    onDataFetched: (newPosts, hasMoreData) => {
      dispatch({
        type: "ADD_POSTS",
        payload: {
          posts: newPosts,
          hasMore: hasMoreData,
          nextTime: newPosts.length > 0 ? newPosts[newPosts.length - 1].createdTime : nextTime,
        },
      });
    },
    getItemId: (post) => post.postId,
    currentData: posts || [],
    isLoading: loadingStatus,
    threshold: 200,
    fetchDelay: 500,
  });

  return (
    <div ref={containerRef}>
      {posts?.map((post) => (
        <PostCard key={post.postId} {...post} />
      ))}
      {isLoadingMore && <Loader />}
    </div>
  );
}
```

### مثال ساده (Stories)

```tsx
function StoryContent() {
  const { data: session } = useSession();
  const [stories, setStories] = useState<IStoryContent[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const { containerRef, isLoadingMore } = useInfiniteScroll<IStoryContent>({
    hasMore,
    fetchMore: async () => {
      if (!stories || stories.length === 0) return [];

      const res = await GetServerResult<boolean, IStoryContent[]>(
        MethodType.get,
        session,
        "Instagramer/Story/GetNextStories",
        null,
        [
          {
            key: "lastStoryCreatedTime",
            value: stories[stories.length - 1].createdTime.toString(),
          },
        ]
      );

      if (!res.succeeded || !res.value || !Array.isArray(res.value)) {
        return [];
      }

      return res.value;
    },
    onDataFetched: (newStories, hasMoreData) => {
      setHasMore(hasMoreData);

      if (newStories.length > 0) {
        setStories((prevStories) => [...prevStories, ...newStories]);
      }
    },
    getItemId: (story) => story.storyId,
    currentData: stories,
    isLoading: loadingStatus,
    threshold: 200,
    minItemsForMore: 18,
  });

  return (
    <div ref={containerRef}>
      {stories.map((story) => (
        <StoryCard key={story.storyId} {...story} />
      ))}
      {isLoadingMore && <Loader />}
    </div>
  );
}
```

### مثال واقعی (Posts)

```tsx
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";

const PostContent = (props) => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextTime, setNextTime] = useState(-1);

  const loadMorePosts = useCallback(async () => {
    if (nextTime <= 0) return;

    try {
      const result = await GetServerResult(MethodType.get, session, "Instagramer/Post/GetPostByScrollingDown", null, [
        { key: "createdTime", value: nextTime.toString() },
      ]);

      if (result.succeeded && result.value) {
        const newPosts = result.value;
        setPosts((prev) => [...prev, ...newPosts]);
        setHasMore(newPosts.length > 0);
        setNextTime(newPosts.length > 0 ? newPosts[newPosts.length - 1].createdTime : nextTime);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      setHasMore(false);
    }
  }, [nextTime, session]);

  const { containerRef, isLoadingMore } = useInfiniteScroll({
    hasMore,
    loadMore: loadMorePosts,
    threshold: 200,
  });

  return (
    <div ref={containerRef}>
      {posts.map((post) => (
        <PostItem key={post.postId} {...post} />
      ))}
      {isLoadingMore && <DotLoaders />}
    </div>
  );
};
```

## پارامترها

### `UseInfiniteScrollOptions<T>`

| پارامتر           | تایپ                                       | پیش‌فرض      | توضیحات                                          |
| ----------------- | ------------------------------------------ | ------------ | ------------------------------------------------ |
| `hasMore`         | `boolean`                                  | **required** | آیا داده‌های بیشتری برای بارگذاری وجود دارد؟     |
| `fetchMore`       | `() => Promise<T[]>`                       | **required** | تابع واکشی داده‌های جدید که آرایه‌ای برمی‌گرداند |
| `onDataFetched`   | `(newData: T[], hasMore: boolean) => void` | **required** | callback برای دریافت داده‌های جدید               |
| `getItemId`       | `(item: T) => string \| number`            | **required** | تابع برای استخراج unique ID از هر آیتم           |
| `currentData`     | `T[]`                                      | **required** | آرایه داده‌های فعلی برای بررسی duplicates        |
| `isLoading`       | `boolean`                                  | `false`      | وضعیت loading اولیه                              |
| `threshold`       | `number`                                   | `200`        | فاصله از انتهای صفحه (پیکسل)                     |
| `enableAutoLoad`  | `boolean`                                  | `true`       | بارگذاری خودکار برای مانیتورهای بزرگ             |
| `autoLoadDelay`   | `number`                                   | `300`        | تاخیر قبل از بارگذاری خودکار (ms)                |
| `enabled`         | `boolean`                                  | `true`       | فعال/غیرفعال کردن infinite scroll                |
| `fetchDelay`      | `number`                                   | `500`        | تاخیر قبل از هر درخواست واکشی (ms)               |
| `minItemsForMore` | `number`                                   | `1`          | حداقل تعداد آیتم برای تعیین hasMore              |

### مقدار برگشتی

| ویژگی           | تایپ                        | توضیحات                          |
| --------------- | --------------------------- | -------------------------------- |
| `containerRef`  | `RefObject<HTMLDivElement>` | ref برای اتصال به container اصلی |
| `isLoadingMore` | `boolean`                   | آیا در حال بارگذاری است؟         |

## نکات مهم

### 1. Duplicate Prevention خودکار

Hook به صورت خودکار آیتم‌های تکراری را با استفاده از `getItemId` فیلتر می‌کند. شما فقط باید تابع استخراج ID را مشخص کنید:

```tsx
getItemId: (post) => post.postId,  // برای posts
getItemId: (story) => story.storyId,  // برای stories
```

**مهم**: دیگر نیازی به فیلتر کردن دستی در reducer یا setState ندارید!

### 2. Error Handling خودکار

Hook به صورت خودکار خطاها را handle می‌کند و در صورت وقوع خطا، `hasMore` را `false` می‌کند:

```tsx
fetchMore: async () => {
  const result = await GetServerResult(...);

  // اگر درخواست ناموفق باشد، آرایه خالی برگردان
  if (!result.succeeded || !result.value) {
    return [];
  }

  return result.value;
},
```

### 3. بهینه‌سازی عملکرد

- Hook از `useCallback` برای جلوگیری از re-render های غیرضروری استفاده می‌کند
- از `useMemo` برای داده‌های پردازش شده در component استفاده کنید
- از key های یونیک (مثلاً `item.id`) برای map استفاده کنید

```tsx
const processedData = useMemo(() => {
  return data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));
}, [data]);
```

### 4. غیرفعال کردن موقت

```tsx
const { containerRef, isLoadingMore } = useInfiniteScroll({
  hasMore,
  fetchMore,
  onDataFetched,
  getItemId,
  currentData,
  enabled: !isSearching, // غیرفعال در حین جستجو
});
```

### 5. تنظیم minItemsForMore

برای Stories که معمولاً 18 آیتم برمی‌گرداند:

```tsx
const { containerRef, isLoadingMore } = useInfiniteScroll({
  // ... سایر پارامترها
  minItemsForMore: 18, // اگر کمتر از 18 آیتم واکشی شد، hasMore = false
});
```

## تفاوت‌ها با نسخه قبلی

### نسخه قبلی (Manual)

```tsx
const loadMore = async () => {
  // 1. Check hasMore manually
  if (!hasMore) return;

  // 2. Set loading state
  setIsLoading(true);

  // 3. Fetch data
  const result = await fetchData();

  // 4. Filter duplicates manually
  const existingIds = new Set(data.map((item) => item.id));
  const uniqueData = result.filter((item) => !existingIds.has(item.id));

  // 5. Update state
  setData((prev) => [...prev, ...uniqueData]);
  setHasMore(uniqueData.length > 0);
  setIsLoading(false);
};
```

### نسخه جدید (Automatic)

```tsx
const { containerRef, isLoadingMore } = useInfiniteScroll({
  hasMore,
  fetchMore: async () => {
    const result = await fetchData();
    return result; // Hook handles everything else!
  },
  onDataFetched: (newData, hasMore) => {
    setData((prev) => [...prev, ...newData]);
    setHasMore(hasMore);
  },
  getItemId: (item) => item.id,
  currentData: data,
});
```

## مزایا نسبت به react-infinite-scroll-component

- ✅ **بدون وابستگی**: نیازی به نصب پکیج اضافی نیست
- ✅ **Duplicate Prevention خودکار**: فیلتر کردن خودکار آیتم‌های تکراری
- ✅ **Error Handling پیشرفته**: مدیریت خودکار خطاها
- ✅ **سبک‌تر**: کد کمتر و عملکرد بهتر
- ✅ **کنترل بیشتر**: دسترسی کامل به منطق
- ✅ **TypeScript با Generics**: type safety کامل برای هر نوع داده
- ✅ **مانیتورهای بزرگ**: بارگذاری خودکار زمانی که scrollbar وجود ندارد
- ✅ **Passive Listeners**: بهبود عملکرد scroll
- ✅ **Configurable**: کنترل کامل بر threshold، delay، و سایر تنظیمات

## استفاده در پروژه

این hook در فایل‌های زیر استفاده شده:

- `components/page/posts/postContent.tsx` - برای نمایش پست‌ها
- `components/page/storyContent/storyContent.tsx` - برای نمایش استوری‌ها

## License

بخشی از پروژه Brancy UI Next.js App
