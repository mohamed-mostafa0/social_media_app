"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FiHeart, FiMessageCircle, FiUserPlus, FiBell } from "react-icons/fi";
import { formatRelativeDate } from "@/lib/date.utils";
import type { INotificationItem } from "../types/notification.types";

interface NotificationItemProps {
  notification: INotificationItem;
  onRead?: (id: string) => void;
  onCloseDropdown?: () => void;
}

export function NotificationItem({
  notification,
  onRead,
  onCloseDropdown,
}: NotificationItemProps) {
  const sender = notification.senderId || notification.sender;
  const senderName = sender
    ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || "Someone"
    : "Someone";

  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return (
          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-white">
            <FiHeart className="w-2.5 h-2.5 fill-current" />
          </div>
        );
      case "comment":
        return (
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-white">
            <FiMessageCircle className="w-2.5 h-2.5 fill-current" />
          </div>
        );
      case "follow":
        return (
          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center ring-2 ring-white">
            <FiUserPlus className="w-2.5 h-2.5" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center ring-2 ring-white">
            <FiBell className="w-2.5 h-2.5" />
          </div>
        );
    }
  };

  const getDestinationUrl = () => {
    if (notification.entityType === "Post" && notification.entityId) {
      return `/#post-${notification.entityId}`;
    }
    if (notification.entityType === "User" && notification.entityId) {
      return `/profile/${notification.entityId}`;
    }
    if (sender?._id) {
      return `/profile/${sender._id}`;
    }
    return "#";
  };

  const handleClick = () => {
    if (!notification.isRead && onRead) {
      onRead(notification._id);
    }
    onCloseDropdown?.();
  };

  return (
    <Link
      href={getDestinationUrl()}
      onClick={handleClick}
      className={`flex items-start gap-3 p-3.5 rounded-xl transition-all ${
        notification.isRead
          ? "bg-white hover:bg-gray-50/80 text-gray-700"
          : "bg-blue-50/40 hover:bg-blue-50/70 text-gray-900"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar
          size="md"
          src={sender?.profilePicture || "/default-avatar-profile.webp"}
        />
        <div className="absolute -bottom-0.5 -right-0.5">{getIcon()}</div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-gray-800 line-clamp-2">
          <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {senderName}
          </span>{" "}
          {notification.message || "interacted with your content."}
        </p>
        <span className="text-[11px] font-medium text-gray-400 mt-1 block">
          {formatRelativeDate(notification.createdAt)}
        </span>
      </div>

      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2 ring-2 ring-blue-100" />
      )}
    </Link>
  );
}
