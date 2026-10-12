import { Worker, type Job } from "bullmq"
import { CommentRepository, LikeRepository, NotificationRepository, UserRepository } from "../../DB/Repositories/index.js"
import { LikeOnModelEnum } from "../../Common/index.js"
import {Redis} from "ioredis"
import { redisUrl } from "../../DB/Connections/redis.connection.js"
import { addDeleteImageJob, addDeleteMediaJob } from "../Cloudinary/cloudinary.queue.js"
import { PostJobName, type DeletePostJobData } from "./post.types.js"
import { UserModel } from "../../DB/Models/user.model.js"


const commentRepo = new CommentRepository()
const likeRepo = new LikeRepository()
const notificationRepo = new NotificationRepository()
const userRepo = new UserRepository(UserModel)

export const initPostWorker = ()=>{
    const worker = new Worker(
        "post-queue",
        async(job:Job<DeletePostJobData>)=>{
            if(job.name === PostJobName.DELETE_POST_DATA){
                const {postId , ownerId} = job.data
                if(!postId) return;
                
                const postComments = await commentRepo.findDocuments({postId})
                const commentsIds = postComments.map((c)=>c._id)
                const publicIds = postComments
                .map((c)=>c.attachment?.publicId)
                .filter((id): id is string=>Boolean(id))

                await Promise.all([
                    commentRepo.deleteManyDocuments({
                        postId
                    }),
                    likeRepo.deleteManyDocuments({
                        refId:postId , onModel:LikeOnModelEnum.Post     
                    }),
                    commentsIds.length > 0 ?
                        likeRepo.deleteManyDocuments({
                            refId:{$in:commentsIds} , onModel:LikeOnModelEnum.Comment
                        }) : Promise.resolve(),

                    notificationRepo.deleteManyDocuments({
                        $or: [
                            { entityId: postId, entityType: "Post" },
                            ...(commentsIds.length > 0
                                ? [{ entityId: { $in: commentsIds }, entityType: "Comment" }]
                                : [])
                        ]
                    }),
                    userRepo.findByIdAndUpdateDocument(ownerId as string, {
                        $inc:{postsCount:-1}
                    })
                ])

               if(publicIds.length > 0){
                await addDeleteMediaJob(publicIds)
               }

               console.log(`[Post Worker]: Cleaned comments (${postComments.length}), likes, notifications, and media for post ${postId}`);
            }
        },
        {
            connection:new Redis(redisUrl ,{maxRetriesPerRequest:null} ),
            concurrency:5
        }
    )

    worker.on("completed", (job) => console.log(`[Post Job ${job.id}] completed`));
    worker.on("failed", (job, err) => console.error(`[Post Job ${job?.id}] failed:`, err.message));
    worker.on("error", (err) => console.error("[Post Worker Error]:", err));
    return worker
} 