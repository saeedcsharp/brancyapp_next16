import router from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DotLoaders from "saeed/components/design/loader/dotLoaders";
import { LanguageKey } from "saeed/i18n";
import { IPostContent } from "saeed/models/page/post/posts";
import styles from "./PostStatsViewer.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const POSTS_PER_PAGE = 50;
export type SortType = "maxView" | "minView" | "maxEngagement" | "minEngagement";
interface PostStatsViewerProps {
  data: IPostContent[] | null;
  sortType: SortType;
  removeMask: () => void;
}
const PostStatsViewer: React.FC<PostStatsViewerProps> = ({ data, sortType, removeMask }) => {
  const { t } = useTranslation();
  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const sortedPosts = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      switch (sortType) {
        case "maxView":
          return b.viewCount - a.viewCount;
        case "minView":
          return a.viewCount - b.viewCount;
        case "maxEngagement": {
          const totalA = a.likeCount + a.commentCount;
          const totalB = b.likeCount + b.commentCount;
          return totalB - totalA;
        }
        case "minEngagement": {
          const totalA = a.likeCount + a.commentCount;
          const totalB = b.likeCount + b.commentCount;
          return totalA - totalB;
        }
        default:
          return 0;
      }
    });
  }, [data, sortType]);
  const displayedPosts = useMemo(() => {
    return sortedPosts.slice(0, displayCount);
  }, [sortedPosts, displayCount]);
  const hasMore = displayCount < sortedPosts.length;
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + POSTS_PER_PAGE, sortedPosts.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, sortedPosts.length]);
  useEffect(() => {
    if (!loadMoreRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    observerRef.current.observe(loadMoreRef.current);
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore]);
  const navigateToPost = useCallback((postId: string) => {
    router.push(`/page/posts/postinfo?postid=${postId}`);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getMedalEmoji = (index: number): string => {
    const isMinSort = sortType === "minView" || sortType === "minEngagement";
    if (isMinSort) {
      if (index === 0) return "🥉";
      if (index === 1) return "🥈";
      if (index === 2) return "🥇";
    } else {
      if (index === 0) return "🥇";
      if (index === 1) return "🥈";
      if (index === 2) return "🥉";
    }
    return "";
  };
  const getTitle = (): string => {
    switch (sortType) {
      case "maxView":
        return t(LanguageKey.pageStatistics_MaxView);
      case "minView":
        return t(LanguageKey.pageStatistics_MinView);
      case "maxEngagement":
        return t(LanguageKey.pageStatistics_MaxCommentLike);
      case "minEngagement":
        return t(LanguageKey.pageStatistics_MinCommentLike);
      default:
        return "";
    }
  };
  const isEngagementMode = sortType === "maxEngagement" || sortType === "minEngagement";
  const isViewMode = sortType === "maxView" || sortType === "minView";

  return (
    <>
      <div className="frameParent">
        <div className="headerChild">
          <div className="circle">
            <div className="outerCircle" />
            <div className="innerCircle" />
          </div>
          <div className="Title">{getTitle()}</div>
        </div>
      </div>

      <div className={styles.postsList}>
        {displayedPosts.map((post, index) => (
          <div
            key={post.postId}
            className={styles.postItem}
            onClick={() => navigateToPost(post.postId.toString())}
            style={{
              animationDelay: `${(index % POSTS_PER_PAGE) * 0.08}s`,
            }}>
            <div className={styles.rankSection}>
              <div className={styles.rankNumber}>#{index + 1}</div>
              {getMedalEmoji(index) && <span className={styles.medal}>{getMedalEmoji(index)}</span>}
            </div>

            <img
              loading="lazy"
              decoding="async"
              className={styles.thumbnail}
              alt={`Post ${post.postId}`}
              src={`${basePictureUrl}${post.thumbnailMediaUrl}`}
            />

            <div className={styles.statsSection}>
              {isViewMode && (
                <div className="instagramprofiledetail">
                  <div className={styles.statGroup}>
                    <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={styles.statValue}>{formatNumber(post.viewCount)}</span>
                  </div>
                  <div className={styles.statGroup}>
                    <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={styles.statValue}>{formatNumber(post.commentCount)}</span>
                  </div>
                </div>
              )}
              {isEngagementMode && (
                <div className="instagramprofiledetail">
                  <div className={styles.statGroup}>
                    <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={styles.statValue}>{formatNumber(post.likeCount)}</span>
                  </div>
                  <div className={styles.statGroup}>
                    <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={styles.statValue}>{formatNumber(post.commentCount)}</span>
                  </div>
                  <div className={styles.statGroup}>
                    <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={styles.statValue}>{formatNumber(post.shareCount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {hasMore && (
          <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
            {isLoading && (
              <div className={styles.loaderWrapper}>
                <DotLoaders />
              </div>
            )}
          </div>
        )}
      </div>

      {sortedPosts.length === 0 && (
        <div className={styles.emptyState}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="60%"
            clipRule="evenodd"
            fillRule="evenodd"
            fill="none"
            viewBox="0 0 167 101">
            <path
              fill="var(--color-dark-blue30)"
              d="M160 14a7 7 0 1 1 0 14h-40a7 7 0 1 1 0 14h22a7 7 0 1 1 0 14h-10.2c-4.8 0-8.8 3.1-8.8 7q0 4 6 7a7 7 0 1 1 0 14H46a7 7 0 1 1 0-14H7a7 7 0 1 1 0-14h40a7 7 0 1 0 0-14H22a7 7 0 1 1 0-14h40a7 7 0 1 1 0-14zm0 28a7 7 0 1 1 0 14 7 7 0 0 1 0-14"
            />
            <path
              fill="var(--text-h1)"
              d="m106.7 13 9.3 67.8.8 6.8a4 4 0 0 1-3.5 4.5l-58.5 7.2a4 4 0 0 1-4.5-3.5l-9-73.4a2 2 0 0 1 1.7-2.2l5-.6"
            />
            <path
              fill="var(--color-dark-blue)"
              d="M48.1 20.9a1.3 1.3 0 0 0-.3-2.5zm3.6-3a1.3 1.3 0 1 0 .3 2.5zm4.9 2a1.3 1.3 0 1 0-.3-2.5zM114.7 81l.9 6.8 2.5-.3-.9-6.8zm.9 6.8c.2 1.5-1 2.9-2.4 3l.3 2.5c2.9-.3 4.9-3 4.6-5.8zm-2.4 3-58.6 7.3.3 2.4 58.6-7.2zm-58.6 7.3c-1.5.1-2.9-1-3-2.4l-2.5.3c.3 2.8 3 4.9 5.8 4.5zm-3-2.4-9-73.5-2.5.3 9 73.5zm-9-73.5q0-.7.6-.8l-.3-2.5c-1.8.2-3 1.9-2.8 3.6zm.6-.8 4.9-.5-.3-2.5-4.9.5zm8.8-1 4.6-.5-.3-2.5-4.6.5z"
            />

            <path
              fill="var(--text-h1)"
              stroke="var(--color-dark-blue)"
              strokeWidth="2.5"
              d="M63.7 1.6h45.5q.7 0 1.1.4l13.4 13.4q.5.4.5 1.1V79q-.1 1.5-1.5 1.6h-59A1.5 1.5 0 0 1 62 79V3q.1-1.3 1.6-1.4Z"
            />
            <mask id="b" fill="var(--text-h1)">
              <path d="M110 1v12q0 1.1 1 2.1 1.1.9 2.5.9h9.5" />
            </mask>
            <path
              fill="var(--color-dark-blue)"
              d="M112.5 1a2.5 2.5 0 1 0-5 0zM123 18.5a2.5 2.5 0 1 0 0-5zM110 1h-2.5v12h5V1zm0 12h-2.5q0 2.4 1.9 4l1.6-2 1.7-1.9q-.2-.1-.2-.3zm1 2.1-1.6 1.9q1.8 1.5 4.1 1.5v-5q-.5 0-.8-.3zm2.5.9v2.5h9.5v-5h-9.5z"
              mask="url(#b)"
            />
            <path
              stroke="var(--color-dark-blue)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M71 67h26M71 16h26M71 28h43M71 41h43M71 54h43"
            />
          </svg>
          <p className={styles.emptyText}>{t(LanguageKey.pageStatistics_EmptyList)}</p>
        </div>
      )}
    </>
  );
};
export default React.memo(PostStatsViewer);
