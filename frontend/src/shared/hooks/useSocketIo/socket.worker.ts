import { io, Socket } from "socket.io-client";
import { retryWithBackoff } from "./retry";

interface SharedWorkerGlobalScope {
  onconnect: (event: MessageEvent) => void;
}
declare const self: SharedWorkerGlobalScope & typeof globalThis;

interface SocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempt: number;
  error: string | null;
}

interface SocketConnection {
  socket: Socket;
  refCount: number;
  ports: Set<MessagePort>;
  state: SocketState;
  isConnecting: boolean;
}

const connections = new Map<string, SocketConnection>();
const activePorts = new Set<MessagePort>();

interface WorkerStateChangeMessage {
  type: "STATE_CHANGE";
  payload: {
    connectionKey: string;
    state: SocketState;
  };
}

interface WorkerEventMessage {
  type: "EVENT";
  payload: {
    connectionKey: string;
    eventName: string;
    data: unknown;
  };
}

type WorkerOutgoingMessage = WorkerStateChangeMessage | WorkerEventMessage;

interface ConnectPayload {
  connectionKey: string;
  url: string;
  accessToken: string;
  socketUrl: string;
  defaultOptions: Record<string, unknown>;
}

interface EmitPayload {
  connectionKey: string;
  eventName: string;
  data: unknown;
  isVolatile?: boolean;
}

interface DisconnectPayload {
  connectionKey: string;
}

function connectSocketPromise(socket: Socket): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (socket.connected) {
      return resolve();
    }

    const onConnect = () => {
      cleanup();
      resolve();
    };

    const onConnectError = (err: Error) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    };

    socket.once("connect", onConnect);
    socket.once("connect_error", onConnectError);

    socket.connect();
  });
}

async function startSocketConnectionWithBackoff(
  connectionKey: string,
  conn: SocketConnection,
) {
  if (conn.isConnecting || conn.socket.connected) return;
  conn.isConnecting = true;
  conn.state.isReconnecting = true;

  broadcastToKey(connectionKey, {
    type: "STATE_CHANGE",
    payload: { connectionKey, state: conn.state },
  });

  try {
    await retryWithBackoff(() => connectSocketPromise(conn.socket), {
      maxAttempts: 5,
      initialDelayMs: 2000,
      maxDelayMs: 10000,
      shouldRetryOnError: () => true,
      onRetry: (attempt) => {
        conn.state.reconnectAttempt = attempt;
        broadcastToKey(connectionKey, {
          type: "STATE_CHANGE",
          payload: { connectionKey, state: conn.state },
        });
      },
    });

    conn.state.isConnected = true;
    conn.state.isReconnecting = false;
    conn.state.reconnectAttempt = 0;
    conn.state.error = null;

    broadcastToKey(connectionKey, {
      type: "STATE_CHANGE",
      payload: { connectionKey, state: conn.state },
    });
  } catch (error) {
    console.error(
      `Socket connection to ${connectionKey} exhausted retry attempts:`,
      error,
    );
    conn.state.error =
      error instanceof Error ? error.message : "Connection failed";
    conn.state.isConnected = false;
    conn.state.isReconnecting = false;

    broadcastToKey(connectionKey, {
      type: "STATE_CHANGE",
      payload: { connectionKey, state: conn.state },
    });
  } finally {
    conn.isConnecting = false;
  }
}

function setupSocketListeners(connectionKey: string, conn: SocketConnection) {
  const { socket } = conn;

  socket.on("connect", () => {
    conn.state.isConnected = true;
    conn.state.isReconnecting = false;
    conn.state.reconnectAttempt = 0;
    conn.state.error = null;
    broadcastToKey(connectionKey, {
      type: "STATE_CHANGE",
      payload: { connectionKey, state: conn.state },
    });
  });

  socket.on("disconnect", (reason) => {
    conn.state.isConnected = false;
    broadcastToKey(connectionKey, {
      type: "STATE_CHANGE",
      payload: { connectionKey, state: conn.state },
    });

    // If disconnected unexpectedly, trigger manual backoff reconnect sequence
    if (reason === "io server disconnect" || reason === "transport close") {
      startSocketConnectionWithBackoff(connectionKey, conn);
    }
  });

  // Forward all socket events from the server to connected client ports
  socket.onAny((eventName: string, ...args: unknown[]) => {
    broadcastToKey(connectionKey, {
      type: "EVENT",
      payload: { connectionKey, eventName, data: args[0] },
    });
  });
}

function broadcastToKey(connectionKey: string, message: WorkerOutgoingMessage) {
  const conn = connections.get(connectionKey);
  if (!conn) return;
  for (const port of conn.ports) {
    try {
      port.postMessage(message);
    } catch (e) {
      console.error("Failed to post message to tab port", e);
    }
  }
}

self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  activePorts.add(port);

  port.onmessage = (event: MessageEvent) => {
    const message = event.data as {
      type: string;
      payload: unknown;
    };
    const { type, payload } = message;

    switch (type) {
      case "CONNECT": {
        const { connectionKey, url, accessToken, socketUrl, defaultOptions } =
          payload as ConnectPayload;
        let conn = connections.get(connectionKey);

        if (!conn) {
          // Disable native Socket.io reconnection; we handle it using retryWithBackoff
          const socket = io(socketUrl + url, {
            ...defaultOptions,
            reconnection: false,
            auth: { token: accessToken },
          });

          conn = {
            socket,
            refCount: 0,
            ports: new Set<MessagePort>(),
            state: {
              isConnected: false,
              isReconnecting: false,
              reconnectAttempt: 0,
              error: null,
            },
            isConnecting: false,
          };

          setupSocketListeners(connectionKey, conn);
          connections.set(connectionKey, conn);
        }

        if (!conn.ports.has(port)) {
          conn.ports.add(port);
          conn.refCount += 1;
        }

        if (!conn.socket.connected) {
          startSocketConnectionWithBackoff(connectionKey, conn);
        } else {
          port.postMessage({
            type: "STATE_CHANGE",
            payload: { connectionKey, state: conn.state },
          });
        }
        break;
      }

      case "EMIT": {
        const {
          connectionKey,
          eventName,
          data: emitData,
          isVolatile,
        } = payload as EmitPayload;
        const conn = connections.get(connectionKey);
        if (conn?.socket.connected) {
          if (isVolatile) {
            conn.socket.volatile.emit(eventName, emitData);
          } else {
            conn.socket.emit(eventName, emitData);
          }
        }
        break;
      }

      case "DISCONNECT": {
        const { connectionKey } = payload as DisconnectPayload;
        cleanupPortFromConnection(port, connectionKey);
        break;
      }

      case "CLOSE_PORT": {
        // Tab is closing or unmounting, clean up from all connections it holds
        for (const [key, conn] of connections.entries()) {
          if (conn.ports.has(port)) {
            cleanupPortFromConnection(port, key);
          }
        }
        activePorts.delete(port);
        break;
      }
    }
  };

  port.start();
};

function cleanupPortFromConnection(port: MessagePort, connectionKey: string) {
  const conn = connections.get(connectionKey);
  if (!conn) return;

  if (conn.ports.has(port)) {
    conn.ports.delete(port);
    conn.refCount -= 1;
  }

  if (conn.refCount <= 0) {
    conn.socket.offAny();
    conn.socket.disconnect();
    connections.delete(connectionKey);
  }
}
