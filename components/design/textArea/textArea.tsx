import { ChangeEvent, CSSProperties, KeyboardEvent, memo, useMemo } from "react";
import { isRTL } from "brancy/helper/checkRtl";
import styles from "brancy/components/design/textArea/textArea.module.css";

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
  } = props;

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
    [style, isPlaceholderRTL]
  );

  const handleKeyDownInternal = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
    handleKeyDown?.(e);
  };

  const handleChange = fadeTextArea ? undefined : handleInputChange;

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
      onFocus={handleInputonFocus}
      onBlur={handleInputBlur}
      placeholder={placeHolder}
      className={`${styles[className]} ${isValueRTL ? "rtl" : "ltr"} ${fadeTextArea ? "fadeDiv" : ""}`}
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
