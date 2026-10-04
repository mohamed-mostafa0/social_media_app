import type { Document, Types } from "mongoose";

export interface IMessage extends Document {
    text: string;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    attachments: string[];
    createdAt?: Date;
    updatedAt?: Date;
}