import type { Document, Types } from "mongoose";

export enum conversationTypeEnum {
  DIRECT = "direct",
  GROUP = "group"  
}

export interface IConversation extends Document {
    type: conversationTypeEnum;
    name?: string;
    members: (Types.ObjectId | string | any)[];
    createdAt?: Date;
    updatedAt?: Date;
}