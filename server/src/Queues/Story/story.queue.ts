import { Queue } from "bullmq";
import { redis } from "../../DB/Connections/redis.connection.js";
import { defaultJobOptions } from "../queue.config.js";




export const storyQueue = new Queue("story-queue" , {
    connection:redis,
    defaultJobOptions
})


export const storyCron = async()=>{
    await storyQueue.upsertJobScheduler(
        "hourly-clean-expired-stories",
        {
            pattern:"0 * * * *"
            // every:10000
        },
        {
            name:"clean-expired-stories",
            data:{},
            opts:defaultJobOptions
        }
    )
}