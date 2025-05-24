import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { bettingRoomQueryKey } from "@/shared/lib/bettingRoomInfo";
import { getBettingRoomInfo } from "@/features/betting-page/api/getBettingRoomInfo";
import { bettingRoomInfoSchema } from "@betting-duck/shared";

export function useChatRoomInfo() {
  const { roomId } = useLoaderData({ from: "/betting_/$roomId/vote" });
  const { data } = useSuspenseQuery({
    queryKey: bettingRoomQueryKey(roomId),
    queryFn: () => getBettingRoomInfo(roomId),
  });

  const parsed = bettingRoomInfoSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("방 정보를 불러오는데 실패했습니다.");
  }
  return { roomId, bettingRoomInfo: parsed.data };
}
