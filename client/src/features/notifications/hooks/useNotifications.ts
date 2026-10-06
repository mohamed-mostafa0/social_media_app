"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../api/notification.service";
import { useSocket } from "@/components/providers/SocketProvider";
import type { INotificationItem, NotificationsResponse } from "../types/notification.types";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"];
export const UNREAD_NOTIFICATIONS_COUNT_KEY = ["notifications", "unread-count"];

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, page, limit],
    queryFn: () => notificationService.getNotifications(page, limit),
    staleTime: 1000 * 30, 
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_NOTIFICATIONS_COUNT_KEY,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 1000 * 30,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (updatedItem) => {
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          const list = Array.isArray(oldData.notifications) ? oldData.notifications : [];
          return {
            ...oldData,
            unreadCount: Math.max(0, (oldData.unreadCount ?? 1) - 1),
            notifications: list.map((item) =>
              item._id === updatedItem?._id ? { ...item, isRead: true } : item)
          };
        }
      );
      // queryClient.invalidateQueries({ queryKey: UNREAD_NOTIFICATIONS_COUNT_KEY });
      queryClient.setQueryData<number>(
        UNREAD_NOTIFICATIONS_COUNT_KEY,
        (prev)=> Math.max(0,(prev ?? 1) - 1 )
      )
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          const list = Array.isArray(oldData.notifications) ? oldData.notifications : [];
          return {
            ...oldData,
            unreadCount: 0,
            notifications: list.map((item) => ({
              ...item,
              isRead: true,
            })),
          };
        }
      );
      queryClient.setQueryData(UNREAD_NOTIFICATIONS_COUNT_KEY, 0);
    },
  });
}



export function useNotificationListener(onNewNotification?: (item: INotificationItem) => void) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [latestNotification, setLatestNotification] = useState<INotificationItem | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingNotification = (data: any) => {
      const incomingItem: INotificationItem = {
        _id: data?._id || String(Date.now()),
        recipientId: data?.recipientId || "",
        senderId: data?.senderId || data?.sender,
        sender: data?.sender || data?.senderId,
        type: data?.type || "like",
        entityId: data?.entityId || data?.data?.refId,
        entityType: data?.entityType || data?.data?.entityType,
        message: data?.message,
        isRead: false,
        createdAt: data?.createdAt || new Date().toISOString(),
      };

      setLatestNotification(incomingItem);
      onNewNotification?.(incomingItem);

      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (oldData) => {
          const existingList = Array.isArray(oldData?.notifications)
            ? oldData.notifications
            : [];

          const exists = existingList.some((n) => n._id === incomingItem._id);
          if (exists) return oldData;

          return {
            notifications: [incomingItem, ...existingList],
            unreadCount: (oldData?.unreadCount ?? 0) + 1,
            page: oldData?.page ?? 1,
            limit: oldData?.limit ?? 20,
          };
        }
      );

      queryClient.setQueryData<number>(UNREAD_NOTIFICATIONS_COUNT_KEY, (prev) =>
        (prev || 0) + 1
      );
    };

    socket.on("notification", handleIncomingNotification);
    socket.on("like", handleIncomingNotification);

    return () => {
      socket.off("notification", handleIncomingNotification);
      socket.off("like", handleIncomingNotification);
    };
  }, [socket, queryClient, onNewNotification]);

  return { latestNotification, clearLatest: () => setLatestNotification(null) };
}
