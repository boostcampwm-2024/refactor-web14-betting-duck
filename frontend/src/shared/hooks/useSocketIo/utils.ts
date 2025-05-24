import { SocketState, Action } from "./types";

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
