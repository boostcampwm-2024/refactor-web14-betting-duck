import { Socket } from "socket.io-client";
import { useCallback } from "react";
import { SocketState } from "../types";

export function useCleanupSocket(
  setSocketState: React.Dispatch<React.SetStateAction<SocketState>>,
) {
  const cleanupSocket = useCallback(
    (socket: Socket) => {
      try {
        socket.offAny(); // 모든 리스너 제거
        socket.disconnect(); // 연결 종료
        setSocketState({
          isConnected: false,
          isReconnecting: false,
          reconnectAttempt: 0,
          error: null,
        });
      } catch (error) {
        console.error("Socket cleanup failed:", error);
      }
    },
    [setSocketState],
  );

  return cleanupSocket;
}
