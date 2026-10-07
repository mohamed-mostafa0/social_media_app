import mongoose, { type PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { NotificationEntityTypeEnum, NotificattionTypeEnum, type INotification } from "../../Common/index.js";



const notificationSchema = new mongoose.Schema<INotification>({
    recipientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    type:{
        type:String,
        enum:NotificattionTypeEnum,
        required:true
    },
    entityId:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"entityType"
    },
    entityType:{
        type:String,
        // enum:NotificationEntityTypeEnum
        enum:["Post" , "Comment" , "User" , "Story"]
    },
    message:{
        type:String,
        trim:true
    },
    isRead:{
        type:Boolean,
        default:false
    }

}, { timestamps:true})


notificationSchema.index({
    recipientId:1,
    isRead:1,
    createdAt:-1
})

notificationSchema.plugin(mongoosePaginate)

export const NotificationModel =
 mongoose.model<INotification , PaginateModel<INotification>>("Notification" , notificationSchema)

