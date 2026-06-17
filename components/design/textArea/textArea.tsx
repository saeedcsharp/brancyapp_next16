import { ChangeEvent, CSSProperties, KeyboardEvent, memo, useMemo, useRef, useEffect, useCallback } from "react";
import { isRTL } from "brancy/helper/checkRtl";
import styles from "./textArea.module.css";

interface TextAreaProps {
  name?: string;
  className: string;
  placeHolder?: string;
  fadeTextArea?: boolean;
  handleInputChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleInputonFocus?: () => void;
  handleInputBlur?: () => void;
  value: string;
  maxLength?: number;
  style?: CSSProperties;
  id?: string;
  role: string;
  title: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  invalid?: boolean;
  dangerOnEmpty?: boolean;
  /** When true, textarea will expand while focused to fit content and collapse back on blur */
  autoExpandOnFocus?: boolean;
  /** Initial height in pixels when not expanded or when collapsed on blur */
  initialHeight?: number;
}

function TextArea(props: TextAreaProps) {
  const {
    name,
    id,
    role,
    title,
    placeHolder,
    fadeTextArea = false,
    handleInputChange,
    handleKeyDown,
    handleInputonFocus,
    handleInputBlur,
    value,
    maxLength = 100000,
    style,
    className,
    readOnly = false,
    autoFocus = false,
    required = false,
    invalid = false,
    dangerOnEmpty = false,
  } = props;

  const isEmpty = !value || value.trim() === "";

  const isValueRTL = useMemo(() => isRTL(value), [value]);
  const isPlaceholderRTL = useMemo(() => isRTL(placeHolder || ""), [placeHolder]);

  const getFontSize = (providedSize?: string | number): string => {
    if (!providedSize) return "16px";
    const size = typeof providedSize === "number" ? providedSize : parseFloat(providedSize);
    return size < 16 ? "16px" : typeof providedSize === "number" ? `${providedSize}px` : String(providedSize);
  };

  const combinedStyle = useMemo(
    (): CSSProperties => ({
      ...style,
      fontSize: getFontSize(style?.fontSize),
      textAlign: isPlaceholderRTL ? ("right" as const) : style?.textAlign,
      touchAction: "manipulation" as const,
      WebkitAppearance: "none" as const,
      MozAppearance: "none" as const,
    }),
    [style, isPlaceholderRTL],
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const initialH = props.initialHeight ?? 180;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newH = Math.max(initialH, el.scrollHeight);
    el.style.height = `${newH}px`;
  }, [initialH]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // set initial height
    if (!props.autoExpandOnFocus) {
      el.style.height = `${initialH}px`;
    } else {
      // ensure at least initial height
      el.style.minHeight = `${initialH}px`;
      // when not focused, keep initial height
      if (document.activeElement !== el) el.style.height = `${initialH}px`;
    }
  }, [initialH, props.autoExpandOnFocus]);

  const handleKeyDownInternal = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
    handleKeyDown?.(e);
  };

  const handleChange = fadeTextArea
    ? undefined
    : (e: ChangeEvent<HTMLTextAreaElement>) => {
        handleInputChange?.(e);
        if (props.autoExpandOnFocus && document.activeElement === textareaRef.current) {
          adjustHeight();
        }
      };

  const ariaLabel = title || placeHolder || "Text area input";

  return (
    <textarea
      name={name}
      id={id}
      role={role}
      title={title}
      aria-label={ariaLabel}
      aria-required={required}
      aria-invalid={invalid}
      maxLength={maxLength}
      onChange={handleChange}
      onKeyDown={handleKeyDownInternal}
      onFocus={(e) => {
        handleInputonFocus?.();
        if (props.autoExpandOnFocus) {
          // expand to fit content
          adjustHeight();
        }
      }}
      onBlur={(e) => {
        handleInputBlur?.();
        if (props.autoExpandOnFocus && textareaRef.current) {
          textareaRef.current.style.height = `${initialH}px`;
        }
      }}
      placeholder={placeHolder}
      ref={textareaRef}
      className={`${styles[className]} ${dangerOnEmpty && isEmpty ? (styles[`${className}danger`] ?? "") : ""} ${isValueRTL ? "rtl" : "ltr"} ${fadeTextArea ? "fadeDiv" : ""}`}
      value={value}
      readOnly={readOnly}
      autoFocus={autoFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      style={combinedStyle}
    />
  );
}

export default memo(TextArea);
