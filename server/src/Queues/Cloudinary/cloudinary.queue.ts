import { Queue } from "bullmq";
import { redis } from "../../DB/Connections/redis.connection.js";
import { defaultJobOptions } from "../queue.config.js";
import type { CloudinaryJobName, DeleteImageJobData } from "./cloudinary.types.js";

const cloudinaryQueue = new Queue<DeleteImageJobData, void, CloudinaryJobName>(
    "cloudinary-queue",
    {
        connection: redis,
        defaultJobOptions,
    }
);

export const addDeleteImageJob = (publicIds: string | string[]) => {
    const ids = Array.isArray(publicIds) ? publicIds : [publicIds];
    if (!ids.length) return;
    return cloudinaryQueue.add("delete-image", ids);
};

export const addDeleteMediaJob = (publicId: string | string[]) => {
    const ids = Array.isArray(publicId) ? publicId : [publicId];
    if (!ids.length) return;
    return cloudinaryQueue.add("delete-media", ids);
};