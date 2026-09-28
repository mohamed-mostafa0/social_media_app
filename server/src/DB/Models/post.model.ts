import mongoose, { type PaginateModel } from "mongoose";
import type { IPost } from "../../Common/index.js";
import mongoosePaginate from "mongoose-paginate-v2"




const postSchema = new mongoose.Schema<IPost>({
    describtion:String,
    attachments:[String],
    attachmentsPublicIds:[String],
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    allowComments:{
        type:Boolean,
        default:true
    },
    tags:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    commentsCount:{
        type:Number,
        default:0
    },
    likesCount:{
        type:Number,
        default:0
    }
}, {
    timestamps:true
})

postSchema.plugin(mongoosePaginate)

export const PostModel = mongoose.model<IPost , PaginateModel<IPost>>("Post" , postSchema)