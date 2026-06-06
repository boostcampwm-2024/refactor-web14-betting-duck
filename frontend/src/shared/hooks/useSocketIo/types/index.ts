import { Socket } from "socket.io-client";

export interface SocketOptions {
  url: string;
  roomId?: string;
  accessToken?: string;
  onConnect?: () => void;
  onDisconnect?: (reason: unknown) => void;
  onError?: (error: Error) => void;
  onReconnectAttempt?: (attempt: number) => void;
  onReconnectFailed?: () => void;
}

export interface SocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempt: number;
  error: Error | null;
}

export type Action =
  | { type: "CONNECT_START" }
  | { type: "CONNECT_SUCCESS" }
  | { type: "CONNECT_ERROR"; error: Error }
  | { type: "DISCONNECT" }
  | { type: "RECONNECT_ATTEMPT"; attempt: number };

export type SocketEventMap = Record<string, unknown>;

export interface UseSocketReturn<E extends SocketEventMap> extends SocketState {
  socket: Socket | null;
  emit: <K extends keyof E>(
    event: K,
    data: E[K],
    options?: { volatile?: boolean },
  ) => boolean;
  on: <K extends keyof E>(
    event: K,
    handler: (data: E[K]) => void,
  ) => () => void;
  off: <K extends keyof E>(
    event: K,
    handler?: (...args: unknown[]) => void,
  ) => void;
  reconnect: () => void;
  disconnect: () => void;
}
