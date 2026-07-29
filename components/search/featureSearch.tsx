"use client";

import { FormEvent, KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { DirectionContext } from "../../context/directionContext";
import { filterFeatureSearch } from "./featureSearchIndex";
import styles from "./featureSearch.module.css";

const formatRouteDisplay = (route: string, direction: "ltr" | "rtl") => {
  const routeParts = route.split("/").filter(Boolean);
  return direction === "rtl" ? routeParts.reverse().join("/") : routeParts.join("/");
};

const FeatureSearch = ({
  onClose,
  onNavigate,
  embedded = false,
}: {
  onClose: () => void;
  onNavigate?: () => void;
  embedded?: boolean;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const direction = useContext(DirectionContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const results = filterFeatureSearch(query, (key) => t(key));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const navigateTo = (route: string) => {
    (onNavigate ?? onClose)();
    router.push(route);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (results[0]) navigateTo(results[0].route);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  };

  return (
    <section
      className={`${styles.searchPanel} ${embedded ? styles.embedded : ""}`}
      role="search"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={handleKeyDown}>
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          className={styles.searchInput}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${t(LanguageKey.search)}...`}
          aria-label={t(LanguageKey.search)}
          autoComplete="off"
        />
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Close search" title="Close">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      {query.trim() && (
        <div className={styles.results} role="listbox" aria-label="Search results">
          {results.length ? (
            results.slice(0, 8).map((result) => (
              <button
                key={`${result.route}-${result.labelKey}`}
                className={styles.result}
                type="button"
                role="option"
                onClick={() => navigateTo(result.route)}>
                <span className={styles.resultText}>
                  <div className="title">{t(result.labelKey)}</div>
                  <div className="explain" dir="ltr">
                    {formatRouteDisplay(result.route, direction)}
                  </div>
                </span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))
          ) : (
            <p className={styles.empty}>{t(LanguageKey.noresult)}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default FeatureSearch;
