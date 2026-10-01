"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiImage,
  FiLoader,
  FiMessageSquare,
  FiAlertCircle,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { useEscapeKey, useLockBodyScroll } from "@/hooks";
import { useEditPost } from "../hooks/usePost";
import { ProfilePost } from "@/features/profile/types/profile.types";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ProfilePost;
}

export function EditPostModal({ isOpen, onClose, post }: EditPostModalProps) {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState(post.content || "");
  const [allowComments, setAllowComments] = useState(post.allowComments !== false);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: editPost, isPending } = useEditPost();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setContent(post.content || "");
      setAllowComments(post.allowComments !== false);
      setRemovedUrls([]);
      setNewFiles([]);
      setNewPreviews([]);
      setErrorMessage(null);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, post]);

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  useEscapeKey(onClose, isOpen && !isPending);
  useLockBodyScroll(isOpen);

  if (!mounted) return null;

  const initialImages = post.images || [];
  const remainingExistingCount = initialImages.filter(
    (url) => !removedUrls.includes(url)
  ).length;
  const totalImagesCount = remainingExistingCount + newFiles.length;

  const canSubmit =
    !isPending && (content.trim().length > 0 || totalImagesCount > 0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validImageFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select only image files.");
        return;
      }
      validImageFiles.push(file);
    }

    const newUrls = validImageFiles.map((file) => URL.createObjectURL(file));
    setNewFiles((prev) => [...prev, ...validImageFiles]);
    setNewPreviews((prev) => [...prev, ...newUrls]);
    setErrorMessage(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleToggleRemoveExisting = (url: string) => {
    setRemovedUrls((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const handleRemoveNewFile = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData();
    formData.append("describtion", content.trim());
    formData.append("allowComments", String(allowComments));

    if (removedUrls.length > 0) {
      if (removedUrls.length === initialImages.length) {
        formData.append("removeAttachments", "true");
      } else {
        formData.append("removeAttachments", JSON.stringify(removedUrls));
      }
    }

    if (newFiles.length > 0) {
      newFiles.forEach((file) => formData.append("images", file));
    }

    editPost(
      { postId: post.id, body: formData },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message || "Failed to update post. Please try again.";
          setErrorMessage(msg);
        },
      }
    );
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (!isPending) onClose();
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-gray-100 z-10 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Post</h3>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 p-3 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
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

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto space-y-4 py-4 pr-1"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  size="md"
                  src={post.author.avatar || "/default-avatar-profile.webp"}
                  alt={post.author.name}
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {post.author.name}
                  </h4>
                  <span className="text-[11px] text-gray-400">Editing post</span>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="What's on your mind?"
                disabled={isPending}
                className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent resize-none outline-none leading-relaxed border-b border-gray-100 pb-3"
              />

              {initialImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Current Photos ({initialImages.length})</span>
                    {removedUrls.length > 0 && (
                      <span className="text-red-600 font-semibold text-[11px]">
                        {removedUrls.length} marked for removal
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {initialImages.map((url, idx) => {
                      const isRemoved = removedUrls.includes(url);
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden group border transition-all ${
                            isRemoved
                              ? "opacity-40 border-red-400 bg-red-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Post attachment ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => handleToggleRemoveExisting(url)}
                            disabled={isPending}
                            className={`absolute top-1.5 right-1.5 p-1.5 rounded-lg shadow-sm text-xs transition-colors cursor-pointer ${
                              isRemoved
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-white/90 text-red-600 hover:bg-red-50 hover:text-red-700"
                            }`}
                            title={isRemoved ? "Undo remove" : "Remove photo"}
                          >
                            {isRemoved ? (
                              <FiRotateCcw className="w-3.5 h-3.5" />
                            ) : (
                              <FiTrash2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isRemoved && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-md shadow-xs">
                                Removed
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {newPreviews.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-blue-600 font-semibold">
                    New Photos to Add ({newPreviews.length})
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {newPreviews.map((preview, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 bg-blue-50/50"
                      >
                        <img
                          src={preview}
                          alt={`New preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          disabled={isPending}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                          title="Remove new photo"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FiImage className="w-4 h-4 text-green-600" />
                    <span>Add Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllowComments((prev) => !prev)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                      allowComments
                        ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
                        : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <FiMessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {allowComments ? "Comments Allowed" : "Comments Off"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isPending ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
