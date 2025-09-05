import { useEffect } from "react";
import type { Dispatch } from "react";

export function useSlowlyIncreaseCount(
  targetCount: number,
  currentCount: number,
  setCount: Dispatch<React.SetStateAction<number>>,
) {
  useEffect(() => {
    if (targetCount > currentCount) {
      const interval = setInterval(() => {
        setCount((currentCount) => {
          if (currentCount < targetCount) {
            return currentCount + 1;
          }
          clearInterval(interval);
          return currentCount;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [targetCount, currentCount, setCount]);
}
