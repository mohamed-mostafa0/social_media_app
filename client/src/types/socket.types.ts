import type { Socket } from "socket.io-client";

export interface ServerToClientEvents {
  [event: string]: (...args: unknown[]) => void;
}

export interface ClientToServerEvents {
  [event: string]: (...args: unknown[]) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
  socketId: string | null;
  connect: () => void;
  disconnect: () => void;
}
