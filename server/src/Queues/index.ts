export * from "./Email/email.queue.js";
export * from "./Email/email.types.js";
export * from "./Cloudinary/cloudinary.queue.js";
export * from "./Cloudinary/cloudinary.types.js";

import { initCloudinaryWorker } from "./Cloudinary/cloudinary.worker.js";
import { initEmailWorker } from "./Email/email.worker.js";

export const initAllWorkers = () => {
    console.log("Initializing BullMQ background workers...");
    initEmailWorker();
    initCloudinaryWorker();
};
