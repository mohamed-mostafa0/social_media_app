import { Server, type Socket } from "socket.io";
import {Server as HttpServer} from "http"



let io:Server | null = null

export const ioIntializer = (server:HttpServer , corsOptions:Object)=>{

    io = new Server(server , {cors:corsOptions 
    //,  maxHttpBufferSize:1e8 ,
    //  connectionStateRecovery:{
    // maxDisconnectionDuration:2*60*1000,
    // skipMiddlewares:false}
})

io.on("connection" , (socket:Socket)=>{
    console.log("A USER CONNECTED");
    
})

// io.use((socket:Socket , next:Function)=>{
//     console.log(socket);
    
// })

}

export const getIo = ()=>{
    try{
        if(!io) throw new Error("Sokcet.io is not intialized")
        return io
    }catch(err){
        console.log(err);
        
    }
}