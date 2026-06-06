import { cn } from "@/shared/misc";
import { TotalBettingDisplay } from "./TotalBettingDisplay";
import { BettingHeader } from "./BettingHeader";
import { BettingInput } from "./BettingInput";
import { BettingFooter } from "./BettingFooter";
import { BettingRoomInfo } from "@betting-duck/shared";
import { useBettingSocketContext } from "../provider/useBettingSocketContext";

function BettingContainer({
  bettingRoomInfo,
}: {
  bettingRoomInfo: BettingRoomInfo;
}) {
  const { channel } = bettingRoomInfo;
  const socket = useBettingSocketContext();

  return (
    <div
      className={cn(
        "betting-container",
        "bg-layout-main h-full min-w-[70cqw] p-6",
      )}
    >
      <div className="flex h-full flex-col justify-around">
        <BettingHeader socket={socket} content={channel.title} />
        <TotalBettingDisplay socket={socket} channel={channel} />
        <div className="flex justify-around">
          <BettingInput
            key={"winning-betting-input"}
            uses={"winning"}
            bettingRoomInfo={bettingRoomInfo}
          />
          <BettingInput
            key={"losing-betting-input"}
            uses={"losing"}
            bettingRoomInfo={bettingRoomInfo}
          />
        </div>
        <BettingFooter bettingRoomInfo={bettingRoomInfo} />
      </div>
    </div>
  );
}

export { BettingContainer };
