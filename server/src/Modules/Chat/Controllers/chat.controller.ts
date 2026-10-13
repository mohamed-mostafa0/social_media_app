import { Router } from "express";
import { ChatService } from "../Services/chat.service.js";
import { authentication, uploadMedia } from "../../../Middlewares/index.js";

export const chatController = Router();
const chatService = new ChatService();

chatController.get("/conversations", authentication, chatService.getUserConversations);
chatController.get("/messages/:targetUserId", authentication, chatService.getConversationMessages);
chatController.post("/upload-voice" , authentication, uploadMedia().single("voice"), chatService.sendVoiceNote);