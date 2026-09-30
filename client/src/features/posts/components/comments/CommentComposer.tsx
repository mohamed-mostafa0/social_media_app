"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { FiImage, FiSend, FiX, FiLoader } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useAddComment } from "../../hooks/useComment";

interface CommentComposerProps {
  postId: string;
  parentCommentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  size?: "sm" | "md";
}

export function CommentComposer({
  postId,
  parentCommentId,
  placeholder = "Write a comment...",
  autoFocus = false,
  onSuccess,
  onCancel,
  size = "md",
}: CommentComposerProps) {
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUser = useAuthStore((state) => state.user);
  const { mutate: addComment, isPending } = useAddComment();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setAttachment(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed && !attachment) return;
    if (isPending) return;

    addComment(
      {
        postId,
        body: {
          content: trimmed,
          parentCommentId,
          attachment,
        },
      },
      {
        onSuccess: () => {
          setContent("");
          handleRemoveAttachment();
          onSuccess?.();
        },
      }
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const userAvatar = currentUser?.profilePicture || "/default-avatar-profile.webp";
  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "You";

  return (
    <div className={`flex gap-2.5 items-start ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <div className="shrink-0 pt-0.5">
        <Avatar
          src={userAvatar}
          alt={userName}
          size={size === "sm" ? "sm" : "sm"}
          className="ring-1 ring-gray-100"
        />
      </div>

      <div className="flex-1 min-w-0 bg-gray-50/80 hover:bg-gray-100/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all rounded-2xl border border-gray-200/70 p-2.5">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={1}
          disabled={isPending}
          className="w-full bg-transparent resize-none outline-none text-gray-800 placeholder:text-gray-400 text-xs sm:text-sm leading-relaxed max-h-32"
          style={{ minHeight: "24px" }}
        />

        {previewUrl && (
          <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-gray-200 bg-white group">
            <img
              src={previewUrl}
              alt="Attachment preview"
              className="max-h-24 sm:max-h-32 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-gray-900/70 text-white hover:bg-gray-900 transition-colors cursor-pointer shadow-sm"
              title="Remove image"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100/80">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Attach photo"
            >
              <FiImage className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={(!content.trim() && !attachment) || isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                content.trim() || attachment
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isPending ? (
                <>
                  <FiLoader className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <FiSend className="w-3 h-3" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
