import type { Document, Types } from "mongoose";


export enum StoryMediaType{
    IMAGE = "image",
    VIDEO = "video"
}


export interface IStoryMedia{
    url:string,
    publicId:string,
    mediaType:StoryMediaType
}

export interface IStory extends Document{
    ownerId:Types.ObjectId,
    media:IStoryMedia,
    caption:string,
    viewsCount:number,
    expiresAt:Date
}

export interface IStoryViewer extends Document{
    storyId:Types.ObjectId,
    ownerId:Types.ObjectId,
    viewedAt:Date,
    expiresAt:Date
}