import RingLoader from "brancy/components/design/loader/ringLoder";
import TextArea from "brancy/components/design/textArea/textArea";
import {
  NotifType,
  internalNotify,
  notify,
  ResponseType,
  InternalResponseType,
} from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import styles from "./createEventIdea.module.css";

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

interface ICreateEventIdeaBody {
  prompt: string;
  minTime: number;
  maxTime: number;
}

const CreateEventIdea = (props: {
  removeMask: () => void;
  handleShowDatePicker: () => void;
  startUnix: number | null;
  endUnix: number | null;
  onSuccess?: () => void;
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const [prompt, setPrompt] = useState("");
  const [selectedLanguageId, setSelectedLanguageId] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatDate = useCallback((unix: number) => {
    const { locale, calendar } = initialzedTime();
    return new DateObject({ date: new Date(unix), calendar, locale }).format("YYYY/MM/DD");
  }, []);

  const dateRangeLabel = (() => {
    if (!props.startUnix || !props.endUnix) return t(LanguageKey.pageTools_EventSelectDate);
    return `${formatDate(props.startUnix)} - ${formatDate(props.endUnix)}`;
  })();

  const canSubmit = !!props.startUnix && !!props.endUnix && !loading;

  const handleSubmit = useCallback(async () => {
    if (!session) return;
    if (!props.startUnix || !props.endUnix) {
      notify(ResponseType.Unexpected, NotifType.Warning);
      return;
    }

    const body: ICreateEventIdeaBody = {
      prompt: prompt.trim(),
      minTime: Math.floor(props.startUnix / 1000),
      maxTime: Math.floor(props.endUnix / 1000),
    };

    setLoading(true);
    try {
      const res = await clientFetchApi<ICreateEventIdeaBody, boolean>("/api/dayevent/createEventIdea", {
        methodType: MethodType.post,
        session,
        data: body,
        queries: [{ key: "language", value: selectedLanguageId.toString() }],
        onUploadProgress: undefined,
      });

      if (res.succeeded) {
        internalNotify(InternalResponseType.Ok, NotifType.Success);
        props.onSuccess?.();
        props.removeMask();
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }, [session, prompt, selectedLanguageId, props]);

  return (
    <div className={styles.modal}>
      {/* Header */}
      <div className={styles.header}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-light-blue)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="13" x2="12" y2="19" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
        <div className={styles.title}>{t(LanguageKey.pageTools_CreateEventIdea)}</div>
      </div>

      <div className={styles.wrapper}>
        {/* Language */}
        <div className={styles.field}>
          <label className={styles.label}>{t(LanguageKey.pageTools_EventIdeasLanguage)}</label>
          <select
            className={styles.select}
            value={selectedLanguageId}
            onChange={(e) => setSelectedLanguageId(Number(e.target.value))}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className={styles.field}>
          <label className={styles.label}>{t(LanguageKey.pageTools_EventDateRange)}</label>
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

        {/* Prompt */}
        <div className={styles.field}>
          <label className={styles.label}>
            {t(LanguageKey.pageTools_CreateEventIdeaPrompt)}
            <span className={styles.optional}>{t(LanguageKey.pageTools_CreateEventIdeaOptional)}</span>
          </label>
          <div className={styles.textarea}>
            <TextArea
              className="captiontextarea"
              value={prompt}
              handleInputChange={(e) => setPrompt(e.target.value)}
              placeHolder={t(LanguageKey.pageTools_CreateEventIdeaPromptPlaceholder)}
              role="textbox"
              title={t(LanguageKey.pageTools_CreateEventIdeaPrompt)}
              style={{
                minHeight: 90,
                height: "auto",
                backgroundColor: "var(--content-box)",
                fontSize: "var(--font-13)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? <RingLoader /> : t(LanguageKey.pageTools_CreateEventIdeaSubmit)}
        </button>
        <button className={styles.cancelBtn} onClick={props.removeMask} disabled={loading}>
          {t(LanguageKey.pageTools_CreateEventIdeaCancel)}
        </button>
      </div>
    </div>
  );
};

export default CreateEventIdea;
