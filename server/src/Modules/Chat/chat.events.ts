import type { Socket } from "socket.io";
import { ChatService } from "./Services/chat.service.js";




export class ChatEvents {
    private chatService:ChatService = new ChatService()

    constructor(private socket:Socket){}


    sendPrivateMessage(){
        this.socket.on("send-private-message",(data)=>{
            this.chatService.sendPrivateMessage(this.socket , data)
        })
    }
}