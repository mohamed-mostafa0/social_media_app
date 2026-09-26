"use client";

import { FiEdit3, FiPlus, FiImage } from "react-icons/fi";

interface ProfileEmptyPostsProps {
  onActionClick?: () => void;
}

export function ProfileEmptyPosts({ onActionClick }: ProfileEmptyPostsProps) {
  return (
    <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xs border border-gray-100 text-center flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-50 via-indigo-50 to-blue-100/50 border border-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs">
          <FiEdit3 className="w-7 h-7 sm:w-9 sm:h-9 text-blue-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs text-indigo-500">
          <FiImage className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
        No posts yet
      </h3>

      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
        Share your thoughts, photos, or updates with your network. Your posts will appear right here.
      </p>

      {onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100/80 border border-blue-100 text-blue-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <FiPlus className="w-3.5 h-3.5 text-blue-500" />
          <span>Create your first post</span>
        </button>
      )}
    </div>
  );
}
