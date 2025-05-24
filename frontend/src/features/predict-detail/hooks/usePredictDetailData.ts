import { useParams, useLoaderData, useNavigate } from "@tanstack/react-router";
import { useBettingRoomInfo } from "@/shared/hooks/useBettingRoomInfo";
import { useUserInfo } from "@/shared/hooks/useUserInfo";

export function usePredictDetailData() {
  const { roomId } = useParams({ from: "/betting_/$roomId/vote/resultDetail" });
  const navigate = useNavigate();
  const { data: bettingRoomInfo } = useBettingRoomInfo(roomId);
  const { data: userInfo } = useUserInfo();
  const loaderData = useLoaderData({
    from: "/betting_/$roomId/vote/resultDetail",
  });

  const { betResults, personalBetResult } = loaderData;
  if (!betResults || !personalBetResult) {
    navigate({ to: "/my-page" });
  }

  return { bettingRoomInfo, userInfo, betResults, personalBetResult };
}
