import {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  memo,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import clsx from "clsx";
import { isRTL } from "brancy/helper/checkRtl";
import styles from "./textArea.module.css";
interface TextAreaProps {
  name?: string;
  id?: string;
  role: string;
  title: string;
  className: string;
  placeHolder?: string;
  value?: string;
  defaultValue?: string;
  handleInputChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleInputonFocus?: () => void;
  handleInputBlur?: () => void;
  maxLength?: number;
  style?: CSSProperties;
  readOnly?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  invalid?: boolean;
  dangerOnEmpty?: boolean;
  fadeTextArea?: boolean;
  autoExpandOnFocus?: boolean;
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  onEscape?: () => void;
}

function TextArea(props: TextAreaProps) {
  const {
    name,
    id,
    role,
    title,
    placeHolder,
    value,
    defaultValue,
    handleInputChange,
    handleKeyDown,
    handleInputonFocus,
    handleInputBlur,
    maxLength = 100000,
    style,
    className,
    readOnly = false,
    autoFocus = false,
    required = false,
    invalid = false,
    dangerOnEmpty = false,
    fadeTextArea = false,
    autoExpandOnFocus = false,
    initialHeight,
    minHeight,
    maxHeight,
    onEscape,
  } = props;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const currentValue = isControlled ? value! : internalValue;
  const isEmpty = useMemo(() => !currentValue?.trim(), [currentValue]);
  const isValueRTL = useMemo(() => isRTL(currentValue), [currentValue]);
  const isPlaceholderRTL = useMemo(() => isRTL(placeHolder || ""), [placeHolder]);
  const getFontSize = (size?: string | number): string => {
    if (!size) return "16px";
    const n = typeof size === "number" ? size : parseFloat(size);
    return n < 16 ? "16px" : typeof size === "number" ? `${size}px` : String(size);
  };
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !autoExpandOnFocus) return;
    el.style.height = "auto";
    let newHeight = el.scrollHeight;
    if (minHeight) newHeight = Math.max(minHeight, newHeight);
    if (maxHeight) newHeight = Math.min(maxHeight, newHeight);
    el.style.height = `${newHeight}px`;
  }, [autoExpandOnFocus, minHeight, maxHeight]);
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (autoExpandOnFocus) {
      const base = initialHeight || minHeight || 40;
      el.style.height = `${base}px`;
    }
  }, [autoExpandOnFocus, initialHeight, minHeight]);
  useEffect(() => {
    if (!autoExpandOnFocus) return;
    const t = setTimeout(() => {
      adjustHeight();
    }, 40);
    return () => clearTimeout(t);
  }, [currentValue, adjustHeight, autoExpandOnFocus]);
  const combinedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      fontSize: getFontSize(style?.fontSize),
      textAlign: isPlaceholderRTL ? "right" : style?.textAlign,
      touchAction: "manipulation",
      WebkitAppearance: "none",
      MozAppearance: "none",
      height: !autoExpandOnFocus && initialHeight ? `${initialHeight}px` : undefined,
      minHeight: autoExpandOnFocus ? `${minHeight ?? initialHeight ?? 40}px` : undefined,
      overflow: autoExpandOnFocus ? "hidden" : "auto",
      resize: "none",
    }),
    [style, isPlaceholderRTL, autoExpandOnFocus, initialHeight, minHeight],
  );
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    handleInputChange?.(e);
    if (autoExpandOnFocus) {
      requestAnimationFrame(adjustHeight);
    }
  };
  const handleKeyDownInternal = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      onEscape?.();
      e.currentTarget.blur();
    }
    handleKeyDown?.(e);
  };
  return (
    <textarea
      ref={textareaRef}
      name={name}
      id={id}
      role={role}
      title={title}
      aria-label={title || placeHolder || "text area"}
      aria-required={required}
      aria-invalid={invalid}
      aria-multiline="true"
      maxLength={maxLength}
      value={isControlled ? value : internalValue}
      defaultValue={!isControlled ? defaultValue : undefined}
      placeholder={placeHolder}
      readOnly={readOnly}
      autoFocus={autoFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      onChange={handleChange}
      onKeyDown={handleKeyDownInternal}
      onFocus={() => {
        handleInputonFocus?.();
        adjustHeight();
      }}
      onBlur={() => {
        handleInputBlur?.();
        if (autoExpandOnFocus && textareaRef.current) {
          const base = initialHeight || minHeight || 40;
          textareaRef.current.style.height = `${base}px`;
        }
      }}
      className={clsx(
        styles.base,
        styles[className],
        dangerOnEmpty && isEmpty && styles.TextAreaDangerOnEmpty,
        isValueRTL ? styles.rtl : styles.ltr,
        fadeTextArea && styles.fade,
      )}
      style={combinedStyle}
    />
  );
}

export default memo(TextArea);
