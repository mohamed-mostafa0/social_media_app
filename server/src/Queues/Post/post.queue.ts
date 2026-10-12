import { Queue } from "bullmq";
import { redis } from "../../DB/Connections/redis.connection.js";
import { defaultJobOptions } from "../queue.config.js";
import { PostJobName, type DeletePostJobData } from "./post.types.js";




export const postQueue = new Queue<DeletePostJobData , void , PostJobName>(
    "post-queue",
    {
        connection:redis,
        defaultJobOptions
    }
)


export const addDeletePostJob = async (data:DeletePostJobData)=>{
    return await postQueue.add(PostJobName.DELETE_POST_DATA , data)
}