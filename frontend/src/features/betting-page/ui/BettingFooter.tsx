import { DuckCoinIcon } from "@/shared/icons";
import React from "react";
import { BettingRoomInfo } from "@betting-duck/shared";
import { useUserInfo } from "@/shared/hooks/useUserInfo";

function BettingFooter({
  bettingRoomInfo,
}: {
  bettingRoomInfo: BettingRoomInfo;
}) {
  const { data: userInfo } = useUserInfo();
  const duckCoin = userInfo.duck;

  const remainingAmount = React.useMemo(
    () => duckCoin - bettingRoomInfo.placeBetAmount,
    [duckCoin, bettingRoomInfo.placeBetAmount],
  );

  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-4 text-center font-bold text-gray-600">
      <div className="flex items-center gap-2">
        베팅 금액:{" "}
        <span className="flex items-center gap-2 font-extrabold">
          <DuckCoinIcon width={26} height={26} />
          {bettingRoomInfo.placeBetAmount}
        </span>
      </div>
      <div className="flex items-center gap-2">
        소유 금액:{" "}
        <span className="flex items-center gap-2 font-extrabold">
          <DuckCoinIcon width={26} height={26} />
          {remainingAmount}
        </span>
      </div>
    </div>
  );
}

export { BettingFooter };
