"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiCheck, FiInbox } from "react-icons/fi";
import { IconButton } from "@/components/ui/IconButton";
import { NotificationItem } from "./NotificationItem";
import { NotificationToast } from "./NotificationToast";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useNotificationListener,
} from "../hooks/useNotifications";
import { useClickOutside } from "@/hooks";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useNotifications(1, 30);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const { latestNotification, clearLatest } = useNotificationListener();

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((item) => !item?.isRead)
      : notifications;

  const currentUnreadCount = data?.unreadCount ?? unreadCount;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <IconButton
          variant="ghost"
          size="md"
          onClick={() => setIsOpen((prev) => !prev)}
          className={isOpen ? "bg-gray-100 cursor-pointer text-blue-600" : ""}
          aria-label="Notifications"
        >
          <FiBell className="w-5 h-5" />
        </IconButton>

        {currentUnreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center pointer-events-none shadow-xs ">
            {currentUnreadCount > 9 ? "9+" : currentUnreadCount}
          </span>
        )}
      </div>

      <NotificationToast
        notification={latestNotification}
        onDismiss={clearLatest}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 backdrop-blur-md"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                {currentUnreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-600 rounded-full">
                    {currentUnreadCount} new
                  </span>
                )}
              </div>

              {currentUnreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="flex px-4 pt-2 border-b border-gray-50 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`pb-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`pb-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1 ${
                  activeTab === "unread"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>Unread</span>
                {currentUnreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 p-2">
              {isLoading ? (
                <div className="space-y-3 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse p-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-10 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-2">
                    <FiInbox className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    No {activeTab === "unread" ? "unread " : ""}notifications
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    We&apos;ll notify you when someone interacts with your posts.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onRead={(id) => markAsRead(id)}
                    onCloseDropdown={() => setIsOpen(false)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
