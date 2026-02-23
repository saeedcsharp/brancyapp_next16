// CircularCountdown.js
import { useEffect, useState } from "react";
import styles from "brancy/components/design/counterDown/circularCounterDown.module.css";

const CIRCLE_SIZE = 48;
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getTimeParts(diff: number) {
  const days = Math.floor(diff / (24 * 3600));
  const hours = Math.floor((diff % (24 * 3600)) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds };
}

export default function CircularCountdown({ unixTime }: { unixTime: number }) {
  // ابتدا تبدیل میلی‌ثانیه به ثانیه برای محاسبه صحیح زمان
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor((unixTime - Date.now()) / 1000)));

  useEffect(() => {
    const timer = setInterval(() => {
      const newRemaining = Math.max(0, Math.floor((unixTime - Date.now()) / 1000));
      setRemaining(newRemaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [unixTime]);

  const { days, hours, minutes, seconds } = getTimeParts(remaining);

  // انتخاب واحد مناسب و درصد پیشرفت
  let value = 0,
    max = 0;
  if (days > 0) {
    value = days;
    max = 30;
  } else if (hours > 0) {
    value = hours;
    max = 24;
  } else if (minutes > 0) {
    value = minutes;
    max = 60;
  } else {
    value = seconds;
    max = 60;
  }

  // محاسبه درصد باقیمانده و offset - معکوس شده
  const percent = value / max;
  // تغییر محاسبه offset برای معکوس کردن رفتار (برای کاهش با گذشت زمان)
  const offset = CIRCUMFERENCE * percent; // فقط percent بدون (1 - percent)

  // console.log برای تشخیص مشکل
  console.log(`Value: ${value}, Max: ${max}, Percent: ${percent}, Offset: ${offset}`);

  return (
    <div className={styles.countdownCircleWrapper}>
      <svg className={styles.countdownCircleSvg} width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        {/* حلقه پس‌زمینه */}
        <circle className={styles.countdownCircleBg} cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} />
        {/* حلقه نازک (کامل) */}
        <circle
          className={styles.countdownCircleFgThin}
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset="0"
        />
        {/* حلقه ضخیم (پیشرفت) */}
        <circle
          className={styles.countdownCircleFg}
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ strokeDashoffset: offset }}
        />
      </svg>

      {/* آیکون SVG به جای متن */}
      <div className={styles.countdownCircleIcon}>
        <svg fill="none" width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 21">
          <path
            d="M14.7 8.3q-.4-.8-1.2-.8H9.3V1.7q0-1.2-1-1.6-.8-.3-1.5.6L1.1 11a2 2 0 0 0 0 1.8q.3.8 1.1.8h4.2v5.8q0 1.2 1 1.6l.4.1q.6 0 1-.7L14.7 10a2 2 0 0 0 0-1.8"
            fill="#fff"
          />
        </svg>
      </div>
    </div>
  );
}
