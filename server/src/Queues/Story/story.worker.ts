import { Job, Worker } from "bullmq"
import { LikeRepository, StoryRepository, StoryViewerRepository } from "../../DB/Repositories/index.js";
import { addDeleteMediaJob } from "../Cloudinary/cloudinary.queue.js";
import {Redis} from "ioredis";
import { redisUrl } from "../../DB/Connections/redis.connection.js";
import { LikeOnModelEnum } from "../../Common/index.js";




const storyRepo = new StoryRepository();
const storyViewerRepo = new StoryViewerRepository();
const likeRepo = new LikeRepository();

export const initStoryWorker = ()=>{
    const worker = new Worker(
        "story-queue",
        async(job:Job)=>{
            if(job.name === "clean-expired-stories"){
                const now = new Date()

                const expiredStories = await storyRepo.findDocuments({
                    expiresAt:{$lte:now}
                })
                if(!expiredStories || expiredStories.length === 0){
                    console.log("[Story Worker]: No expired stories found");
                    return;
                }

                const storyIds = expiredStories.map((s)=>s._id)
                const publicIds = expiredStories
                    .map((s) => s.media?.publicId)
                    .filter((id): id is string => Boolean(id));

                await Promise.all([
                    storyRepo.deleteManyDocuments({
                        _id:{$in:storyIds}
                    }),
                    storyViewerRepo.deleteManyDocuments({
                        storyId:{$in:storyIds}
                    }),
                    likeRepo.deleteManyDocuments({
                         refId: { $in: storyIds }, onModel: LikeOnModelEnum.Story }), 
                ])

                if(publicIds.length > 0){
                    await addDeleteMediaJob(publicIds)
                }

                console.log(`[Story Worker]: Cleaned ${expiredStories.length}
                     expired stories and queued ${publicIds.length} media files for deletion.`);
            }
        },
        {
            connection: new Redis(redisUrl, { maxRetriesPerRequest: null }),
            concurrency:1
        }
    )

    worker.on("completed", (job) => console.log(`[Story Job ${job.id}] completed`));
    worker.on("failed", (job, err) => console.error(`[Story Job ${job?.id}] failed:`, err.message));
    worker.on("error", (err) => console.error("[Story Worker Error]:", err));
    return worker;
}