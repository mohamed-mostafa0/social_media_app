"use client";

import { Avatar } from "@/components/ui/Avatar";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { useCreatePostForm } from "../hooks/useCreatePostForm";
import {
  CreatePostCollapsed,
  CreatePostPreviews,
  CreatePostActions,
} from "./create-post";

interface ProfileCreatePostProps {
  onPost?: (content: string) => void;
}

export function ProfileCreatePost({ onPost }: ProfileCreatePostProps) {
  const {
    user,
    displayName,
    formik,
    isExpanded,
    previews,
    errorMessage,
    setErrorMessage,
    isPending,
    canSubmit,
    fileInputRef,
    textareaRef,
    handleFileChange,
    removePreview,
    handleCancel,
    triggerFileInput,
    expandAndFocus,
  } = useCreatePostForm({ onPost });

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-gray-100 mb-4 sm:mb-6 transition-all">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        {!isExpanded ? (
          <CreatePostCollapsed
            userAvatar={user?.profilePicture}
            userName={user?.firstName}
            displayName={displayName}
            onExpand={expandAndFocus}
            onSelectPhoto={triggerFileInput}
            onSelectAttachment={triggerFileInput}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar
                size="md"
                src={user?.profilePicture || "/default-avatar-profile.webp"}
                alt={displayName}
              />
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900 mb-1">
                  {displayName}
                </div>
                <textarea
                  ref={textareaRef}
                  name="describtion"
                  rows={3}
                  value={formik.values.describtion}
                  onChange={formik.handleChange}
                  placeholder={`What's on your mind, ${user?.firstName || "there"}?`}
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed"
                  disabled={isPending}
                />
              </div>
            </div>

            <CreatePostPreviews
              previews={previews}
              onRemove={removePreview}
              disabled={isPending}
            />

            <CreatePostActions
              allowComments={Boolean(formik.values.allowComments)}
              onToggleAllowComments={() =>
                formik.setFieldValue("allowComments", !formik.values.allowComments)
              }
              onSelectPhoto={triggerFileInput}
              onCancel={handleCancel}
              isPending={isPending}
              canSubmit={canSubmit}
            />
          </div>
        )}
      </form>
    </div>
  );
}
