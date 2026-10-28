import DotMenu from "brancy/components/design/dotMenu/dotMenu";
import InputBox from "brancy/components/design/inputBox/inputBox";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import { DirectionContext } from "brancy/context/directionContext";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { getThumbnailStyle } from "brancy/helper/getThumbnailColor";
import initialzedTime, { convertToMilliseconds } from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { IShortPostInfo } from "brancy/models/interfaces";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { PostAutomation } from "./popup/connectAutomationToPost";
import { AutomationPost } from "./useAutomationPosts";
import styles from "./flowAndAIIBox.module.css";
import Soon from "brancy/components/notOk/soon";

export type AutomationSort = "newest" | "oldest" | "title";

export function automationIdentity(automation: PostAutomation) {
  return automation.type === "flow" ? automation.flow.masterFlowId : automation.prompt.promptId;
}

export function sortAutomations(items: PostAutomation[], order: AutomationSort, locale: string) {
  return [...items].sort((left, right) => {
    const a = left.type === "flow" ? left.flow : left.prompt;
    const b = right.type === "flow" ? right.flow : right.prompt;
    if (order === "title") return a.title.localeCompare(b.title, locale);
    const aTime = left.type === "ai" ? left.prompt.updatedTime : left.flow.createdTime;
    const bTime = right.type === "ai" ? right.prompt.updatedTime : right.flow.createdTime;
    return order === "oldest" ? aTime - bTime : bTime - aTime;
  });
}

function Icon({ kind }: { kind: "cart" | "translate" | "sun" | "chat" }) {
  const paths: Record<typeof kind, ReactNode> = {
    cart: (
      <>
        <path d="M3 3h2l2 12h12l2-9H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    translate: (
      <>
        <path d="M3 5h12M9 3v2m3 0c0 6-4 9-8 11m1-8c1 3 4 5 7 6m2 7 4-11 4 11m-6-4h5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
      </>
    ),
    chat: <path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5ZM8 10h8m-8 4h5" />,
  };
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

const SortIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="  var(--text-h2)"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M8 19V5L4 9m4-4 4 4m4-4v14l-4-4m4 4 4-4" />
  </svg>
);
const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    viewBox="0 0 24 24">
    <path d="m9.1 10.7.3-.2a5 5 0 1 1 7.1 7.1l-2.9 3a5 5 0 1 1-7.1-7.2l.4-.5" />
    <path d="m17 11.1.5-.5a5 5 0 1 0-7.1-7.1l-3 2.9a5 5 0 1 0 7.2 7.1l.3-.2" />
  </svg>
);

const templates = [
  {
    title: LanguageKey.Automation_sample_cart,
    description: LanguageKey.Automation_sample_cart_description,
    kind: "cart",
    level: LanguageKey.Automation_beginner,
    tone: "blue",
    levelTone: "green",
  },
  {
    title: LanguageKey.Automation_sample_language,
    description: LanguageKey.Automation_sample_language_description,
    kind: "translate",
    level: LanguageKey.Automation_intermediate,
    tone: "green",
    levelTone: "orange",
  },
  {
    title: LanguageKey.Automation_sample_support,
    description: LanguageKey.Automation_sample_support_description,
    kind: "sun",
    level: LanguageKey.Automation_advanced,
    tone: "sky",
    levelTone: "red",
  },
  {
    title: LanguageKey.Automation_sample_welcome,
    description: LanguageKey.Automation_sample_welcome_description,
    kind: "chat",
    level: LanguageKey.Automation_beginner,
    tone: "orange",
    levelTone: "green",
  },
] as const;

