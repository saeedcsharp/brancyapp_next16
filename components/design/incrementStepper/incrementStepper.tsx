import { ChangeEvent, KeyboardEvent, PointerEvent, useEffect, useRef, useState } from "react";
import styles from "./incrementStepper.module.css";
type StepperDirection = "increment" | "decrement";
interface IncrementStepperProps {
  id?: string;
  data: number;
  increment: () => void;
  decrement: () => void;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  incrementLabel?: string;
  decrementLabel?: string;
}
const HOLD_DELAY = 500;
const HOLD_INTERVAL = 100;
const IncrementStepper = ({
  id,
  data,
  increment,
  decrement,
  onValueChange,
  min = 0,
  max,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  incrementLabel,
  decrementLabel,
}: IncrementStepperProps) => {
  const [isShaking, setIsShaking] = useState(false);
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dataRef = useRef(data);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const didRepeatRef = useRef(false);
  const suppressClickRef = useRef<StepperDirection | null>(null);
  dataRef.current = data;
  const triggerShake = () => {
    setIsShaking(false);
    requestAnimationFrame(() => setIsShaking(true));
  };
  const stopRepeating = () => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };
  const performStep = (direction: StepperDirection) => {
    if (direction === "decrement" && dataRef.current <= min) {
      triggerShake();
      return false;
    }
    if (direction === "increment") {
      increment();
    } else {
      decrement();
    }
    return true;
  };
  const startRepeating = (direction: StepperDirection, event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointerRef.current = event.pointerId;
    didRepeatRef.current = false;
    stopRepeating();
    delayTimerRef.current = setTimeout(() => {
      repeatTimerRef.current = setInterval(() => {
        if (!performStep(direction)) {
          stopRepeating();
          return;
        }
        didRepeatRef.current = true;
      }, HOLD_INTERVAL);
    }, HOLD_DELAY);
  };
  const stopPointerInteraction = (direction: StepperDirection, event: PointerEvent<HTMLButtonElement>) => {
    if (activePointerRef.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerRef.current = null;
    stopRepeating();
    if (didRepeatRef.current) {
      suppressClickRef.current = direction;
      didRepeatRef.current = false;
    }
  };
  const handleClick = (direction: StepperDirection) => {
    if (suppressClickRef.current === direction) {
      suppressClickRef.current = null;
      return;
    }
    performStep(direction);
  };
  useEffect(() => {
    if (!isShaking) return;
    const timeoutId = setTimeout(() => setIsShaking(false), 500);
    return () => clearTimeout(timeoutId);
  }, [isShaking]);
  useEffect(() => stopRepeating, []);
  useEffect(() => {
    if (draftValue !== null && document.activeElement !== inputRef.current) {
      setDraftValue(null);
    }
  }, [data]);

  const valueId = id?.trim() || undefined;
  const valueLabel = ariaLabel ?? "Value";
  const inputId = valueId ? `${valueId}-input` : undefined;

  const formatNumber = (value: number) =>
    Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0";

  const commitDraftValue = () => {
    if (draftValue === null) return;

    const normalizedDraft = draftValue.replace(/,/g, "");
    const parsedValue = Number(normalizedDraft);
    if (!Number.isInteger(parsedValue)) {
      triggerShake();
      setDraftValue(null);
      return;
    }

    const nextValue = Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, parsedValue));
    if (nextValue !== dataRef.current) onValueChange?.(nextValue);
    setDraftValue(null);
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/,/g, "");
    if (/^\d*$/.test(nextValue)) setDraftValue(nextValue);
  };

  const handleValueKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      setDraftValue(null);
      event.currentTarget.blur();
    }
  };
  return (
    <div
      className={`${styles.IncrementStepper} ${isShaking ? styles.isShaking : ""} ${className ?? ""}`}
      role="group"
      aria-label={ariaLabel}>
      <button
        type="button"
        className={styles.control}
        onClick={() => handleClick("decrement")}
        onPointerDown={(event) => startRepeating("decrement", event)}
        onPointerUp={(event) => stopPointerInteraction("decrement", event)}
        onPointerCancel={(event) => stopPointerInteraction("decrement", event)}
        disabled={disabled}
        aria-label={decrementLabel ?? `Decrease ${valueLabel}`}>
        <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M1 5h8" />
        </svg>
      </button>
      <input
        ref={inputRef}
        id={inputId}
        className={styles.value}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draftValue !== null ? draftValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : formatNumber(data)}
        onChange={handleValueChange}
        onBlur={commitDraftValue}
        onKeyDown={handleValueKeyDown}
        disabled={disabled || !onValueChange}
        aria-label={valueLabel}
      />
      <button
        type="button"
        className={styles.control}
        onClick={() => handleClick("increment")}
        onPointerDown={(event) => startRepeating("increment", event)}
        onPointerUp={(event) => stopPointerInteraction("increment", event)}
        onPointerCancel={(event) => stopPointerInteraction("increment", event)}
        disabled={disabled}
        aria-label={incrementLabel ?? `Increase ${valueLabel}`}>
        <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 1v8M1 5h8" />
        </svg>
      </button>
    </div>
  );
};
export default IncrementStepper;
