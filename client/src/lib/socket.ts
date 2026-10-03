import { io } from "socket.io-client";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import type { AppSocket } from "@/types/socket.types";

let socket: AppSocket | null = null;

const getSocketUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000"
  );
};

export const getSocket = (): AppSocket => {
  if (typeof window === "undefined") {
    return {} as AppSocket;
  }

  if (!socket) {
    const socketUrl = getSocketUrl();

    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: (cb) => {
        const token = useAuthStore.getState().accessToken;
        cb({ token });
      },
    });
  }

  return socket;
};

export const connectSocket = (): AppSocket | null => {
  if (typeof window === "undefined") return null;

  const currentSocket = getSocket();
  const token = useAuthStore.getState().accessToken;

  currentSocket.auth = { token };

  if (!currentSocket.connected) {
    currentSocket.connect();
  }

  return currentSocket;
};

export const disconnectSocket = () => {
  if (typeof window === "undefined") return;

  if (socket && socket.connected) {
    socket.disconnect();
  }
};