function TemplateGallery({ isAI }: { isAI: boolean }) {
  const { t } = useTranslation();
  const direction = useContext(DirectionContext);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const update = () => {
      const position = Math.abs(element.scrollLeft);
      setCanPrevious(position > 2);
      setCanNext(position + element.clientWidth < element.scrollWidth - 2);
    };
    element.scrollLeft = 0;
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [direction, isAI]);

  function move(forward: boolean) {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: Math.max(260, element.clientWidth * 0.8) * (forward ? 1 : -1) * (direction === "rtl" ? -1 : 1),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <section className={styles.templateSection} aria-labelledby="automation-templates-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.headingGroup}>
          <h2 id="automation-templates-heading">
            {t(isAI ? LanguageKey.Automation_ai_templates : LanguageKey.Automation_flow_templates)}
          </h2>
          {/* <span className={styles.sampleBadge}>{t(LanguageKey.Automation_sample)}</span> */}
        </div>
        <div className={styles.templateNavigation}>
          {[false, true].map((forward) => (
            <button
              type="button"
              className={styles.arrowButton}
              key={String(forward)}
              disabled={forward ? !canNext : !canPrevious}
              onClick={() => move(forward)}
              aria-label={t(forward ? LanguageKey.next : LanguageKey.previous)}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ transform: `rotate(${forward !== (direction === "rtl") ? 180 : 0}deg)` }}>
                <path d="M19 12H5m7-7-7 7 7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <p className={styles.sampleExplanation}>{t(LanguageKey.Automation_sample_notice)}</p>
      <Slider
        freeMode
        spaceBetween={22}
        scrollContainerRef={scrollRef}
        ariaLabel={t(isAI ? LanguageKey.Automation_ai_templates : LanguageKey.Automation_flow_templates)}
        className={styles.templateSlider}>
        {templates.map((template, index) => (
          <SliderSlide key={template.title} className={styles.templateSlide}>
            <article className={styles.templateCard}>
              <div className={styles.cardHeader}>
                <span className={`${styles.cardIcon} ${styles[template.tone]}`}>
                  <Icon kind={template.kind} />
                </span>
                <h3>{t(template.title)}</h3>
              </div>
              <p>{t(template.description)}</p>
              <div className={styles.templateFooter}>
                <span>{t(LanguageKey.Automation_template_number, { number: index + 1 })}</span>
                <div className={styles.templateTags}>
                  {index === 2 && (
                    <span className={`${styles.tag} ${styles.purple}`}>{t(LanguageKey.Automation_trending)}</span>
                  )}
                  <span className={`${styles.tag} ${styles[template.levelTone]}`}>{t(template.level)}</span>
                </div>
              </div>
            </article>
          </SliderSlide>
        ))}
      </Slider>
    </section>
  );
}

function ConnectedPosts({ posts, onConnect }: { posts: IShortPostInfo[]; onConnect?: () => void }) {
  const { t } = useTranslation();
  return (
    <Slider
      freeMode
      spaceBetween={8}
      className={styles.connectedPosts}
      ariaLabel={t(LanguageKey.Automation_connected_posts)}>
      {posts.map((post) => (
        <SliderSlide key={post.postId}>
          <figure className={styles.postThumbnail} title={`${t(LanguageKey.navbar_Post)} #${post.postId}`}>
            <img
              src={getClientMediaBaseUrl() + post.thumbnailMediaUrl}
              alt={`${t(LanguageKey.navbar_Post)} #${post.postId}`}
              loading="lazy"
              decoding="async"
            />
            <figcaption dir="ltr">#{post.postId}</figcaption>
          </figure>
        </SliderSlide>
      ))}
      {onConnect && (
        <SliderSlide key="connect">
          <button
            type="button"
            className={styles.connectPostTile}
            title={t(LanguageKey.AIFlow_connect_post)}
            aria-label={t(LanguageKey.AIFlow_connect_post)}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onConnect();
            }}>
            <LinkIcon />
          </button>
        </SliderSlide>
      )}
    </Slider>
  );
}

