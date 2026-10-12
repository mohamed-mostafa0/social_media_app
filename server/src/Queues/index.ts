export * from "./Email/email.queue.js";
export * from "./Email/email.types.js";
export * from "./Cloudinary/cloudinary.queue.js";
export * from "./Cloudinary/cloudinary.types.js";
export * from "./Post/post.queue.js"

import { initCloudinaryWorker } from "./Cloudinary/cloudinary.worker.js";
import { initEmailWorker } from "./Email/email.worker.js";
import { initPostWorker } from "./Post/post.worker.js";
import { storyCron } from "./Story/story.queue.js";
import { initStoryWorker } from "./Story/story.worker.js";

export const initAllWorkers = async() => {
    console.log("Initializing BullMQ background workers...");
    initEmailWorker();
    initCloudinaryWorker();
    initStoryWorker();
    initPostWorker();

    await storyCron()
};
