import RedisStore from "rate-limit-redis"
import { redis } from "../DB/Connections/redis.connection.js"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { TooManyRequestsException } from "../Utils/index.js"






const createRedisStore = (prefix:string)=>{
    return new RedisStore({
        sendCommand:(...args:string[])=>(redis as any).call(...args),
        prefix:`ratelimit:${prefix}:`
    })
}


export const globalRateLimiter = rateLimit({
    windowMs:15 * 60 * 1000,
    limit:100,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    store:createRedisStore("global"),
    handler:(req,res,next)=>{
        next(new TooManyRequestsException("Too many requests from this IP. Please try again after 15 minutes."))
    }
})

export const loginRateLimit = rateLimit({
    windowMs:15 * 60* 1000,
    limit:5,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    store:createRedisStore("auth:login"),
    handler: (req, res, next) => {
        next(new TooManyRequestsException("Too many login attempts. Please try again after 15 minutes."));
    }
})

export const otpRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createRedisStore("auth:otp"),
    keyGenerator: (req) => {
        const email = req.body?.email;
        return email ? String(email).toLowerCase().trim() : ipKeyGenerator(req.ip || "127.0.0.1");
    },
    handler: (req, res, next) => {
        next(new TooManyRequestsException("Too many OTP requests for this account. Please wait 10 minutes."));
    },
});
