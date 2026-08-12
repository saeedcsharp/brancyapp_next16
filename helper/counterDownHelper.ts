export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const calculateTimeRemaining = (expireTime: number): TimeRemaining => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const timeDiff = expireTime - now;

  if (timeDiff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(timeDiff / 86400);
  const hours = Math.floor((timeDiff % 86400) / 3600);
  const minutes = Math.floor((timeDiff % 3600) / 60);
  const seconds = timeDiff % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
};

export const formatTime = (time: TimeRemaining): string => {
  if (time.isExpired) {
    return "00:00:00";
  }

  const pad = (num: number): string => num.toString().padStart(2, "0");
  const dayPrefix = time.days > 0 ? `${pad(time.days)}:` : "";
  return `${dayPrefix}${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;

  //   const dayPrefix = time.days > 0 ? `${pad(time.days)}:` : "";
  //   return `${dayPrefix}${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
  // =======
  //   const formattedTime = `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;

  //   return time.days > 0 ? `${time.days}d ${formattedTime}` : formattedTime;
};
