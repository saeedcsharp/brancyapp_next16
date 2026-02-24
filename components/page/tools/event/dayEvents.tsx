import RingLoader from "brancy/components/design/loader/ringLoder";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import modalStyles from "./createEventIdea.module.css";
import styles from "./event.module.css";
import Loading from "brancy/components/notOk/loading";

interface IDayEvent {
  languageId: number;
  description: string;
  id: number;
  title: string;
  countryCode: string;
  date: number;
  isReligious: boolean;
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

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

const DayEvents = (props: { removeMask: () => void; backButton?: () => void }) => {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<IDayEvent[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const formatDate = useCallback((unix: number) => {
    const { locale, calendar } = initialzedTime();
    return new DateObject({ date: new Date(unix), calendar, locale }).format("YYYY/MM/DD");
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!session) return;

    const minTime = Date.now();
    const maxTime = Date.now() + ONE_MONTH_MS;
    const languageId = LANGUAGE_CODE_TO_ID[i18n.language] ?? 0;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await clientFetchApi<null, IDayEvent[]>("/api/dayevent/getEvents", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          { key: "minTime", value: Math.floor(minTime / 1000).toString() },
          { key: "maxTime", value: Math.floor(maxTime / 1000).toString() },
          { key: "language", value: languageId.toString() },
        ],
        onUploadProgress: undefined,
      });

      if (res.succeeded) {
        setEvents(res.value ?? []);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }, [session, i18n.language]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={modalStyles.modal}>
      {/* Header */}
      <div className={modalStyles.header}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-light-blue)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={modalStyles.icon}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <div className={modalStyles.title}>{t(LanguageKey.pageTools_DayEvents)}</div>
      </div>

      <div className={modalStyles.wrapper}>
        {/* Loading */}
        {loading && (
          <div className={styles.loaderContainer}>
            <Loading />
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && events.length === 0 && (
          <div className={styles.emptyState}>{t(LanguageKey.pageTools_EventEmpty)}</div>
        )}

        {/* Results */}
        {!loading && events.length > 0 && (
          <Slider
            slidesPerView={1}
            spaceBetween={12}
            itemsPerSlide={3}
            navigation={true}
            pagination={{ clickable: true, dynamicBullets: true }}
            className={styles.eventList}>
            {events.map((event) => (
              <SliderSlide key={event.id} className={styles.eventItem}>
                <div className={styles.eventTitle}>{event.title}</div>
                <div className={styles.eventDescription}>{event.description}</div>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>{formatDate(event.date * 1000)}</span>
                  <div className={styles.eventTags}>
                    {event.countryCode && event.countryCode !== "--" && (
                      <span className={`${styles.tag} ${styles.tagCountry}`}>{event.countryCode}</span>
                    )}
                    {event.isReligious && (
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
      </div>

      {/* Footer */}
      <div className={modalStyles.footer}>
        {props.backButton && (
          <button className={modalStyles.cancelBtn} onClick={props.backButton}>
            {t(LanguageKey.back)}
          </button>
        )}
        <button className={modalStyles.cancelBtn} onClick={props.removeMask}>
          {t(LanguageKey.pageTools_CreateEventIdeaCancel)}
        </button>
      </div>
    </div>
  );
};

export default DayEvents;
