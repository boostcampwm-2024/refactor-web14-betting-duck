import { useSocketIO } from "@/shared/hooks/useSocketIo";
import { getBettingSummary } from "@/shared/utils/bettingOdds";
import { bettingProgressInfoSchema } from "@betting-duck/shared";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_BETTING_SUMMARY = {
  totalParticipants: 0,
  totalAmount: 0,
  option1Percentage: "0",
  option2Percentage: "0",
  option1: {
    participants: 0,
    totalAmount: 0,
    multiplier: 0,
    returnRate: 0,
  },
  option2: {
    participants: 0,
    totalAmount: 0,
    multiplier: 0,
    returnRate: 0,
  },
};

export function useBettingSummary(socket: ReturnType<typeof useSocketIO>) {
  const [bettingSummary, setBettingSummary] = useState<
    ReturnType<typeof getBettingSummary>
  >(DEFAULT_BETTING_SUMMARY);

  const onFetchBetRoomInfo = useCallback((data: unknown) => {
    const parsedData = bettingProgressInfoSchema.safeParse(data);
    if (!parsedData.success) return;
    const { channel } = parsedData.data;

    const summary = getBettingSummary({
      option1: {
        totalAmount: channel.option1.currentBets,
        participants: channel.option1.participants,
      },
      option2: {
        totalAmount: channel.option2.currentBets,
        participants: channel.option2.participants,
      },
    });
    setBettingSummary(summary);
  }, []);

  useEffect(() => {
    socket.on("fetchBetRoomInfo", onFetchBetRoomInfo);
    return () => {
      socket.off("fetchBetRoomInfo");
    };
  }, [socket, onFetchBetRoomInfo]);

  return bettingSummary;
}
