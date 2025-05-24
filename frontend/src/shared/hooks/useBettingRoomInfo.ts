import {
  useSuspenseQuery,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { BettingRoomInfo, bettingRoomInfoSchema } from "@betting-duck/shared";

async function bettingRoomQueryFn(roomId: string): Promise<BettingRoomInfo> {
  try {
    const response = await fetch(`/api/betrooms/${roomId}`);
    if (!response.ok) {
      throw new Error("베팅 방 정보를 불러오는데 실패했습니다.");
    }

    const { data } = await response.json();
    const result = bettingRoomInfoSchema.safeParse(data);
    if (!result.success) {
      console.error(result.error.errors);
      throw new Error("베팅 방 정보를 파싱하는데 실패했습니다.");
    }
    return result.data;
  } catch (error) {
    console.error(error);
    throw error instanceof Error
      ? error
      : new Error("베팅 방 정보를 불러오는데 실패했습니다.");
  }
}

const generateBettingQuery = (roomId: string) =>
  ["betRoom", "info", roomId] as const;

export function useBettingRoomInfo(
  roomId: string,
): UseSuspenseQueryResult<BettingRoomInfo, Error> {
  return useSuspenseQuery<BettingRoomInfo, Error>({
    queryKey: generateBettingQuery(roomId),
    queryFn: () => bettingRoomQueryFn(roomId),
    retry: 2,
  });
}
