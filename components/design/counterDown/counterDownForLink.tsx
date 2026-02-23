import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TimeRemaining, calculateTimeRemaining, formatTime } from "brancy/helper/counterDownHelper";
import { LanguageKey } from "brancy/i18n";

interface CountdownTimerProps {
  expireTime: number;
  className?: string;
  expiredClassName?: string;
}

const CountdownTimerForLink = memo<CountdownTimerProps>(({ expireTime, className, expiredClassName }) => {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining(expireTime));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update immediately
    const initialTime = calculateTimeRemaining(expireTime);
    setTimeRemaining(initialTime);

    // Don't start interval if already expired
    if (initialTime.isExpired) {
      return;
    }

    // Set up interval to update every second
    intervalRef.current = setInterval(() => {
      const newTime = calculateTimeRemaining(expireTime);
      setTimeRemaining(newTime);

      // Clear interval if expired
      if (newTime.isExpired && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);

    // Cleanup interval on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [expireTime]);

  return (
    <span className={timeRemaining.isExpired ? expiredClassName : className}>
      {timeRemaining.isExpired ? t(LanguageKey.Expired) : formatTime(timeRemaining)}
    </span>
  );
});

CountdownTimerForLink.displayName = "CountdownTimer";

export default CountdownTimerForLink;