export default function AutomationDashboard({
  containerRef,
  loadMoreRef,
  ...props
}: {
  toggleOrder: ToggleOrder;
  onToggle: (order: ToggleOrder) => void;
  items: PostAutomation[];
  hasMore: boolean;
  fetching: boolean;
  failed: boolean;
  onRetry: () => void;
  query: string;
  onSearch: (query: string) => void;
  searchOpen: boolean;
  onSearchOpen: (open: boolean) => void;
  sort: AutomationSort;
  onSort: (order: AutomationSort) => void;
  onNew: () => void;
  onOpen: (automation: PostAutomation) => void;
  onConnect: (automation: PostAutomation) => void;
  canConnect: (automation: PostAutomation) => boolean;
  connections: AutomationPost[];
  connectionStatus: "loading" | "ready" | "error";
  canReadConnections: boolean;
  onRetryConnections: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  loadingMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t, i18n } = useTranslation();
  const searchRef = useRef<HTMLInputElement>(null);
  const isAI = props.toggleOrder === ToggleOrder.SecondToggle;
  const sortLabels: Record<AutomationSort, LanguageKey> = {
    newest: LanguageKey.Automation_sort_newest,
    oldest: LanguageKey.Automation_sort_oldest,
    title: LanguageKey.Automation_sort_title,
  };
  useEffect(() => {
    if (props.searchOpen) searchRef.current?.focus();
  }, [props.searchOpen]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardScroll} ref={containerRef}>
        <div className={styles.modeToggle}>
          <ToggleButton
            options={[
              { id: 0, label: t(LanguageKey.Flow) },
              { id: 1, label: t(LanguageKey.AI) },
            ]}
            selectedValue={props.toggleOrder}
            onChange={props.onToggle}
          />
        </div>
        <TemplateGallery isAI={isAI} />
        <section className={styles.historySection} aria-labelledby="automation-history-heading">
          <div className={`${styles.sectionHeader} ${styles.historyHeader}`}>
            <div className={styles.headingGroup}>
              <h2 id="automation-history-heading">
                {t(isAI ? LanguageKey.Automation_ai_history : LanguageKey.Automation_flow_history)}
              </h2>
              <span className={styles.countBadge} title={t(LanguageKey.Automation_loaded_count)}>
                {props.items.length.toLocaleString(i18n.language)}
                {props.hasMore ? "+" : ""}
              </span>
            </div>
            <div className={styles.historyControls}>
              <button
                type="button"
                className={styles.newButton}
                onClick={props.onNew}
                title={t(isAI ? LanguageKey.CreateAutomationAI : LanguageKey.CreateAutomationFlow)}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <path d="M12 8v8m-4-4h8" stroke="#202122" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {t(LanguageKey.new)}
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={t(LanguageKey.searchKeyword)}
                aria-expanded={props.searchOpen}
                aria-controls="automation-search"
                onClick={() => {
                  props.onSearchOpen(!props.searchOpen);
                  if (props.searchOpen) props.onSearch("");
                }}>
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true">
                  <circle cx="10.5" cy="10.5" r="7.5" />
                  <path d="m16 16 5 5" />
                </svg>
              </button>
              <div className={styles.sortControl}>
                <DotMenu
                  ariaLabel={`${t(LanguageKey.filter_sortby)}: ${t(sortLabels[props.sort])}`}
                  options={(Object.keys(sortLabels) as AutomationSort[]).map((order) => ({
                    id: order,
                    icon: <SortIcon />,
                    value: t(sortLabels[order]),
                    onClick: () => props.onSort(order),
                  }))}
                />
              </div>
            </div>
          </div>
          {props.searchOpen && (
            <div id="automation-search" className={styles.search}>
              <InputBox
                ref={searchRef}
                className="serachMenuBar"
                value={props.query}
                handleInputChange={(event) => props.onSearch(event.target.value)}
                placeHolder={t(LanguageKey.searchKeyword)}
                ariaLabel={t(LanguageKey.searchKeyword)}
                clearable
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    props.onSearch("");
                    props.onSearchOpen(false);
                  }
                }}
              />
            </div>
          )}
          {props.fetching ? (
            <div className={styles.listState} role="status">
              <RingLoader />
              <span>{t(LanguageKey.loading)}</span>
            </div>
          ) : (
            <div className={styles.historyGrid}>
              {sortAutomations(props.items, props.sort, i18n.language).map((automation) => {
                const item = automation.type === "flow" ? automation.flow : automation.prompt;
                const thumbnailStyle = getThumbnailStyle(item.title, {
                  backgroundOpacity: 60,
                  characterCount: 2,
                  textColorMode: "background-dark",
                });
                const id = automationIdentity(automation);
                const draft = automation.type === "flow" && id === "newFlow";
                const canConnect = !draft && props.canConnect(automation);
                const connectLabel = t(
                  draft
                    ? LanguageKey.AIFlow_connect_post_save_first
                    : canConnect
                      ? LanguageKey.AIFlow_connect_post
                      : automation.type === "flow"
                        ? LanguageKey.AIFlow_connect_post_access
                        : LanguageKey.AIPrompt_connect_post_access,
                );
                const posts = props.canReadConnections
                  ? props.connections
                      .filter((connection) => connection.type === automation.type && connection.automationId === id)
                      .map((connection) => connection.post)
                  : [];
                const date = new DateObject({
                  date: draft
                    ? item.createdTime
                    : convertToMilliseconds(
                        automation.type === "ai" ? automation.prompt.updatedTime : automation.flow.createdTime,
                      ),
                  calendar: initialzedTime().calendar,
                  locale: initialzedTime().locale,
                });
                return (
                  <article className={styles.historyCard} key={`${automation.type}-${id}`}>
                    <button
                      type="button"
                      className={styles.openCard}
                      onClick={() => props.onOpen(automation)}
                      aria-label={item.title}
                    />
                    <div className={styles.cardHeader}>
                      <span
                        className={`${styles.cardIcon} ${styles.cardInitials}`}
                        style={{ background: thumbnailStyle.backgroundColor, color: thumbnailStyle.color }}
                        aria-hidden="true">
                        {thumbnailStyle.text}
                      </span>
                      <div className={styles.cardTitle}>
                        <h3 title={item.title}>{item.title}</h3>
                        <span dir="auto" title={id}>
                          # {id}
                        </span>
                        {/* <span dir="auto" title={id}>
                          {draft
                            ? t(LanguageKey.Flow)
                            : posts.length
                              ? `${t(LanguageKey.navbar_Post)} #${posts[0].postId}${posts.length > 1 ? ` +${posts.length - 1}` : ""}`
                              : `#${id}`}
                        </span> */}
                      </div>
                      {draft && <span className={styles.draftBadge}>{t(LanguageKey.product_draft)}</span>}
                    </div>
                    <div className={styles.cardBody}>
                      {posts.length > 0 && (
                        <ConnectedPosts
                          posts={posts}
                          onConnect={canConnect ? () => props.onConnect(automation) : undefined}
                        />
                      )}
                      {draft ||
                      (props.canReadConnections && props.connectionStatus === "ready" && posts.length === 0) ? (
                        <>
                          <p>{t(LanguageKey.Automation_not_connected)}</p>
                          <button
                            type="button"
                            className={styles.connectPostButton}
                            disabled={!canConnect}
                            title={connectLabel}
                            aria-label={`${t(LanguageKey.AIFlow_connect_post)} ${connectLabel}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onConnect(automation);
                            }}>
                            <LinkIcon /> {t(LanguageKey.AIFlow_connect_post)}
                          </button>
                        </>
                      ) : !props.canReadConnections ? (
                        <p>{t(LanguageKey.Automation_connections_access)}</p>
                      ) : props.connectionStatus === "loading" ? (
                        <p
                          className={styles.connectionLoading}
                          role="status"
                          title={t(LanguageKey.Automation_checking_connections)}>
                          {t(LanguageKey.Automation_checking_connections)}
                        </p>
                      ) : props.connectionStatus === "error" ? (
                        <button
                          type="button"
                          className={styles.connectionRetry}
                          onClick={props.onRetryConnections}
                          title={t(LanguageKey.Automation_connections_retry)}
                          aria-label={t(LanguageKey.Automation_connections_retry)}>
                          {t(posts.length ? LanguageKey.AIFlow_retry : LanguageKey.Automation_connections_retry)}
                        </button>
                      ) : null}
                    </div>
                    <time className={styles.cardTime} title={date.format("YYYY/MM/DD - HH:mm")}>
                      {date.format("YYYY/MM/DD - HH:mm")}
                    </time>
                  </article>
                );
              })}
            </div>
          )}
          {!props.fetching && props.items.length === 0 && !props.failed && (
            <div className={styles.listState}>{t(LanguageKey.noresult)}</div>
          )}
          {props.failed && (
            <button type="button" className={`cancelButton ${styles.listRetry}`} onClick={props.onRetry}>
              {t(LanguageKey.AIFlow_retry)}
            </button>
          )}
          {props.loadingMore && !props.fetching && (
            <div className={styles.paginationLoading} role="status">
              <RingLoader width={24} height={24} />
              <span>{t(LanguageKey.loading)}</span>
            </div>
          )}
          <div ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden="true" />
        </section>
      </div>
      {props.hasMore && !props.failed && <div className={styles.scrollHint} aria-hidden="true" />}
    </div>
  );
}
