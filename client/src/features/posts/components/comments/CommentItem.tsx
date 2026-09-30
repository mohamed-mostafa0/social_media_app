"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  FiHeart,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiCornerDownRight,
  FiX,
  FiImage,
  FiLoader,
} from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { formatRelativeDate } from "@/lib/date.utils";
import { useClickOutside } from "@/hooks";
import { CommentItem as CommentItemType } from "../../types/comment.types";
import {
  useDeleteComment,
  useEditComment,
  useToggleCommentLike,
} from "../../hooks/useComment";
import { CommentComposer } from "./CommentComposer";

interface CommentItemProps {
  comment: CommentItemType;
  postId: string;
  postOwnerId?: string;
  isReply?: boolean;
}

export function PostCommentItem({
  comment,
  postId,
  postOwnerId,
  isReply = false,
}: CommentItemProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [editContent, setEditContent] = useState(comment.content || "");
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [newAttachment, setNewAttachment] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [isLiked, setIsLiked] = useState(Boolean(comment.isLiked));
  const [likesCount, setLikesCount] = useState(comment.likesCount ?? 0);

  useEffect(() => {
    setIsLiked(Boolean(comment.isLiked));
    setLikesCount(comment.likesCount ?? 0);
  }, [comment.isLiked, comment.likesCount]);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowMenu(false), showMenu);

  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
  const { mutate: editComment, isPending: isEditingPending } = useEditComment();
  const { mutate: toggleLike } = useToggleCommentLike();

  const isCommentOwner =
    Boolean(currentUser?._id) &&
    String(comment.ownerId?._id) === String(currentUser?._id);

  const isPostOwner =
    Boolean(currentUser?._id) &&
    Boolean(postOwnerId) &&
    String(postOwnerId) === String(currentUser?._id);

  const canDelete = isCommentOwner || isPostOwner;
  const canEdit = isCommentOwner;

  const authorName = comment.ownerId
    ? `${comment.ownerId.firstName || ""} ${comment.ownerId.lastName || ""}`.trim() || "User"
    : "User";
  const authorAvatar =
    comment.ownerId?.profilePicture || "/default-avatar-profile.webp";

  const handleToggleLike = () => {
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));
    toggleLike(comment._id, {
      onError: () => {
        setIsLiked(!nextIsLiked);
        setLikesCount((prev) => (nextIsLiked ? Math.max(0, prev - 1) : prev + 1));
      },
    });
  };

  const handleEditFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setNewAttachment(file);
      setRemoveAttachment(false);
      const url = URL.createObjectURL(file);
      setNewPreviewUrl(url);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content || "");
    setRemoveAttachment(false);
    setNewAttachment(null);
    if (newPreviewUrl) {
      URL.revokeObjectURL(newPreviewUrl);
      setNewPreviewUrl(null);
    }
  };

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    const hasRemainingAttachment =
      (!removeAttachment && Boolean(comment.attachment?.url)) || Boolean(newAttachment);

    if (!trimmed && !hasRemainingAttachment) {
      alert("Comment must contain text or an image");
      return;
    }

    editComment(
      {
        commentId: comment._id,
        body: {
          content: trimmed,
          removeAttachment,
          attachment: newAttachment,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setNewAttachment(null);
          if (newPreviewUrl) {
            URL.revokeObjectURL(newPreviewUrl);
            setNewPreviewUrl(null);
          }
        },
      }
    );
  };

  const handleDelete = () => {
    deleteComment(comment._id, {
      onSuccess: () => {
        setIsConfirmDeleteOpen(false);
      },
    });
  };

  const currentAttachmentUrl =
    !removeAttachment && !newPreviewUrl
      ? comment.attachment?.url
      : newPreviewUrl || null;

  const replies = comment.replies || [];

  return (
    <div className={`group/comment relative ${isReply ? "mt-3" : "mt-4"}`}>
      <div className="flex gap-2.5 items-start">
        <div className="shrink-0 pt-0.5">
          <Avatar
            src={authorAvatar}
            alt={authorName}
            size={isReply ? "sm" : "sm"}
            className="ring-1 ring-gray-100"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative inline-block max-w-full text-left bg-gray-50/90 hover:bg-gray-100/70 border border-gray-100 rounded-2xl px-3.5 py-2.5 transition-colors">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                {authorName}
              </span>
              <span className="text-[11px] text-gray-400">
                {formatRelativeDate(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2 mt-1 min-w-[220px] sm:min-w-[280px]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  disabled={isEditingPending}
                  className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-800"
                />

                {currentAttachmentUrl && (
                  <div className="relative inline-block rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={currentAttachmentUrl}
                      alt="Attachment"
                      className="max-h-24 rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveAttachment(true);
                        setNewAttachment(null);
                        if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
                        setNewPreviewUrl(null);
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-xs"
                      title="Remove image"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Change or add image"
                    >
                      <FiImage className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isEditingPending}
                      className="px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isEditingPending}
                      className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                    >
                      {isEditingPending ? (
                        <>
                          <FiLoader className="w-3 h-3 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {comment.content && (
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                )}

                {comment.attachment?.url && (
                  <div className="mt-2">
                    <img
                      src={comment.attachment.url}
                      alt="Comment attachment"
                      onClick={() => setIsImageModalOpen(true)}
                      className="max-h-48 sm:max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity border border-gray-100"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {!isEditing && (canEdit || canDelete) && (
            <div className="inline-block relative ml-1 align-top pt-2" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="opacity-0 group-hover/comment:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                title="Options"
              >
                <FiMoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div className="absolute left-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditing(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <FiEdit2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>Edit</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setIsConfirmDeleteOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] text-gray-500 font-medium">
              <button
                type="button"
                onClick={handleToggleLike}
                className={`flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer ${
                  isLiked ? "text-rose-600 font-semibold" : ""
                }`}
              >
                <FiHeart
                  className={`w-3.5 h-3.5 ${
                    isLiked ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                {likesCount > 0 && <span>{likesCount}</span>}
                <span>Like</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReplyBox((prev) => !prev)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <FiCornerDownRight className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </div>
          )}

          {showReplyBox && (
            <div className="mt-3 ml-1 sm:ml-2">
              <CommentComposer
                postId={postId}
                parentCommentId={comment._id}
                placeholder={`Reply to ${comment.ownerId?.firstName || "user"}...`}
                autoFocus
                size="sm"
                onSuccess={() => {
                  setShowReplyBox(false);
                  setShowReplies(true);
                }}
                onCancel={() => setShowReplyBox(false)}
              />
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowReplies((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer py-1"
              >
                <FiCornerDownRight className="w-3.5 h-3.5" />
                <span>
                  {showReplies
                    ? `Hide ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`
                    : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                </span>
              </button>

              {showReplies && (
                <div className="pl-3 sm:pl-4 border-l-2 border-gray-100 space-y-3 mt-1">
                  {replies.map((reply) => (
                    <PostCommentItem
                      key={reply._id}
                      comment={reply}
                      postId={postId}
                      postOwnerId={postOwnerId}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isImageModalOpen && comment.attachment?.url && (
        <div
          onClick={() => setIsImageModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={comment.attachment.url}
              alt="Enlarged comment attachment"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-3 -right-3 p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100 shadow-lg cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          if (!isDeleting) setIsConfirmDeleteOpen(false);
        }}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
