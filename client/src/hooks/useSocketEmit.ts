"use client";

import { useCallback } from "react";
import { useSocket } from "@/components/providers/SocketProvider";


export function useSocketEmit() {
  const { socket, isConnected } = useSocket();

  const emit = useCallback(
    (event: string, ...args: unknown[]): boolean => {
      if (!socket || !isConnected) {
        console.warn(`[Socket.IO] Cannot emit "${event}": Socket is not connected.`);
        return false;
      }
      socket.emit(event, ...args);
      return true;
    },
    [socket, isConnected]
  );

  return { emit, isConnected };
}
