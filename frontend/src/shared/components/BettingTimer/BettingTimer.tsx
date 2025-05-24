import { TimerIcon } from "@/shared/icons";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useSocketIO } from "@/shared/hooks/useSocketIo";
import { BettingRoomInfo } from "@betting-duck/shared";
import { useVotingTimer } from "./hooks/useBettingTimer";

function BettingTimer({
  socket,
  bettingRoomInfo,
}: {
  socket: ReturnType<typeof useSocketIO>;
  bettingRoomInfo: BettingRoomInfo;
}) {
  const { remaining, progress, active, format } = useVotingTimer(
    bettingRoomInfo.channel.metadata,
    socket,
  );

  return (
    <div className="px-4">
      <div className="bg-primary text-layout-main flex w-full flex-col items-start rounded-lg px-4 py-4">
        <div className="flex w-full items-center gap-4">
          <TimerIcon width={24} height={24} />
          <ProgressBar
            label="투표 진행 시간 타이머"
            uses="default"
            max={100}
            value={progress}
          />
        </div>
        <div className="text-lg">
          {active ? format(remaining) : "투표 종료"}
        </div>
      </div>
    </div>
  );
}

export { BettingTimer };
