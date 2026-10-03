"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import type { AppSocket, SocketContextValue } from "@/types/socket.types";

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const isAuth = useAuthStore((state) => state.isAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [socket] = useState<AppSocket | null>(() => {
    if (typeof window === "undefined") return null;
    return getSocket();
  });

  const [isConnected, setIsConnected] = useState<boolean>(() =>
    Boolean(socket?.connected)
  );
  const [socketId, setSocketId] = useState<string | null>(
    () => socket?.id ?? null
  );

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id ?? null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
    };

    const onConnectError = (error: Error) => {
      console.warn("[Socket.IO] Connection error:", error.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    if (isAuth && accessToken) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [socket, isAuth, accessToken]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      isConnected,
      socketId,
      connect: () => {
        connectSocket();
      },
      disconnect: () => {
        disconnectSocket();
      },
    }),
    [socket, isConnected, socketId]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
