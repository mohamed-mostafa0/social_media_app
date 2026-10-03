"use client";

import { useState } from "react";
import { FiSettings } from "react-icons/fi";
import { ProfileStats } from "../types/profile.types";

interface ProfileStatsBarProps {
  stats: ProfileStats;
  isSelf?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenSettings?: () => void;
  onOpenFollowModal?: (tab: "followers" | "following") => void;
}

export function ProfileStatsBar({
  stats,
  isSelf = true,
  activeTab = "posts",
  onTabChange,
  onOpenSettings,
  onOpenFollowModal,
}: ProfileStatsBarProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabClick = (tabKey: string) => {
    if (tabKey === "followers" || tabKey === "following") {
      onOpenFollowModal?.(tabKey);
      return;
    }
    setCurrentTab(tabKey);
    onTabChange?.(tabKey);
  };

  const navItems = [
    { key: "posts", count: stats.postsCount, label: "posts" },
    { key: "followers", count: stats.followersCount, label: "followers" },
    { key: "following", count: stats.followingCount, label: "following" },
  ];

  return (
    <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-2.5 sm:py-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-hide py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabClick(item.key)}
                className={`flex items-baseline gap-1.5 pb-1 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-gray-900 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className={`font-bold ${isActive ? "text-gray-900" : "text-gray-800"}`}>
                  {item.count.toLocaleString()}
                </span>
                <span className="text-gray-400 capitalize">{item.label}</span>
              </button>
            );
          })}
        </div>

        {isSelf && (
          <div className="flex items-center justify-end">
            <button
              onClick={onOpenSettings}
              type="button"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <span>Settings</span>
              <FiSettings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

