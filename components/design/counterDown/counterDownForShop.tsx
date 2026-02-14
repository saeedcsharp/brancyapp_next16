// First, let's create a CountdownTimer component
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetTimestamp: number; // Unix timestamp in milliseconds
}

const styles = {
  discountdateremaining: {
    display: "flex",
    gap: "var(--gap-3)",
    fontSize: "var(--font-14)",
    fontWeight: "var(--weight-500)",
    color: "#fff",
    alignItems: "center",
  },
  timeUnit: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "5px",
  },
};

const CountdownTimer = ({ targetTimestamp }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetTimestamp - Date.now();

      if (difference <= 0) {
        // Countdown finished
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup
  }, [targetTimestamp]);

  // Format with leading zeros
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num.toString();
  };

  return (
    <div style={styles.discountdateremaining}>
      <span style={styles.timeUnit}>{formatNumber(timeLeft.days)}</span>:
      <span style={styles.timeUnit}>{formatNumber(timeLeft.hours)}</span>:
      <span style={styles.timeUnit}>{formatNumber(timeLeft.minutes)}</span>:
      <span style={styles.timeUnit}>{formatNumber(timeLeft.seconds)}</span>
    </div>
  );
};

export default CountdownTimer;
