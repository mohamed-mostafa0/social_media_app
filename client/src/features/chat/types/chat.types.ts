export interface ChatMessage {
  _id?: string;
  text: string;
  conversationId: string;
  senderId: string;
  attachments?: string[];
  createdAt?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface ConversationItem {
  _id: string;
  updatedAt?: string;
  otherUser: {
    _id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
    isOnline?: boolean;
  };
  lastMessage?: {
    _id: string;
    text: string;
    senderId: string;
    createdAt?: string;
  } | null;
}

