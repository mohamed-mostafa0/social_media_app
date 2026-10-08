import type { Request, Response } from "express";
import { OtpTypeEnum, type IRequest, type IUser, type signupBodyType } from "../../../Common/index.js";
import { BlackListedTokenRepository, UserRepository } from "../../../DB/Repositories/index.js";
import { UserModel , BlackListedTokenModel} from "../../../DB/Models/index.js";
import { customAlphabet } from 'nanoid'
import { BadRequestException, compareHash, ConflictException, eventEmiiter, generateHash, generateToken, successResponse, UnauthorizedException } from "../../../Utils/index.js";
import { v4 as uuidv4 } from 'uuid';
import type { SignOptions } from "jsonwebtoken";
import { redis } from "../../../DB/Connections/redis.connection.js";

const nanoid = customAlphabet("123456789ABCDEFG" , 6)


class AuthService {

    private userRepo:UserRepository = new UserRepository(UserModel)
    private blackListedRepo:BlackListedTokenRepository = new BlackListedTokenRepository(BlackListedTokenModel)



    signup = async(req:Request , res:Response)=>{
        const {firstName , lastName , email , password , gender ,phoneNumber }:signupBodyType = req.body

        const isEmailExist = await this.userRepo.findOneDocument({email} , 'email')
        if(isEmailExist) throw new ConflictException("Email Already Exist")

        const otp = nanoid()
        await redis.set(`otp:confirm:${email}`, otp , "EX" , 600)
        eventEmiiter.emit("send-email",{
            to:email,
            subject:"Eamil Confirmation",
            content:`Your OTP is ${otp}`
        })

        const user = await this.userRepo.createDocument({
            firstName , lastName , gender , email , password , phoneNumber
        })

        return res.status(201).json({message:"Registered Successfully" , user})
    }


    signin = async(req:Request , res:Response)=>{
        const {email , password} = req.body

        const user = await this.userRepo.findOneDocument({email})
        if(!user) throw new UnauthorizedException("User not found, Please signup first and try again")

        const matchPassword = compareHash(password , user.password)
        if(!matchPassword)  return res.status(401).json({message:"Incorrect Credentials"})

        const accessToken = generateToken({
            _id:user._id,
            email:user.email,
            provider:user.provider,
        } ,
         process.env.ACCESS_TOKEN_SECRET,
        {
            jwtid:uuidv4(),
            expiresIn:process.env.ACCESS_TOKEN_EXPIRATION_TIME as SignOptions['expiresIn']
        })

        const refreshToken = generateToken({
            _id:user._id,
            email:user.email,
            provider:user.provider,
        } ,
         process.env.REFRESH_TOKEN_SECRET,
        {
            jwtid:uuidv4(),
            expiresIn:process.env.REFRESH_TOKEN_EXPIRATION_TIME as SignOptions['expiresIn']
        })

        const userResponse = typeof (user as any).toObject === 'function' ? (user as any).toObject() : { ...user };
        delete userResponse.password;
        delete userResponse.OTPs;

        return res.status(200).json(successResponse("Logged In" , 200 , {accessToken , refreshToken , user: userResponse}))
    }

    confirmEmail = async(req:Request , res:Response)=>{
        const {email , otp} = req.body

        const storedOtp = await redis.get(`otp:confirm:${email}`)
        if(!storedOtp) throw new BadRequestException("OTP has expired")

        if(storedOtp !== otp) throw new BadRequestException("Incorrect OTP code")
        
        await this.userRepo.findOneupdateDocument({email} , {isVerified:true})
        await redis.del(`otp:confirm:${email}`)

        return res.status(200).json(successResponse("Email confirmed successfully", 200));
    }


    logout = async(req:Request , res:Response)=>{
        const {user , token} = (req as unknown as IRequest).loggedInUser

        const blackListToken =  this.blackListedRepo.createDocument({
            tokenId:token.jti,
            expiresAt:new Date(token.exp || Date.now() + 600000)
        })
        return res.status(200).json({blackListToken})
    }
}

export default new AuthService()