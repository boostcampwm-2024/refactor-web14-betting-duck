import { bettingRoomQueryKey } from "@/shared/lib/bettingRoomInfo";
import { BettingPool } from "@/shared/utils/bettingOdds";
import { QueryClient } from "@tanstack/react-query";
import { BettingRoomInfo, bettingRoomInfoSchema } from "@betting-duck/shared";

type PartialBettingPool = Partial<{
  option1: Partial<BettingPool["option1"]>;
  option2: Partial<BettingPool["option2"]>;
  isPlaceBet: boolean;
  placeBetAmount: number;
  isBettingEnd: boolean;
  selectedOption: keyof BettingPool;
}>;

interface PlaceBettingParams {
  selectedOption: "option1" | "option2";
  roomId: string;
  duck: number;
  bettingAmount: number;
  bettingRoomInfo: BettingRoomInfo;
  queryClient: QueryClient;
  updateBettingPool: (partialPool: PartialBettingPool) => Promise<void>;
}

async function placeBetting({
  selectedOption,
  roomId,
  duck,
  bettingAmount,
  bettingRoomInfo,
  queryClient,
  updateBettingPool,
}: PlaceBettingParams) {
  const { isPlaceBet } = bettingRoomInfo;

  if (isPlaceBet) {
    console.error("이미 배팅을 했습니다.");
    return;
  }

  if (duck - bettingAmount < 0) {
    throw new Error("소유한 덕코인보다 더 많은 금액을 베팅할 수 없습니다.");
  }

  const response = await fetch("/api/bets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        betAmount: bettingAmount,
        selectOption: selectedOption,
      },
      channel: {
        roomId,
      },
    }),
  });
  if (!response.ok) {
    throw new Error("베팅에 실패했습니다.");
  }
  queryClient.setQueryData(bettingRoomQueryKey(roomId), (prevData: unknown) => {
    const parsedData = bettingRoomInfoSchema.safeParse(prevData);
    if (!parsedData.success) {
      return prevData;
    }
    return {
      ...parsedData.data,
      isPlaceBet: true,
      placeBetAmount: bettingAmount,
    };
  });
  await updateBettingPool({
    isPlaceBet: true,
    placeBetAmount: bettingAmount,
    selectedOption,
  });
}

export { placeBetting };
