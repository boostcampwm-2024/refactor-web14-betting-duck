import { createFileRoute, redirect } from "@tanstack/react-router";
import { BettingPage } from "@/pages/betting-page";
import { getBettingRoomInfo } from "@/pages/betting-page/api/getBettingRoomInfo";

export const Route = createFileRoute("/betting_/$roomId/vote/voting")({
  component: BettingPage,
  beforeLoad: async ({ params }) => {
    const { roomId } = params;

    const bettingRoomInfo = await getBettingRoomInfo(roomId);

    if (bettingRoomInfo?.channel.isAdmin) {
      throw redirect({
        to: "/betting/$roomId/vote/admin",
        params: { roomId },
      });
    }
  },
});
