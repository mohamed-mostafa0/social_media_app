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

  sendVoiceNote: async (targetUserId: string, audioBlob: Blob, duration: number): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append("voice", audioBlob, "voice-note.webm");
    formData.append("targetUserId", targetUserId);
    formData.append("duration", String(duration));

    const res = await apiClient.post("/chat/upload-voice", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data?.data || res.data?.data;
  },
};
