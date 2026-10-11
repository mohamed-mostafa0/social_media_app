export * from "./Email/email.queue.js";
export * from "./Email/email.types.js";

import { initEmailWorker } from "./Email/email.worker.js";

export const initAllWorkers = () => {
    console.log("Initializing BullMQ background workers...");
    initEmailWorker();
};
