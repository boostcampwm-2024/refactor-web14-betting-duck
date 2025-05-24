import React, { useEffect, useMemo, useReducer, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  SOCKET_URL,
  DEFAULT_SOCKET_STATE,
  DEFAULT_SOCKET_OPTIONS,
} from "./vars";

import type {
  SocketOptions,
  SocketState,
  Action,
  UseSocketReturn,
  SocketEventMap,
} from "./types";

export function socketReducer(state: SocketState, action: Action): SocketState {
  switch (action.type) {
    case "CONNECT_START":
      return {
        ...state,
        isConnected: false,
        isReconnecting: false,
        error: null,
      };
    case "CONNECT_SUCCESS":
      return {
        ...state,
        isConnected: true,
        isReconnecting: false,
        reconnectAttempt: 0,
      };
    case "CONNECT_ERROR":
      return { ...state, error: action.error };
    case "DISCONNECT":
      return { ...state, isConnected: false };
    case "RECONNECT_ATTEMPT":
      return {
        ...state,
        isReconnecting: true,
        reconnectAttempt: action.attempt,
      };
    default:
      return state;
  }
}

export function useSocketIO<E extends SocketEventMap>(
  options: SocketOptions,
): UseSocketReturn<E> {
  const socketRef = React.useRef<Socket>();
  const [token, setToken] = useState<string | null>(null);
  const [socketState, dispatch] = useReducer(
    socketReducer,
    DEFAULT_SOCKET_STATE,
  );

  const cleanupSocket = React.useCallback((socket: Socket) => {
    try {
      socket.offAny();
      socket.disconnect();
      dispatch({ type: "DISCONNECT" });
    } catch (error) {
      console.error("Socket cleanup failed:", error);
    }
  }, []);

  const initializeSocket = React.useCallback(
    (accessToken: string) => {
      if (socketRef.current) {
        cleanupSocket(socketRef.current);
        socketRef.current = undefined;
      }

      const socket = io(
        SOCKET_URL + options.url,
        DEFAULT_SOCKET_OPTIONS(accessToken),
      );

      socket.on("connect", () => {
        dispatch({ type: "CONNECT_SUCCESS" });
        options.onConnect?.();
      });

      socket.on("disconnect", (reason) => {
        dispatch({ type: "DISCONNECT" });
        options.onDisconnect?.(reason);
      });

      socket.on("reconnect_attempt", (attempt) => {
        dispatch({ type: "RECONNECT_ATTEMPT", attempt });
        options.onReconnectAttempt?.(attempt);
      });

      socket.on("connect_error", (error) => {
        dispatch({ type: "CONNECT_ERROR", error });
        options.onError?.(error);
      });

      socket.connect();
      socketRef.current = socket;
      return socket;
    },
    [cleanupSocket, options],
  );

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        dispatch({ type: "CONNECT_START" });
        const response = await fetch("/api/users/token", {
          signal: ac.signal,
        });
        const json = await response.json();
        const { accessToken } = json.data;
        if (!accessToken) {
          throw new Error("Access token이 없어 소켓을 연결할 수 없습니다!");
        }
        setToken(accessToken);
      } catch (error) {
        console.error("Token fetch failed:", error);
        dispatch({
          type: "CONNECT_ERROR",
          error:
            error instanceof Error
              ? error
              : new Error("Unknown error occurred"),
        });
      }
    })();

    return () => {
      ac.abort();
    };
  }, [initializeSocket, cleanupSocket]);

  useEffect(() => {
    if (!token) return;
    const socket = initializeSocket(token);
    return () => {
      cleanupSocket(socket);
      socketRef.current = undefined;
    };
  }, [token, initializeSocket, cleanupSocket]);

  const api = useMemo<UseSocketReturn<E>>(
    () => ({
      socket: socketRef.current || null,
      isConnected: socketState.isConnected,
      isReconnecting: socketState.isReconnecting,
      reconnectAttempt: socketState.reconnectAttempt,
      error: socketState.error,
      emit: <K extends keyof E>(event: K, data: E[K]) => {
        if (socketRef.current?.connected) {
          socketRef.current.emit(event as string, data);
          return true;
        }
        return false;
      },
      on: <K extends keyof E>(event: K, handler: (data: E[K]) => void) => {
        socketRef.current?.on(
          event as string,
          handler as (...args: unknown[]) => void,
        );
        return () => {
          socketRef.current?.off(
            event as string,
            handler as (...args: unknown[]) => void,
          );
        };
      },
      off: <K extends keyof E>(
        event: K,
        handler?: (...args: unknown[]) => void,
      ) => {
        socketRef.current?.off(event as string, handler);
      },
      reconnect: () => {
        if (!socketState.isConnected) {
          socketRef.current?.connect();
        }
      },
      disconnect: () => {
        socketRef.current?.disconnect();
      },
    }),
    [socketState],
  );

  return api;
}
