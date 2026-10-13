"use client";

import { Avatar } from "@/components/ui/Avatar";
import { FiCamera, FiPaperclip } from "react-icons/fi";

interface CreatePostCollapsedProps {
  userAvatar?: string;
  userName?: string;
  displayName: string;
  onExpand: () => void;
  onSelectPhoto: () => void;
  onSelectAttachment: () => void;
}

export function CreatePostCollapsed({
  userAvatar,
  userName,
  displayName,
  onExpand,
  onSelectPhoto,
  onSelectAttachment,
}: CreatePostCollapsedProps) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-4">
      <Avatar
        size="md"
        src={userAvatar || "/default-avatar-profile.webp"}
        alt={displayName}
      />

      <div className="flex-1 min-w-0">
        <input
          type="text"
          readOnly
          placeholder={`What's on your mind, ${userName || "there"}?`}
          className="w-full bg-gray-50 hover:bg-gray-100/80 text-xs sm:text-sm text-gray-800 placeholder-gray-400 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 outline-none cursor-pointer transition-colors truncate"
          onClick={onExpand}
        />
      </div>

      <div className="flex items-center gap-0.5 sm:gap-2 text-gray-400 shrink-0">
        <button
          type="button"
          aria-label="Add photo"
          onClick={onSelectPhoto}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          title="Add photo"
        >
          <FiCamera className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
        </button>
        <button
          type="button"
          aria-label="Add attachment"
          onClick={onSelectAttachment}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          title="Add attachment"
        >
          <FiPaperclip className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}
