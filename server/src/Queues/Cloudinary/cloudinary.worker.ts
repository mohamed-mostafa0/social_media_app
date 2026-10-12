import { Job, Worker } from "bullmq";
import { deleteImagesOnCloudinary, deleteMediaFromCloudinary } from "../../Utils/index.js";
import { Redis } from "ioredis";
import { redisUrl } from "../../DB/Connections/redis.connection.js";
import type { CloudinaryJobName, DeleteImageJobData } from "./cloudinary.types.js";

export const initCloudinaryWorker = () => {
    const worker = new Worker<DeleteImageJobData, any, CloudinaryJobName>(
        "cloudinary-queue",
        async (job: Job<DeleteImageJobData, any, CloudinaryJobName>) => {
            if (!job.data) return;

            const publicIds = Array.isArray(job.data) ? job.data : [job.data];
            if (!publicIds.length) return;

            if (job.name === "delete-media") {
                const results = await Promise.all(publicIds.map((id) => deleteMediaFromCloudinary(id)));
                console.log(`[Cloudinary delete-media results]:`, results);
                return results;
            } else {
                const results = await deleteImagesOnCloudinary(publicIds);
                console.log(`[Cloudinary delete-image results]:`, results);
                return results;
            }
        },
        {
            connection: new Redis(redisUrl, { maxRetriesPerRequest: null }),
            concurrency: 5,
        }
    );

    worker.on("completed", (job) => console.log(`[Cloudinary Job ${job.id}] completed`));
    worker.on("failed", (job, err) => console.error(`[Cloudinary Job ${job?.id}] failed:`, err.message));
    worker.on("error", (err) => console.error("[Cloudinary Worker Error]:", err));

    return worker;
};