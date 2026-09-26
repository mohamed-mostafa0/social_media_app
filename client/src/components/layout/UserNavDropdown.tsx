"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, 
  FiSettings, 
  FiBookmark, 
  FiHelpCircle, 
  FiLogOut, 
  FiChevronRight 
} from "react-icons/fi";
import { Avatar } from "../ui/Avatar";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useClickOutside, useEscapeKey } from "@/hooks";

export function UserNavDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const userAvatar = user?.profilePicture;
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";
  const userHandle = user?.email ? `@${user.email.split("@")[0]}` : "@user";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 p-1 rounded-full transition-all group cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User navigation menu"
      >
        <div className="relative">
          <Avatar 
            size="sm" 
            src={userAvatar} 
            online 
            className="transition-transform group-hover:scale-105"
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-76 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-100 p-2.5 z-50 origin-top-right focus:outline-none"
          >
            <Link
              href="/profile"
              onClick={closeDropdown}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <Avatar size="md" src={userAvatar} online />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {fullName}
                  </h4>
                </div>
                <p className="text-xs text-gray-400 truncate">{userHandle}</p>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <div className="h-px bg-gray-100 my-1.5 mx-2" />

            <div className="space-y-0.5">
              <Link
                href="/profile"
                onClick={closeDropdown}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className=" rounded-lg text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <FiUser className="w-4 h-4" />
                  </span>
                  <span>My Profile</span>
                </div>
              </Link>

              <Link
                href="/saved"
                onClick={closeDropdown}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className=" rounded-lg text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <FiBookmark className="w-4 h-4" />
                  </span>
                  <span>Saved Posts</span>
                </div>
              </Link>

              <Link
                href="/settings"
                onClick={closeDropdown}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className=" rounded-lg text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <FiSettings className="w-4 h-4" />
                  </span>
                  <span>Settings & Privacy</span>
                </div>
              </Link>

              <Link
                href="/help"
                onClick={closeDropdown}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className=" rounded-lg text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <FiHelpCircle className="w-4 h-4" />
                  </span>
                  <span>Help & Support</span>
                </div>
              </Link>
            </div>

            <div className="h-px bg-gray-100 my-1.5 mx-2" />

            <button
              onClick={() => {
                closeDropdown();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50/80 rounded-xl transition-colors group cursor-pointer"
            >
              <span className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                <FiLogOut className="w-4 h-4" />
              </span>
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
