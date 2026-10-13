import mongoose from "mongoose";
import { MessageStatusEnum, type IMessage } from "../../Common/index.js";



const messageSchema = new mongoose.Schema<IMessage>({
    text: String,
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversations",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    attachments: [String],
    voiceNote:{
        url:String,
        publicId:String,
        duration:Number
    },
    status:{
        type:String,
        enum:MessageStatusEnum,
        default:MessageStatusEnum.SENT
    },
    deliveredAt:Date,
    seenAt:Date
}, {
    timestamps: true
})

export const MessageModel = mongoose.model<IMessage>("Messages", messageSchema)
