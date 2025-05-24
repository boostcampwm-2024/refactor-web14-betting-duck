import { useLayoutShift } from "@/shared/hooks/useLayoutShift";
import { BettingStatistics } from "./ui/Bettingstatistics";
import { AdminBettingResult } from "./ui/AdminBettingResult";
import { getBettingSummary } from "@/shared/utils/bettingOdds";
import { usePredictDetailData } from "./hooks/usePredictDetailData";
import { PersonalResult } from "./ui/PersonalResult";
import { FooterSelector } from "./ui/FooterSelector";
import { PredictDetailHeader } from "./ui/PredictDetailHeader";

function PredictDetail() {
  useLayoutShift();
  const { bettingRoomInfo, userInfo, betResults, personalBetResult } =
    usePredictDetailData();
  const { channel } = bettingRoomInfo;

  const myoption: "option1" | "option2" = personalBetResult.selectedOption;
  const myresult = myoption === betResults.winning_option ? "win" : "lose";

  const getWinningOptionName = () =>
    bettingRoomInfo.channel.options[betResults.winning_option].name;

  const summary = getBettingSummary({
    option1: {
      participants: betResults.option_1_total_participants,
      totalAmount: betResults.option_1_total_bet,
    },
    option2: {
      participants: betResults.option_2_total_participants,
      totalAmount: betResults.option_2_total_bet,
    },
  });
  const personalBettingMultiplier = summary[myoption].multiplier;

  return (
    <div className="bg-layout-main flex h-full w-full flex-col items-center justify-between gap-4">
      <PredictDetailHeader
        title={channel.title}
        winningOptionName={getWinningOptionName()}
      />

      <BettingStatistics betResults={betResults} channel={channel} />

      <AdminBettingResult
        winningOption={betResults.winning_option}
        winner={
          betResults.winning_option === "option1"
            ? channel.options.option1.name
            : channel.options.option2.name
        }
        winnerCount={
          betResults.winning_option === "option1"
            ? betResults.option_1_total_participants
            : betResults.option_2_total_participants
        }
      />

      <PersonalResult
        winningOption={betResults.winning_option}
        betAmount={personalBetResult.betAmount}
        myOption={myoption}
        myResult={myresult}
        personalMultiplier={personalBettingMultiplier}
        optionName={
          myoption === "option1"
            ? channel.options.option1.name
            : channel.options.option2.name
        }
      />

      <div>
        <FooterSelector role={userInfo.role} />
        <div className="bg-layout-main h-[60px] w-[100cqw]" />
      </div>
    </div>
  );
}

export { PredictDetail };
