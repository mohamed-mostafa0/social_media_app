import { create } from "zustand";
import { ChatMessage, ChatUser } from "../types/chat.types";

interface ChatState {
  activeUser: ChatUser | null;
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];

  openChat: (user: ChatUser) => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setActiveUserOnline: (userId: string, isOnline: boolean) => void;
  markMessagesAsSeen: (conversationId: string, seenAt: string) => void;
  markMessagesAsDelivered: (conversationId: string, deliveredAt: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeUser: null,
  isOpen: false,
  isMinimized: false,
  messages: [],

  openChat: (user) =>
    set({
      activeUser: user,
      isOpen: true,
      isMinimized: false,
    }),

  closeChat: () =>
    set({
      isOpen: false,
      activeUser: null,
      messages: [],
    }),

  toggleMinimize: () =>
    set((state) => ({
      isMinimized: !state.isMinimized,
    })),

  addMessage: (msg) =>
    set((state) => {
      if (msg._id && state.messages.some((m) => m._id === msg._id)) {
        return state;
      }
      const messageWithDate = {
        ...msg,
        createdAt: msg.createdAt || new Date().toISOString(),
      };
      return { messages: [...state.messages, messageWithDate] };
    }),


  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

  setActiveUserOnline: (userId: string, isOnline: boolean) =>
    set((state) => {
      if (state.activeUser && state.activeUser.id === userId) {
        return { activeUser: { ...state.activeUser, isOnline } };
      }
      return state;
    }),

  markMessagesAsSeen: (conversationId: string, seenAt: string) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.conversationId === conversationId && m.status !== "seen"
          ? { ...m, status: "seen", seenAt }
          : m
      ),
    })),

  markMessagesAsDelivered: (conversationId: string, deliveredAt: string) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.conversationId === conversationId && m.status === "sent"
          ? { ...m, status: "delivered", deliveredAt }
          : m
      ),
    })),
}));
