import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { placeBetting } from "@/features/betting-page/utils/placeBetting";
import { useBettingContext } from "@/features/betting-page/hook/useBettingContext";
import type { BettingRoomInfo } from "@betting-duck/shared";
import { useUserInfo } from "@/shared/hooks/useUserInfo";

export function usePlaceBet(
  uses: "winning" | "losing",
  roomInfo: BettingRoomInfo,
) {
  const { data: userInfo } = useUserInfo();
  const qc = useQueryClient();
  const { updateBettingPool } = useBettingContext();

  return useCallback(() => {
    const amount = Number(
      roomInfo.isPlaceBet ? roomInfo.placeBetAmount : roomInfo.placeBetAmount,
    );
    const selectedOption = uses === "winning" ? "option1" : "option2";
    placeBetting({
      selectedOption,
      duck: userInfo.duck,
      bettingAmount: amount,
      roomId: roomInfo.channel.id,
      queryClient: qc,
      bettingRoomInfo: roomInfo,
      updateBettingPool,
    });
  }, [uses, roomInfo, qc, updateBettingPool, userInfo.duck]);
}
