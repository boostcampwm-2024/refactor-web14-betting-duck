import { memo } from "react";
import { DuckCoinIcon } from "@/shared/icons";

interface Props {
  winningOption: "option1" | "option2";
  betAmount: number;
  myOption: "option1" | "option2";
  myResult: "win" | "lose";
  personalMultiplier: number;
  optionName: string;
}

export const PersonalResult = memo(function ({
  winningOption,
  betAmount,
  myResult,
  personalMultiplier,
  optionName,
}: Props) {
  const colorClass =
    myResult === "win" ? "text-bettingBlue" : "text-bettingPink";
  const delta = Math.round(betAmount * personalMultiplier);
  const renderWinningIcon = () => (
    <DuckCoinIcon
      className={
        winningOption === "option1" ? "text-bettingBlue" : "text-bettingPink"
      }
      width={24}
      height={24}
    />
  );

  return (
    <div className="bg-secondary flex w-full max-w-[90cqw] flex-col gap-4 rounded-lg p-4 shadow-inner">
      <h3 className="text-lg font-extrabold">베팅 결과</h3>
      <div className="flex justify-between font-extrabold">
        <div className="flex items-center gap-2">
          {renderWinningIcon()}
          베팅 금액
        </div>
        <span>{betAmount} 코인</span>
      </div>
      <div className="flex justify-between font-extrabold">
        <span>선택 옵션</span>
        <span className={colorClass}>{optionName}</span>
      </div>
      <div className="flex justify-between font-extrabold">
        <span>얻은 금액</span>
        <span className={colorClass}>
          {myResult === "win" ? "+" : "-"} {delta} 코인
        </span>
      </div>
    </div>
  );
});
