import { Job, Worker } from "bullmq"
import type { SendOtpJobData } from "./email.types.js"
import { sendEmail } from "../../Utils/index.js"
import {Redis} from "ioredis";

const redisUrl = process.env.REDIS_URL as string;


export const initEmailWorker = ()=>{
    const worker = new Worker(
        "email-queue",
        async(job:Job)=>{
            const data = job.data as SendOtpJobData
            await sendEmail({
                to:data.to,
                subject:data.subject || "Email Confirmation",
                content:`Your OTP is ${data.otp}`
            })
        },
        {
            connection: new Redis(redisUrl, { maxRetriesPerRequest: null }),
            concurrency:5
        }
    )

    worker.on("completed", (job) => console.log(`[Job ${job.id}] completed`));
    worker.on("failed", (job, err) => console.error(`[Job ${job?.id}] failed:`, err.message));

    return worker
}