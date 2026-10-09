import { Server, type Socket } from "socket.io";
import {Server as HttpServer} from "http"
import { verifyToken } from "../Utils/index.js";
import { chatInitiation } from "../Modules/Chat/chat.js";
import presenceService from "../Modules/Users/Services/presence.service.js";


const socketAuthentication = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        const decodedData = verifyToken(token);
        if (!decodedData || !decodedData._id) {
            return next(new Error("Authentication error: Invalid token"));
        }

        socket.data = { userId: decodedData._id.toString() };

        const userTabs = connectedSockets.get(socket.data.userId);
        if (!userTabs) connectedSockets.set(socket.data.userId, [socket.id]);
        else userTabs.push(socket.id);

        next();
    } catch (err: any) {
        console.warn(`[Socket Auth Rejected] ${socket.id}: ${err?.message || "Token expired or invalid"}`);
        return next(new Error("Authentication error: Token expired or invalid"));
    }
};


const socketDisconnection =  (socket: Socket) => {
    socket.on("disconnect", async() => {
        const userId = socket.data.userId;
        const userTabs = connectedSockets.get(userId);

        if (!userTabs) return;

        const remainingTabs = userTabs.filter((tab) => tab !== socket.id);
        if (remainingTabs.length === 0) {
            connectedSockets.delete(userId);
            const lastSeen = await presenceService.markUserOffline(userId)
            getIo()?.emit("user-status" , {userId , isOnline:false , lastSeen})
        } else {
            connectedSockets.set(userId, remainingTabs);
        }
        console.log(`Socket ${socket.id} disconnected for user ${userId}`);
    });
};


let io:Server | null = null
export const connectedSockets = new Map<string ,string[]>() 

export const ioIntializer = (server:HttpServer , corsOptions:Object)=>{

    io = new Server(server , {cors:corsOptions })

    io.use(socketAuthentication)

    io.on("connection" , async (socket:Socket)=>{
        const userId = socket.data.userId
        const userTabs = connectedSockets.get(userId) || []

        if(userTabs.length === 1){
            await presenceService.markUserOnline(userId)
            socket.broadcast.emit("user-status" , {userId , isOnline:true})
        }
        console.log("A USER CONNECTED");
        chatInitiation(socket)
        socketDisconnection(socket)
        
    })
}

export const emitToUser = (userId: string, event: string, data: any) => {
    const userTabs = connectedSockets.get(userId.toString());
    if (userTabs?.length) {
        const ioInstance = getIo();
        userTabs.forEach((sockId) => {
            ioInstance?.to(sockId).emit(event, data);
        });
    }
};

export const getIo = ()=>{
    try{
        if(!io) throw new Error("Sokcet.io is not intialized")
        return io
    }catch(err){
        console.log(err);
        
    }
}




