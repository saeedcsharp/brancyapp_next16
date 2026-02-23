import { useEffect, useRef, useState } from "react";
import styles from "brancy/components/design/incrementStepper.module.css";

const IncrementStepper = (prop: { id: string; data: number; increment: () => void; decrement: () => void }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [isIncrementHeld, setIsIncrementHeld] = useState(false);
  const [isDecrementHeld, setIsDecrementHeld] = useState(false);
  const incrementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decrementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDecrement = () => {
    if (prop.data === 0) {
      setIsShaking(true);
    } else {
      prop.decrement();
    }
  };

  const startIncrementing = () => {
    setIsIncrementHeld(true);
    // Initial delay before rapid increment starts
    initialDelayTimeoutRef.current = setTimeout(() => {
      incrementTimerRef.current = setInterval(() => {
        prop.increment();
      }, 100); // Increment every 100ms while held
    }, 500); // Start rapid increment after 500ms hold
  };

  const stopIncrementing = () => {
    setIsIncrementHeld(false);
    if (initialDelayTimeoutRef.current) {
      clearTimeout(initialDelayTimeoutRef.current);
      initialDelayTimeoutRef.current = null;
    }
    if (incrementTimerRef.current) {
      clearInterval(incrementTimerRef.current);
      incrementTimerRef.current = null;
    }
  };

  const startDecrementing = () => {
    if (prop.data === 0) {
      setIsShaking(true);
      return;
    }

    setIsDecrementHeld(true);
    // Initial delay before rapid decrement starts
    initialDelayTimeoutRef.current = setTimeout(() => {
      decrementTimerRef.current = setInterval(() => {
        if (prop.data > 0) {
          prop.decrement();
        } else {
          stopDecrementing();
          setIsShaking(true);
        }
      }, 100); // Decrement every 100ms while held
    }, 500); // Start rapid decrement after 500ms hold
  };

  const stopDecrementing = () => {
    setIsDecrementHeld(false);
    if (initialDelayTimeoutRef.current) {
      clearTimeout(initialDelayTimeoutRef.current);
      initialDelayTimeoutRef.current = null;
    }
    if (decrementTimerRef.current) {
      clearInterval(decrementTimerRef.current);
      decrementTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isShaking) return;

    const timeoutId = setTimeout(() => setIsShaking(false), 500); // Match animation duration

    return () => clearTimeout(timeoutId);
  }, [isShaking]);

  // Clean up all timers when component unmounts
  useEffect(() => {
    return () => {
      if (incrementTimerRef.current) clearInterval(incrementTimerRef.current);
      if (decrementTimerRef.current) clearInterval(decrementTimerRef.current);
      if (initialDelayTimeoutRef.current) clearTimeout(initialDelayTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div className={`${styles.stepper} ${isShaking ? styles.shake : ""}`}>
        <div
          className={styles.icon}
          onClick={handleDecrement}
          onMouseDown={startDecrementing}
          onMouseUp={stopDecrementing}
          onMouseLeave={stopDecrementing}
          onTouchStart={startDecrementing}
          onTouchEnd={stopDecrementing}
          onTouchCancel={stopDecrementing}>
          <svg width="12" height="12" viewBox="0 0 10 10">
            <path stroke="var(--text-h2)" strokeLinecap="round" strokeWidth="2" d="M1 5h8" />
          </svg>
        </div>
        <div className={styles.value}>{prop.data}</div>

        <div
          className={styles.icon}
          onClick={prop.increment}
          onMouseDown={startIncrementing}
          onMouseUp={stopIncrementing}
          onMouseLeave={stopIncrementing}
          onTouchStart={startIncrementing}
          onTouchEnd={stopIncrementing}
          onTouchCancel={stopIncrementing}>
          <svg width="12" height="12" viewBox="0 0 10 10">
            <path stroke="var(--text-h2)" strokeLinecap="round" strokeWidth="2" d="M5 1v8M1 5h8" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default IncrementStepper;
