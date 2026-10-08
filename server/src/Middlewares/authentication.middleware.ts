import type { NextFunction, Request, Response } from "express";
import { BadRequestException, HttpException, NotFoundException, UnauthorizedException, verifyToken } from "../Utils/index.js";
import { UserRepository } from "../DB/Repositories/index.js";
import { UserModel } from "../DB/Models/index.js";
import { REDIS_KEYS, REDIS_TTL, type IRequest, type IUser } from "../Common/index.js";
import type { JwtPayload } from "jsonwebtoken";
import { redis } from "../DB/Connections/redis.connection.js";



const userRepo = new UserRepository(UserModel)

export const authentication = async(req:Request , res:Response , next:NextFunction)=>{    
    const{authorization:accessToken} = req.headers
    if(!accessToken) return next(new BadRequestException("Please login first"))    

    let decodedToken: JwtPayload;
    try {
        decodedToken = verifyToken(accessToken , process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
    } catch (err: any) {
        if (err?.name === "TokenExpiredError") {
            return next(new UnauthorizedException("Token expired, please login again"));
        }
        return next(new UnauthorizedException("Invalid token"));
    }

    if(!decodedToken) return next(new UnauthorizedException("Invalid Token"))

    const isTokenBlackListed = await redis.get(REDIS_KEYS.tokenBlacklist(decodedToken.jti as string))
    if(isTokenBlackListed) return next(new UnauthorizedException("Session Expired, Please login again"))

    const cachedUser = await redis.get(REDIS_KEYS.userSession(decodedToken._id))
    let user:IUser|null = null

    if(cachedUser){
        user = JSON.parse(cachedUser)
    }else {
        user = await userRepo.findDocumentById(decodedToken._id)
        if(!user) return next(new NotFoundException("Account not found , Please register first"));
        
        await redis.set(REDIS_KEYS.userSession(decodedToken._id),
        JSON.stringify(user),
        "EX",
        REDIS_TTL.USER_SESSION
        )
    }
        
    (req as unknown as IRequest).loggedInUser = {user:user as IUser, token:decodedToken as JwtPayload}
    next()
}