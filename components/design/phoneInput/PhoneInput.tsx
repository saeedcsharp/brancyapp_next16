"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { PHONE_COUNTRIES, countryFlagUrl } from "./countries";
import type { PhoneCountry, PhoneFormat, PhoneInputProps, PhoneValue } from "./types";
import { getCountryCodeFromTimezone } from "brancy/helper/detectLocaleFromTimezone";
import styles from "./PhoneInput.module.css";

const digitMap: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};
const normalizeDigits = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit]).replace(/[^0-9]/g, "");
const formatDigits = (digits: string, format?: string) => {
  if (!format || !digits) return digits;
  let index = 0;
  return format
    .replace(/[_.]/g, () => digits[index++] || "")
    .replace(/\D+$/g, "")
    .trim();
};
const cleanIso = (value?: string) => value?.toLowerCase().replace(/[^a-z]/g, "") || "";
const fuzzyMatch = (text: string, query: string) => {
  let position = 0;
  for (const char of query) {
    position = text.indexOf(char, position);
    if (position < 0) return false;
    position++;
  }
  return true;
};

const detectCountry = (fallback: string, countries: PhoneCountry[]) => {
  const timezoneCountry = cleanIso(getCountryCodeFromTimezone());
  const timezoneMatch = countries.find((country) => country.iso2 === timezoneCountry);
  if (timezoneMatch) return timezoneMatch;

  const fallbackMatch = countries.find((country) => country.iso2 === cleanIso(fallback));
  if (fallbackMatch) return fallbackMatch;

  if (typeof navigator !== "undefined") {
    const localeCountry = cleanIso((navigator.language || "").split("-")[1]);
    const localeMatch = countries.find((country) => country.iso2 === localeCountry);
    if (localeMatch) return localeMatch;
  }
  return countries.find((country) => country.iso2 === "gb") || countries[0];
};

export const getPhoneValue = (country: PhoneCountry, nationalNumber: string, format?: PhoneFormat): PhoneValue => {
  const normalizedNationalNumber = normalizeDigits(nationalNumber);
  const national = formatDigits(normalizedNationalNumber, country.format);
  const e164 = `+${country.dialCode}${normalizedNationalNumber}`;
  const international = `+${country.dialCode} ${national}`.trim();
  const isValid = normalizedNationalNumber.length >= 4 && normalizedNationalNumber.length <= 15;
  return {
    country,
    countryCode: country.iso2,
    dialCode: country.dialCode,
    nationalNumber: normalizedNationalNumber,
    e164,
    international,
    national,
    isValid: format === "e164" ? isValid : isValid,
  };
};

