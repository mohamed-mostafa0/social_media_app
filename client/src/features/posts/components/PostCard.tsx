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
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        {authorId ? (
          <Link href={`/profile/${authorId}`} className="flex items-center gap-3 group/author">
            <Avatar size="md" src={author.avatar} />
            <div>
              <h3 className="text-sm font-bold text-gray-900 group-hover/author:text-blue-600 transition-colors">
                {author.name}
              </h3>
              <p className="text-xs text-gray-400">{author.date || author.handle}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar size="md" src={author.avatar} />
            <div>
              <h3 className="text-sm font-bold text-gray-900">{author.name}</h3>
              <p className="text-xs text-gray-400">{author.date || author.handle}</p>
            </div>
          </div>
        )}
        <IconButton variant="ghost" size="sm">
          <FiMoreVertical className="w-5 h-5 text-gray-400" />
        </IconButton>
      </div>

      {content && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed text-sm">
            {content}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="text-blue-500 text-sm hover:underline cursor-pointer">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div
          className={`grid gap-2 mb-4 overflow-hidden ${
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
                  className="col-span-1 w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center max-h-[500px]"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-auto h-auto max-h-[500px] max-w-full object-contain rounded-xl"
                  />
                </div>
              );
            }
            if (images.length === 2) {
              return (
                <div
                  key={index}
                  className="col-span-1 h-56 sm:h-64 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
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
                  className="col-span-2 h-60 sm:h-72 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
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
                  className="col-span-1 h-44 sm:h-52 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
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
                  className="col-span-1 h-44 sm:h-52 relative cursor-pointer group rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt="Post content"
                    className="w-full h-full object-contain group-hover:brightness-75 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">+{images.length - 4}</span>
                  </div>
                </div>
              );
            }
            if (index < 4) {
              return (
                <div
                  key={index}
                  className="col-span-1 h-44 sm:h-52 relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
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



      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
              isLikedState ? "text-rose-600 font-semibold" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <FiHeart
              className={`w-4 h-4 transition-colors ${
                isLikedState ? "fill-rose-500 text-rose-500" : "group-hover:fill-red-500"
              }`}
            />
            <span className="text-xs font-semibold">{likesCount} Like</span>
          </button>
          <button
            onClick={() => setShowComments((prev) => !prev)}
            type="button"
            className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
              showComments ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <FiMessageCircle className={`w-4 h-4 transition-colors ${showComments ? "fill-blue-50 text-blue-600" : "group-hover:fill-blue-500"}`} />
            <span className="text-xs font-semibold">{comments} Comment</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors group">
            <FiShare2 className="w-4 h-4" />
            <span className="text-xs font-semibold">{shares} Share</span>
          </button>
        </div>
        <button className="text-gray-400 hover:text-blue-500 transition-colors">
          <FiBookmark className="w-5 h-5" />
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
