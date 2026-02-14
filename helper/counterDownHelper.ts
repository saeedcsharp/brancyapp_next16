export interface TimeRemaining {
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
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const hours = Math.floor(timeDiff / 3600);
  const minutes = Math.floor((timeDiff % 3600) / 60);
  const seconds = timeDiff % 60;

  return {
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
  return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
};
