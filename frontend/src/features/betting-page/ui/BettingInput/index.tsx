import React, { useCallback } from "react";
import { DuckIcon } from "@/shared/icons";
import { cn } from "@/shared/misc";
import { useUserInfo } from "@/shared/hooks/useUserInfo";
import { useBettingInput } from "./hooks/useBettingInput";
import { usePlaceBet } from "./hooks/usePlaceBet";
import type { BettingRoomInfo } from "@betting-duck/shared";

const BG = {
  winning: "bg-bettingBlue-behind",
  losing: "bg-bettingPink-disabled",
};
const BTN = { winning: "bg-bettingBlue", losing: "bg-bettingPink" };

function BettingInput({
  uses,
  bettingRoomInfo,
}: {
  uses: "winning" | "losing";
  bettingRoomInfo: BettingRoomInfo;
}) {
  const { data: user } = useUserInfo();
  const userDuck = user.duck;
  const { value, errors, onChange } = useBettingInput(
    bettingRoomInfo,
    userDuck,
  );
  const placeBet = usePlaceBet(uses, bettingRoomInfo);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange],
  );

  const handleClick = useCallback(() => {
    if (!errors.isText) placeBet();
  }, [errors.isText, placeBet]);

  return (
    <div className="flex flex-col items-end space-y-1">
      <div className={cn(BG[uses], "flex items-center rounded-lg p-2")}>
        <DuckIcon width={36} height={36} />
        <input
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          maxLength={10}
          aria-label="베팅 금액 입력"
          className="flex-1 p-2 text-end text-lg font-extrabold"
          value={value}
          onChange={handleChange}
        />
        <button
          disabled={errors.isText || bettingRoomInfo.isPlaceBet}
          onClick={handleClick}
          className={cn(BTN[uses], "rounded-lg px-4 py-2 text-white")}
        >
          투표
        </button>
      </div>
      <ErrorMessage {...errors} />
    </div>
  );
}

const ErrorMessage = React.memo(function ErrorMessage({
  isText,
  isLong,
  isOver,
}: {
  isText: boolean;
  isLong: boolean;
  isOver: boolean;
}) {
  const msg = isOver
    ? "보유 코인보다 많이 베팅할 수 없어요~"
    : isLong
      ? "최대 입력 수는 10글자에요~"
      : isText
        ? "문자 말고 숫자를 입력 해주세요~"
        : "";
  return (
    <p className={cn(msg ? "visible" : "invisible", "text-sm text-red-600")}>
      {msg}
    </p>
  );
});

export { BettingInput };
