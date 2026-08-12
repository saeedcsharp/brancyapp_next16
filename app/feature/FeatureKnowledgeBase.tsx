"use client";

import { useContext, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DirectionContext } from "brancy/context/directionContext";
import {
  auditRecords,
  featureCatalog,
  type FeatureAccess,
  type FeatureCategory,
  type FeatureRecord,
  type FeatureRole,
} from "./featureCatalog";
import styles from "./page.module.css";
import { wrap } from "node:module";

type AccessFilter = "all" | "free" | "paid" | "subscription" | "token" | "required";
type SortField = "title" | "category" | "access";
type SortDirection = "ascending" | "descending";

const roleOrder: FeatureRole[] = ["instagramer", "shopper", "advertiser"];
const categoryOrder: FeatureCategory[] = [
  "account",
  "content",
  "analytics",
  "messaging",
  "automation",
  "ai",
  "market",
  "finance",
  "commerce",
  "orders",
  "advertising",
  "settings",
];

function matchesAccessFilter(access: FeatureAccess, filter: AccessFilter): boolean {
  if (filter === "all") return true;
  if (filter === "free") return access === "free";
  if (filter === "paid") return access === "package" || access === "feature" || access === "token";
  if (filter === "subscription") return access === "package";
  if (filter === "token") return access === "token";
  return access === "role" || access === "verification";
}

function joinTranslated(t: (key: string) => string, prefix: string, values: string[]): string {
  return values.map((value) => t(`${prefix}.${value}`)).join(" · ");
}

function DetailPanel({ feature }: { feature: FeatureRecord }) {
  const { t } = useTranslation();
  const featureKey = `featureKnowledge.records.${feature.id}`;

  return (
    <div className={styles.detailPanel}>
      {/* <p className={styles.detailIntro}>{t(`${featureKey}.description`)}</p> */}
      <div className={styles.detailGrid}>
        <section>
          <h3>{t("featureKnowledge.detail.problem")}</h3>
          <p>{t(`${featureKey}.descriptionDetail`)}</p>
        </section>

        <section>
          <h3>{t("featureKnowledge.detail.usage")}</h3>
          <p>{t("featureKnowledge.detail.route")}</p>
          <code className={styles.detailRoute} dir="ltr">
            {feature.routes.join("  |  ")}
          </code>
        </section>
        {/* <section>
          <h3>{t("featureKnowledge.detail.prerequisites")}</h3>
          {feature.prerequisites.length ? (
            <div className={styles.tagList}>
              {feature.prerequisites.map((item) => (
                <span key={item} className={styles.tag}>
                  {t(`featureKnowledge.prerequisite.${item}`)}
                </span>
              ))}
            </div>
          ) : (
            <p>{t("featureKnowledge.detail.noPrerequisites")}</p>
          )}
        </section> */}

        <section>
          <h3>
            {t("featureKnowledge.detail.limitation")} - {t("featureKnowledge.detail.access")}
          </h3>
          <p>
            {t(`featureKnowledge.limitation.${feature.limitation}`)} -{" "}
            {t(`featureKnowledge.accessLabels.${feature.access}`)}
          </p>
        </section>
        <section>
          <h3>
            {t("featureKnowledge.columns.role")} - {t("featureKnowledge.columns.status")}
          </h3>

          <div className={styles.roleAccessRow}>
            <p className="IDpurple" style={{ textWrap: "auto" }}>
              {joinTranslated(t, "featureKnowledge.role", feature.roles)}
            </p>
            -
            <p style={{ textWrap: "auto" }} className={`IDblue ${styles[`access${feature.access}`]}`}>
              {t(`featureKnowledge.accessLabels.${feature.access}`)}
            </p>
          </div>
        </section>
        {/* <section>
          <h3>{t("featureKnowledge.detail.contentIdea")}</h3>
          <p>{t(`featureKnowledge.contentIdea.${feature.contentIdea}`)}</p>
        </section> */}
      </div>
      {/* <div className={styles.evidenceRow}>
        <span className={styles.evidenceLabel}>{t("featureKnowledge.detail.evidence")}</span>
        <div className={styles.tagList}>
          {feature.sourceKinds.map((source) => (
            <span key={source} className={styles.evidenceTag}>
              {t(`featureKnowledge.evidence.${source}`)}
            </span>
          ))}
        </div>
      </div>
      <p className={styles.sourceNote}>{t("featureKnowledge.detail.sourceNote")}</p> */}
    </div>
  );
}

