import type { Types } from "mongoose";
import type { LikeOnModelEnum, NotificationEntityTypeEnum, NotificattionTypeEnum } from "../../Common/index.js";

export enum NotificationJobName {
    SEND_NOTIFICATION = "send-notification"
}

export interface NotificationJobData {
    type: NotificattionTypeEnum;
    recipientId: string | Types.ObjectId;
    entityId: string | Types.ObjectId;
    entityType: NotificationEntityTypeEnum | LikeOnModelEnum | string;
    message: string;
    createdAt?: string;
    isRead?: boolean;
    sender: {
        _id: string | Types.ObjectId;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
}