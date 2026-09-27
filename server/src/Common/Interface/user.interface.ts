import type { Document, Types } from "mongoose"
import type { followStatusEnum, GenderEnum, OtpTypeEnum, ProviderEnum, RoleEnum } from "../index.js"
import type { Request } from "express"
import type { JwtPayload } from "jsonwebtoken"




export interface IOTP {
    value: string,
    expiresAt: Date,
    otpType: OtpTypeEnum
}

export interface ILocation {
    country?:String,
    city?: string,
    governrate?: string,
    street?: string,
}

export interface IEducation {
    university?: string,
    college?: string,
    major?:String,
    graduationYear?:number
}

export interface ISocialLinks {
    platformName?:string,
    link?:string
}

export interface IUser extends Document {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: RoleEnum,
    gender: GenderEnum,
    DOB?: Date,
    age: number
    location?: ILocation,
    education?: IEducation,
    socialLinks?:ISocialLinks[],
    profilePicture?: string,
    profilePictureId?: string,
    coverPicture?: string,
    coverPictureId?: string,
    provider: ProviderEnum,
    googleId?: string,
    phoneNumber?: string,
    isVerified?: boolean,
    OTPs?: IOTP[],
    followersCount?:number,
    followingCount?:number,
    postsCount?:number,
    isPrivate?:boolean,
    isOnline?:boolean,
    isDeleted?:boolean,
    isDeactivated?:boolean

}


export interface IEmail {
    subject: string,
    to: string,
    attachments?: [],
    content: string
}

export interface IBlackListedToken {
    tokenId: string,
    expiresAt: Date
}

export interface IRequest extends Request {
    loggedInUser: { user: IUser, token: JwtPayload }
}

export interface IFollow extends Document {
    followFromId: Types.ObjectId,
    followToId: Types.ObjectId,
    status: followStatusEnum
}
// export interface IFriendship extends Document {
//     requestFromId: Types.ObjectId,
//     requestToId: Types.ObjectId,
//     status: friendshipStatusEnum
// }
