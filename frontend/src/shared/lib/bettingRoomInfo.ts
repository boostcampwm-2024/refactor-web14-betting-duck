import { useSuspenseQuery } from "@tanstack/react-query";
import { getBettingRoomInfo } from "@/pages/betting-page/api/getBettingRoomInfo";

export const bettingRoomQueryKey = (roomId: string) => ["bettingRoom", roomId];

export function useBettingRoomQuery(roomId: string) {
  return useSuspenseQuery({
    queryKey: bettingRoomQueryKey(roomId),
    queryFn: () => getBettingRoomInfo(roomId),
  });
}
