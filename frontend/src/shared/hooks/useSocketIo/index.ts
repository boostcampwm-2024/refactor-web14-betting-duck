import { useEffect, useMemo, useReducer, useState, useRef } from "react";
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

interface TrustedScriptURL {
  readonly brand: unique symbol;
}

interface TrustedTypePolicy {
  createScriptURL(input: string): TrustedScriptURL;
}

interface TrustedTypesWindow extends Window {
  trustedTypes?: {
    createPolicy(
      policyName: string,
      rules: { createScriptURL: (input: string) => string },
    ): TrustedTypePolicy;
  };
}

interface CustomSharedWorker {
  port: MessagePort;
}

declare const SharedWorker: {
  prototype: CustomSharedWorker;
  new (
    stringUrl: string | URL | TrustedScriptURL,
    options?: string | WorkerOptions,
  ): CustomSharedWorker;
};

interface WorkerState {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempt: number;
  error: string | null;
}

interface WorkerMessagePayload {
  connectionKey: string;
  state?: WorkerState;
  eventName?: string;
  data?: unknown;
}

interface WorkerMessage {
  type: string;
  payload: WorkerMessagePayload;
}

const win =
  typeof window !== "undefined"
    ? (window as unknown as TrustedTypesWindow)
    : null;

const workerPolicy = win?.trustedTypes?.createPolicy("socketWorkerPolicy", {
  createScriptURL: (input: string) => {
    const origin = win?.location.origin || "";
    const parsedUrl = new URL(input, origin);

    if (parsedUrl.origin !== origin) {
      throw new Error("XSS Prevention: Cross-origin workers are not allowed.");
    }
    return parsedUrl.href;
  },
});

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
  const [token, setToken] = useState<string | null>(null);
  const [socketState, dispatch] = useReducer(
    socketReducer,
    DEFAULT_SOCKET_STATE,
  );

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const isSharedWorkerSupported = typeof SharedWorker !== "undefined";

  const workerRef = useRef<CustomSharedWorker>();
  const localSocketRef = useRef<Socket>();
  const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(
    new Map(),
  );

  const connectionKey = useMemo(() => {
    return `${options.url}${options.roomId ? `?roomId=${options.roomId}` : ""}`;
  }, [options.url, options.roomId]);

  // Fetch auth token
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
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    function setupLocalSocket(accessToken: string) {
      if (localSocketRef.current) {
        cleanupLocalSocket();
      }

      const socket = io(
        SOCKET_URL + optionsRef.current.url,
        DEFAULT_SOCKET_OPTIONS(accessToken),
      );

      socket.on("connect", () => {
        dispatch({ type: "CONNECT_SUCCESS" });
        optionsRef.current.onConnect?.();
      });

      socket.on("disconnect", (reason) => {
        dispatch({ type: "DISCONNECT" });
        optionsRef.current.onDisconnect?.(reason);
      });

      socket.on("reconnect_attempt", (attempt) => {
        dispatch({ type: "RECONNECT_ATTEMPT", attempt });
        optionsRef.current.onReconnectAttempt?.(attempt);
      });

      socket.on("connect_error", (error) => {
        dispatch({ type: "CONNECT_ERROR", error });
        optionsRef.current.onError?.(error);
      });

      socket.onAny((eventName: string, ...args: unknown[]) => {
        const handlers = listenersRef.current.get(eventName);
        if (handlers) {
          for (const handler of handlers) {
            handler(args[0]);
          }
        }
      });

      socket.connect();
      localSocketRef.current = socket;
    }

    if (isSharedWorkerSupported) {
      try {
        const workerUrl = new URL("./socket.worker.ts", import.meta.url).href;

        const trustedWorkerUrl = workerPolicy
          ? workerPolicy.createScriptURL(workerUrl)
          : workerUrl;

        const worker = new SharedWorker(trustedWorkerUrl, { type: "module" });
        workerRef.current = worker;

        worker.port.onmessage = (event: MessageEvent) => {
          const message = event.data as WorkerMessage;
          const { type, payload } = message;
          if (payload.connectionKey !== connectionKey) return;

          switch (type) {
            case "STATE_CHANGE": {
              const state = payload.state;
              if (!state) return;
              if (state.isConnected && !socketState.isConnected) {
                dispatch({ type: "CONNECT_SUCCESS" });
                optionsRef.current.onConnect?.();
              } else if (!state.isConnected && socketState.isConnected) {
                dispatch({ type: "DISCONNECT" });
                optionsRef.current.onDisconnect?.("io server disconnect");
              }

              if (state.isReconnecting) {
                dispatch({
                  type: "RECONNECT_ATTEMPT",
                  attempt: state.reconnectAttempt,
                });
                optionsRef.current.onReconnectAttempt?.(state.reconnectAttempt);
              }

              if (state.error) {
                const err = new Error(state.error);
                dispatch({ type: "CONNECT_ERROR", error: err });
                optionsRef.current.onError?.(err);
              }
              break;
            }

            case "EVENT": {
              const eventName = payload.eventName;
              const eventData = payload.data;
              if (!eventName) return;
              const handlers = listenersRef.current.get(eventName);
              if (handlers) {
                for (const handler of handlers) {
                  handler(eventData);
                }
              }
              break;
            }
          }
        };

        worker.port.start();

        worker.port.postMessage({
          type: "CONNECT",
          payload: {
            connectionKey,
            url: options.url,
            accessToken: token,
            socketUrl: SOCKET_URL,
            defaultOptions: DEFAULT_SOCKET_OPTIONS(token),
          },
        });

        return () => {
          worker.port.postMessage({
            type: "CLOSE_PORT",
            payload: { connectionKey },
          });
          worker.port.close();
          workerRef.current = undefined;
        };
      } catch (err) {
        console.error(
          "SharedWorker initialization failed, falling back to local socket:",
          err,
        );
        setupLocalSocket(token);
        return () => cleanupLocalSocket();
      }
    } else {
      setupLocalSocket(token);
      return () => cleanupLocalSocket();
    }
  }, [
    token,
    connectionKey,
    isSharedWorkerSupported,
    options.url,
    socketState.isConnected,
  ]);

  function cleanupLocalSocket() {
    if (localSocketRef.current) {
      try {
        localSocketRef.current.offAny();
        localSocketRef.current.disconnect();
      } catch (error) {
        console.error("Local socket cleanup failed:", error);
      }
      localSocketRef.current = undefined;
      dispatch({ type: "DISCONNECT" });
    }
  }

  const api = useMemo<UseSocketReturn<E>>(() => {
    return {
      socket: localSocketRef.current || null,
      isConnected: socketState.isConnected,
      isReconnecting: socketState.isReconnecting,
      reconnectAttempt: socketState.reconnectAttempt,
      error: socketState.error,

      emit: (event, data, emitOptions) => {
        if (workerRef.current) {
          workerRef.current.port.postMessage({
            type: "EMIT",
            payload: {
              connectionKey,
              eventName: event as string,
              data,
              isVolatile: emitOptions?.volatile,
            },
          });
          return true;
        }
        if (localSocketRef.current?.connected) {
          if (emitOptions?.volatile) {
            localSocketRef.current.volatile.emit(event as string, data);
          } else {
            localSocketRef.current.emit(event as string, data);
          }
          return true;
        }
        return false;
      },

      on: (event, handler) => {
        const eventName = event as string;
        let handlers = listenersRef.current.get(eventName);
        if (!handlers) {
          handlers = new Set();
          listenersRef.current.set(eventName, handlers);
        }

        handlers.add(handler as (data: unknown) => void);

        return () => {
          const currentHandlers = listenersRef.current.get(eventName);
          if (currentHandlers) {
            currentHandlers.delete(handler as (data: unknown) => void);
            if (currentHandlers.size === 0) {
              listenersRef.current.delete(eventName);
            }
          }
        };
      },

      off: (event, handler) => {
        const eventName = event as string;
        if (handler) {
          const currentHandlers = listenersRef.current.get(eventName);
          if (currentHandlers) {
            currentHandlers.delete(handler as (data: unknown) => void);
            if (currentHandlers.size === 0) {
              listenersRef.current.delete(eventName);
            }
          }
        } else {
          listenersRef.current.delete(eventName);
        }
      },

      reconnect: () => {
        if (workerRef.current) {
          workerRef.current.port.postMessage({
            type: "CONNECT",
            payload: {
              connectionKey,
              url: optionsRef.current.url,
              accessToken: token,
              socketUrl: SOCKET_URL,
              defaultOptions: DEFAULT_SOCKET_OPTIONS(token || ""),
            },
          });
        } else if (localSocketRef.current && !socketState.isConnected) {
          localSocketRef.current.connect();
        }
      },

      disconnect: () => {
        if (workerRef.current) {
          workerRef.current.port.postMessage({
            type: "DISCONNECT",
            payload: { connectionKey },
          });
        } else if (localSocketRef.current) {
          localSocketRef.current.disconnect();
        }
      },
    };
  }, [socketState, connectionKey, token]);

  return api;
}
