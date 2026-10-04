import { apiClient } from "@/lib/axios";
import { ChatMessage, ConversationItem } from "../types/chat.types";

export const chatService = {
  getConversations: async (): Promise<ConversationItem[]> => {
    const res = await apiClient.get("/chat/conversations");
    return res.data?.data?.data || [];
  },

  getMessages: async (targetUserId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get(`/chat/messages/${targetUserId}`);
    return res.data?.data?.data || [];
  },
};
