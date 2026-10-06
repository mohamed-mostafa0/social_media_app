import { apiClient } from "@/lib/axios";
import type { INotificationItem, NotificationsResponse } from "../types/notification.types";

export const notificationService = {
  getNotifications: async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    const response = await apiClient.get("/notification", {
      params: { page, limit },
    });
    
    const payload = response.data?.data?.data || {};
    return {
      notifications: Array.isArray(payload.notifications) ? payload.notifications : [],
      unreadCount: payload.unreadCount ?? 0,
      page: payload.page ?? page,
      limit: payload.limit ?? limit,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get("/notification/unread-count");
    
    const payload = response.data?.data?.data;
    return payload?.unreadCount ?? 0;
  },

  markAsRead: async (id: string): Promise<INotificationItem> => {
    const response = await apiClient.patch(`/notification/${id}/read`);
    return response.data?.data?.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notification/read-all");
  },
};
