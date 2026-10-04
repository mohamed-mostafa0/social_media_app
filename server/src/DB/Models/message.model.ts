import mongoose from "mongoose";
import type { IMessage } from "../../Common/index.js";



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
    attachments: [String]
}, {
    timestamps: true
})

export const MessageModel = mongoose.model<IMessage>("Messages", messageSchema)