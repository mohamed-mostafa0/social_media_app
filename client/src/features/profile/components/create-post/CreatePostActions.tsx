"use client";

import { FiCamera, FiMessageSquare, FiLoader } from "react-icons/fi";

interface CreatePostActionsProps {
  allowComments: boolean;
  onToggleAllowComments: () => void;
  onSelectPhoto: () => void;
  onCancel: () => void;
  isPending: boolean;
  canSubmit: boolean;
}

export function CreatePostActions({
  allowComments,
  onToggleAllowComments,
  onSelectPhoto,
  onCancel,
  isPending,
  canSubmit,
}: CreatePostActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onSelectPhoto}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        >
          <FiCamera className="w-4 h-4 text-blue-500" />
          <span>Photo</span>
        </button>

        <button
          type="button"
          onClick={onToggleAllowComments}
          disabled={isPending}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            allowComments
              ? "text-gray-700 bg-gray-100 hover:bg-gray-200/70"
              : "text-gray-400 bg-gray-50 line-through"
          }`}
          title="Toggle comments permission"
        >
          <FiMessageSquare className="w-3.5 h-3.5" />
          <span>{allowComments ? "Comments On" : "Comments Off"}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            canSubmit
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isPending ? (
            <>
              <FiLoader className="w-3.5 h-3.5 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <span>Post</span>
          )}
        </button>
      </div>
    </div>
  );
}
