import type { Socket } from "socket.io";
import { ChatEvents } from "./chat.events.js";



export const chatInitiation = (socket:Socket)=>{

    const chatEvents = new ChatEvents(socket)

    chatEvents.sendPrivateMessage()
}