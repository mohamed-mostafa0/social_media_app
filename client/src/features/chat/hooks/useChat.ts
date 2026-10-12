"use client";

import { useEffect, useCallback, useState, useRef } from "react";
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

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsOtherUserTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [activeUser?.id]);

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
      const isChatOpen = useChatStore.getState().isOpen && !useChatStore.getState().isMinimized;

      if (
        currentActive &&
        (String(message.senderId) === String(currentActive.id) ||
          String(message.senderId) === String(loggedInUser?._id))
      ) {
        addMessage(message);

        if (isChatOpen && String(message.senderId) === String(currentActive.id) && message.conversationId) {
          socket.emit("mark-seen", {
            conversationId: message.conversationId,
            senderId: currentActive.id,
          });
        }
      }
    };

    const handleMessagesSeen = (data: unknown) => {
      const payload = data as { conversationId: string; seenAt: string };
      if (payload?.conversationId) {
        useChatStore.getState().markMessagesAsSeen(payload.conversationId, payload.seenAt);
      }
    };

    const handleUserStatus = (data: unknown) => {
      const status = data as { userId: string; isOnline: boolean };
      if (status?.userId) {
        useChatStore.getState().setActiveUserOnline(status.userId, status.isOnline);
      }
    };

    const handleUserTyping = (data: unknown) => {
      const payload = data as { userId: string; isTyping: boolean };
      const currentActive = useChatStore.getState().activeUser;
      if (currentActive && String(payload?.userId) === String(currentActive.id)) {
        setIsOtherUserTyping(Boolean(payload.isTyping));

        if (payload.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, 3500);
        }
      }
    };

    socket.on("message-sent", handleIncomingMessage);
    socket.on("messages-seen", handleMessagesSeen);
    socket.on("user-status", handleUserStatus);
    socket.on("user-typing", handleUserTyping);

    return () => {
      socket.off("message-sent", handleIncomingMessage);
      socket.off("messages-seen", handleMessagesSeen);
      socket.off("user-status", handleUserStatus);
      socket.off("user-typing", handleUserTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, loggedInUser?._id, addMessage]);

  useEffect(() => {
    if (!socket || !isConnected || !isOpen || isMinimized || !activeUser?.id || messages.length === 0) return;

    const hasUnread = messages.some(
      (m) => String(m.senderId) === String(activeUser.id) && m.status !== "seen"
    );

    if (hasUnread && messages[0]?.conversationId) {
      socket.emit("mark-seen", {
        conversationId: messages[0].conversationId,
        senderId: activeUser.id,
      });
    }
  }, [socket, isConnected, isOpen, isMinimized, activeUser?.id, messages]);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !isConnected || !activeUser?.id) return;
      socket.emit("typing", {
        targetUserId: activeUser.id,
        isTyping,
      });
    },
    [socket, isConnected, activeUser?.id]
  );

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
    isOtherUserTyping,
    emitTyping,
    openChat,
    closeChat,
    toggleMinimize,
    sendPrivateMessage,
  };
}

