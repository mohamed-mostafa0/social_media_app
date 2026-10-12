import type { Socket } from "socket.io";
import { ChatService } from "./Services/chat.service.js";
import { MessageStatusEnum, REDIS_KEYS } from "../../Common/index.js";
import { redis } from "../../DB/Connections/redis.connection.js";
import { emitToUser } from "../../Gateways/socket.gateway.js";
import { MessageModel } from "../../DB/Models/message.model.js";




export class ChatEvents {
    private chatService:ChatService = new ChatService()

    constructor(private socket:Socket){}


    sendPrivateMessage(){
        this.socket.on("send-private-message",(data)=>{
            this.chatService.sendPrivateMessage(this.socket , data)
        })
    }
    handleTyping() {
        this.socket.on("typing", async (data: { targetUserId?: string; tagetUserId?: string; isTyping: boolean }) => {
            const senderId = this.socket.data?.userId;
            const targetUserId = data.targetUserId || data.tagetUserId;
            if (!senderId || !targetUserId) return;

            const typingKey = REDIS_KEYS.userTyping(senderId , targetUserId)

            if(data.isTyping){
                await redis.set(typingKey , "1" , "EX" , 3)
                emitToUser(targetUserId , "user-typing" , {
                    userId:senderId,
                    isTyping:true
                })
            } else {
                await redis.del(typingKey);
                emitToUser(targetUserId, "user-typing", {
                    userId: senderId,
                    isTyping: false,
                });
            }
        })
    }
    handleMarkAsSeen() {
  this.socket.on("mark-seen", async (data: { conversationId: string; senderId: string }) => {
    const currentUserId = this.socket.data?.userId;
    const { conversationId, senderId } = data; 
    if (!currentUserId || !conversationId) return;

    const seenAt = new Date();

    await MessageModel.updateMany(
      {
        conversationId,
        senderId,
        status: { $ne: MessageStatusEnum.SEEN }
      },
      {
        $set: { status: MessageStatusEnum.SEEN, seenAt }
      }
    );

    emitToUser(senderId, "messages-seen", {
      conversationId,
      seenAt
    });
  });
}

}