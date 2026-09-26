import type { Types } from "mongoose";



export interface IPost extends Document{
    describtion:string,
    attachments:string[],
    attachmentsPublicIds:string[],
    ownerId:Types.ObjectId,
    allowComments:boolean,
    tags?:object[]
}