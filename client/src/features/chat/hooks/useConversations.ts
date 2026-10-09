"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { chatService } from "../api/chat.service";
import { ConversationItem } from "../types/chat.types";

export function useConversations() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const isAuth = useAuthStore((state) => state.isAuth);

  const query = useQuery<ConversationItem[]>({
    queryKey: ["chat-conversations"],
    queryFn: chatService.getConversations,
    enabled: isAuth,
    staleTime: 1000 * 20,
  });

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    };

    const handleUserStatus = (data: unknown) => {
      const status = data as { userId: string; isOnline: boolean };
      if (!status?.userId) return;

      queryClient.setQueryData<ConversationItem[]>(["chat-conversations"], (old) => {
        if (!old) return old;
        return old.map((conv) => {
          if (conv.otherUser._id === status.userId) {
            return {
              ...conv,
              otherUser: {
                ...conv.otherUser,
                isOnline: status.isOnline,
              },
            };
          }
          return conv;
        });
      });
    };

    socket.on("conversation-updated", handleUpdate);
    socket.on("message-sent", handleUpdate);
    socket.on("user-status", handleUserStatus);

    return () => {
      socket.off("conversation-updated", handleUpdate);
      socket.off("message-sent", handleUpdate);
      socket.off("user-status", handleUserStatus);
    };
  }, [socket, queryClient]);

  return query;
}
