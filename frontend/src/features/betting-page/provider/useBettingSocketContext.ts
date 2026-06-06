import { useContext } from "react";
import { BettingContext } from "./BettingProvider";
import { useSocketIO } from "@/shared/hooks/useSocketIo";

export function useBettingSocketContext() {
  const context = useContext(BettingContext);
  if (!context || !context.socket) {
    throw new Error(
      "useBettingSocketContext must be used within a BettingProvider",
    );
  }
  return context.socket as ReturnType<typeof useSocketIO>;
}
