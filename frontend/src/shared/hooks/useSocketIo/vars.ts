import { config } from "@shared/config/environment";

export const SOCKET_URL = config.socketUrl;

export const DEFAULT_SOCKET_STATE = {
  isConnected: false,
  isReconnecting: false,
  reconnectAttempt: 0,
  error: null,
} as const;

export const DEFAULT_SOCKET_OPTIONS = (accessToken: string) => ({
  withCredentials: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  autoConnect: false,
  transports: ["websocket"],
  auth: {
    token: accessToken,
  },
});
