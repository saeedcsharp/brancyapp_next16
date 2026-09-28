import { MethodType } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import {
  IGetImagePromptCategories,
  IImagePrompt,
  IGetImagePrompts,
  IImagePromptCategory,
} from "brancy/models/interfaces";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "brancy/components/notOk/loading";
import styles from "./mediaCreator.module.css";

function promptValue(value: string | { name?: string; title?: string } | null | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.name || value.title || "";
}

export interface ImagePromptSuggestionsProps {
  session: Session | null;
  isOpen: boolean;
  onSelect: (prompt: IImagePrompt) => void;
}

export function ImagePromptDetail({ prompt }: { prompt: IImagePrompt }) {
  const { t } = useTranslation();
  const copyPrompt = async () => {
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(prompt.promptBody);
    internalNotify(InternalResponseType.CopyLink, NotifType.Info);
  };

  return (
    <article className={styles.promptDetail}>
      {prompt.exampleOutputUrl && (
        <img className={styles.promptDetailImage} src={getClientMediaBaseUrl() + prompt.exampleOutputUrl} alt="" />
      )}
      <div className={styles.promptDetailBody}>
        <span className="title2">{prompt.promptName}</span>
        <p>{prompt.description}</p>
        <dl className={styles.promptDetailMeta}>
          <div>
            <dt>{t("aiSuggestedPrompts_category")}</dt>
            <dd>{promptValue(prompt.category) || t("Not available")}</dd>
          </div>
          <div>
            <dt>{t("aiSuggestedPrompts_subCategory")}</dt>
            <dd>{promptValue(prompt.subCategory) || t("Not available")}</dd>
          </div>
        </dl>
        <div className={styles.promptBodyBox}>
          <div className="headerparent">
            <span className="title2">{t("aiSuggestedPrompts_prompt")}</span>
            <button
              type="button"
              onClick={copyPrompt}
              aria-label={t("aiSuggestedPrompts_copy")}
              title={t("aiSuggestedPrompts_copy")}>
              <img src="/copy.svg" alt="" />
            </button>
          </div>
          <p>{prompt.promptBody}</p>
        </div>
      </div>
    </article>
  );
}

export default function ImagePromptSuggestions({ session, isOpen, onSelect }: ImagePromptSuggestionsProps) {
  const { t } = useTranslation();
  const [prompts, setPrompts] = useState<IImagePrompt[]>([]);
  const [categories, setCategories] = useState<IImagePromptCategory[]>([]);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const isLoading = loading || categoriesLoading;

  const loadCategories = async () => {
    if (!session) return;
    setCategoriesLoading(true);
    const response = await clientFetchApi<null, IGetImagePromptCategories>("/api/mediaai/GetImagePromptCategories", {
      session,
      methodType: MethodType.get,
    });
    setCategoriesLoading(false);
    if (!response.succeeded) {
      notify(response.info?.responseType ?? ResponseType.Unexpected, NotifType.Error, response.errorMessage);
      return;
    }
    setCategories(response.value ?? []);
  };

  const loadPrompts = async (cursor: string | null = null, selectedCategory = categoryId) => {
    if (!session) return;
    setLoading(true);
    const response = await clientFetchApi<null, IGetImagePrompts>("/api/mediaai/GetImagePrompts", {
      session,
      methodType: MethodType.get,
      queries: [
        { key: "nextMaxId", value: cursor ?? "" },
        { key: "categoryId", value: selectedCategory },
      ],
    });
    setLoading(false);
    if (!response.succeeded) {
      notify(response.info?.responseType ?? ResponseType.Unexpected, NotifType.Error, response.errorMessage);
      return;
    }
    setPrompts((current) => (cursor ? [...current, ...(response.value?.items ?? [])] : (response.value?.items ?? [])));
    setNextMaxId(response.value?.nextMaxId || null);
  };

  useEffect(() => {
    if (isOpen) {
      if (!categories.length && !categoriesLoading) loadCategories();
      if (!prompts.length) loadPrompts();
    }
  }, [isOpen, session]);

  const chooseCategory = (value: string) => {
    setCategoryId(value);
    loadPrompts(null, value);
  };

  return (
    <section className={styles.promptSuggestions}>
      <header className={styles.promptSuggestionsHeader}>
        <div>
          <span className="title2">{t("aiSuggestedPrompts_title")}</span>
          <span className="explain">{t("aiSuggestedPrompts_explain")}</span>
        </div>
        <select
          aria-label={t("aiSuggestedPrompts_category")}
          value={categoryId}
          onChange={(event) => chooseCategory(event.target.value)}>
          <option value="">{t("aiSuggestedPrompts_allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </header>
      {isLoading ? <Loading /> : null}
      {!isLoading && !prompts.length ? (
        <div className={styles.promptSuggestionsState}>{t("aiSuggestedPrompts_empty")}</div>
      ) : null}
      <div className={styles.promptSuggestionGrid}>
        {prompts.map((item) => (
          <button type="button" className={styles.promptSuggestionCard} key={item.id} onClick={() => onSelect(item)}>
            {item.exampleOutputUrl ? (
              <img src={getClientMediaBaseUrl() + item.exampleOutputUrl} alt="" />
            ) : (
              <span className={styles.promptSuggestionPlaceholder}>AI</span>
            )}
            <span className={styles.promptSuggestionCardBody}>
              <strong>{item.promptName}</strong>
              <small>{item.description}</small>
              <span>
                {promptValue(item.category)}
                {promptValue(item.subCategory) ? ` / ${promptValue(item.subCategory)}` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>
      {nextMaxId && (
        <button
          type="button"
          className="cancelButton"
          disabled={loading}
          onClick={() => loadPrompts(nextMaxId, categoryId)}>
          {t("aiSuggestedPrompts_loadMore")}
        </button>
      )}
    </section>
  );
}
