import { UserInfo } from "@betting-duck/shared";
import { useSocketIO } from "@/shared/hooks/useSocketIo";

export type ChatContextType = {
  socket: ReturnType<typeof useSocketIO>;
  userInfo: UserInfo;
};
