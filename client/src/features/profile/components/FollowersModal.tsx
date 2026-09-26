"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSearch, FiUsers, FiUserCheck, FiUserX, FiLoader, FiUserPlus } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { useEscapeKey, useLockBodyScroll } from "@/hooks";
import {
  useGetFollowers,
  useGetFollowings,
  useToggleFollow,
  useRemoveFollower,
} from "../hooks/useFollowingOrFollowers";
import { FollowRequester } from "../types/request.types";

interface FollowModalUser extends FollowRequester {
  isFollowing: boolean;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "followers" | "following";
  followersCount?: number;
  followingCount?: number;
}

export function FollowersModal({
  isOpen,
  onClose,
  initialTab = "followers",
  followersCount,
  followingCount,
}: FollowersModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: followers = [], isLoading: isLoadingFollowers } = useGetFollowers();
  const { data: followings = [], isLoading: isLoadingFollowings } = useGetFollowings();
  const { mutate: toggleFollow, isPending: isToggling } = useToggleFollow();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { mutate: removeFollower, isPending: isRemoving } = useRemoveFollower();
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
    }
  }, [isOpen, initialTab]);

  useEscapeKey(onClose, isOpen);
  useLockBodyScroll(isOpen);

  const activeUsers: FollowModalUser[] = useMemo(() => {
    const rawList = activeTab === "followers" ? followers : followings;
    const list: FollowModalUser[] = [];

    for (const item of rawList) {
      const u = activeTab === "followers" ? item.followFromId : item.followToId;
      if (typeof u === "object" && u !== null && u._id) {
        list.push({
          ...u,
          isFollowing: activeTab === "followers" ? Boolean(item.isFollowing) : true,
        });
      }
    }

    return list;
  }, [activeTab, followers, followings]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return activeUsers;
    const q = searchQuery.toLowerCase().trim();
    return activeUsers.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      return fullName.includes(q);
    });
  }, [activeUsers, searchQuery]);

  const isLoading = activeTab === "followers" ? isLoadingFollowers : isLoadingFollowings;
  const currentCount =
    activeTab === "followers"
      ? followersCount ?? followers.length
      : followingCount ?? followings.length;

  const handleToggleFollow = (targetUserId: string) => {
    setTogglingId(targetUserId);
    toggleFollow(targetUserId, {
      onSettled: () => setTogglingId(null),
    });
  };

  const handleRemoveFollower = (targetUserId: string) => {
    setRemovingId(targetUserId);
    removeFollower(targetUserId, {
      onSettled: () => setRemovingId(null),
    });
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                {activeTab}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-100 px-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("followers");
                  setSearchQuery("");
                }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  activeTab === "followers"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <span>Followers</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {followersCount ?? followers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("following");
                  setSearchQuery("");
                }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  activeTab === "following"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <span>Following</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {followingCount ?? followings.length}
                </span>
              </button>
            </div>

            <div className="px-6 pt-3 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 pl-9 pr-4 py-2 rounded-xl outline-none border border-transparent focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-3 flex-1 space-y-2.5 divide-y divide-gray-50">
              {isLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse pt-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-32 h-3.5 bg-gray-200 rounded" />
                        <div className="w-20 h-2.5 bg-gray-100 rounded" />
                      </div>
                      <div className="w-20 h-7 bg-gray-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                    {activeTab === "followers" ? (
                      <FiUsers className="w-6 h-6 text-blue-500" />
                    ) : (
                      <FiUserCheck className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    {searchQuery
                      ? "No results found"
                      : activeTab === "followers"
                      ? "No followers yet"
                      : "Not following anyone yet"}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                    {searchQuery
                      ? `No user found matching "${searchQuery}".`
                      : activeTab === "followers"
                      ? "When other users follow this account, they will appear here."
                      : "People you follow will show up right here."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
                  const isBusy = isToggling && togglingId === u._id;
                  const isRemovingFollower = isRemoving && removingId === u._id;

                  return (
                    <div
                      key={u._id}
                      className="flex items-center justify-between gap-3 pt-2.5 pb-1 first:pt-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar
                          size="md"
                          src={u.profilePicture || "/default-avatar-profile.webp"}
                          alt={fullName}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate hover:text-blue-600 transition-colors cursor-pointer">
                            {fullName}
                          </h4>
                          {u.email && (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {u.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {activeTab === "following" ? (
                        <button
                          type="button"
                          onClick={() => handleToggleFollow(u._id)}
                          disabled={isBusy}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                          title="Unfollow user"
                        >
                          {isBusy ? (
                            <FiLoader className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FiUserX className="w-3.5 h-3.5" />
                          )}
                          <span>Unfollow</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {u.isFollowing ? (
                            <button
                              type="button"
                              onClick={() => handleToggleFollow(u._id)}
                              disabled={isBusy}
                              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                              title="Unfollow user"
                            >
                              {isBusy ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiUserCheck className="w-3.5 h-3.5 text-gray-500" />
                              )}
                              <span>Following</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleFollow(u._id)}
                              disabled={isBusy}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="Follow user"
                            >
                              {isBusy ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiUserPlus className="w-3.5 h-3.5" />
                              )}
                              <span>Follow</span>
                            </button>
                          )}

                          {/* Remove follower button (X icon) */}
                          <button
                            type="button"
                            onClick={() => handleRemoveFollower(u._id)}
                            disabled={isRemovingFollower}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            title="Remove follower"
                            aria-label="Remove follower"
                          >
                            {isRemovingFollower ? (
                              <FiLoader className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <FiX className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
