"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { FiX, FiHeart, FiMessageCircle, FiBell } from "react-icons/fi";
import Link from "next/link";
import type { INotificationItem } from "../types/notification.types";

interface NotificationToastProps {
  notification: INotificationItem | null;
  onDismiss: () => void;
}

export function NotificationToast({
  notification,
  onDismiss,
}: NotificationToastProps) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const sender = notification.senderId || notification.sender;
  const senderName = sender
    ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || "Someone"
    : "Someone";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3 backdrop-blur-md bg-white/95"
      >
        <div className="relative shrink-0">
          <Avatar
            size="md"
            src={sender?.profilePicture || "/default-avatar-profile.webp"}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-white">
            {notification.type === "like" ? (
              <FiHeart className="w-2.5 h-2.5 fill-current" />
            ) : notification.type === "comment" ? (
              <FiMessageCircle className="w-2.5 h-2.5 fill-current" />
            ) : (
              <FiBell className="w-2.5 h-2.5" />
            )}
          </div>
        </div>

        <Link
          href={
            notification.entityType === "Post" && notification.entityId
              ? `/#post-${notification.entityId}`
              : sender?._id
              ? `/profile/${sender._id}`
              : "#"
          }
          onClick={onDismiss}
          className="flex-1 min-w-0"
        >
          <p className="text-xs font-semibold text-gray-900 line-clamp-1">
            New Notification
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
            <span className="font-semibold text-gray-800">{senderName}</span>{" "}
            {notification.message || "interacted with your post"}
          </p>
        </Link>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
