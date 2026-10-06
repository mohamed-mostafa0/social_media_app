export type NotificationType = "like" | "comment" | "message" | "follow";

export type NotificationEntityType = "Post" | "Comment" | "User";

export interface NotificationSender {
  _id: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface INotificationItem {
  _id: string;
  recipientId: string;
  senderId?: NotificationSender;
  sender?: NotificationSender;
  type: NotificationType;
  entityId?: string;
  entityType?: NotificationEntityType;
  message?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  notifications: INotificationItem[];
  unreadCount: number;
  page: number;
  limit: number;
}
