import { Job, Worker } from "bullmq"
import { NotificationJobName, type NotificationJobData } from "./notification.types.js"
import { NotificationRepository } from "../../DB/Repositories/index.js"
import type { Types } from "mongoose"
import { emitToUser } from "../../Gateways/socket.gateway.js"
import {Redis} from "ioredis"
import { redisUrl } from "../../DB/Connections/redis.connection.js"


const notificationRepo = new NotificationRepository()


export const initNotificationWorker = ()=>{
    const  worker = new Worker(
        "notification-queue",
        async(job:Job<NotificationJobData>)=>{
            
            if(job.name === NotificationJobName.SEND_NOTIFICATION){
                const {type , sender, message , recipientId , entityId , entityType} = job.data
                
                const createdNotification = await notificationRepo.createDocument({
                    type,
                    senderId:sender._id as unknown as Types.ObjectId,
                    recipientId:recipientId as unknown as Types.ObjectId,
                    entityId:entityId as unknown as Types.ObjectId,
                    entityType,
                    message
                })
                const notificationPayload = {
                    _id:createdNotification._id,
                    message,
                    type,
                    entityId,
                    entityType,
                    createdAt: (createdNotification as any).createdAt || new Date().toISOString(),
                    isRead:false,
                    sender: {
                        _id: sender._id,
                        firstName: sender.firstName,
                        lastName: sender.lastName,
                        profilePicture: sender.profilePicture
                    },
                };

                await emitToUser(recipientId.toString() , "notification" ,notificationPayload )

                console.log(`[Notification Worker]: Sent notification to user ${recipientId}`);
                
            }
        },
        {
            connection:new Redis(redisUrl , {maxRetriesPerRequest:null}),
            concurrency:5
        }
    )

    worker.on("completed", (job) => console.log(`[Notification Job ${job.id}] completed`));
    worker.on("failed", (job, err) => console.error(`[Notification Job ${job?.id}] failed:`, err.message));
    worker.on("error", (err) => console.error("[Notification Worker Error]:", err));
    return worker
}