function FeatureRow({
  feature,
  expanded,
  onToggle,
}: {
  feature: FeatureRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const featureKey = `featureKnowledge.records.${feature.id}`;

  return (
    <article className={styles.featureRow}>
      <div className={styles.featureSummary}>
        <div className={styles.featureName}>
          {/* <span className={styles.mobileLabel}>{t("featureKnowledge.columns.feature")}</span> */}

          <strong>{t(`${featureKey}.title`)}</strong>
          <span className={styles.categoryTag}>{t(`featureKnowledge.categoryLabels.${feature.category}`)}</span>
        </div>
        <div className={styles.description}>
          {/* <span className={styles.mobileLabel}>{t("featureKnowledge.columns.description")}</span> */}
          <p>{t(`${featureKey}.description`)}</p>
        </div>

        <div className={styles.expandCell}>
          {/* <span className={styles.mobileLabel}>{t("featureKnowledge.columns.details")}</span> */}
          <button
            className={styles.expandButton}
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={t(expanded ? "featureKnowledge.collapse" : "featureKnowledge.expand")}
            title={t(expanded ? "featureKnowledge.collapse" : "featureKnowledge.expand")}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={expanded ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {expanded && <DetailPanel feature={feature} />}
    </article>
  );
}

export default function FeatureKnowledgeBase() {
  const { t, i18n } = useTranslation();
  const direction = useContext(DirectionContext);
  const [selectedRole, setSelectedRole] = useState<FeatureRole>("instagramer");
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | "all">("all");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim());

  const counts = useMemo(
    () => ({
      total: featureCatalog.length,
      instagramer: featureCatalog.filter((feature) => feature.roles.includes("instagramer")).length,
      shopper: featureCatalog.filter((feature) => feature.roles.includes("shopper")).length,
      advertiser: featureCatalog.filter((feature) => feature.roles.includes("advertiser")).length,
      shared: featureCatalog.filter((feature) => feature.roles.length > 1).length,
      ai: featureCatalog.filter((feature) => feature.isAi).length,
      free: featureCatalog.filter((feature) => feature.access === "free").length,
      paid: featureCatalog.filter((feature) => matchesAccessFilter(feature.access, "paid")).length,
    }),
    [],
  );

  const availableCategories = useMemo(
    () =>
      categoryOrder.filter((category) =>
        featureCatalog.some((feature) => feature.roles.includes(selectedRole) && feature.category === category),
      ),
    [selectedRole],
  );

  const visibleFeatures = useMemo(() => {
    const normalizedQuery = deferredQuery.toLocaleLowerCase(i18n.language);
    const collator = new Intl.Collator(i18n.language, { sensitivity: "base" });
    const filtered = featureCatalog.filter((feature) => {
      if (!feature.roles.includes(selectedRole)) return false;
      if (selectedCategory !== "all" && feature.category !== selectedCategory) return false;
      if (!matchesAccessFilter(feature.access, accessFilter)) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        t(`featureKnowledge.records.${feature.id}.title`),
        t(`featureKnowledge.records.${feature.id}.description`),
        t(`featureKnowledge.categoryLabels.${feature.category}`),
        t(`featureKnowledge.accessLabels.${feature.access}`),
        ...feature.roles.map((role) => t(`featureKnowledge.role.${role}`)),
      ]
        .join(" ")
        .toLocaleLowerCase(i18n.language);

      return searchable.includes(normalizedQuery);
    });

    return [...filtered].sort((first, second) => {
      const firstValue =
        sortField === "title"
          ? t(`featureKnowledge.records.${first.id}.title`)
          : sortField === "category"
            ? t(`featureKnowledge.categoryLabels.${first.category}`)
            : t(`featureKnowledge.accessLabels.${first.access}`);
      const secondValue =
        sortField === "title"
          ? t(`featureKnowledge.records.${second.id}.title`)
          : sortField === "category"
            ? t(`featureKnowledge.categoryLabels.${second.category}`)
            : t(`featureKnowledge.accessLabels.${second.access}`);
      const comparison = collator.compare(firstValue, secondValue);
      return sortDirection === "ascending" ? comparison : -comparison;
    });
  }, [accessFilter, deferredQuery, i18n.language, selectedCategory, selectedRole, sortDirection, sortField, t]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setAccessFilter("all");
    setQuery("");
    setSortField("title");
    setSortDirection("ascending");
    setExpandedId(null);
  };

  return (
    <main className={styles.page} dir={direction}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <h1>{t("featureKnowledge.title")}</h1>
          <span className={styles.eyebrow}>{t("featureKnowledge.verifiedCaption")}</span>
          {/* <p>{t("featureKnowledge.subtitle")}</p> */}
        </header>

        {/* <section className={styles.overview} aria-labelledby="overview-title">
          <div className={styles.sectionHeading}>
            <h2 id="overview-title">
              {t("featureKnowledge.overview")}{" "}
            <span className={styles.featureCount}>{t("featureKnowledge.featureCount", { count: counts.total })}</span>
            </h2>
            <span>{t("featureKnowledge.verifiedCaption")}</span>
          </div>
          <div className={styles.statsGrid}>
            {[
              ["totalFeatures", counts.total],
              ["instagramerFeatures", counts.instagramer],
              ["shopperFeatures", counts.shopper],
              ["advertiserFeatures", counts.advertiser],
              ["sharedFeatures", counts.shared],
              ["aiFeatures", counts.ai],
              ["freeFeatures", counts.free],
              ["paidFeatures", counts.paid],
            ].map(([label, count]) => (
              <div className={styles.stat} key={label as string}>
                <strong>{count}</strong>
                <span>{t(`featureKnowledge.${label}`)}</span>
              </div>
            ))}
          </div>
        </section> */}

        <section className={styles.workspace} aria-labelledby="catalog-title">
          {/* <div className={styles.workspaceHeader}>
            <div>
              <span className={styles.eyebrow}>{t("featureKnowledge.roleNavigation")}</span>
             <h2 id="catalog-title">{t(`featureKnowledge.role.${selectedRole}`)}</h2>
            </div>
            <button className={styles.clearButton} type="button" onClick={resetFilters}>
              {t("featureKnowledge.clearFilters")}
            </button>
          </div> */}

          <div className={styles.roleTabs} role="tablist" aria-label={t("featureKnowledge.roleNavigation")}>
            {roleOrder.map((role) => (
              <button
                key={role}
                className={selectedRole === role ? styles.roleTabActive : styles.roleTab}
                type="button"
                role="tab"
                aria-selected={selectedRole === role}
                onClick={() => {
                  setSelectedRole(role);
                  setSelectedCategory("all");
                  setExpandedId(null);
                }}>
                {t(`featureKnowledge.role.${role}`)}
                <span>{counts[role]}</span>
              </button>
            ))}
          </div>

          <div className={styles.filters}>
            <label className={styles.searchField}>
              <span>{t("featureKnowledge.search")}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("featureKnowledge.searchPlaceholder")}
                aria-label={t("featureKnowledge.search")}
              />
            </label>
            <div className={styles.filterGroup}>
              <span>{t("featureKnowledge.category")}</span>
              <div className={styles.filterButtons}>
                <button
                  type="button"
                  className={selectedCategory === "all" ? styles.filterActive : styles.filterButton}
                  onClick={() => setSelectedCategory("all")}
                  aria-pressed={selectedCategory === "all"}>
                  {t("featureKnowledge.all")}
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategory === category ? styles.filterActive : styles.filterButton}
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={selectedCategory === category}>
                    {t(`featureKnowledge.categoryLabels.${category}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <span>{t("featureKnowledge.access")}</span>
              <div className={styles.filterButtons}>
                {(["all", "free", "paid", "subscription", "token", "required"] as AccessFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={accessFilter === filter ? styles.filterActive : styles.filterButton}
                    onClick={() => setAccessFilter(filter)}
                    aria-pressed={accessFilter === filter}>
                    {filter === "all" ? t("featureKnowledge.all") : t(`featureKnowledge.accessFilters.${filter}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tableToolbar}>
            <span>{t("featureKnowledge.results", { count: visibleFeatures.length })}</span>
            {/* <div className={styles.sortControls}>
              <label>
                <span>{t("featureKnowledge.sort.label")}</span>
                <select value={sortField} onChange={(event) => setSortField(event.target.value as SortField)}>
                  {(["title", "category", "access"] as SortField[]).map((field) => (
                    <option key={field} value={field}>
                      {t(`featureKnowledge.sort.${field}`)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className={styles.sortDirection}
                type="button"
                onClick={() => setSortDirection((current) => (current === "ascending" ? "descending" : "ascending"))}
                aria-label={t(`featureKnowledge.sort.${sortDirection}`)}
                title={t(`featureKnowledge.sort.${sortDirection}`)}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d={sortDirection === "ascending" ? "m8 9 4-4 4 4m-4-4v14" : "m8 15 4 4 4-4m-4 4V5"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div> */}
          </div>

          <div className={styles.table} role="region" aria-live="polite">
            <div className={styles.tableHead} aria-hidden="true">
              <span>{t("featureKnowledge.columns.feature")}</span>
              <span>{t("featureKnowledge.columns.description")}</span>
              {/* <span>{t("featureKnowledge.columns.role")}</span>
              <span>{t("featureKnowledge.columns.status")}</span> */}
              <span>{t("featureKnowledge.columns.details")}</span>
            </div>
            {visibleFeatures.length ? (
              visibleFeatures.map((feature) => (
                <FeatureRow
                  key={feature.id}
                  feature={feature}
                  expanded={expandedId === feature.id}
                  onToggle={() => setExpandedId((current) => (current === feature.id ? null : feature.id))}
                />
              ))
            ) : (
              <p className={styles.empty}>{t("featureKnowledge.noResults")}</p>
            )}
          </div>
        </section>

        {/* <section className={styles.audit} aria-labelledby="audit-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{t("featureKnowledge.audit.status")}</span>
              <h2 id="audit-title">{t("featureKnowledge.audit.title")}</h2>
            </div>
          </div>
          <p>{t("featureKnowledge.audit.description")}</p>
          <div className={styles.auditGrid}>
            {auditRecords.map((record) => (
              <article key={record.id} className={styles.auditItem}>
                <h3>{t(`featureKnowledge.records.${record.id}.title`)}</h3>
                <p>{t(`featureKnowledge.records.${record.id}.description`)}</p>
                <span className={styles.auditStatus}>{t("featureKnowledge.audit.status")}</span>
                <div className={styles.auditRoutes}>
                  <span>{t("featureKnowledge.audit.route")}</span>
                  <code>{record.routes.join(" | ")}</code>
                </div>
              </article>
            ))}
          </div>
        </section> */}
      </div>
    </main>
  );
}
