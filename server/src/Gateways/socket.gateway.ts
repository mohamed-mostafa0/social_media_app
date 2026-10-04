import { Server, type Socket } from "socket.io";
import {Server as HttpServer} from "http"
import { verifyToken } from "../Utils/index.js";
import { chatInitiation } from "../Modules/Chat/chat.js";


const socketAuthentication = ((socket:Socket , next:Function)=>{

    const decodedData = verifyToken(socket.handshake.auth.token)
    socket.data = {userId:decodedData._id}

    const userTabs = connectedSockets.get(socket.data.userId)    
    if(!userTabs) connectedSockets.set(socket.data.userId , [socket.id])
    else userTabs.push(socket.id)
    // console.log(connectedSockets);
    next() 
})

const socketDisconnection = (socket: Socket) => {
    socket.on("disconnect", () => {
        const userId = socket.data.userId;
        const userTabs = connectedSockets.get(userId);

        if (!userTabs) return;

        const remainingTabs = userTabs.filter((tab) => tab !== socket.id);
        if (remainingTabs.length === 0) {
            connectedSockets.delete(userId);
        } else {
            connectedSockets.set(userId, remainingTabs);
        }
        console.log(`Socket ${socket.id} disconnected for user ${userId}`);
    });
};


let io:Server | null = null
export const connectedSockets = new Map<string ,string[]>() 

export const ioIntializer = (server:HttpServer , corsOptions:Object)=>{

    io = new Server(server , {cors:corsOptions 
    //,  maxHttpBufferSize:1e8 ,
    //  connectionStateRecovery:{
    // maxDisconnectionDuration:2*60*1000,
    // skipMiddlewares:false}
})

io.use(socketAuthentication)

io.on("connection" , (socket:Socket)=>{
    console.log("A USER CONNECTED");
    chatInitiation(socket)
    socketDisconnection(socket)
    
})



}

export const getIo = ()=>{
    try{
        if(!io) throw new Error("Sokcet.io is not intialized")
        return io
    }catch(err){
        console.log(err);
        
    }
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