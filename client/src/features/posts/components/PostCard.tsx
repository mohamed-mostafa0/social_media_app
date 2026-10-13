"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { FiMoreVertical, FiHeart, FiMessageCircle, FiBookmark, FiShare2 } from "react-icons/fi";
import { PostAuthor } from "../types/post.types";
import { CommentItem as CommentItemType } from "../types/comment.types";
import { PostComments } from "./comments";
import { useTogglePostLike } from "../hooks/usePost";

export interface PostCardProps {
  id?: string | number;
  author: PostAuthor;
  content: string;
  tags: string[];
  images: string[];
  likes: string | number;
  comments: string | number;
  shares?: string | number;
  allowComments?: boolean;
  commentsList?: CommentItemType[];
  authorId?: string;
  isLiked?: boolean;
  onLike?: (id: string | number) => void;
}

export function PostCard({
  id,
  author,
  content,
  tags,
  images,
  likes,
  comments,
  shares = "0",
  allowComments = true,
  commentsList = [],
  authorId,
  isLiked = false,
  onLike,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isLikedState, setIsLikedState] = useState(Boolean(isLiked));
  const [likesCount, setLikesCount] = useState(
    typeof likes === "number" ? likes : parseInt(String(likes)) || 0
  );
  const { mutate: togglePostLike } = useTogglePostLike();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    setIsLikedState(Boolean(isLiked));
    setLikesCount(typeof likes === "number" ? likes : parseInt(String(likes)) || 0);
  }, [isLiked, likes]);

  const handleLike = () => {
    const nextIsLiked = !isLikedState;
    setIsLikedState(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (id) {
      togglePostLike(String(id), {
        onError: () => {
          setIsLikedState(!nextIsLiked);
          setLikesCount((prev) => (nextIsLiked ? Math.max(0, prev - 1) : prev + 1));
        },
      });
    }
    if (id && onLike) onLike(id);
  };

  return (
    <motion.article 
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs sm:shadow-sm border border-gray-100 mb-4 sm:mb-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {authorId ? (
          <Link href={`/profile/${authorId}`} className="flex items-center gap-2.5 sm:gap-3 group/author min-w-0">
            <Avatar size="md" src={author.avatar} />
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover/author:text-blue-600 transition-colors truncate">
                {author.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate">{author.date || author.handle}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Avatar size="md" src={author.avatar} />
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{author.name}</h3>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate">{author.date || author.handle}</p>
            </div>
          </div>
        )}
        <IconButton variant="ghost" size="sm" className="shrink-0">
          <FiMoreVertical className="w-5 h-5 text-gray-400" />
        </IconButton>
      </div>

      {content && (
        <div className="mb-3 sm:mb-4">
          <p className="text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap break-words">
            {content}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="text-blue-500 text-xs sm:text-sm hover:underline cursor-pointer">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div
          className={`grid gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-hidden rounded-xl ${
            images.length === 1
              ? "grid-cols-1"
              : "grid-cols-2"
          }`}
        >
          {images.map((img, index) => {
            if (images.length === 1) {
              return (
                <div
                  key={index}
                  className="col-span-1 w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center max-h-[380px] sm:max-h-[500px]"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-auto h-auto max-h-[380px] sm:max-h-[500px] max-w-full object-contain rounded-xl"
                  />
                </div>
              );
            }
            if (images.length === 2) {
              return (
                <div
                  key={index}
                  className="col-span-1 h-40 sm:h-56 md:h-64 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }
            if (images.length === 3 && index === 0) {
              return (
                <div
                  key={index}
                  className="col-span-2 h-48 sm:h-64 md:h-72 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }
            if (images.length === 3) {
              return (
                <div
                  key={index}
                  className="col-span-1 h-32 sm:h-44 md:h-52 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }
            if (images.length > 4 && index === 3) {
              return (
                <div
                  key={index}
                  className="col-span-1 h-32 sm:h-44 md:h-52 relative cursor-pointer group rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-full h-full object-contain group-hover:brightness-75 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-base sm:text-lg font-bold">+{images.length - 4}</span>
                  </div>
                </div>
              );
            }
            if (index < 4) {
              return (
                <div
                  key={index}
                  className="col-span-1 h-32 sm:h-44 md:h-52 relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer group py-1 ${
              isLikedState ? "text-rose-600 font-semibold" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <FiHeart
              className={`w-4 h-4 transition-colors ${
                isLikedState ? "fill-rose-500 text-rose-500" : "group-hover:fill-red-500"
              }`}
            />
            <span className="text-xs font-semibold">
              {likesCount} <span className="hidden sm:inline">Like</span>
            </span>
          </button>
          <button
            onClick={() => setShowComments((prev) => !prev)}
            type="button"
            className={`flex items-center gap-1.5 transition-colors cursor-pointer group py-1 ${
              showComments ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <FiMessageCircle className={`w-4 h-4 transition-colors ${showComments ? "fill-blue-50 text-blue-600" : "group-hover:fill-blue-500"}`} />
            <span className="text-xs font-semibold">
              {comments} <span className="hidden sm:inline">Comment</span>
            </span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors group py-1">
            <FiShare2 className="w-4 h-4" />
            <span className="text-xs font-semibold">
              {shares} <span className="hidden sm:inline">Share</span>
            </span>
          </button>
        </div>
        <button className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="Save post">
          <FiBookmark className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {id && (
        <AnimatePresence>
          {showComments && (
            <PostComments
              postId={String(id)}
              allowComments={allowComments}
              comments={commentsList}
              postOwnerId={authorId}
            />
          )}
        </AnimatePresence>
      )}
    </motion.article>
  );
}
