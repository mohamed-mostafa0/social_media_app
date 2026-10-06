import type { Document, Types } from "mongoose";
import type { NotificationEntityTypeEnum, NotificattionTypeEnum } from "../Enum/notification.enum.js";



export interface INotification extends Document{
    recipientId:Types.ObjectId,
    senderId:Types.ObjectId,
    type:NotificattionTypeEnum,
    entityId:Types.ObjectId,
    // entityType:NotificationEntityTypeEnum,
    entityType:string,
    message:string,
    isRead:boolean
}