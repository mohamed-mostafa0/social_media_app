import type { Types , Document } from "mongoose";

export enum LikeOnModelEnum {
    Post = "Post",
    Comment = "Comment",
    Story = "Story",
}

export interface ILike extends Document{
    userId:Types.ObjectId,
    refId:Types.ObjectId,
    onModel:LikeOnModelEnum
}