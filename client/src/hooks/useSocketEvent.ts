"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/components/providers/SocketProvider";

export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void
) {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket || !event) return;

    const listener = (data: unknown) => {
      handlerRef.current?.(data as T);
    };

    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
}
