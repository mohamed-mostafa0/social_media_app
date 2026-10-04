import type { NextFunction, Request, Response } from "express";
import { BadRequestException, HttpException, NotFoundException, UnauthorizedException, verifyToken } from "../Utils/index.js";
import { BlackListedTokenRepository, UserRepository } from "../DB/Repositories/index.js";
import { BlackListedTokenModel, UserModel } from "../DB/Models/index.js";
import type { IRequest, IUser } from "../Common/index.js";
import type { JwtPayload } from "jsonwebtoken";



const blackListedRepo = new BlackListedTokenRepository(BlackListedTokenModel)
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

    const isTokenBlackListed = await blackListedRepo.findOneDocument({tokenId:decodedToken.jti})
    if(isTokenBlackListed) return next(new UnauthorizedException("Session Expired, Please login again"))

    const user:IUser | null = await userRepo.findDocumentById(decodedToken._id)
    if(!user) return next(new NotFoundException("Account not found , Please register first"));

    // console.log(user);
    

    (req as unknown as IRequest).loggedInUser = {user , token:decodedToken as JwtPayload}
    next()
}