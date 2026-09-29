import mongoose, { type PaginateModel } from "mongoose";
import type { ILike } from "../../Common/index.js";
import mongoosePaginate from "mongoose-paginate-v2";




const likeSchema = new mongoose.Schema<ILike>({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    refId:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"onModel",
        required:true
    },
    onModel:{
        type:String,
        enum:["Post" , "Comment"],
        required:true
    }

}, {
    timestamps:true
})

likeSchema.index({
    userId:1,
    refId:1
} , {unique:true})

likeSchema.index({ refId: 1, onModel: 1 });
likeSchema.plugin(mongoosePaginate)

export const LikeModel = mongoose.model<ILike , PaginateModel<ILike>>("Like" , likeSchema)