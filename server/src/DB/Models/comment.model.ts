import mongoose, { type PaginateModel } from "mongoose";
import type { IComment } from "../../Common/index.js";
import mongoosePaginate from "mongoose-paginate-v2";




const commentSchema = new mongoose.Schema<IComment>({
    content:{
        type:String,
        trim:true
    },
    attachment:{
        url:String,
        publicId:String
    },
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
        index:true
    },
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    parentCommentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        default:null,
        index:true
    },
    likesCount:{
        type:Number,
        default:0
    },
    repliesCount:{
        type:Number,
        default:0
    }
} , {
    timestamps:true
})

commentSchema.index({
    postId:1,
    parentCommentId:1,
    createdAt:1
})
commentSchema.plugin(mongoosePaginate)

export const CommentModel = mongoose.model<IComment, PaginateModel<IComment>>("Comment" , commentSchema)