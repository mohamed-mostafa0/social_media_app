import { Redis } from 'ioredis'


export const redisUrl = process.env.REDIS_URL as string

export const redis = new Redis(redisUrl,{
    maxRetriesPerRequest:null,
    // lazyConnect:true
})
 

redis.on("ready" , ()=>{
    console.log("REDIS CONNECTED SUCCESSFULLY");
})
redis.on("error",(err)=>{
    console.log("REDIS CONNECTION FAILED:", err);
})