const PhoneInput = (props: PhoneInputProps) => {
  const {
    value = "",
    defaultCountry = "gb",
    country: controlledCountry,
    onChange,
    onCountryChange,
    enableCountrySelector = true,
    enableFlag = true,
    enableSearch = true,
    enableAutoDetect = true,
    detectIp = true,
    detectIpUrl = "/api/user/ip",
    enableFormatting = true,
    format = "national",
    onlyCountries,
    excludeCountries,
    preferredCountries = [],
    suggestedCountries = [],
    locale = "en",
    direction = "auto",
    error,
    success,
    loading = false,
    readOnly = false,
    disabled = false,
    autoFocus = false,
    inputProps,
    countryInputProps,
    numberInputProps,
    numberInputClassName,
    className = "",
    countrySelectorClassName = "",
    countryListClassName = "",
  } = props;
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const countryFieldRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedIso, setSelectedIso] = useState(cleanIso(controlledCountry || defaultCountry));
  const [dialCodeInput, setDialCodeInput] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [detected, setDetected] = useState<PhoneCountry | null>(null);
  const [recentCountries, setRecentCountries] = useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const allCountries: PhoneCountry[] = props.countries || PHONE_COUNTRIES;
  const countries: PhoneCountry[] = useMemo(
    () =>
      allCountries.filter(
        (item) =>
          (!onlyCountries?.length || onlyCountries.map(cleanIso).includes(item.iso2)) &&
          !excludeCountries?.map(cleanIso).includes(item.iso2),
      ),
    [allCountries, excludeCountries, onlyCountries],
  );
  const selected = countries.find((item) => item.iso2 === cleanIso(controlledCountry || selectedIso));
  const fallbackCountry = countries[0] || PHONE_COUNTRIES[0];
  const valueDigits = normalizeDigits(value);

  useEffect(() => {
    if (valueDigits) {
      const matching = countries
        .filter((item) => valueDigits.startsWith(item.dialCode))
        .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
      if (matching) {
        setSelectedIso(matching.iso2);
        setDialCodeInput(matching.dialCode);
        setNationalNumber(valueDigits.slice(matching.dialCode.length));
      } else {
        setDialCodeInput("");
        setNationalNumber(valueDigits);
      }
    }
  }, [valueDigits]);
  useEffect(() => {
    if (enableAutoDetect && !controlledCountry) {
      const localCountry = detectCountry(defaultCountry, countries);
      setDetected(localCountry);
      if (!controlledCountry) {
        setSelectedIso(localCountry.iso2);
        setDialCodeInput(localCountry.dialCode);
      }
    }
  }, [defaultCountry, controlledCountry, enableAutoDetect, countries]);
  useEffect(() => {
    if (!enableAutoDetect || !detectIp || !detectIpUrl || controlledCountry || typeof window === "undefined") return;
    const controller = new AbortController();
    fetch(detectIpUrl, { signal: controller.signal })
      .then((response) =>
        response.ok ? (response.json() as Promise<{ countryCode?: string; country?: string; iso2?: string }>) : null,
      )
      .then((result) => {
        const iso = cleanIso(result?.iso2 || result?.countryCode || result?.country);
        const match = countries.find((item) => item.iso2 === iso);
        if (match) {
          setDetected(match);
          setSelectedIso(match.iso2);
          setDialCodeInput(match.dialCode);
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [countries, controlledCountry, detectIp, detectIpUrl, enableAutoDetect]);
  useEffect(() => {
    if (!enableAutoDetect || controlledCountry || typeof window === "undefined") return;
    try {
      setRecentCountries(JSON.parse(localStorage.getItem("brancy-phone-recent") || "[]") as string[]);
    } catch {
      setRecentCountries([]);
    }
  }, [controlledCountry, enableAutoDetect]);
  useEffect(() => {
    const close = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !dropdownRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useLayoutEffect(() => {
    if (!open) return;

    const updateDropdownPosition = () => {
      const field = countryFieldRef.current;
      if (!field) return;

      const rect = field.getBoundingClientRect();
      const dropdownWidth = Math.min(320, window.innerWidth - 24);
      const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - dropdownWidth - 12));
      setDropdownPosition({ top: rect.bottom + 6, left });
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open]);
  const resolvedDirection =
    direction === "auto" ? (locale.startsWith("fa") || locale.startsWith("ar") ? "rtl" : "ltr") : direction;
  const useLocalizedCountryNames = locale.startsWith("fa") || locale.startsWith("ar");
  const getCountryName = (country: PhoneCountry) =>
    useLocalizedCountryNames ? country.localizedName || country.name : country.name;
  const selectCountry = (next: PhoneCountry) => {
    setSelectedIso(next.iso2);
    setOpen(false);
    setCountryQuery("");
    setDialCodeInput(next.dialCode);
    onCountryChange?.(next);
    emit(next, nationalNumber);
    try {
      const recent = [next.iso2, ...recentCountries.filter((item) => item !== next.iso2)].slice(0, 5);
      setRecentCountries(recent);
      localStorage.setItem("brancy-phone-recent", JSON.stringify(recent));
    } catch {
      setRecentCountries([]);
    }
  };
  const emit = (nextCountry: PhoneCountry, nextNumber: string) =>
    onChange?.(getPhoneValue(nextCountry, nextNumber, format));
  const handleNumberChange = (next: string) => {
    const digits = normalizeDigits(next);
    setNationalNumber(digits);
    if (selected) emit(selected, digits);
  };
  const handleDialChange = (next: string) => {
    const digits = normalizeDigits(next);
    setDialCodeInput(digits);
    const matches = countries.filter((item) => item.dialCode.startsWith(digits));
    const exactMatch = countries.find((item) => item.dialCode === digits);
    if (exactMatch) {
      setSelectedIso(exactMatch.iso2);
      onCountryChange?.(exactMatch);
    } else if (!matches.length && digits) {
      setSelectedIso("");
    }
  };
  const preferred = [...preferredCountries.map(cleanIso), ...recentCountries]
    .map((iso) => countries.find((item) => item.iso2 === iso))
    .filter(
      (item, index, items): item is PhoneCountry =>
        Boolean(item) && items.findIndex((candidate) => candidate?.iso2 === item?.iso2) === index,
    );
  const suggestions = [...suggestedCountries.map(cleanIso), detected?.iso2 || ""]
    .map((iso) => countries.find((item) => item.iso2 === iso))
    .filter(
      (item, index, items): item is PhoneCountry =>
        Boolean(item) && items.findIndex((candidate) => candidate?.iso2 === item?.iso2) === index,
    );
  const query = countryQuery.trim().toLowerCase();
  const numericQuery = normalizeDigits(query);
  const isNumericQuery = numericQuery.length > 0 && numericQuery === query.replace(/\D/g, "");
  const filtered = countries.filter(
    (item) =>
      !query ||
      (isNumericQuery
        ? item.dialCode.startsWith(numericQuery)
        : [item.name, item.localizedName || "", item.iso2].some((field) => field.toLowerCase().includes(query))) ||
      fuzzyMatch(item.name.toLowerCase(), query) ||
      fuzzyMatch((item.localizedName || "").toLowerCase(), query),
  );
  const normalResults = filtered.filter(
    (item) =>
      !suggestions.some((suggestion) => suggestion.iso2 === item.iso2) &&
      !preferred.some((preferredCountry) => preferredCountry.iso2 === item.iso2),
  );
  const topResults = query
    ? []
    : [...suggestions, ...preferred].filter(
        (item, index, items) => items.findIndex((candidate) => candidate.iso2 === item.iso2) === index,
      );
  const list = query ? filtered : normalResults;
  const displayedNumber = enableFormatting ? formatDigits(nationalNumber, selected?.format) : nationalNumber;
  const currentValue = getPhoneValue(selected || fallbackCountry, nationalNumber, format);
  const validationResult = props.validate?.(currentValue);
  const validationError =
    validationResult === false
      ? "Invalid phone number"
      : typeof validationResult === "string"
        ? validationResult
        : undefined;
  const status = error || validationError || success;
  const invalidDialCode = !dialCodeInput || !countries.some((item) => item.dialCode.startsWith(dialCodeInput));
  const incompleteDialCode = Boolean(dialCodeInput) && !countries.some((item) => item.dialCode === dialCodeInput);
  const showDialCodeWarning = !selected || invalidDialCode || incompleteDialCode;
  const showSuggestedSeparator = !query && suggestions.length > 0 && normalResults.length > 0;
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  };
  const stopClick = (event: MouseEvent) => event.stopPropagation();

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`} dir={resolvedDirection} data-phone-input>
      {props.label && (
        <label className={styles.label} htmlFor={`${id}-number`}>
          {props.label}
        </label>
      )}
      <div className={styles.field}>
        {props.countryLabel && (
          <label className={styles.label} htmlFor={`${id}-dial`}>
            {props.countryLabel}
          </label>
        )}
        <div
          ref={countryFieldRef}
          className={`${styles.countryField} ${showDialCodeWarning ? styles.countryFieldError : ""} ${countrySelectorClassName}`}>
          <button
            type="button"
            className={styles.countryButton}
            disabled={disabled || readOnly || !enableCountrySelector}
            aria-label="Select country"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            onKeyDown={handleKeyDown}>
            {showDialCodeWarning ? (
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠
              </span>
            ) : enableFlag ? (
              <img className={styles.flag} src={countryFlagUrl(selected.iso2)} alt="" aria-hidden="true" />
            ) : null}
            {/* {selected && <span className={styles.iso}>{selected.iso2.toUpperCase()}</span>} */}
            {/* <span className={styles.chevron} aria-hidden="true">
              ⌄
            </span> */}
          </button>
          <span aria-hidden="true">+</span>
          <input
            {...countryInputProps}
            id={`${id}-dial`}
            className={styles.dialInput}
            value={dialCodeInput}
            inputMode="tel"
            readOnly={!enableCountrySelector || readOnly}
            disabled={disabled}
            onChange={(event) => handleDialChange(event.target.value)}
            aria-label={props.countryLabel || "Country dial code"}
            aria-invalid={invalidDialCode}
          />
        </div>
        {open &&
          enableCountrySelector &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              className={`${styles.dropdown} ${countryListClassName}`}
              role="dialog"
              aria-label="Country list"
              onClick={stopClick}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>
              {enableSearch && (
                <input
                  className={styles.search}
                  autoFocus
                  placeholder="Search country, ISO or dial code"
                  value={countryQuery}
                  onChange={(event) => setCountryQuery(event.target.value)}
                  aria-label="Search country"
                />
              )}

              <ul className={styles.list} role="listbox">
                {topResults.length > 0 && (
                  <ul className={styles.list} role="listbox">
                    {topResults.map((item) => (
                      <li key={item.iso2}>
                        <button
                          type="button"
                          className={styles.countryOption}
                          role="option"
                          aria-selected={item.iso2 === selected?.iso2}
                          onClick={() => selectCountry(item)}>
                          <img className={styles.flag} src={countryFlagUrl(item.iso2)} alt="" aria-hidden="true" />
                          <span className={styles.countryName}>{getCountryName(item)}</span>
                          <span className={styles.iso}>+{item.dialCode}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {showSuggestedSeparator && <div className={styles.separator} role="separator" />}
                {list.length ? (
                  list.map((item) => (
                    <li key={item.iso2}>
                      <button
                        type="button"
                        className={styles.countryOption}
                        role="option"
                        aria-selected={item.iso2 === selected?.iso2}
                        onClick={() => selectCountry(item)}>
                        <img className={styles.flag} src={countryFlagUrl(item.iso2)} alt="" aria-hidden="true" />
                        <span className={styles.countryName}>{getCountryName(item)}</span>
                        <span className={styles.iso}>+{item.dialCode}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className={styles.empty}>No country found</li>
                )}
              </ul>
            </div>,
            document.body,
          )}
      </div>
      <div className={styles.field}>
        {props.numberLabel && (
          <label className={styles.label} htmlFor={`${id}-number`}>
            {props.numberLabel}
          </label>
        )}
        <div className={`${styles.numberField} ${loading ? styles.loading : ""}`}>
          <input
            {...props.inputProps}
            {...numberInputProps}
            id={`${id}-number`}
            name={props.numberInputName || props.name}
            className={`${styles.numberInput} ${numberInputClassName || ""}`}
            type="tel"
            inputMode="tel"
            autoFocus={autoFocus}
            disabled={disabled || loading || invalidDialCode || incompleteDialCode}
            readOnly={readOnly}
            value={displayedNumber}
            placeholder={
              props.placeholder || selected?.placeholder || selected?.format?.replace(/\./g, "0") || "Phone number"
            }
            onChange={(event) => handleNumberChange(event.target.value)}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            aria-invalid={Boolean(error)}
            aria-describedby={status ? `${id}-status` : undefined}
          />
        </div>
        {/* {(status || invalidDialCode || incompleteDialCode) && (
          <div
            id={`${id}-status`}
            className={`${styles.status} ${error ? styles.error : styles.success}`}
            role={error || invalidDialCode || incompleteDialCode ? "alert" : "status"}>
            {(error || invalidDialCode || incompleteDialCode) && <span aria-hidden="true">⚠ </span>}
            {invalidDialCode
              ? "Invalid country dial code"
              : incompleteDialCode
                ? "Enter a complete country dial code"
                : status}
          </div>
        )} */}
      </div>

      {detected && <span hidden data-detected-country={detected.iso2} />}
    </div>
  );
};

export { PHONE_COUNTRIES } from "./countries";
export type { PhoneCountry, PhoneFormat, PhoneInputProps, PhoneValue } from "./types";
export default PhoneInput;
