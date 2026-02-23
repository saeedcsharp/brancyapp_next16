import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import RingLoader from "../../../design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "../../../notifications/notificationBox";
import { MethodType } from "../../../../helper/api";
import { clientFetchApi } from "../../../../helper/clientFetchApi";
import initialzedTime, { convertToMilliseconds } from "../../../../helper/manageTimer";
import { LanguageKey } from "../../../../i18n";
import styles from "./event.module.css";

interface IDayEvent {
  languageId: number;
  description: string;
  id: number;
  title: string;
  countryCode: string;
  date: number;
  isReligious: boolean;
}

const LANGUAGE_OPTIONS = [
  { id: 0, code: "en", label: "English" },
  { id: 1, code: "fa", label: "فارسی" },
  { id: 2, code: "ar", label: "العربية" },
  { id: 3, code: "fr", label: "Français" },
  { id: 4, code: "ru", label: "Русский" },
  { id: 5, code: "tr", label: "Türkçe" },
  { id: 6, code: "gr", label: "Ελληνικά" },
  { id: 7, code: "az", label: "Azərbaycan" },
];

const MAX_RANGE_MS = 30 * 24 * 60 * 60 * 1000; // 1 month
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const DayEvents = (props: { handleShowDatePicker: () => void; startUnix: number | null; endUnix: number | null }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const [isHidden, setIsHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<IDayEvent[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleHidden = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, []);

  const formatDate = useCallback((unix: number) => {
    const { locale, calendar } = initialzedTime();
    return new DateObject({ date: new Date(unix), calendar, locale }).format("YYYY/MM/DD");
  }, []);

  const dateRangeLabel = useMemo(() => {
    if (!props.startUnix || !props.endUnix) {
      return t(LanguageKey.pageTools_EventSelectDate);
    }
    return `${formatDate(props.startUnix)} - ${formatDate(props.endUnix)}`;
  }, [props.startUnix, props.endUnix, formatDate, t]);

  const fetchEvents = useCallback(async () => {
    if (!session) return;
    if (!props.startUnix || !props.endUnix) {
      notify(ResponseType.Unexpected, NotifType.Warning);
      return;
    }

    const minTime = props.startUnix + FIVE_MINUTES_MS;
    const maxTime = props.endUnix;

    if (maxTime <= minTime) {
      notify(ResponseType.Unexpected, NotifType.Warning);
      return;
    }

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
          { key: "language", value: selectedLanguageId.toString() },
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
  }, [session, props.startUnix, props.endUnix, selectedLanguageId]);

  const canSearch = useMemo(() => {
    return !!props.startUnix && !!props.endUnix;
  }, [props.startUnix, props.endUnix]);

  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" onClick={toggleHidden}>
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.pageTools_DayEvents)}</div>
      </div>

      <div className={`${styles.eventCard} ${isHidden ? "" : styles.show}`}>
        <div className={styles.controls}>
          {/* Date Range Selection */}
          <div className={styles.row}>
            <span className={styles.label}>{t(LanguageKey.pageTools_EventDateRange)}:</span>
            <button className={styles.dateBtn} onClick={props.handleShowDatePicker}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dateRangeLabel}
            </button>
          </div>

          {/* Language Selection */}
          <div className={styles.row}>
            <span className={styles.label}>{t(LanguageKey.pageTools_EventLanguage)}:</span>
            <select
              className={styles.languageSelect}
              value={selectedLanguageId}
              onChange={(e) => setSelectedLanguageId(Number(e.target.value))}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className={styles.row}>
            <button className={styles.searchBtn} onClick={fetchEvents} disabled={!canSearch || loading}>
              {t(LanguageKey.pageTools_EventSearch)}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className={styles.loaderContainer}>
            <RingLoader />
          </div>
        )}

        {!loading && hasSearched && events.length === 0 && (
          <div className={styles.emptyState}>{t(LanguageKey.pageTools_EventEmpty)}</div>
        )}

        {!loading && events.length > 0 && (
          <div className={styles.eventList}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.eventTitle}>{event.title}</div>
                <div className={styles.eventDescription}>{event.description}</div>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>{formatDate(convertToMilliseconds(event.date))}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayEvents;
