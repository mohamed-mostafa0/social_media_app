"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { FiMoreHorizontal, FiMapPin, FiHeart, FiMessageCircle, FiShare2, FiTrash2 } from "react-icons/fi";
import { ProfilePost } from "../types/profile.types";
import { useDeletePost, useTogglePostLike, PostComments } from "@/features/posts";
import { useClickOutside } from "@/hooks";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ProfilePostCardProps {
  post: ProfilePost;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function ProfilePostCard({
  post,
  onLike,
  onComment,
  onShare,
}: ProfilePostCardProps) {
  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: togglePostLike } = useTogglePostLike();

  useClickOutside(menuRef, () => setShowMenu(false), showMenu);

  const [likesCount, setLikesCount] = useState(
    typeof post.likes === "number" ? post.likes : parseInt(String(post.likes)) || 0
  );

  useEffect(() => {
    setIsLiked(Boolean(post.isLiked));
    setLikesCount(
      typeof post.likes === "number" ? post.likes : parseInt(String(post.likes)) || 0
    );
  }, [post.isLiked, post.likes]);

  const handleLike = () => {
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));
    togglePostLike(post.id, {
      onError: () => {
        setIsLiked(!nextIsLiked);
        setLikesCount((prev) => (nextIsLiked ? Math.max(0, prev - 1) : prev + 1));
      },
    });
    onLike?.(post.id);
  };

  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;

    if (post.images.length === 3) {
      return (
        <div className="grid grid-cols-12 gap-2 mb-4 rounded-2xl overflow-hidden">
          <div className="col-span-7 h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={post.images[0]}
              alt="Main post visual"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="col-span-5 flex flex-col gap-2 h-64 sm:h-80 md:h-96">
            <div className="flex-1 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={post.images[1]}
                alt="Post visual 2"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="flex-1 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={post.images[2]}
                alt="Post visual 3"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      );
    }

    if (post.images.length === 1) {
      return (
        <div className="mb-4 rounded-2xl overflow-hidden bg-gray-100 max-h-96">
          <img
            src={post.images[0]}
            alt="Post visual"
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 mb-4 rounded-2xl overflow-hidden">
        {post.images.slice(0, 4).map((img, idx) => (
          <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img src={img} alt={`Post visual ${idx}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <article className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-200 ring-2 ring-gray-100">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
              {post.author.name}
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">{post.author.date}</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Post options"
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <FiMoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setIsConfirmOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {(post.content || (post.tags && post.tags.length > 0)) && (
        <div className="mb-3 space-y-1">
          {post.content && (
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
              {post.content}
            </p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs sm:text-sm font-medium text-blue-500 hover:underline cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {renderImages()}

      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5 text-gray-500">
          <FiMapPin className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium text-[11px] sm:text-xs">
            {post.location || "London, UK"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            type="button"
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLiked ? "text-rose-600 font-semibold" : "text-gray-500 hover:text-rose-500"
            }`}
          >
            <FiHeart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => {
              setShowComments((prev) => !prev);
              onComment?.(post.id);
            }}
            type="button"
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              showComments ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-blue-600"
            }`}
          >
            <FiMessageCircle className={`w-4 h-4 ${showComments ? "fill-blue-50 text-blue-600" : ""}`} />
            <span>{post.comments}</span>
          </button>

          {post.shares !== undefined && (
            <button
              onClick={() => onShare?.(post.id)}
              type="button"
              className="flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
            >
              <FiShare2 className="w-4 h-4" />
              <span>{post.shares}</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <PostComments
            postId={String(post.id)}
            allowComments={post.allowComments}
            comments={post.commentsList}
            postOwnerId={post.author.id}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          if (!isDeleting) setIsConfirmOpen(false);
        }}
        onConfirm={() => {
          deletePost(String(post.id), {
            onSuccess: () => {
              setIsConfirmOpen(false);
            },
          });
        }}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </article>
  );
}
