import { ChangeEvent, forwardRef, useCallback, useId, useMemo, useRef } from "react";
import styles from "./inputBox.module.css";
import { isRTL } from "brancy/helper/checkRtl";

const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";
const arabicNumbers = "٠١٢٣٤٥٦٧٨٩";
const thaiNumbers = "๐๑๒๓๔๕๖๗๘๙";
const bengaliNumbers = "০১২৩৪৫৬৭৮৯";
const devanagariNumbers = "०१२३४५६७८९";
const numberMap = new Map<string, string>();
for (let i = 0; i < 10; i++) {
  numberMap.set(persianNumbers[i], i.toString());
  numberMap.set(arabicNumbers[i], i.toString());
  numberMap.set(thaiNumbers[i], i.toString());
  numberMap.set(bengaliNumbers[i], i.toString());
  numberMap.set(devanagariNumbers[i], i.toString());
}
const decimalDigitBlockStarts = [
  0x660, 0x6f0, 0x966, 0x9e6, 0xa66, 0xae6, 0xb66, 0xbe6, 0xc66, 0xce6, 0xd66, 0xe50, 0xed0, 0xf20, 0x1040, 0x17e0,
  0x1810, 0x1946, 0x19d0, 0x1a80, 0x1b50, 0x1bb0, 0x1c40, 0x1c50, 0xa620, 0xa8d0, 0xa900, 0xa9d0, 0xaa50, 0xabf0,
  0xff10,
];
const convertToEnglishNumbers = (input: string): string => {
  if (!input) return "";
  return Array.from(input)
    .map((character) => {
      const mappedCharacter = numberMap.get(character);
      if (mappedCharacter) return mappedCharacter;
      const codePoint = character.codePointAt(0) ?? -1;
      const blockStart = decimalDigitBlockStarts.find((start) => codePoint >= start && codePoint <= start + 9);
      return blockStart === undefined ? character : String(codePoint - blockStart);
    })
    .join("");
};
const convertToDigitsOnly = (input: string): string => convertToEnglishNumbers(input).replace(/[^0-9]/g, "");
const convertToDecimalDigits = (input: string): string => {
  const normalized = convertToEnglishNumbers(input).replace(/[^0-9.]/g, "");
  const decimalIndex = normalized.indexOf(".");
  return decimalIndex === -1
    ? normalized
    : `${normalized.slice(0, decimalIndex)}.${normalized.slice(decimalIndex + 1).replace(/\./g, "")}`;
};
type InputBoxVariant =
  | "default"
  | "initial"
  | "hover"
  | "filled"
  | "number"
  | "num"
  | "percentage"
  | "numAndPercentage"
  | "search"
  | "menuSearch"
  | "serachMenuBar";
type InputBoxStatus = "default" | "success" | "info" | "warning" | "danger";

interface InputBoxProps {
  id?: string;
  name?: string;
  className?: string;
  variant?: InputBoxVariant;
  status?: InputBoxStatus;
  placeHolder?: string;
  placeholder?: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  handleInputonFocus?: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  fadeTextArea?: boolean;
  maxLength?: number;
  style?: React.CSSProperties;
  numberType?: boolean;
  decimal?: boolean;
  type?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  autoComplete?: string;
  pattern?: string;

