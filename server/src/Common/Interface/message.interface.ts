import type { Document, Types } from "mongoose";


export enum MessageStatusEnum {
    SENT = "sent",
    DELIVERED = "delivered",
    SEEN = "seen"
}

export interface IVoiceNote{
    url:string,
    publicId:string,
    duration:number
}


export interface IMessage extends Document {
    text?: string;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    attachments?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    status: MessageStatusEnum;
    deliveredAt?: Date;
    seenAt?: Date;
    voiceNote?: IVoiceNote;
}
