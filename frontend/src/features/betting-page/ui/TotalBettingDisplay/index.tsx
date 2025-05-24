import { z } from "zod";
import { useSocketIO } from "@/shared/hooks/useSocketIo";
import { responseBetRoomInfo } from "@betting-duck/shared";
import { useBettingSummary } from "./hooks/useBettingSummary";
import { PercentageDisplay } from "@/shared/components/PercentageDisplay/PercentageDisplay";
import { BettingStatsDisplay } from "@/shared/components/BettingStatsDisplay/BettingStatsDisplay";

function TotalBettingDisplay({
  channel,
  socket,
}: {
  channel: z.infer<typeof responseBetRoomInfo>["channel"];
  socket: ReturnType<typeof useSocketIO>;
}) {
  const bettingSummary = useBettingSummary(socket);

  return (
    <div className="flex w-full justify-around">
      <div className="flex w-full max-w-[45cqw] justify-between">
        <BettingStatsDisplay
          stats={bettingSummary.option1}
          content={channel.options.option1.name}
          uses="winning"
          className="min-w-[35cqw]"
        >
          <PercentageDisplay
            index={0}
            percentage={parseInt(bettingSummary.option1Percentage)}
          />
        </BettingStatsDisplay>
      </div>
      <div className="flex w-full max-w-[45cqw] justify-between">
        <BettingStatsDisplay
          stats={bettingSummary.option2}
          content={channel.options.option2.name}
          uses="losing"
          className="min-w-[35cqw]"
        >
          <PercentageDisplay
            index={1}
            percentage={parseInt(bettingSummary.option2Percentage)}
          />
        </BettingStatsDisplay>
      </div>
    </div>
  );
}

export { TotalBettingDisplay };
