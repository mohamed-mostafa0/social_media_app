"use client";

import { motion } from "framer-motion";
import { FiMessageSquare, FiSlash } from "react-icons/fi";
import { CommentItem as CommentItemType } from "../../types/comment.types";
import { CommentComposer } from "./CommentComposer";
import { PostCommentItem } from "./CommentItem";

interface PostCommentsProps {
  postId: string;
  allowComments?: boolean;
  comments?: CommentItemType[];
  postOwnerId?: string;
}

export function PostComments({
  postId,
  allowComments = true,
  comments = [],
  postOwnerId,
}: PostCommentsProps) {
  const rootComments = comments.filter((c) => !c.parentCommentId);

  return (
    <motion.section
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden pt-4 mt-3 border-t border-gray-100/90"
    >
      {!allowComments ? (
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 text-gray-500 rounded-xl text-xs font-medium border border-gray-200/60">
          <FiSlash className="w-4 h-4 text-gray-400" />
          <span>Comments are disabled for this post.</span>
        </div>
      ) : (
        <div className="space-y-4">
          <CommentComposer postId={postId} placeholder="Write a comment..." />

          {rootComments.length > 0 ? (
            <div className="space-y-1 divide-y divide-gray-50/60 pt-1">
              {rootComments.map((comment) => (
                <PostCommentItem
                  key={comment._id}
                  comment={comment}
                  postId={postId}
                  postOwnerId={postOwnerId}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 text-gray-400">
                <FiMessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-600">No comments yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}
