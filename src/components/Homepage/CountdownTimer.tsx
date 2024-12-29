import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isTimeUp, setIsTimeUp] = useState(false); // Tracks if countdown is complete

  const formatWithLeadingZero = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval); // Stop the countdown if time is up
        setIsTimeUp(true); // Indicate that the time is up
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isTimeUp) {
    return (
      <div className="text-center">
        <h4 className="text-2xl md:text-3xl font-medium uppercase tracking-wide mb-6">
          Parade is Ongoing !
        </h4>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h4 className="text-3xl md:text-4xl font-medium uppercase tracking-wide mb-6">
        Next Parade In:
      </h4>
      <div className="flex flex-col space-y-8 md:space-y-4">
        <div className="flex items-center justify-center space-x-6 md:space-x-4">
          <div
            className="bg-white text-black font-bold text-5xl md:text-6xl px-8 py-6 rounded shadow-lg"
            aria-label={`${timeLeft.days} days`}
          >
            {formatWithLeadingZero(timeLeft.days)} <span className="text-sm">Days</span>
          </div>
          <div
            className="bg-white text-black font-bold text-5xl md:text-6xl px-8 py-6 rounded shadow-lg"
            aria-label={`${timeLeft.hours} hours`}
          >
            {formatWithLeadingZero(timeLeft.hours)} <span className="text-sm">Hour</span>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-6 md:space-x-4">
          <div
            className="bg-white text-black font-bold text-5xl md:text-6xl px-8 py-6 rounded shadow-lg"
            aria-label={`${timeLeft.minutes} minutes`}
          >
            {formatWithLeadingZero(timeLeft.minutes)} <span className="text-sm">Mins</span>
          </div>
          <div
            className="bg-white text-black font-bold text-5xl md:text-6xl px-8 py-6 rounded shadow-lg"
            aria-label={`${timeLeft.seconds} seconds`}
          >
            {formatWithLeadingZero(timeLeft.seconds)} <span className="text-sm">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
