"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "../ui/Avatar";
import { 
  FiHome, 
  FiUsers, 
  FiCalendar, 
  FiVideo, 
  FiImage, 
  FiShoppingBag,
  FiFolder
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useFollowRequests, useGetProfile, FollowersModal } from "@/features/profile";

function formatStatNumber(num?: number): string {
  if (num === undefined || num === null || isNaN(num)) return "0";
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toLocaleString();
}

const navItems = [
  { name: "Feed", icon: FiHome, path: "/", badge: 0 },
  { name: "Friends", icon: FiUsers, path: "/friends", badge: 0 },
  { name: "Event", icon: FiCalendar, path: "/events", badge: 4 },
  { name: "Watch Videos", icon: FiVideo, path: "/videos", badge: 0 },
  { name: "Photos", icon: FiImage, path: "/photos", badge: 0 },
  { name: "Marketplace", icon: FiShoppingBag, path: "/marketplace", badge: 0 },
  { name: "Files", icon: FiFolder, path: "/files", badge: 7 },
];

const pages = [
  { name: "UI/UX Community...", iconBg: "bg-blue-100", iconText: "text-blue-500", text: "UIX" },
  { name: "Web Designer", iconBg: "bg-gray-100", iconText: "text-gray-500", text: "Wd" },
  { name: "Dribbble Community", iconBg: "bg-pink-100", iconText: "text-pink-500", text: "Dr" },
  { name: "Behance", iconBg: "bg-blue-600", iconText: "text-white", text: "Be" },
];

export function LeftSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const { data: requests = [] } = useFollowRequests();
  const [followModalType, setFollowModalType] = useState<"followers" | "following" | null>(null);

  const displayUser = profile || user;
  const followersCount = profile?.followersCount ?? user?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? user?.followingCount ?? 0;
  const postsCount = profile?.postsCount ?? (profile?.posts?.totalDocs ?? user?.postsCount ?? 0);

  return (
    <>
      <aside className="w-75 h-[calc(100vh-65px)] sticky top-[65px] flex flex-col pl-5 pt-6 pb-4 pr-3 overflow-y-auto scrollbar-hide">
        
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <Link
            href="/profile"
            className="flex items-center gap-3 mb-5 group p-1 -m-1 rounded-xl hover:bg-gray-50/80 transition-colors"
            title="View profile"
          >
            <Avatar
              size="md"
              src={displayUser?.profilePicture || "/default-avatar-profile.webp"}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                <span className="truncate">
                  {displayUser ? `${displayUser.firstName} ${displayUser.lastName}`.trim() : "Guest User"}
                </span>
                {displayUser?.isVerified && (
                  <span className="bg-blue-500 text-white rounded-full w-3.5 h-3.5 shrink-0 flex items-center justify-center text-[8px]">✓</span>
                )}
              </h2>
              <p className="text-xs text-gray-500 truncate">{displayUser?.email ? `@${displayUser.email.split('@')[0]}` : "@guest"}</p>
            </div>
          </Link>
          
          <div className="grid grid-cols-3 divide-x divide-gray-100 text-center py-2 px-1 bg-gray-50/70 rounded-xl border border-gray-100/80">
            <button
              type="button"
              onClick={() => setFollowModalType("followers")}
              className="px-1 py-1 rounded-lg hover:bg-white hover:shadow-xs transition-all cursor-pointer group"
              title="View followers"
            >
              {isProfileLoading && !profile && !user ? (
                <div className="h-4 w-6 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              ) : (
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {formatStatNumber(followersCount)}
                </p>
              )}
              <p className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-600 uppercase tracking-wider">
                Follower
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFollowModalType("following")}
              className="px-1 py-1 rounded-lg hover:bg-white hover:shadow-xs transition-all cursor-pointer group"
              title="View following"
            >
              {isProfileLoading && !profile && !user ? (
                <div className="h-4 w-6 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              ) : (
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {formatStatNumber(followingCount)}
                </p>
              )}
              <p className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-600 uppercase tracking-wider">
                Following
              </p>
            </button>

            <Link
              href="/profile"
              className="px-1 py-1 rounded-lg hover:bg-white hover:shadow-xs transition-all cursor-pointer group block"
              title="View posts"
            >
              {isProfileLoading && !profile && !user ? (
                <div className="h-4 w-6 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              ) : (
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {formatStatNumber(postsCount)}
                </p>
              )}
              <p className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-600 uppercase tracking-wider">
                Post
              </p>
            </Link>
          </div>
        </div>

      <div className="bg-white rounded-2xl py-4 shadow-sm border border-gray-100 mb-6 flex-1">
        <nav className="space-y-1 px-3 mb-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link href={item.path} key={item.name}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors ${
                    isActive 
                      ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {((item.name === "Friends" ? requests.length : item.badge) > 0) && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                    } ${item.name === "Files" && !isActive ? "!bg-purple-500" : ""} ${
                      item.name === "Event" && !isActive ? "!bg-red-500" : ""
                    }`}>
                      {item.name === "Friends" ? requests.length : item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="px-7">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Pages You Like</h3>
          <ul className="space-y-3">
            {pages.map((page, i) => (
              <li key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${page.iconBg} ${page.iconText} group-hover:opacity-80 transition-opacity`}>
                  {page.text}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {page.name}
                  {page.name === "Behance" && <span className="inline-block ml-1 bg-blue-500 text-white rounded-full w-3 h-3 text-center leading-3 text-[8px]">✓</span>}
                </span>
              </li>
            ))}
          </ul>
          <button className="text-xs font-semibold text-gray-500 mt-4 hover:text-gray-800 transition-colors">
            View All
          </button>
        </div>
      </div>

      <div className="px-4 text-[10px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
        <a href="#" className="hover:text-gray-600 transition-colors">Privacy terms</a>
        <a href="#" className="hover:text-gray-600 transition-colors">Advertising</a>
        <a href="#" className="hover:text-gray-600 transition-colors">Cookies</a>
        <span className="w-full mt-1">Platform © 2023</span>
      </div>
    </aside>

    <FollowersModal
      isOpen={followModalType !== null}
      onClose={() => setFollowModalType(null)}
      initialTab={followModalType || "followers"}
      followersCount={followersCount}
      followingCount={followingCount}
    />
  </>
  );
}
