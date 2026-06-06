import { useSocketIO } from "@/shared/hooks/useSocketIo";
import { useParams } from "@tanstack/react-router";
import type { ChatContextType } from "../types";
import { useUserInfo } from "@/shared/hooks/useUserInfo";
import { createContext, useCallback } from "react";
import { DEFAULT_USERINFO } from "@/shared/constants";

const ChatContext = createContext<ChatContextType | null>(null);

function ChatProvider({ children }: { children: React.ReactNode }) {
  const { roomId } = useParams({
    from: "/betting_/$roomId/vote",
  });
  const { data: userInfo = DEFAULT_USERINFO } = useUserInfo();
  const socket = useSocketIO({
    url: "/api/chat",
    roomId,
    onConnect: () => {
      console.log("채팅 메세지 소켓에 연결이 되었습니다.");
      joinChatRoom();
    },
    onDisconnect: (reason) => {
      console.log("채팅 메세지 소켓 연결이 끊겼습니다.", reason);
    },
  });

  const joinChatRoom = useCallback(() => {
    if (socket.isConnected) {
      socket.emit("joinRoom", {
        sender: {
          nickname: userInfo.nickname,
        },
        channel: {
          roomId: roomId,
        },
        message: `${roomId} 방에 ${userInfo.nickname} 님이 입장하셨습니다.`,
      });
    }
  }, [userInfo.nickname, roomId, socket]);

  return (
    <ChatContext.Provider value={{ socket, userInfo }}>
      {children}
    </ChatContext.Provider>
  );
}

export { ChatProvider, ChatContext };
