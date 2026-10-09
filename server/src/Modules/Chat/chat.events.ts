import type { Socket } from "socket.io";
import { ChatService } from "./Services/chat.service.js";
import { REDIS_KEYS } from "../../Common/index.js";
import { redis } from "../../DB/Connections/redis.connection.js";
import { emitToUser } from "../../Gateways/socket.gateway.js";




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
}