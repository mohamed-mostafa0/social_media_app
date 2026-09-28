import type { Types } from "mongoose";



export interface ICommentAttachment {
    url: string,
    publicId: string
}

export interface ICommentReplies {
    repliesCount: number,
    replies: Types.ObjectId[]
}

export interface IComment extends Document {
    content: string,
    attachment?: ICommentAttachment,
    ownerId: Types.ObjectId,
    postId: Types.ObjectId,
    parentCommentId: Types.ObjectId | null,
    likesCount: number,
    replyCount: number,
    repliesCount: number
}