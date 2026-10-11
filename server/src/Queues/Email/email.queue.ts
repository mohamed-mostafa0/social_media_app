import { Queue } from "bullmq";
import { redis } from "../../DB/Connections/redis.connection.js";
import {defaultJobOptions} from '../queue.config.js'
import { EmailJobName, type SendOtpJobData } from "./email.types.js";




export const emailQueue = new Queue("email-queue" , {
    connection:redis,
    defaultJobOptions
})

export const addSendOtpJob = async(data:SendOtpJobData)=>{
    return emailQueue.add(EmailJobName.SEND_OTP , data)
}