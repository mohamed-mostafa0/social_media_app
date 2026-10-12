import { Queue } from "bullmq";
import { redis } from "../../DB/Connections/redis.connection.js";
import { defaultJobOptions } from "../queue.config.js";
import { NotificationJobName, type NotificationJobData } from "./notification.types.js";




export const notificationQueue = new Queue<NotificationJobData , void , NotificationJobName>(
    "notification-queue",
    {
        connection:redis,
        defaultJobOptions
    }
)

export const addNotificationJob = (data:NotificationJobData)=>{
    return notificationQueue.add(NotificationJobName.SEND_NOTIFICATION , data)
}