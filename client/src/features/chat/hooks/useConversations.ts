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

    socket.on("conversation-updated", handleUpdate);
    socket.on("message-sent", handleUpdate);

    return () => {
      socket.off("conversation-updated", handleUpdate);
      socket.off("message-sent", handleUpdate);
    };
  }, [socket, queryClient]);

  return query;
}