  autoCorrect?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  clearable?: boolean;
  pasteIcon?: boolean;
  unit?: React.ReactNode;
  unitStyle?: React.CSSProperties;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  dangerOnEmpty?: boolean;
  isEmptyOverride?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  shake?: boolean;
}
const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(function InputBox(props, forwardedRef) {
  const {
    id: providedId,
    name,
    className = "textinputbox",
    variant,
    status = "default",
    placeHolder,
    placeholder,
    handleInputChange,
    handleInputBlur,
    handleInputonFocus,
    value,
    fadeTextArea,
    maxLength,
    style,
    numberType,
    decimal = false,
    type,
    inputMode,
    autoComplete,
    pattern,
    autoCorrect,
    disabled,
    readOnly,
    required,
    autoFocus,
    clearable = true,
    pasteIcon = false,
    unit,
    unitStyle,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    dangerOnEmpty,
    isEmptyOverride,
    onKeyDown,
    shake,
  } = props;
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const inputPlaceholder = placeholder ?? placeHolder;
  const numericInput =
    decimal ||
    numberType ||
    variant === "number" ||
    variant === "num" ||
    variant === "percentage" ||
    variant === "numAndPercentage" ||
    className === "num" ||
    className === "numAndPercentage";
  const isPlaceholderRTL = useMemo(() => (inputPlaceholder ? isRTL(inputPlaceholder) : false), [inputPlaceholder]);
  const isValueRTL = useMemo(() => isRTL(value), [value]);
  const handleInputChangeWithConversion = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (fadeTextArea) return;
      const convertedValue = numericInput
        ? decimal
          ? convertToDecimalDigits(e.target.value)
          : convertToDigitsOnly(e.target.value)
        : convertToEnglishNumbers(e.target.value);
      handleInputChange({
        ...e,
        target: { ...e.target, value: convertedValue },
      });
    },
    [decimal, fadeTextArea, handleInputChange, numericInput],
  );
  const handleClearInput = useCallback(() => {
    if (inputRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(inputRef.current, "");
      }
      const event = new Event("input", { bubbles: true });
      inputRef.current.dispatchEvent(event);
      inputRef.current.focus();
    }
  }, []);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && value && !disabled) {
        handleClearInput();
        e.preventDefault();
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    },
    [value, disabled, handleClearInput, onKeyDown],
  );
  const handleClearKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        handleClearInput();
        e.preventDefault();
      }
    },
    [handleClearInput],
  );
  const handlePasteInput = useCallback(async () => {
    if (!pasteIcon || disabled || readOnly || !navigator.clipboard?.readText) return;
    const clipboardText = await navigator.clipboard.readText();
    if (!inputRef.current) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    if (!nativeInputValueSetter) return;
    nativeInputValueSetter.call(inputRef.current, clipboardText);
    inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    inputRef.current.focus();
  }, [disabled, pasteIcon, readOnly]);
  const isEmpty = isEmptyOverride ?? (!value || value.trim() === "");
  const activeRTL = value ? isValueRTL : isPlaceholderRTL;
  const legacyClass = styles[className as keyof typeof styles] || styles.textinputbox;
  const selectedVariant =
    variant ||
    (className === "num"
      ? "number"
      : className === "numAndPercentage"
        ? "percentage"
        : className === "serachMenuBar"
          ? "menuSearch"
          : className === "search"
            ? "search"
            : undefined);
  const selectedStatus = dangerOnEmpty && isEmpty ? "danger" : status;
  const variantClass = selectedVariant
    ? styles[`variant${selectedVariant[0].toUpperCase()}${selectedVariant.slice(1)}` as keyof typeof styles]
    : "";
  const statusClass =
    selectedStatus !== "default"
      ? styles[`status${selectedStatus[0].toUpperCase()}${selectedStatus.slice(1)}` as keyof typeof styles]
      : "";
  const inputClassNames =
    `${legacyClass} ${styles.input} ${variantClass || ""} ${statusClass || ""} ${unit ? styles.hasUnit : ""} ${
      activeRTL ? styles.rtl : styles.ltr
    } ${fadeTextArea ? "fadeDiv" : ""} ${isEmpty ? styles.emptyInput : ""}`.trim();
  const shakeClass = shake || (dangerOnEmpty && isEmpty) ? styles.shake : "";
  const clearButtonClassNames = `${styles.clearButton} ${activeRTL ? styles.clearButtonRtl : styles.clearButtonLtr}`;
  const inputStyles = useMemo(() => {
    const directionValue = value ? (isValueRTL ? "rtl" : "ltr") : isPlaceholderRTL ? "rtl" : "ltr";
    const textAlign: "right" | "left" = directionValue === "rtl" ? "right" : "left";
    return {
      ...style,
      fontSize: "16px",
      textAlign,
      direction: directionValue as "rtl" | "ltr",
    };
  }, [style, value, isValueRTL, isPlaceholderRTL]);
  const inputType = useMemo(() => {
    if (type) return type;
    if (inputMode || pattern) return "text";
    if (numberType) return "text";
    return "text";
  }, [type, inputMode, pattern, numberType]);
  return (
    <div className={styles.inputBox}>
      <input
        ref={(node) => {
          inputRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        id={inputId}
        name={name}
        maxLength={maxLength}
        type={inputType}
        onChange={handleInputChangeWithConversion}
        onBlur={handleInputBlur}
        onFocus={handleInputonFocus}
        onKeyDown={handleKeyDown}
        placeholder={inputPlaceholder}
        dir={activeRTL ? "rtl" : "ltr"}
        className={`${inputClassNames} ${shakeClass}`.trim()}
        value={
          numericInput
            ? decimal
              ? convertToDecimalDigits(value)
              : convertToDigitsOnly(value)
            : convertToEnglishNumbers(value)
        }
        style={inputStyles}
        inputMode={inputMode ?? (numericInput ? "numeric" : undefined)}
        pattern={pattern}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={selectedStatus === "danger" ? true : undefined}
        aria-describedby={ariaDescribedBy || (selectedStatus === "danger" ? `${inputId}-error` : undefined)}
      />
      {unit && (
        <span
          className={`${styles.unitLabel} ${activeRTL ? styles.unitLabelRtl : styles.unitLabelLtr}`}
          style={unitStyle}
          aria-hidden="true">
          {unit}
        </span>
      )}
      {pasteIcon && (
        <button
          type="button"
          className={`${styles.pasteButton} ${activeRTL ? styles.pasteButtonRtl : styles.pasteButtonLtr}`}
          onClick={handlePasteInput}
          disabled={disabled || readOnly}
          aria-label="Paste from clipboard"
          title="Paste from clipboard">
          <img src="/copy.svg" alt="" width="100%" height="100%" aria-hidden="true" />
        </button>
      )}
      {clearable && !unit && value && !disabled && !readOnly && (
        <button
          type="button"
          className={clearButtonClassNames}
          onClick={handleClearInput}
          onKeyDown={handleClearKeyDown}
          aria-label="Clear input">
          <img src="/iconbox-close.svg" alt="" width="100%" height="100%" aria-hidden="true" />
        </button>
      )}
    </div>
  );
});
export default InputBox;
