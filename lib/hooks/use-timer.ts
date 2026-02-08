import { useEffect, useRef, useState } from 'react';

/**
 * useTimer - Custom hook for managing a timer
 * @returns The elapsed seconds since the timer started
 */
export function useTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return elapsedSeconds;
}
