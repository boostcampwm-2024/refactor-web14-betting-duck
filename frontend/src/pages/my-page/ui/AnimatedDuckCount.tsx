import React, { useState, useEffect } from "react";
import { DuckCoinIcon } from "@/shared/icons";

interface DuckCoinIconProps {
  width: number;
  height: number;
}

interface AnimatedDigitProps {
  digit: string;
  shouldAnimate: boolean;
}

interface AnimatedDuckCountProps {
  value: number;
  DuckCoinIcon: React.ComponentType<DuckCoinIconProps>;
}

const AnimatedDigit: React.FC<AnimatedDigitProps> = ({
  digit,
  shouldAnimate,
}) => {
  return (
    <span
      className="inline-block"
      style={{
        animation: shouldAnimate ? "slideIn3D 500ms ease-in-out" : "none",
      }}
    >
      {digit}
    </span>
  );
};

const AnimatedDuckCount: React.FC<AnimatedDuckCountProps> = ({ value }) => {
  const [prevValue, setPrevValue] = useState<number>(value);
  const [animatingDigits, setAnimatingDigits] = useState<Set<number>>(
    new Set(),
  );

  const getDigits = (num: number): string[] => {
    return num.toString().padStart(4, "0").split("");
  };

  useEffect(() => {
    if (value !== prevValue) {
      const prevDigits = getDigits(prevValue);
      const newDigits = getDigits(value);
      const changedPositions = new Set<number>();

      for (let i = newDigits.length - 1; i >= 0; i--) {
        if (prevDigits[i] !== newDigits[i]) {
          changedPositions.add(i);
          if (i < newDigits.length - 1) {
            changedPositions.add(i + 1);
          }
        }
      }

      setAnimatingDigits(changedPositions);

      const timer = setTimeout(() => {
        setAnimatingDigits(new Set());
        setPrevValue(value);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const digits = getDigits(value);

  return (
    <div className="z-20 flex w-full items-center justify-center gap-4">
      <DuckCoinIcon width={32} height={32} />
      <div className="flex text-2xl font-bold">
        {digits.map((digit, index) => (
          <AnimatedDigit
            key={`${index}-${digit}`}
            digit={digit}
            shouldAnimate={animatingDigits.has(index)}
          />
        ))}
      </div>
    </div>
  );
};

export { AnimatedDuckCount };
