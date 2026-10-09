import { Redis } from 'ioredis'


const redisUrl = process.env.REDIS_URL as string

export const redis = new Redis(redisUrl,{
    maxRetriesPerRequest:3,
    // lazyConnect:true
})


redis.on("ready" , ()=>{
    console.log("REDIS CONNECTED SUCCESSFULLY");
})
redis.on("error",(err)=>{
    console.log("REDIS CONNECTION FAILED:", err);
})


