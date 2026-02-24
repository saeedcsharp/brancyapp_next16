import { ChangeEvent, useCallback, useId, useMemo, useRef } from "react";
import { isRTL } from "brancy/helper/checkRtl";
import styles from "./inputBox.module.css";
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
const convertToEnglishNumbers = (input: string): string => {
  if (!input) return "";
  return input.replace(/[۰-۹٠-٩๐-๙০-৯०-९]/g, (match) => numberMap.get(match) || match);
};
interface InputTextProps {
  id?: string;
  name?: string;
  className: string;
  placeHolder?: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  handleInputonFocus?: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  fadeTextArea?: boolean;
  maxLength?: number;
  style?: React.CSSProperties;
  numberType?: boolean;
  type?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  autoComplete?: string;
  pattern?: string;
  autoCorrect?: string;
  disabled?: boolean;
  dangerOnEmpty?: boolean;
  onKeyDown?: (e: any) => void;
  shake?: boolean;
}
const InputText = (props: InputTextProps) => {
  const {
    id: providedId,
    name,
    className,
    placeHolder,
    handleInputChange,
    handleInputBlur,
    handleInputonFocus,
    value,
    fadeTextArea,
    maxLength,
    style,
    numberType,
    type,
    inputMode,
    autoComplete,
    pattern,
    autoCorrect,
    disabled,
    dangerOnEmpty,
    onKeyDown,
    shake,
  } = props;
  const generatedId = useId();
  const inputId = providedId || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const isPlaceholderRTL = useMemo(() => (placeHolder ? isRTL(placeHolder) : false), [placeHolder]);
  const isValueRTL = useMemo(() => isRTL(value), [value]);
  const handleInputChangeWithConversion = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (fadeTextArea) return;
      const convertedValue = convertToEnglishNumbers(e.target.value);
      handleInputChange({
        ...e,
        target: { ...e.target, value: convertedValue },
      });
    },
    [fadeTextArea, handleInputChange],
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
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        handleClearInput();
        e.preventDefault();
      }
    },
    [handleClearInput],
  );
  const isEmpty = !value || value.trim() === "";
  const activeRTL = value ? isValueRTL : isPlaceholderRTL;
  const inputClassNames = `${dangerOnEmpty && isEmpty ? styles.danger : styles[className]} ${
    activeRTL ? "rtl" : "ltr"
  } ${fadeTextArea ? "fadeDiv" : ""} ${isEmpty ? styles.emptyInput : ""}`.trim();
  const shakeClass = shake ? styles.shake : "";
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
    if (numberType) return "number";
    return "text";
  }, [type, inputMode, pattern, numberType]);
  return (
    <div className={styles.inputWrapper}>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        maxLength={maxLength}
        type={inputType}
        onChange={handleInputChangeWithConversion}
        onBlur={handleInputBlur}
        onFocus={handleInputonFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeHolder}
        className={`${inputClassNames} ${shakeClass}`.trim()}
        value={convertToEnglishNumbers(value)}
        style={inputStyles}
        inputMode={inputMode}
        pattern={pattern}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        disabled={disabled}
        aria-invalid={dangerOnEmpty && isEmpty ? true : undefined}
        aria-describedby={dangerOnEmpty && isEmpty ? `${inputId}-error` : undefined}
      />
      {value && !disabled && (
        <div
          className={clearButtonClassNames}
          onClick={handleClearInput}
          onKeyDown={handleClearKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Clear input">
          <img src="/iconbox-close.svg" alt="" width={18} height={18} aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
export default InputText;
