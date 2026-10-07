"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useStories } from "../hooks/useStory";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { IUserStoryGroup } from "../types/story.types";
import { CreateStoryModal } from "./CreateStoryModal";
import { StoryViewerModal } from "./StoryViewerModal";

export function Stories() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  const { data, isLoading } = useStories();
  const authUser = useAuthStore((state) => state.user);

  const rawData = Array.isArray(data) ? data : (data as any)?.data;
  const storyGroups: IUserStoryGroup[] = Array.isArray(rawData) ? rawData : [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedViewerGroupIndex, setSelectedViewerGroupIndex] = useState<number | null>(null);

  const currentUserGroup = storyGroups.find((g) => g.isUser) || {
    user: {
      _id: authUser?._id || "me",
      firstName: authUser?.firstName || "Your",
      lastName: authUser?.lastName || "Story",
      profilePicture: authUser?.profilePicture,
    },
    isUser: true,
    allViewed: true,
    stories: [],
  };

  const otherGroups = storyGroups.filter((g) => !g.isUser);
  const allDisplayGroups: IUserStoryGroup[] = [currentUserGroup, ...otherGroups];

  const playableGroups = allDisplayGroups.filter((g) => g.stories && g.stories.length > 0);

  const handleUserStoryClick = (group: IUserStoryGroup) => {
    if (group.isUser) {
      if (group.stories.length > 0) {
        const playableIdx = playableGroups.findIndex((g) => g.isUser);
        if (playableIdx !== -1) {
          setSelectedViewerGroupIndex(playableIdx);
        }
      } else {
        setIsCreateOpen(true);
      }
    } else {
      const playableIdx = playableGroups.findIndex((g) => g.user._id === group.user._id);
      if (playableIdx !== -1) {
        setSelectedViewerGroupIndex(playableIdx);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6 overflow-hidden"
        ref={containerRef}
      >
        {isLoading ? (
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 border-2 border-white" />
                <div className="w-12 h-2.5 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 scrollbar-hide"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {allDisplayGroups.map((group, index) => {
              const hasStories = group.stories && group.stories.length > 0;
              const hasUnseen = !group.allViewed && hasStories;
              const avatar =
                group.user?.profilePicture ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop";

              return (
                <motion.div
                  key={group.user?._id || index}
                  variants={itemVariants}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer group select-none"
                  onClick={() => handleUserStoryClick(group)}
                >
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-transform duration-200 group-hover:scale-105 ${
                      group.isUser
                        ? hasStories
                          ? hasUnseen
                            ? "bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400"
                            : "border-2 border-gray-300"
                          : "border-2 border-dashed border-gray-300 hover:border-purple-500"
                        : hasUnseen
                        ? "bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400"
                        : "border-2 border-gray-200"
                    }`}
                  >
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                      <img
                        src={avatar}
                        alt={group.user?.firstName || "User"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {group.isUser && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCreateOpen(true);
                        }}
                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full border-2 border-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                        title="Add Story"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] sm:text-xs font-medium text-gray-700 text-center truncate w-16">
                    {group.isUser ? "Your Story" : `${group.user?.firstName || "User"}`}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {selectedViewerGroupIndex !== null && playableGroups.length > 0 && (
        <StoryViewerModal
          isOpen={selectedViewerGroupIndex !== null}
          initialGroupIndex={selectedViewerGroupIndex}
          storyGroups={playableGroups}
          onClose={() => setSelectedViewerGroupIndex(null)}
        />
      )}
    </>
  );
}
