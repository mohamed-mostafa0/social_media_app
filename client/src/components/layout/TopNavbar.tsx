"use client";

import { useState } from "react";
import { FiSearch, FiBookmark, FiX } from "react-icons/fi";
import { IconButton } from "../ui/IconButton";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useFollowRequests } from "@/features/profile";
import { UserNavDropdown } from "./UserNavDropdown";
import { NotificationDropdown } from "@/features/notifications";

export function TopNavbar() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const { data: requests = [] } = useFollowRequests();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-3.5 sm:px-6 py-2.5 sm:py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex flex-col justify-center gap-[2px] items-center p-[6px]">
            <div className="w-full flex gap-[2px]">
              <div className="w-1.5 h-1.5 bg-white rounded-sm" />
              <div className="w-1.5 h-1.5 bg-white/60 rounded-sm" />
            </div>
            <div className="w-full flex gap-[2px]">
              <div className="w-1.5 h-1.5 bg-white/60 rounded-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-sm" />
            </div>
          </div>
          <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            WeShare
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl mx-6 lg:mx-8 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-full text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
            placeholder="Search posts, friends..."
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="Search"
          >
            {isMobileSearchOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiSearch className="w-5 h-5" />
            )}
          </button>

          {isAuth && <NotificationDropdown />}

          <IconButton variant="ghost" size="md" className="hidden sm:inline-flex">
            <FiBookmark className="w-5 h-5" />
          </IconButton>

          <div className="h-6 sm:h-8 w-px bg-gray-200 mx-0.5 sm:mx-1" />

          {isAuth ? (
            <UserNavDropdown />
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 sm:px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="mt-2.5 pt-2 pb-1 md:hidden border-t border-gray-100 animate-fadeIn">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              autoFocus
              className="block w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              placeholder="Search posts, friends..."
            />
          </div>
        </div>
      )}
    </header>
  );
}
