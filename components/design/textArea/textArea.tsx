import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { isRTL } from "brancy/helper/checkRtl";
import styles from "./textArea.module.css";
type NativeTextAreaProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "defaultValue" | "onBlur" | "onChange" | "onFocus" | "onKeyDown" | "value"
>;
interface TextAreaProps extends NativeTextAreaProps {
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  dangerOnEmpty?: boolean;
  fadeTextArea?: boolean;
  autoResize?: boolean;
  autoExpandOnFocus?: boolean;
  minRows?: number;
  maxRows?: number;
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  onEscape?: () => void;
  /** @deprecated Use placeholder instead. */
  placeHolder?: string;
  /** @deprecated Use onChange instead. */
  handleInputChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  /** @deprecated Use onKeyDown instead. */
  handleKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** @deprecated Use onFocus instead. */
  handleInputonFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /** @deprecated Use onBlur instead. */
  handleInputBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
}
function toMinimumMobileFontSize(fontSize?: CSSProperties["fontSize"]): CSSProperties["fontSize"] {
  if (typeof fontSize === "number") return `${Math.max(16, fontSize)}px`;
  if (fontSize) return `max(16px, ${fontSize})`;
  return "16px";
}
function getRowsHeight(element: HTMLTextAreaElement, rows: number): number {
  const computedStyle = window.getComputedStyle(element);
  const lineHeight = Number.parseFloat(computedStyle.lineHeight) || Number.parseFloat(computedStyle.fontSize) * 1.5;
  const verticalPadding =
    (Number.parseFloat(computedStyle.paddingTop) || 0) + (Number.parseFloat(computedStyle.paddingBottom) || 0);
  const verticalBorder =
    (Number.parseFloat(computedStyle.borderTopWidth) || 0) + (Number.parseFloat(computedStyle.borderBottomWidth) || 0);
  return Math.ceil(lineHeight * rows + verticalPadding + verticalBorder);
}
function TextArea(props: TextAreaProps) {
  const {
    value,
    defaultValue,
    placeholder,
    placeHolder,
    onChange,
    handleInputChange,
    onFocus,
    handleInputonFocus,
    onBlur,
    handleInputBlur,
    onKeyDown,
    handleKeyDown,
    className,
    style,
    dangerOnEmpty = false,
    fadeTextArea = false,
    autoResize,
    autoExpandOnFocus = false,
    minRows,
    maxRows,
    initialHeight,
    minHeight,
    maxHeight,
    onEscape,
    readOnly = false,
    tabIndex,
    title,
    "aria-label": ariaLabel,
    ...nativeProps
  } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = isControlled ? value : internalValue;
  const resolvedPlaceholder = placeholder ?? placeHolder;
  const shouldAutoResize = autoResize ?? autoExpandOnFocus;
  const isEmpty = !currentValue.trim();
  const direction = isRTL(currentValue || resolvedPlaceholder || "") ? "rtl" : "ltr";
  const baseHeight = initialHeight ?? minHeight ?? 40;
  const resetHeight = useCallback(() => {
    const element = textareaRef.current;
    if (!element || !shouldAutoResize) return;
    const height = minRows === undefined ? baseHeight : getRowsHeight(element, minRows);
    element.style.height = `${height}px`;
    element.style.overflowY = "hidden";
  }, [baseHeight, minRows, shouldAutoResize]);
  const adjustHeight = useCallback(() => {
    const element = textareaRef.current;
    if (!element || !shouldAutoResize) return;
    element.style.height = "auto";
    const contentHeight = element.scrollHeight;
    const minimumHeight = minRows === undefined ? (minHeight ?? baseHeight) : getRowsHeight(element, minRows);
    const maximumHeight = maxRows === undefined ? maxHeight : getRowsHeight(element, maxRows);
    const targetHeight = Math.max(minimumHeight, contentHeight);
    const height = maximumHeight ? Math.min(targetHeight, maximumHeight) : targetHeight;
    element.style.height = `${height}px`;
    element.style.overflowY = maximumHeight && contentHeight > maximumHeight ? "auto" : "hidden";
  }, [baseHeight, maxHeight, maxRows, minHeight, minRows, shouldAutoResize]);
  useLayoutEffect(() => {
    if (!shouldAutoResize) return;
    if (document.activeElement === textareaRef.current) {
      adjustHeight();
    } else {
      resetHeight();
    }
  }, [adjustHeight, currentValue, resetHeight, shouldAutoResize]);
  const combinedStyle = useMemo<CSSProperties>(
    () => ({
      ...style,
      fontSize: toMinimumMobileFontSize(style?.fontSize),
      textAlign: style?.textAlign ?? (direction === "rtl" ? "right" : "left"),
      touchAction: "manipulation",
      WebkitAppearance: "none",
      MozAppearance: "none",
      height: shouldAutoResize ? undefined : initialHeight ? `${initialHeight}px` : style?.height,
      minHeight: shouldAutoResize ? `${minHeight ?? baseHeight}px` : style?.minHeight,
      resize: "none",
    }),
    [baseHeight, direction, initialHeight, minHeight, shouldAutoResize, style],
  );
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
    handleInputChange?.(event);
  };
  const handleKeyDownInternal = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && onEscape) {
      onEscape();
      event.currentTarget.blur();
    }
    onKeyDown?.(event);
    handleKeyDown?.(event);
  };
  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    onFocus?.(event);
    handleInputonFocus?.(event);
    adjustHeight();
  };
  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    onBlur?.(event);
    handleInputBlur?.(event);
    resetHeight();
  };
  return (
    <textarea
      {...nativeProps}
      ref={textareaRef}
      title={title}
      value={isControlled ? value : internalValue}
      placeholder={resolvedPlaceholder}
      readOnly={readOnly || fadeTextArea}
      tabIndex={fadeTextArea ? -1 : tabIndex}
      dir={direction}
      aria-label={ariaLabel ?? title ?? resolvedPlaceholder ?? "Text area"}
      aria-invalid={nativeProps["aria-invalid"] ?? (dangerOnEmpty && isEmpty ? true : undefined)}
      onChange={handleChange}
      onKeyDown={handleKeyDownInternal}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={clsx(
        styles.textArea,
        className,
        dangerOnEmpty && isEmpty && styles.danger,
        direction === "rtl" ? styles.rtl : styles.ltr,
        fadeTextArea && styles.fade,
      )}
      style={combinedStyle}
    />
  );
}
export default memo(TextArea);
