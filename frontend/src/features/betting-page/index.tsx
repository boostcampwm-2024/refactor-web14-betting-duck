import { BettingContainer } from "./ui/BettingContainer";
import { BettingTimer } from "@/shared/components/BettingTimer/BettingTimer";
import { BettingSharedLink } from "@/shared/components/BettingSharedLink/BettingSharedLink";
import { useLayoutShift } from "@/shared/hooks/useLayoutShift";
import { usePreventLeave } from "@/shared/hooks/usePreventLeave";
import { useBettingSocket } from "./hook/useBettingSocket";
import { useBettingRoomInfo } from "@/shared/hooks/useBettingRoomInfo";
import { useParams } from "@tanstack/react-router";
import { Suspense } from "react";
import { LoadingAnimation } from "@/shared/components/Loading";

function BettingPageContent() {
  useLayoutShift();
  const { roomId } = useParams({
    from: "/betting_/$roomId/vote/voting",
  });
  const { data: bettingRoomInfo } = useBettingRoomInfo(roomId);
  const bettingSocket = useBettingSocket(bettingRoomInfo?.channel);
  usePreventLeave(
    true,
    "베팅 페이지에서 벗어나면 베팅이 취소됩니다. 정말로 나가시겠습니까?",
  );

  return (
    <div className="flex w-[100cqw] flex-col">
      <BettingTimer socket={bettingSocket} bettingRoomInfo={bettingRoomInfo} />
      <BettingContainer
        socket={bettingSocket}
        bettingRoomInfo={bettingRoomInfo}
      />
      <BettingSharedLink />
    </div>
  );
}

function BettingPage() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <BettingPageContent />
    </Suspense>
  );
}

export { BettingPage };
