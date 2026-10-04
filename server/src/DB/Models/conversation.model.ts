import mongoose, { Types } from "mongoose";
import { conversationTypeEnum, type IConversation } from "../../Common/index.js";


const conversationSchema = new mongoose.Schema<IConversation>({
    type:{
        type:String,
        enum:conversationTypeEnum,
        default:conversationTypeEnum.DIRECT
    },
    name:String,
    members:[{type:Types.ObjectId , ref:"User"}]

},{
    timestamps:true
})


export const ConversationModel = mongoose.model<IConversation>("Conversations" , conversationSchema)