import RingLoader from "brancy/components/design/loader/ringLoder";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import styles from "./event.module.css";

interface IEventIdeaItem {
  ideaId: number;
  idea: string;
  languageId: number;
  description: string;
  id: number;
  title: string;
  countryCode: string;
  date: number;
  isReligious: boolean;
}

interface IEventIdea {
  id: number;
  fbId: number;
  prompt: string;
  minTime: number;
  maxTime: number;
  createdTime: number;
  languageId: number;
  items: IEventIdeaItem[];
}

const LANGUAGE_CODE_TO_ID: Record<string, number> = {
  en: 0,
  fa: 1,
  ar: 2,
  fr: 3,
  ru: 4,
  tr: 5,
  gr: 6,
  az: 7,
};

interface IEventIdeaResponse {
  items: IEventIdea[];
  nextMaxId: number | null;
}

const EventIdea = (props: { handleOpenCreate: () => void }) => {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();

  const [isHidden, setIsHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ideas, setIdeas] = useState<IEventIdea[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [nextMaxId, setNextMaxId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const toggleHidden = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, []);

  const formatDate = useCallback((unix: number) => {
    const { locale, calendar } = initialzedTime();
    return new DateObject({ date: new Date(unix * 1000), calendar, locale }).format("YYYY/MM/DD");
  }, []);

  const fetchIdeas = useCallback(
    async (append = false, maxId: number | null = null) => {
      if (!session) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setHasSearched(true);
        setIdeas([]);
        setNextMaxId(null);
        setHasMore(false);
      }

      try {
        const queries: { key: string; value: string }[] = [
          { key: "language", value: (LANGUAGE_CODE_TO_ID[i18n.language] ?? 0).toString() },
        ];
        if (maxId !== null) {
          queries.push({ key: "nextMaxId", value: maxId.toString() });
        }

        const res = await clientFetchApi<null, IEventIdeaResponse>("/api/dayevent/getEventIdeas", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries,
          onUploadProgress: undefined,
        });

        if (res.succeeded) {
          const fetched: IEventIdea[] = Array.isArray(res.value?.items) ? res.value!.items : [];
          const newNextMaxId = res.value?.nextMaxId ?? null;
          if (append) {
            setIdeas((prev) => [...prev, ...fetched]);
          } else {
            setIdeas(fetched);
          }
          setNextMaxId(newNextMaxId);
          setHasMore(newNextMaxId !== null && fetched.length > 0);
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [session, i18n.language],
  );

  const handleLoadMore = useCallback(() => {
    if (nextMaxId !== null) {
      fetchIdeas(true, nextMaxId);
    }
  }, [fetchIdeas, nextMaxId]);

  // Flatten all idea items from all idea groups into one list for the slider
  const flatItems = useMemo(
    () =>
      (Array.isArray(ideas) ? ideas : []).flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          prompt: group.prompt,
          createdTime: group.createdTime,
        })),
      ),
    [ideas],
  );

  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" onClick={toggleHidden}>
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.pageTools_EventIdeas)}</div>
      </div>

      <div className={`${styles.eventCard} ${isHidden ? "" : styles.show}`}>
        <div id="score" onClick={props.handleOpenCreate} className={styles.score}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-light-blue)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--color-light-blue)" }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="12" y1="13" x2="12" y2="19" />
            <line x1="9" y1="16" x2="15" y2="16" />
          </svg>
          <div className={styles.frame}>
            <div className={styles.title}>{t(LanguageKey.pageTools_IdeaCreate)}</div>
            <div className="explain">{t(LanguageKey.pageTools_IdeaExplain)}</div>
          </div>
        </div>
        <div className={styles.controls}>
          {/* Fetch Button */}
          <div className={styles.row}>
            <button className={styles.searchBtn} onClick={() => fetchIdeas(false)} disabled={loading}>
              {t(LanguageKey.pageTools_EventIdeasFetch)}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loaderContainer}>
            <RingLoader />
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && flatItems.length === 0 && (
          <div className={styles.emptyState}>{t(LanguageKey.pageTools_EventIdeasEmpty)}</div>
        )}

        {/* Results */}
        {!loading && flatItems.length > 0 && (
          <>
            <Slider
              slidesPerView={1}
              spaceBetween={12}
              itemsPerSlide={1}
              navigation={true}
              pagination={{ clickable: true, dynamicBullets: true }}
              className={styles.ideaSlider}
              onReachEnd={hasMore ? handleLoadMore : undefined}
              isLoading={loadingMore}>
              {flatItems.map((item) => (
                <SliderSlide key={`${item.id}-${item.ideaId}`} className={styles.ideaSlide}>
                  {/* Header */}
                  <div className={styles.ideaHeader}>
                    <div className={styles.eventTitle}>{item.title}</div>
                    <div className={styles.eventDescription}>{item.description}</div>
                  </div>

                  {/* Idea text — scrollable */}
                  <div className={styles.ideaTextBlock}>{item.idea}</div>

                  {/* Info rows */}
                  <div className={styles.ideaInfoList}>
                    {item.prompt && (
                      <div className={styles.ideaInfoRow}>
                        <span className={styles.ideaInfoLabel}>{t(LanguageKey.pageTools_EventIdeasPrompt)}</span>
                        <span className={styles.ideaInfoValue}>{item.prompt.trim()}</span>
                      </div>
                    )}
                    {item.countryCode && item.countryCode !== "--" && (
                      <div className={styles.ideaInfoRow}>
                        <span className={styles.ideaInfoLabel}>{t(LanguageKey.pageTools_EventIdeasCountry)}</span>
                        <span className={styles.ideaInfoValue}>{item.countryCode.toUpperCase()}</span>
                      </div>
                    )}
                    <div className={styles.ideaInfoRow}>
                      <span className={styles.ideaInfoLabel}>{t(LanguageKey.pageTools_EventIdeasCreatedTime)}</span>
                      <span className={styles.ideaInfoValue}>{formatDate(item.createdTime)}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className={styles.ideaMeta}>
                    <span className={styles.eventDate}>{formatDate(item.date)}</span>
                    <div className={styles.eventTags}>
                      {item.isReligious && (
                        <span className={`${styles.tag} ${styles.tagReligious}`}>
                          {t(LanguageKey.pageTools_EventReligious)}
                        </span>
                      )}
                    </div>
                  </div>
                </SliderSlide>
              ))}
            </Slider>
          </>
        )}
      </div>
    </div>
  );
};

export default EventIdea;
