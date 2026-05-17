import IconToggleButton from "brancy/components/design/toggleButton/iconToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { useSession } from "next-auth/react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
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
interface ICustomEventIdeaItem {
  id: number;
  fbId: number;
  prompt: string;
  idea: string;
  languageId: number;
  createdTime: number;
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

interface ICustomEventIdeaResponse {
  items: ICustomEventIdeaItem[];
  nextMaxId: number | null;
}

export interface EventIdeaHandle {
  fetchWithLanguage: (languageId: number) => void;
  fetchCustomWithLanguage: (languageId: number) => void;
}

const EventIdea = forwardRef<EventIdeaHandle, { handleOpenCreate: () => void }>(function EventIdea(props, ref) {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();

  const [isHidden, setIsHidden] = useState(false);
  const [activeTab, setActiveTab] = useState<ToggleOrder>(ToggleOrder.FirstToggle);

  // --- Event Ideas state ---
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ideas, setIdeas] = useState<IEventIdea[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [nextMaxId, setNextMaxId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // --- Custom Event state ---
  const [customLoading, setCustomLoading] = useState(false);
  const [customLoadingMore, setCustomLoadingMore] = useState(false);
  const [customIdeas, setCustomIdeas] = useState<ICustomEventIdeaItem[]>([]);
  const [customHasSearched, setCustomHasSearched] = useState(false);
  const [customNextMaxId, setCustomNextMaxId] = useState<number | null>(null);
  const [customHasMore, setCustomHasMore] = useState(false);

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const toggleHidden = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, []);

  const formatDate = useCallback((unix: number) => {
    const { locale, calendar } = initialzedTime();
    return new DateObject({ date: new Date(unix * 1000), calendar, locale }).format("YYYY/MM/DD");
  }, []);

  const fetchIdeas = useCallback(
    async (append = false, maxId: number | null = null, languageIdOverride?: number) => {
      const currentSession = sessionRef.current;
      if (!currentSession) return;

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
        const langId =
          languageIdOverride !== undefined ? languageIdOverride : (LANGUAGE_CODE_TO_ID[i18n.language] ?? 0);
        const queries: { key: string; value: string }[] = [{ key: "language", value: langId.toString() }];
        if (maxId !== null) {
          queries.push({ key: "nextMaxId", value: maxId.toString() });
        }

        const res = await clientFetchApi<null, IEventIdeaResponse>("/api/dayevent/getEventIdeas", {
          methodType: MethodType.get,
          session: currentSession,
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
    [i18n.language],
  );

  useImperativeHandle(
    ref,
    () => ({
      fetchWithLanguage: (languageId: number) => {
        fetchIdeas(false, null, languageId);
      },
      fetchCustomWithLanguage: (_languageId: number) => {
        setActiveTab(ToggleOrder.SecondToggle);
        setCustomHasSearched(false);
      },
    }),
    [fetchIdeas],
  );

  const handleLoadMore = useCallback(() => {
    if (nextMaxId !== null) {
      fetchIdeas(true, nextMaxId);
    }
  }, [fetchIdeas, nextMaxId]);

  // --- Custom Event fetch ---
  const fetchCustomIdeas = useCallback(
    async (append = false, maxId: number | null = null) => {
      const currentSession = sessionRef.current;
      if (!currentSession) return;

      if (append) {
        setCustomLoadingMore(true);
      } else {
        setCustomLoading(true);
        setCustomHasSearched(true);
        setCustomIdeas([]);
        setCustomNextMaxId(null);
        setCustomHasMore(false);
      }

      try {
        const langId = LANGUAGE_CODE_TO_ID[i18n.language] ?? 0;
        const queries: { key: string; value: string }[] = [{ key: "language", value: langId.toString() }];
        if (maxId !== null) {
          queries.push({ key: "nextMaxId", value: maxId.toString() });
        }

        const res = await clientFetchApi<null, ICustomEventIdeaResponse>("/api/dayevent/getCustomEventIdeas", {
          methodType: MethodType.get,
          session: currentSession,
          data: null,
          queries,
          onUploadProgress: undefined,
        });

        if (res.succeeded) {
          const fetched: ICustomEventIdeaItem[] = Array.isArray(res.value?.items) ? res.value!.items : [];
          const newNextMaxId = res.value?.nextMaxId ?? null;
          if (append) {
            setCustomIdeas((prev) => [...prev, ...fetched]);
          } else {
            setCustomIdeas(fetched);
          }
          setCustomNextMaxId(newNextMaxId);
          setCustomHasMore(newNextMaxId !== null && fetched.length > 0);
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setCustomLoading(false);
        setCustomLoadingMore(false);
      }
    },
    [i18n.language],
  );

  const handleCustomLoadMore = useCallback(() => {
    if (customNextMaxId !== null) {
      fetchCustomIdeas(true, customNextMaxId);
    }
  }, [fetchCustomIdeas, customNextMaxId]);

  // Auto-fetch on tab switch
  useEffect(() => {
    if (activeTab === ToggleOrder.FirstToggle && !hasSearched) {
      fetchIdeas(false, null);
    } else if (activeTab === ToggleOrder.SecondToggle && !customHasSearched) {
      fetchCustomIdeas(false, null);
    }
  }, [activeTab, hasSearched, customHasSearched, fetchIdeas, fetchCustomIdeas]);

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

  const customFlatItems = useMemo(() => (Array.isArray(customIdeas) ? customIdeas : []), [customIdeas]);

  const eventIdeasIcon = {
    active: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={18}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    diactive: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={18}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  };

  const customEventIcon = {
    active: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={18}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    diactive: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={18}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  };

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

        <IconToggleButton
          data={{
            firstToggle: t(LanguageKey.pageTools_EventIdeas),
            secondToggle: t(LanguageKey.pageTools_CustomEvent),
          }}
          values={{
            firstToggle: t(LanguageKey.pageTools_EventIdeas),
            secondToggle: t(LanguageKey.pageTools_CustomEvent),
          }}
          dataIcon={{ firstIcon: eventIdeasIcon, secondIcon: customEventIcon }}
          toggleValue={activeTab}
          setChangeToggle={setActiveTab}
        />

        {/* ---- Event Ideas Tab ---- */}
        {activeTab === ToggleOrder.FirstToggle && (
          <>
            {loading && (
              <div className={styles.loaderContainer}>
                <RingLoader />
              </div>
            )}
            {!loading && hasSearched && flatItems.length === 0 && (
              <div className={styles.emptyState}>{t(LanguageKey.pageTools_EventIdeasEmpty)}</div>
            )}
            {!loading && flatItems.length > 0 && (
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
                    <div className={styles.ideaHeader}>
                      <div className={styles.eventTitle}>{item.title}</div>
                      <div className={styles.eventDescription}>{item.description}</div>
                    </div>
                    <div className={styles.ideaTextBlock}>{item.idea}</div>
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
            )}
          </>
        )}

        {/* ---- Custom Event Tab ---- */}
        {activeTab === ToggleOrder.SecondToggle && (
          <>
            {customLoading && (
              <div className={styles.loaderContainer}>
                <RingLoader />
              </div>
            )}
            {!customLoading && customHasSearched && customFlatItems.length === 0 && (
              <div className={styles.emptyState}>{t(LanguageKey.pageTools_EventIdeasEmpty)}</div>
            )}
            {!customLoading && customFlatItems.length > 0 && (
              <Slider
                slidesPerView={1}
                spaceBetween={12}
                itemsPerSlide={1}
                navigation={true}
                pagination={{ clickable: true, dynamicBullets: true }}
                className={styles.ideaSlider}
                onReachEnd={customHasMore ? handleCustomLoadMore : undefined}
                isLoading={customLoadingMore}>
                {customFlatItems.map((item) => (
                  <SliderSlide key={`custom-${item.id}`} className={styles.ideaSlide}>
                    <div className={styles.ideaTextBlock}>{item.idea}</div>
                    <div className={styles.ideaInfoList}>
                      {item.prompt && (
                        <div className={styles.ideaInfoRow}>
                          <span className={styles.ideaInfoLabel}>{t(LanguageKey.pageTools_EventIdeasPrompt)}</span>
                          <span className={styles.ideaInfoValue}>{item.prompt.trim()}</span>
                        </div>
                      )}
                      <div className={styles.ideaInfoRow}>
                        <span className={styles.ideaInfoLabel}>{t(LanguageKey.pageTools_EventIdeasCreatedTime)}</span>
                        <span className={styles.ideaInfoValue}>{formatDate(item.createdTime)}</span>
                      </div>
                    </div>
                  </SliderSlide>
                ))}
              </Slider>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default EventIdea;
