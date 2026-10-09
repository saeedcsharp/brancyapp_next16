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
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "brancy/components/notOk/loading";
import { PromptCodeBlock } from "./generatedMediaHelpers";
import styles from "./imagePromptSuggestions.module.css";

function promptValue(value: string | { name?: string; title?: string } | null | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.name || value.title || "";
}
export interface ImagePromptSuggestionsProps {
  session: Session | null;
  isOpen: boolean;
  onSelect: (prompt: IImagePrompt) => void;
  onClose: () => void;
}
export function ImagePromptDetail({
  prompt,
  onBack,
  onUsePrompt,
}: {
  prompt: IImagePrompt;
  onBack: () => void;
  onUsePrompt: () => void;
}) {
  const { t } = useTranslation();
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const promptLines = prompt.promptBody.split(/\r?\n/);
  const hasMorePromptLines = promptLines.length > 10;
  const visiblePrompt = isPromptExpanded ? prompt.promptBody : promptLines.slice(0, 10).join("\n");
  const copyPrompt = async () => {
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(prompt.promptBody);
    internalNotify(InternalResponseType.CopyLink, NotifType.Info);
  };
  useEffect(() => {
    if (!isImageFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsImageFullscreen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isImageFullscreen]);
  return (
    <>
      <article className={styles.promptDetail}>
        <div className={styles.promptDetailTop}>
          {prompt.exampleOutputUrl && (
            <button
              type="button"
              className={styles.promptDetailImageButton}
              onClick={() => setIsImageFullscreen(true)}
              aria-label={t("aiSuggestedPrompts_openImage")}
              title={t("aiSuggestedPrompts_openImage")}>
              <img
                className={styles.promptDetailImage}
                src={getClientMediaBaseUrl() + prompt.exampleOutputUrl}
                alt={prompt.promptName}
              />
            </button>
          )}

          <div className={styles.promptDetailBody}>
            <div className={styles.promptDetailHeading}>
              <div className="headerparent">
                <button type="button" className={styles.promptUseButton} onClick={onUsePrompt}>
                  {t("usethisPrompt")}
                </button>
                <button type="button" className={styles.promptUseButton} onClick={onBack}>
                  {t("back")}
                </button>
                {/* <img
                src="/back-box.svg"
                style={{ cursor: "pointer", width: "34px", height: "34px" }}
                onClick={onBack}
                aria-label={t("back")}
                title={t("back")}
              /> */}
              </div>
              <div className="headerandinput">
                <span className="title2">{prompt.promptName}</span>
                <p className="explain"> {prompt.description}</p>
              </div>
            </div>
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
          </div>
        </div>
        <div className={styles.promptBodyBox}>
          <div className="headerparent">
            <span className="title2">{t("aiSuggestedPrompts_prompt")}</span>
            <div className={styles.promptActions}>
              <button
                type="button"
                className={styles.promptCopyButton}
                onClick={copyPrompt}
                aria-label={t("aiSuggestedPrompts_copy")}
                title={t("aiSuggestedPrompts_copy")}>
                <img src="/copy.svg" alt="" />
              </button>
              {hasMorePromptLines && (
                <button
                  type="button"
                  className={styles.promptExpandButton}
                  aria-expanded={isPromptExpanded}
                  onClick={() => setIsPromptExpanded((expanded) => !expanded)}>
                  {t(isPromptExpanded ? "aiSuggestedPrompts_showLess" : "aiSuggestedPrompts_showMore")}
                </button>
              )}
            </div>
          </div>
          <PromptCodeBlock prompt={visiblePrompt} />
        </div>
      </article>
      {isImageFullscreen &&
        createPortal(
          <div
            className={styles.promptImageFullscreen}
            role="dialog"
            aria-modal="true"
            aria-label={t("aiSuggestedPrompts_openImage")}
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsImageFullscreen(false);
            }}>
            <button
              type="button"
              className={styles.promptImageFullscreenClose}
              onClick={() => setIsImageFullscreen(false)}
              aria-label={t("Close")}
              title={t("Close")}>
              <img src="/close-box.svg" alt="" />
            </button>
            <img
              className={styles.promptImageFullscreenContent}
              src={getClientMediaBaseUrl() + prompt.exampleOutputUrl}
              alt={prompt.promptName}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
export default function ImagePromptSuggestions({ session, isOpen, onSelect, onClose }: ImagePromptSuggestionsProps) {
  const { t } = useTranslation();
  const [prompts, setPrompts] = useState<IImagePrompt[]>([]);
  const [categories, setCategories] = useState<IImagePromptCategory[]>([]);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const categorySectionRef = useRef<HTMLDivElement>(null);
  const categoryDragRef = useRef({ startX: 0, scrollLeft: 0, isDragging: false, suppressClick: false });
  const promptRequestRef = useRef(0);
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
    const requestId = ++promptRequestRef.current;
    setLoading(true);
    const response = await clientFetchApi<null, IGetImagePrompts>("/api/mediaai/GetImagePrompts", {
      session,
      methodType: MethodType.get,
      queries: [
        { key: "nextMaxId", value: cursor ?? "" },
        { key: "categoryId", value: selectedCategory },
      ],
    });
    if (requestId !== promptRequestRef.current) return;
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
    setPrompts([]);
    setNextMaxId(null);
    loadPrompts(null, value);
  };
  const allCategoriesCount = categories.reduce((total, category) => total + (category.count ?? 0), 0);
  const handleCategoryPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !categorySectionRef.current) return;
    categoryDragRef.current = {
      startX: event.clientX,
      scrollLeft: categorySectionRef.current.scrollLeft,
      isDragging: true,
      suppressClick: false,
    };
  };
  const handleCategoryPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = categoryDragRef.current;
    if (!drag.isDragging || !categorySectionRef.current) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) {
      drag.suppressClick = true;
      if (!categorySectionRef.current.hasPointerCapture(event.pointerId)) {
        categorySectionRef.current.setPointerCapture(event.pointerId);
      }
    }
    categorySectionRef.current.scrollLeft = drag.scrollLeft - distance;
  };
  const handleCategoryPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const section = categorySectionRef.current;
    if (section?.hasPointerCapture(event.pointerId)) section.releasePointerCapture(event.pointerId);
    categoryDragRef.current.isDragging = false;
  };
  const handleCategoryClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!categoryDragRef.current.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    categoryDragRef.current.suppressClick = false;
  };
  return (
    <>
      <header className="headerparent">
        <div className="headerandinput">
          <span className="title2">{t("aiSuggestedPrompts_title")}</span>
          <span className="explain">{t("aiSuggestedPrompts_explain")}</span>
        </div>
        <img
          role="button"
          onClick={onClose}
          aria-label={t("Close")}
          style={{ cursor: "pointer", width: "32px", height: "32px" }}
          src="/close-box.svg"
        />
      </header>
      <div
        ref={categorySectionRef}
        className={styles.categorySection}
        aria-label={t("aiSuggestedPrompts_category")}
        role="group"
        onPointerDown={handleCategoryPointerDown}
        onPointerMove={handleCategoryPointerMove}
        onPointerUp={handleCategoryPointerUp}
        onPointerCancel={handleCategoryPointerUp}
        onClickCapture={handleCategoryClickCapture}>
        <button
          type="button"
          className={`${styles.category} ${categoryId === "" ? styles.categoryActive : ""}`}
          aria-pressed={categoryId === ""}
          onClick={() => chooseCategory("")}>
          {t("aiSuggestedPrompts_allCategories")}
          <span className={styles.categoryCount}>({allCategoriesCount})</span>
        </button>
        {categories.map((category) => {
          const value = String(category.id);
          const isActive = categoryId === value;
          return (
            <button
              type="button"
              className={`${styles.category} ${isActive ? styles.categoryActive : ""}`}
              aria-pressed={isActive}
              key={category.id}
              onClick={() => chooseCategory(value)}>
              {category.name}
              <span className="explain">({category.count ?? 0})</span>
            </button>
          );
        })}
      </div>
      {isLoading ? <Loading /> : null}
      {!isLoading && !prompts.length ? (
        <div className={styles.promptSuggestionsState}>{t("aiSuggestedPrompts_empty")}</div>
      ) : null}
      <div className={styles.imglist}>
        {prompts.map((item) => (
          <img
            key={item.id}
            className={styles.imgtumbnail}
            src={getClientMediaBaseUrl() + item.exampleOutputUrl}
            alt=""
            onClick={() => onSelect(item)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/product_Stoppedsale.svg";
            }}
          />
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
    </>
  );
}
