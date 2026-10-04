"use client";

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/SocketProvider";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useChatStore } from "../stores/chat.store";
import { ChatMessage } from "../types/chat.types";
import { chatService } from "../api/chat.service";

export function useChat() {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const loggedInUser = useAuthStore((state) => state.user);
  const {
    activeUser,
    isOpen,
    isMinimized,
    messages,
    openChat,
    closeChat,
    toggleMinimize,
    addMessage,
    setMessages,
  } = useChatStore();

  useEffect(() => {
    if (!activeUser?.id) return;
    let isMounted = true;

    chatService
      .getMessages(activeUser.id)
      .then((history) => {
        if (isMounted) {
          setMessages(history);
        }
      })
      .catch((err) => {
        console.error("[Chat] Failed to load messages:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUser?.id, setMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data: unknown) => {
      const message = data as ChatMessage;
      const currentActive = useChatStore.getState().activeUser;
      if (
        currentActive &&
        (String(message.senderId) === String(currentActive.id) ||
          String(message.senderId) === String(loggedInUser?._id))
      ) {
        addMessage(message);
      }
    };

    socket.on("message-sent", handleIncomingMessage);

    return () => {
      socket.off("message-sent", handleIncomingMessage);
    };
  }, [socket, loggedInUser?._id, addMessage]);


  const sendPrivateMessage = useCallback(
    (text: string) => {
      const trimmedText = text.trim();
      if (!socket || !isConnected || !activeUser || !trimmedText) {
        console.warn("[Chat] Cannot send message: socket disconnected or no active recipient.");
        return false;
      }

      socket.emit("send-private-message", {
        targetUserId: activeUser.id,
        text: trimmedText,
      });

      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });

      return true;
    },
    [socket, isConnected, activeUser, queryClient]
  );


  return {
    socket,
    isConnected,
    activeUser,
    isOpen,
    isMinimized,
    messages,
    loggedInUser,
    openChat,
    closeChat,
    toggleMinimize,
    sendPrivateMessage,
  };
}
